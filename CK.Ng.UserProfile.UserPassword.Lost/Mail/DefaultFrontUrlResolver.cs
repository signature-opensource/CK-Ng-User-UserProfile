using CK.AppIdentity;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Default <see cref="IFrontUrlResolver"/>: reads <c>CK-AppIdentity:Local:FrontUrl</c>
/// and falls back to the standard Angular development URL.
/// </summary>
public class DefaultFrontUrlResolver : IFrontUrlResolver
{
    const string DefaultFrontUrl = "http://localhost:4200";

    readonly IApplicationIdentityService _appIdentity;

    public DefaultFrontUrlResolver( IApplicationIdentityService appIdentity )
    {
        _appIdentity = appIdentity;
    }

    public string ResolveFrontUrl()
    {
        var configured = _appIdentity.LocalConfiguration.Configuration["FrontUrl"];
        return string.IsNullOrWhiteSpace( configured ) ? DefaultFrontUrl : configured.TrimEnd( '/' );
    }
}
