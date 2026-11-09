using CK.AppIdentity;
using CK.Core;
using Microsoft.AspNetCore.DataProtection;
using System.Globalization;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace CK.UserProfile.UserPassword.Lost;

/// <summary>
/// Issues and validates the self-signed recovery tokens of the lost password flow.
/// <para>
/// The token carries the user identifier, the party through which it was issued (its full name) and a fingerprint of
/// the user's current password hash, protected by ASP.NET Core Data Protection with a bounded lifetime: nothing is
/// persisted. It is redeemed only through the party that issued it. The produced string is URL-safe
/// base64 and goes straight into the <c>recover-password/:token</c> route segment.
/// </para>
/// <para>
/// The fingerprint makes the token single use without storage: it is valid only while the password is the one it
/// was issued for. A recovery changes the password, so the link dies with its first use; so does every other link
/// issued before a password change. A token that has not been used stays valid until it expires:
/// <see cref="DefaultLifetime"/> should be kept short.
/// </para>
/// </summary>
public class PasswordLostTokenService : ISingletonAutoService
{
    /// <summary>
    /// Lifetime used when <c>CK-AppIdentity:Local:PasswordLostTokenLifetime</c> is not configured.
    /// </summary>
    public static readonly TimeSpan FallbackLifetime = TimeSpan.FromHours( 2 );

    const string ConfigurationKey = "PasswordLostTokenLifetime";
    const string ProtectorPurpose = "CK.UserProfile.UserPassword.Lost.PasswordLostToken";

    readonly ITimeLimitedDataProtector _protector;

    public PasswordLostTokenService( IDataProtectionProvider dataProtectionProvider,
                                     IApplicationIdentityService appIdentity )
    {
        _protector = dataProtectionProvider.CreateProtector( ProtectorPurpose ).ToTimeLimitedDataProtector();
        // This service is a singleton: IActivityMonitor is scoped and cannot be injected here.
        // The configuration is read once at construction, so a local monitor is enough.
        DefaultLifetime = ReadLifetime( new ActivityMonitor( $"{nameof( PasswordLostTokenService )}" ), appIdentity );
    }

    /// <summary>
    /// Gets how long an issued token stays valid, read once from
    /// <c>CK-AppIdentity:Local:PasswordLostTokenLifetime</c> (a <see cref="TimeSpan"/> such as
    /// <c>"02:00:00"</c> or <c>"1.00:00:00"</c>), defaulting to <see cref="FallbackLifetime"/>.
    /// <para>
    /// The e-mail templates render this duration, so changing the configuration keeps the message
    /// truthful without touching them.
    /// </para>
    /// </summary>
    public TimeSpan DefaultLifetime { get; }

    /// <summary>
    /// Creates a recovery token for a user.
    /// </summary>
    /// <param name="userId">The user identifier. Must be positive.</param>
    /// <param name="passwordHash">The user's current password hash (<c>CK.tUserPassword.PwdHash</c>).</param>
    /// <param name="issuingPartyFullName">The full name of the party through which the user acts (the caller party, null when it is unknown).</param>
    /// <param name="lifetime">
    /// Overrides <see cref="DefaultLifetime"/> for this token. Must be positive when specified.
    /// </param>
    /// <returns>The token to send by e-mail.</returns>
    public string CreateToken( int userId, byte[] passwordHash, string? issuingPartyFullName, TimeSpan? lifetime = null )
    {
        Throw.CheckOutOfRangeArgument( userId > 0 );
        Throw.CheckNotNullArgument( passwordHash );
        Throw.CheckArgument( issuingPartyFullName == null || !string.IsNullOrWhiteSpace( issuingPartyFullName ) );
        Throw.CheckOutOfRangeArgument( lifetime is null || lifetime.Value > TimeSpan.Zero );
        // The full name is last: whatever its characters, the split of the payload is not ambiguous.
        var payload = $"{userId.ToString( CultureInfo.InvariantCulture )}:{GetPasswordFingerprint( passwordHash )}:{issuingPartyFullName}";
        return _protector.Protect( payload, lifetime ?? DefaultLifetime );
    }

    /// <summary>
    /// Validates a recovery token: it must be authentic, not expired, issued through the caller party and for the user's
    /// current password.
    /// </summary>
    /// <param name="monitor">The monitor to use.</param>
    /// <param name="token">The token to validate.</param>
    /// <param name="callerPartyFullName">The full name of the party through which the token is redeemed (null when it is unknown).</param>
    /// <param name="getPasswordHashAsync">
    /// Reads the current password hash of the user designated by the token (null when the user has no password).
    /// </param>
    /// <returns>The user identifier, or 0 when the token is invalid, expired or already used.</returns>
    public async Task<int> ReadTokenAsync( IActivityMonitor monitor, string? token, string? callerPartyFullName, Func<int, Task<byte[]?>> getPasswordHashAsync )
    {
        if( string.IsNullOrWhiteSpace( token ) )
        {
            monitor.Warn( "Empty password recovery token." );
            return 0;
        }
        string payload;
        try
        {
            payload = _protector.Unprotect( token );
        }
        catch( Exception ex )
        {
            // Tampered, forged or expired token: Unprotect throws in all these cases.
            monitor.Warn( "Could not validate the password recovery token.", ex );
            return 0;
        }
        var parts = payload.Split( ':', 3 );
        if( parts.Length != 3
            || !int.TryParse( parts[0], NumberStyles.Integer, CultureInfo.InvariantCulture, out var userId )
            || userId <= 0 )
        {
            monitor.Error( $"Invalid payload in password recovery token. (Payload: {payload})" );
            return 0;
        }
        var issuingParty = parts[2].Length > 0 ? parts[2] : null;
        if( !string.Equals( issuingParty, callerPartyFullName, StringComparison.Ordinal ) )
        {
            monitor.Warn( $"The password recovery token is redeemed through another party than the one that issued it. (UserId: {userId}, IssuingParty: {issuingParty}, CallerParty: {callerPartyFullName})" );
            return 0;
        }
        var currentHash = await getPasswordHashAsync( userId ).ConfigureAwait( false );
        if( currentHash == null || parts[1] != GetPasswordFingerprint( currentHash ) )
        {
            monitor.Warn( $"The password recovery token was issued for another password: it has been used, or the password changed since. (UserId: {userId})" );
            return 0;
        }
        return userId;
    }

    // The fingerprint is inside the protected payload: it is neither readable nor forgeable by the token's holder.
    static string GetPasswordFingerprint( byte[] passwordHash ) => Convert.ToBase64String( SHA256.HashData( passwordHash ) );

    static TimeSpan ReadLifetime( IActivityMonitor monitor, IApplicationIdentityService appIdentity )
    {
        var configured = appIdentity.LocalConfiguration.Configuration[ConfigurationKey];
        if( string.IsNullOrWhiteSpace( configured ) ) return FallbackLifetime;

        if( !TimeSpan.TryParse( configured, CultureInfo.InvariantCulture, out var lifetime ) || lifetime <= TimeSpan.Zero )
        {
            monitor.Warn( $"Invalid '{ConfigurationKey}' configuration: expected a positive TimeSpan such as \"02:00:00\". Falling back to {FallbackLifetime}. (Value: {configured})" );
            return FallbackLifetime;
        }
        monitor.Info( $"Password recovery tokens are valid for {lifetime}." );
        return lifetime;
    }
}
