Angular CKomposable package that brings the `/profile` page.
At this level, this user profile page enables the user to change its user name, and its "Sign-in methods"
tab lists the user's sign-in methods (the satellite packages add their sections to it).

The page and its update form are built as anchored files: satellite packages - names, preferred
culture, workspace, password - add their properties, form controls and commands by transforming them,
and the form then sends a single batch command.
