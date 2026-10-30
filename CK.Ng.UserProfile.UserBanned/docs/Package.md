Brings the banishment flow to the client: as soon as a user is banished it is logged out and sent back
to the authentication page, where the login is already refused by the database.

A navigation guard detects it and logs the user out. This is not a security mechanism: what makes a
banishment effective is the server refusing the commands of a banished actor and the refresh of its
session.
