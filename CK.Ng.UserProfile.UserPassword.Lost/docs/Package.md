Brings the lost password flow to CK.Ng.UserProfile.UserPassword.

An anonymous page asks for an e-mail address and sends a recovery link; a second anonymous page,
reached through that link, lets the user choose a new password from the token it carries. The commands
are handled by CK.UserProfile.UserPassword.Lost, where the database is.
