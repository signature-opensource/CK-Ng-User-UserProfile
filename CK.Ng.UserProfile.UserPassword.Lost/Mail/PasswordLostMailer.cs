using CK.Core;
using CK.Mail.SharedLayout;
using CK.Mailer;
using CK.Template.Fluid;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Default <see cref="IPasswordLostMailer"/>: renders the <c>PasswordLost</c> and
/// <c>PasswordSetConfirmation</c> Fluid templates (subject + HTML body) for the current culture,
/// wraps the body in the shared <c>_DefaultMailLayout.liquid</c> chrome and dispatches through the
/// CK-AppIdentity-configured <see cref="IDefaultEmailSender"/>.
/// </summary>
public class PasswordLostMailer : IPasswordLostMailer
{
    readonly IFluidTemplateService _fluid;
    readonly PocoDirectory _pocoDir;
    readonly IDefaultEmailSender _emailSender;
    readonly IMailBrandingProvider _brandingProvider;
    readonly CurrentCultureInfo _currentCulture;
    readonly string _frontUrl;

    public PasswordLostMailer( IFluidTemplateService fluid,
                               PocoDirectory pocoDir,
                               IFrontUrlResolver frontUrlResolver,
                               IDefaultEmailSender emailSender,
                               IMailBrandingProvider brandingProvider,
                               CurrentCultureInfo currentCulture )
    {
        _fluid = fluid;
        _pocoDir = pocoDir;
        _emailSender = emailSender;
        _brandingProvider = brandingProvider;
        _currentCulture = currentCulture;
        _frontUrl = frontUrlResolver.ResolveFrontUrl();
    }

    public async Task SendPasswordLostAsync( IActivityMonitor monitor, string destination, string token, TimeSpan validity, string firstName, string lastName )
    {
        var culture = _currentCulture.CurrentCulture.PrimaryCulture;
        var model = _pocoDir.Create<IPasswordLostModel>( m =>
        {
            m.FrontUrl = _frontUrl;
            m.Token = token;
            // Whole hours, rounded down so the mail never announces more than the token grants.
            // A sub-hour lifetime is an edge case: announce one hour rather than zero.
            m.ValidityHours = Math.Max( 1, (int)validity.TotalHours );
            m.FirstName = firstName;
            m.LastName = lastName;
        } );

        var subject = await _fluid.RenderAsync( "PasswordLost.Subject", culture, model );
        var (html, inlineLogo) = await RenderWithLayoutAsync( "PasswordLost.Body", culture, model );

        await SendAsync( monitor, destination, subject, html, inlineLogo );

        monitor.Info( $"Password lost e-mail sent. (Email: {destination}, Culture: {culture.Name})" );
    }

    public async Task SendPasswordSetConfirmationAsync( IActivityMonitor monitor, string destination, string firstName, string lastName )
    {
        var culture = _currentCulture.CurrentCulture.PrimaryCulture;
        var model = _pocoDir.Create<IPasswordSetConfirmationModel>( m =>
        {
            m.FrontUrl = _frontUrl;
            m.FirstName = firstName;
            m.LastName = lastName;
        } );

        var subject = await _fluid.RenderAsync( "PasswordSetConfirmation.Subject", culture, model );
        var (html, inlineLogo) = await RenderWithLayoutAsync( "PasswordSetConfirmation.Body", culture, model );

        await SendAsync( monitor, destination, subject, html, inlineLogo );

        monitor.Info( $"Password set confirmation e-mail sent. (Email: {destination}, Culture: {culture.Name})" );
    }

    /// <summary>
    /// Renders a body template, then wraps the resulting HTML inside the shared
    /// <c>_DefaultMailLayout.liquid</c> chrome. The brand values flow as an ambient binding into
    /// the body render (so the CTA button color tracks the tenant brand) and as a model field into
    /// the layout render. When a logo stream is available it ships as an inline <c>cid:</c>
    /// attachment, which bypasses Outlook's remote-image blocking.
    /// </summary>
    async Task<(string Html, Attachment? InlineLogo)> RenderWithLayoutAsync( string bodyTemplateName,
                                                                             NormalizedCultureInfo culture,
                                                                             object model )
    {
        var branding = _brandingProvider.GetBranding();
        var ambient = new Dictionary<string, object> { ["branding"] = branding };

        var bodyHtml = await _fluid.RenderAsync( bodyTemplateName, culture, model, ambient );

        Attachment? inlineLogo = null;
        string logoUrl;
        var logoStream = _brandingProvider.OpenLogo();
        if( logoStream is not null )
        {
            inlineLogo = new Attachment
            {
                IsInline = true,
                ContentId = _brandingProvider.LogoContentId,
                ContentType = _brandingProvider.LogoContentType,
                Filename = "logo.png",
                Data = logoStream,
            };
            logoUrl = "cid:" + _brandingProvider.LogoContentId;
        }
        else
        {
            logoUrl = ResolveLogoUrl( branding.LogoUrl, _frontUrl );
        }

        var layoutModel = new { bodyHtml, frontUrl = _frontUrl, logoUrl, branding };
        var html = await _fluid.RenderAsync( "_DefaultMailLayout", culture, layoutModel );
        return (html, inlineLogo);
    }

    /// <summary>
    /// Resolves the branding logo URL against the front URL: absolute URLs are returned verbatim,
    /// a relative path gets the front URL prepended, an empty value stays empty.
    /// </summary>
    static string ResolveLogoUrl( string logoUrl, string frontUrl )
    {
        if( string.IsNullOrEmpty( logoUrl ) ) return string.Empty;
        if( logoUrl.Contains( "://", StringComparison.Ordinal ) ) return logoUrl;
        return string.IsNullOrEmpty( frontUrl ) ? logoUrl : frontUrl + logoUrl;
    }

    async Task SendAsync( IActivityMonitor monitor, string destination, string subject, string htmlBody, Attachment? inlineLogo )
    {
        var message = new SimpleEmail { Subject = subject, HtmlBody = htmlBody };
        message.To( destination );
        if( inlineLogo is not null )
        {
            message.AddAttach( inlineLogo );
        }
        try
        {
            await _emailSender.SendAsync( monitor, message );
        }
        finally
        {
            inlineLogo?.Data?.Dispose();
        }
    }
}
