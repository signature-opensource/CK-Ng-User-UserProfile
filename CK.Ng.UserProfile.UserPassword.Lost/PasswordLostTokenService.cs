using CK.AppIdentity;
using CK.Core;
using Microsoft.AspNetCore.DataProtection;
using System.Globalization;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Issues and validates the self-signed recovery tokens of the lost password flow.
/// <para>
/// The token carries the user identifier and is protected by ASP.NET Core Data Protection with a
/// bounded lifetime: nothing is persisted, so validating it needs no database access at all. The
/// produced string is URL-safe base64 and goes straight into the <c>recover-password/:token</c>
/// route segment.
/// </para>
/// <para>
/// Consequence of not persisting anything: a token cannot be revoked and stays usable until it
/// expires. <see cref="DefaultLifetime"/> should therefore be kept short.
/// </para>
/// </summary>
public class PasswordLostTokenService : ISingletonAutoService
{
    /// <summary>
    /// Lifetime used when <c>CK-AppIdentity:Local:PasswordLostTokenLifetime</c> is not configured.
    /// </summary>
    public static readonly TimeSpan FallbackLifetime = TimeSpan.FromHours( 2 );

    const string ConfigurationKey = "PasswordLostTokenLifetime";
    const string ProtectorPurpose = "CK.Ng.UserProfile.UserPassword.Lost.PasswordLostToken";

    readonly ITimeLimitedDataProtector _protector;

    public PasswordLostTokenService( IDataProtectionProvider dataProtectionProvider,
                                     IApplicationIdentityService appIdentity,
                                     IActivityMonitor monitor )
    {
        _protector = dataProtectionProvider.CreateProtector( ProtectorPurpose ).ToTimeLimitedDataProtector();
        DefaultLifetime = ReadLifetime( monitor, appIdentity );
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
    /// <param name="lifetime">
    /// Overrides <see cref="DefaultLifetime"/> for this token. Must be positive when specified.
    /// </param>
    /// <returns>The token to send by e-mail.</returns>
    public string CreateToken( int userId, TimeSpan? lifetime = null )
    {
        Throw.CheckOutOfRangeArgument( userId > 0 );
        Throw.CheckOutOfRangeArgument( lifetime is null || lifetime.Value > TimeSpan.Zero );
        return _protector.Protect( userId.ToString( CultureInfo.InvariantCulture ), lifetime ?? DefaultLifetime );
    }

    /// <summary>
    /// Validates a recovery token and extracts the user identifier it carries.
    /// </summary>
    /// <param name="monitor">The monitor to use.</param>
    /// <param name="token">The token to validate.</param>
    /// <param name="userId">The user identifier when this method returns true, 0 otherwise.</param>
    /// <returns>True if the token is valid and not expired.</returns>
    public bool TryReadToken( IActivityMonitor monitor, string? token, out int userId )
    {
        userId = 0;
        if( string.IsNullOrWhiteSpace( token ) )
        {
            monitor.Warn( "Empty password recovery token." );
            return false;
        }
        try
        {
            var payload = _protector.Unprotect( token );
            if( !int.TryParse( payload, NumberStyles.Integer, CultureInfo.InvariantCulture, out userId ) || userId <= 0 )
            {
                monitor.Error( $"Invalid payload in password recovery token. (Payload: {payload})" );
                userId = 0;
                return false;
            }
            return true;
        }
        catch( Exception ex )
        {
            // Tampered, forged or expired token: Unprotect throws in all these cases.
            monitor.Warn( "Could not validate the password recovery token.", ex );
            return false;
        }
    }

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
