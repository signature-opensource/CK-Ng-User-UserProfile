Adds the password section to the "Sign-in methods" tab of the CK.Ng.UserProfile `/profile` page: an
authenticated user changes its password, adds one when it has none, or removes it.

Ships the change-password form, a password strength component, and the password validators. A single
ordered criteria table - minimum length, digit, lower case, upper case, special character - is read
both by the validator and by the strength display, so what the user is shown and what blocks the
submission cannot drift apart.
