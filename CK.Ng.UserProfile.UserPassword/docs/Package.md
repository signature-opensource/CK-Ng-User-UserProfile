Adds the Security tab to the CK.Ng.UserProfile `/profile` page, where an authenticated user changes its
own password.

Ships the change-password form, a password strength component, and the password rules for Angular
signal forms. A single ordered criteria table - minimum length, digit, lower case, upper case, special
character - is read both by the complexity rule and by the strength display, so what the user is shown
and what blocks the submission cannot drift apart.
