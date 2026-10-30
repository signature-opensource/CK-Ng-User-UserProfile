Server side of the lost password flow: the handler of `ISendForgotPasswordEmailCommand` and
`IRecoverPasswordCommand`, the recovery token (Data Protection) and the e-mails that carry it. It runs
where the database is (the authentication center).

Mail subjects and bodies are Fluid templates that a consumer can override by name, without replacing
the mailer.

See the [README](https://github.com/signature-opensource/CK-Ng-User-UserProfile/blob/stable/CK.UserProfile.UserPassword.Lost/README.md).
