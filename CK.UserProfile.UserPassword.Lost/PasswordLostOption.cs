using CK.AppIdentity;
using CK.AppIdentity.AuthCenter;
using CK.Core;
using Microsoft.Extensions.Configuration;
using System.Globalization;
using System.Linq;

namespace CK.UserProfile.UserPassword.Lost;

/// <summary>
/// The "PasswordLost" option of the AuthCenter: the lost password flow of the users of an Authentication Center, and its
/// policy. Enabled by default: <c>"AuthCenter": { "PasswordLost": false }</c> turns the flow off (no recovery mail is
/// sent, a recovery link is refused).
/// <code>
/// "AuthCenter": {
///   "PasswordLost": {
///     "TokenLifetime": "02:00:00" // The default: how long a recovery link stays valid.
///   }
/// }
/// </code>
/// An invalid configuration throws.
/// </summary>
[PartyFeatureOption( "PasswordLost", TypeActivation.ByDefault )]
public sealed class PasswordLostOption : IPartyComponentOption<LocalAuthCenterFeatureDriver>
{
    /// <summary>
    /// The default <see cref="TokenLifetime"/>: 2 hours.
    /// </summary>
    public static readonly TimeSpan DefaultTokenLifetime = TimeSpan.FromHours( 2 );

    static readonly string[] _keys = ["TokenLifetime"];

    /// <summary>
    /// Initializes a new <see cref="PasswordLostOption"/> from its configuration.
    /// </summary>
    /// <param name="configuration">The "PasswordLost" section of the AuthCenter. Null for the defaults.</param>
    public PasswordLostOption( IConfiguration? configuration )
    {
        TokenLifetime = DefaultTokenLifetime;
        if( configuration != null )
        {
            foreach( var c in configuration.GetChildren() )
            {
                if( !_keys.Contains( c.Key ) ) Throw.CKException( $"Unknown \"{c.Key}\": the keys are {_keys.Concatenate()}." );
            }
            var lifetime = configuration["TokenLifetime"];
            if( lifetime != null )
            {
                if( !TimeSpan.TryParse( lifetime, CultureInfo.InvariantCulture, out var l ) || l <= TimeSpan.Zero )
                {
                    Throw.CKException( $"Invalid \"TokenLifetime\": '{lifetime}' (a positive TimeSpan is expected, like \"02:00:00\")." );
                }
                TokenLifetime = l;
            }
        }
    }

    /// <summary>
    /// Gets how long a recovery token stays valid. Defaults to <see cref="DefaultTokenLifetime"/>. It should be kept short:
    /// a token that has not been used stays valid until it expires. The e-mail templates render this duration.
    /// </summary>
    public TimeSpan TokenLifetime { get; }
}
