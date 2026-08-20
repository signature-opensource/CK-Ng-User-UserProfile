using CK.Core;
using CK.TS.Angular;

namespace CK.Ng.UserProfile.UserPassword;

/// <summary>
/// Strength bar and criteria checklist displayed under a new-password field.
/// <para>
/// It reads <c>PASSWORD_CRITERIA</c> of password-validators.ts, the very table
/// <c>passwordComplexityValidator</c> enforces, so that what the user is shown and what blocks the
/// submission cannot drift apart.
/// </para>
/// </summary>
[NgComponent]
[Package<UserProfilePasswordPackage>]
public sealed class PasswordStrengthComponent : NgComponent
{
}
