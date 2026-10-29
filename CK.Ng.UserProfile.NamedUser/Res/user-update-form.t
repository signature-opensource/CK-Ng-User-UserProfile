create <ts> transformer
begin
    ensure import { SetUserNamesCommand, textField } from '@local/ck-gen';

    inject """

           // <PreFirstNameFormControlDefinition revert />
           const firstName = textField( 'CK.UserProfile.FirstName', this.userProfile()?.firstName ?? '', {
               placeholder: 'CK.UserProfile.Form.FirstName.Placeholder'
           } );
           // <PostFirstNameFormControlDefinition />

           // <PreLastNameFormControlDefinition revert />
           const lastName = textField( 'CK.UserProfile.LastName', this.userProfile()?.lastName ?? '', {
               placeholder: 'CK.UserProfile.Form.LastName.Placeholder'
           } );
           // <PostLastNameFormControlDefinition />

           """ into <PostUserIdentityFormControlDefinition>;

    inject """

           firstName,
           lastName,

           """ into <PostUserIdentityFormControlRegistration>;

    inject """

           // <PreSetUserNamesCommandRegistering />
           if( this.userProfile()!.firstName !== value.firstName || this.userProfile()!.lastName !== value.lastName ) {
               const newFirstName = value.firstName.trim();
               const currentFirstName = this.userProfile()!.firstName;
               const newLastName = value.lastName.trim();
               const currentLastName = this.userProfile()!.lastName;
               const setUserNamesCmd = new SetUserNamesCommand();

               setUserNamesCmd.userId = this.userProfile()!.userId;
               // An unchanged name is sent as null (C# string?), which the generated type declares as undefined.
               setUserNamesCmd.firstName = ( newFirstName !== currentFirstName ? newFirstName : null ) as string | undefined;
               setUserNamesCmd.lastName = ( newLastName !== currentLastName ? newLastName : null ) as string | undefined;
               batchCmd.commands.push( { command: setUserNamesCmd, description: 'Setting user\'s first name and last name.' } );
           }
           // <PostSetUserNamesCommandRegistering />
           """ into <PostSetUserNameCommandRegistering>;
end
