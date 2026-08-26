# CK.Ng.UserProfile.UserPassword

Angular CKomposable package that adds the "Security" tab to the `/profile` page brought by
[CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md), where an authenticated user changes its own
password.

## What it brings.

| | |
|---|---|
| Components | [`ChangePasswordFormComponent`](ChangePassword/ChangePasswordFormComponent.cs), [`PasswordStrengthComponent`](PasswordStrength/PasswordStrengthComponent.cs) |
| Validators | [`password-validators.ts`](Res/password-validators.ts) - `PASSWORD_MIN_LENGTH`, `PASSWORD_CRITERIA`, `PasswordCriterion`, `passwordComplexityValidator`, `passwordsMatchValidator` |
| Command | `ISetPasswordCommand` |
| Transformer | [`user-profile-page.t`](Res/user-profile-page.t) injects the tab at `PostUserProfileGeneralInfosTab` |
| Translations | `CK.UserProfile.Security` and the `CK.UserProfile.PasswordStrength.Criterion.*` keys |

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.User.UserPassword` for `ISetPasswordCommand`

## The criteria table is the rule.

`PASSWORD_CRITERIA` in [password-validators.ts](Res/password-validators.ts) is a single ordered table
of `{ key, test }` pairs - minimum length, digit, lower case, upper case, special character. Both
`passwordComplexityValidator` and the `ck-password-strength` component read it, so what the user is
shown and what blocks the submission cannot drift apart.

Two consequences worth remembering:

- The minimum length is **one criterion among the others**. Do not add a separate
  `Validators.minLength( PASSWORD_MIN_LENGTH )` on a control that already carries
  `passwordComplexityValidator` - it would report the same failure twice.
- A criterion `key` is the suffix of a translation key
  (`CK.UserProfile.PasswordStrength.Criterion.<key>`), so adding a rule means adding its label to
  [default.jsonc](PasswordStrength/Res/ts-locales/default.jsonc) and
  [fr.jsonc](PasswordStrength/Res/ts-locales/fr.jsonc).

`PasswordStrengthComponent` is not private to the change-password form: it is exposed so that any other
new-password field can display the same criteria against the same table.
