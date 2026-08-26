Brings the temporary password flow to CK.Ng.UserProfile.UserPassword.

While the password of an authenticated user is a temporary one, a route guard forbids every private
page and redirects to a reset form served under the authentication page, where the only thing the user
can do is choose a real password.

No dependency on the e-mail feature: the user is already authenticated.
