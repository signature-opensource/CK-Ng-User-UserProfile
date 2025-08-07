create <html> transformer
begin
    insert """

            <ng-template #languageChoice let-option>
                <img class="ck-btn-icon lang-flag" [src]="'/flags/' + option.value + '.svg'" />
                {{ option.label }}
            </ng-template>

           """ after *;
end

create <less> transformer
begin
    insert """

           .lang-flag {
               max-width: 2%;
           }

           """ after *;
end

create <ts> transformer
begin
    ensure import { locales } from '@local/ck-gen/ts-locales/locales';
    ensure import { TemplateRef, viewChild } from '@angular/core';
    ensure import { SetUserPreferredCultureCommand } from '@local/ck-gen';

    inject """
           languageChoice: Signal<TemplateRef<unknown> | undefined> = viewChild( 'languageChoice' );
           """ into <PreViewChildren>;

    inject """

           this.form()!.get( 'language' )?.patchValue( this.userProfile()!.preferredCultureName );

           """ into <PostCancelModifications>;

    inject """

           // <PrePreferredLanguageFormControlDefinition revert />
           const language = new FormControlConfig(
               'select',
               this.#translateService.instant( 'CK.UserProfile.PreferredCultureName' ),
               this.userProfile()!.preferredCultureName,
               {
                   options: Object.entries( locales ).map( cklocale => { return { label: cklocale[1].nativeName, value: cklocale[0] } } ),
                   selectOptionTemplate: this.languageChoice()
               }
           );
           // <PostPreferredLanguageFormControlDefinition />

           """ into <PreUserPreferencesFormControlDefinition>;

    inject """

           language,

           """ into <PreUserPreferencesFormControlRegistration>;

    inject """

           // <PreSetUserPreferedCultureCommandRegistering />
           if( form.get( 'language' )!.value !== this.userProfile()!.preferredCultureName ) {
               var setCultureCmd = new SetUserPreferredCultureCommand();

               setCultureCmd.actorId = this.userProfile()!.userId;

               setCultureCmd.userId = this.userProfile()!.userId;
               setCultureCmd.preferredCultureName = form.get( 'language' )!.value;
               batchCmd.commands.push( { command: setCultureCmd, description: 'Setting user\'s preferredCultureName.' } );
           }
           // <PostSetUserPreferedCultureCommandRegistering />
           """ into <PostSetUserNameCommandRegistering>;
end
