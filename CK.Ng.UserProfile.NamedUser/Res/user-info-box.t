create <ts> transformer
begin
    ensure import { UserService } from '@local/ck-gen';

    inject """
           readonly #userService = inject( UserService );
           """ into <PreDependencyInjection>;

    inject """

           const firstName = this.#userService.userProfile()?.firstName;
           const lastName = this.#userService.userProfile()?.lastName
           if ( firstName && lastName ) {
               return `${trimAndUpper( firstName.trim().slice( 0, 1 ) )}${trimAndUpper( lastName.trim().slice( 0, 1 ) )}`;
           }

           """ into <PreAvatarFallbackComputing>
end
