The commands of the lost password flow: `ISendForgotPasswordEmailCommand` (sends a recovery link, never
disclosing whether the address is known) and `IRecoverPasswordCommand` (sets a new password from the
token of the link). Both are anonymous by design.

See the [README](https://github.com/signature-opensource/CK-Ng-User-UserProfile/blob/stable/CK.IO.UserProfile.UserPassword.Lost/README.md).
