using CK.Template.Fluid;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Registers the <c>Res/Templates/*.liquid</c> resources of this package.
/// <para>
/// A consumer can override the content by declaring its own <c>[FluidTemplatePackage]</c>
/// carrying a template with the same logical name.
/// </para>
/// </summary>
[FluidTemplatePackage]
public sealed class PasswordLostMailTemplatesPackage : FluidTemplatePackage
{
}
