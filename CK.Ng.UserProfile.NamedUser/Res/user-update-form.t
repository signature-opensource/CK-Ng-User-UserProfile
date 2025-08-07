create <ts> transformer
begin
    ensure import { SetUserNamesCommand } from '@local/ck-gen';

    inject """

           // <PreFirstNameFormControlDefinition revert />
           const firstName = new FormControlConfig(
               'text',
               this.#translateService.instant( 'CK.UserProfile.FirstName' ),
               this.userProfile()!.firstName,
               {
                 placeholder: this.#translateService.instant( 'CK.UserProfile.Form.FirstName.Placeholder' )
               }
           );
           // <PostFirstNameFormControlDefinition />

           // <PreLastNameFormControlDefinition revert />
           const lastName = new FormControlConfig(
               'text',
               this.#translateService.instant( 'CK.UserProfile.LastName' ),
               this.userProfile()!.lastName,
               {
                 placeholder: this.#translateService.instant( 'CK.UserProfile.Form.LastName.Placeholder' )
               }
           );
           // <PostLastNameFormControlDefinition />

           """ into <PostUserIdentityFormControlDefinition>;

    inject """

           firstName,
           lastName,

           """ into <PostUserIdentityFormControlRegistration>;

    inject """

           // <PreSetUserNamesCommandRegistering />
           if( this.userProfile()!.firstName !== form.get( 'firstName' )!.value || this.userProfile()!.lastName !== form.get( 'lastName' )!.value ) {
               const newFirstName = form.get( 'firstName' )!.value;
               const currentFirstName = this.userProfile()!.firstName;
               const newLastName = form.get( 'lastName' )!.value;
               const currentLastName = this.userProfile()!.lastName;
               const setUserNamesCmd = new SetUserNamesCommand();

               setUserNamesCmd.actorId = this.userProfile()!.userId;

               setUserNamesCmd.userId = this.userProfile()!.userId;
               setUserNamesCmd.firstName = newFirstName !== currentFirstName ? newFirstName : null;
               setUserNamesCmd.lastName = newLastName !== currentLastName ? newLastName : null;
               batchCmd.commands.push( { command: setUserNamesCmd, description: 'Setting user\'s first name and last name.' } );
           }
           // <PostSetUserNamesCommandRegistering />
           """ into <PostSetUserNameCommandRegistering>;

    inject """
           // <PreNamedUserReset revert />
           firstName: this.userProfile()!.firstName,
           lastName: this.userProfile()!.lastName,
           // <PostNamedUserReset />
           """ into <PostUserNameReset>;
end
