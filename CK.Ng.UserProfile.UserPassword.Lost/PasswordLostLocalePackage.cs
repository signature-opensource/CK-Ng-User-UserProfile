using CK.Core;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Registers the <c>Res/locales</c> translation sets of this package: the back-end answers of the
/// lost password flow travel as <see cref="UserMessage"/> (a resource name plus an English
/// fallback text) and are translated server-side from the command's current culture.
/// <para>
/// This is distinct from the <c>Res/ts-locales</c> of the components, which feed ngx-translate
/// in the browser.
/// </para>
/// </summary>
[Globalization.LocalePackage]
public class PasswordLostLocalePackage : IResourceGroup
{
}
