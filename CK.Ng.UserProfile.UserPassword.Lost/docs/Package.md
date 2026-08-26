Brings the lost password flow to CK.Ng.UserProfile.UserPassword.

An anonymous page asks for an e-mail address and sends a recovery link; a second anonymous page,
reached through that link, lets the user choose a new password from the token it carries.

The send command never discloses whether an address is known. Mail subjects and bodies are Fluid
templates that a consumer can override by name, without replacing the mailer.
