using CK.AppIdentity;
using CK.AppIdentity.AuthCenter;
using CK.AppIdentity.AuthCenter.Password;
using CK.Core;
using CK.Mailer;
using System;

namespace CK.UserProfile.UserPassword.Lost;

/// <summary>
/// The "PasswordLost" option of the AuthCenter: the lost password flow of the users of an Authentication Center, and its
/// policy. Enabled by default: <c>"AuthCenter": { "PasswordLost": false }</c> turns the flow off (no recovery mail is
/// sent, a recovery link is refused).
/// <code>
/// "AuthCenter": {
///   "PasswordLost": {
///     "TokenLifetime": "02:00:00", // The default: how long a recovery link stays valid.
///     "Sender": "Support"          // Optional: the sender of the mails ("MailSender" of the party), its default sender when null.
///   }
/// }
/// </code>
/// Its configuration is <see cref="PasswordLostOptionConfiguration"/>: an invalid one is an error.
/// <para>
/// It exists only with the "Password" option of the AuthCenter (no password, nothing to recover) and the "MailSender"
/// feature of the party (the recovery mail): enabled by default, it is disabled with them; enabled explicitly, it is an
/// error without them.
/// </para>
/// </summary>
[PartyFeatureOption( "PasswordLost", TypeActivation.ByDefault )]
[Configuration<PasswordLostOptionConfiguration>]
[Requires<AuthCenterPasswordOption>]
[Requires<MailSenderFeatureDriver>]
public sealed class PasswordLostOption : IPartyComponentOption<LocalAuthCenterFeatureDriver>
{
    /// <summary>
    /// The default <see cref="TokenLifetime"/>: 2 hours.
    /// </summary>
    public static readonly TimeSpan DefaultTokenLifetime = TimeSpan.FromHours( 2 );

    /// <summary>
    /// Initializes a new <see cref="PasswordLostOption"/> from its (checked) configuration.
    /// </summary>
    /// <param name="configuration">The configuration of the option.</param>
    public PasswordLostOption( PasswordLostOptionConfiguration configuration )
    {
        TokenLifetime = configuration.TokenLifetime;
        Sender = string.IsNullOrEmpty( configuration.Sender ) ? null : configuration.Sender;
    }

    /// <summary>
    /// Gets how long a recovery token stays valid. Defaults to <see cref="DefaultTokenLifetime"/>. It should be kept short:
    /// a token that has not been used stays valid until it expires. The e-mail templates render this duration.
    /// </summary>
    public TimeSpan TokenLifetime { get; }

    /// <summary>
    /// Gets the name of the sender of the mails (a sender of the "MailSender" feature of the AuthCenter party, CK.Mailer).
    /// Null: its default sender. An unknown sender fails the sending of a mail.
    /// </summary>
    public string? Sender { get; }
}

/// <summary>
/// The configuration of the <see cref="PasswordLostOption"/>.
/// </summary>
[ConfigurationModel]
public sealed class PasswordLostOptionConfiguration : IConfigurationModel
{
    /// <summary>
    /// Gets the lifetime of the token sent by mail. Defaults to <see cref="PasswordLostOption.DefaultTokenLifetime"/> (2 hours).
    /// </summary>
    public TimeSpan TokenLifetime { get; init; } = PasswordLostOption.DefaultTokenLifetime;

    /// <summary>
    /// Gets the name of the sender of the mail (the default sender of the MailSender feature when null).
    /// </summary>
    public string? Sender { get; init; }

    /// <inheritdoc />
    public void Validate( IConfigurationValidationContext context )
    {
        if( TokenLifetime <= TimeSpan.Zero )
        {
            context.Error( $"'{context.Path}:TokenLifetime' = '{TokenLifetime}': a positive time span is expected (like \"02:00:00\")." );
        }
    }
}
