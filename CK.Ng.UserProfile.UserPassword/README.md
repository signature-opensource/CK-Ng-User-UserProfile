# CK.Ng.UserProfile.UserPassword

Angular CKomposable package that adds the password section to the "Sign-in methods" tab of the
`/profile` page brought by [CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md): an authenticated user
changes its password, adds one when it has none (a user created by a remote login, a passkey-only
user: a new sign-in method), or removes it (it migrates to another method; its last one is never
removed). The three require a recent login (the Critical level) and are refused while impersonating.
Below the Critical level, the section offers to sign in again in a popup (`NgAuthService.elevateToCritical()`: the
profile stays on its tab) when one of the user's methods can elevate it.

## What it brings.

| | |
|---|---|
| Components | [`PasswordSectionComponent`](PasswordSection/PasswordSectionComponent.cs) (the section), [`ChangePasswordFormComponent`](ChangePassword/ChangePasswordFormComponent.cs) (its `mode` input: "change" or "add"), [`PasswordStrengthComponent`](PasswordStrength/PasswordStrengthComponent.cs) |
| Validators | [`password-validators.ts`](Res/password-validators.ts) - `PASSWORD_MIN_LENGTH`, `PASSWORD_CRITERIA`, `PasswordCriterion`, `passwordComplexityValidator`, `passwordsMatchValidator` |
| Commands | `ISetPasswordCommand`, `IAddPasswordCommand`, `IRemovePasswordCommand` |
| Transformer | [`sign-in-methods.t`](Res/sign-in-methods.t) injects the section at `PostSignInMethodsSections` |
| Translations | the `CK.UserProfile.PasswordSection.*` and the `CK.UserProfile.PasswordStrength.Criterion.*` keys |

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.User.UserPassword` for the commands

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
Putting it on your own field is one line:

```html
<ck-password-strength [password]="formGroup.get('password')!.value" />
```

and in a test, `imports: [PasswordStrength]` plus `providers: appConfig.providers` is all the wiring it
needs - `PasswordStrength` being the TypeScript class behind the `ck-password-strength` selector.

That is exactly how this package's own form uses it - and note what the same file puts a few lines
above the call, inside the password field's error template
([change-password-form.html](ChangePassword/Res/change-password-form.html)):

```html
<!-- Length and complexity are told by ck-password-strength below, permanently and one
     criterion at a time. The two regions are kept empty rather than removed: they are
     extension points for consumer packages. -->
<!-- <PrePasswordLengthError revert /> -->
<!-- <PostPasswordLengthError /> -->
<!-- <PrePasswordComplexityError revert /> -->
<!-- <PostPasswordComplexityError /> -->
```

Two deliberately empty anchor pairs. Because the component already reports every criterion
permanently, this package emits no *length or complexity* error text of its own - it does emit the
others, `CK.UserProfile.Form.PasswordRequired` and `...PasswordMustMatch` among them. It keeps the two
anchors so a consumer that wants an inline message has somewhere to put it.

## What the validator reports.

The criteria table above is only trustworthy if the key the user sees unchecked is the key the
validator returns, and that is asserted criterion by criterion:

```ts
const validate = ( value: string ) => passwordComplexityValidator( new FormControl( value ) );

// One breaking sample per criterion: 'abcdefg1!' fails Upper and nothing else.
expect( validate( 'abcdefg1!' ) ).toEqual( { passwordComplexity: ['Upper'] } );

// Every unmet criterion at once, in display order.
expect( validate( 'abc' ) ).toEqual( { passwordComplexity: ['MinLength', 'Digit', 'Upper', 'Special'] } );

// Nothing about an empty value.
expect( validate( '' ) ).toBeNull();
```

The last line is the one to remember: **`passwordComplexityValidator` says nothing about an empty
value.** An empty password is not "failing five criteria", it is not this validator's business -
`Validators.required` is. A control that carries only `passwordComplexityValidator` accepts an empty
value.

The fixture also asserts that `BREAKS_ONLY`'s keys are exactly `PASSWORD_CRITERIA`'s keys, so adding a
criterion without a breaking sample fails the suite rather than going untested. From
[`password-strength.spec.ts`](../Tests/CK.Ng.UserProfile.UserPassword.Tests/TSInlineTests/CK_Ng_UserProfile_UserPassword/src/app/password-strength.spec.ts).
