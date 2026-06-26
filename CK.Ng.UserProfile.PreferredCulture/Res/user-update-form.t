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
    ensure import { locales, DEFAULT_LOCALE_INFO } from '@local/ck-gen/ts-locales/locales';
    ensure import { TemplateRef, viewChild } from '@angular/core';
    ensure import { SetUserExtendedCultureCommand } from '@local/ck-gen';

    inject """
           languageChoice: Signal<TemplateRef<unknown> | undefined> = viewChild( 'languageChoice' );
           """ into <PreViewChildren>;

    inject """

           this.form()!.get( 'language' )?.patchValue( Object.values( locales ).find( l => l.id === this.userProfile()!.extendedCultureId )?.name ?? DEFAULT_LOCALE_INFO.name );

           """ into <PostCancelModifications>;

    inject """

           // <PrePreferredLanguageFormControlDefinition revert />
           const language = new FormControlConfig(
               'select',
               this.#translateService.instant( 'CK.UserProfile.PreferredCultureName' ),
               ( Object.values( locales ).find( l => l.id === this.userProfile()!.extendedCultureId )?.name ?? DEFAULT_LOCALE_INFO.name ),
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
           const currentCultureName = Object.values( locales ).find( l => l.id === this.userProfile()!.extendedCultureId )?.name ?? DEFAULT_LOCALE_INFO.name;
           if( form.get( 'language' )!.value !== currentCultureName ) {
               var setCultureCmd = new SetUserExtendedCultureCommand();

               setCultureCmd.actorId = this.userProfile()!.userId;

               setCultureCmd.userId = this.userProfile()!.userId;
               setCultureCmd.extendedCultureId = locales[form.get( 'language' )!.value].id;
               batchCmd.commands.push( { command: setCultureCmd, description: 'Setting user\'s extendedCultureId.' } );
           }
           // <PostSetUserPreferedCultureCommandRegistering />
           """ into <PostSetUserNameCommandRegistering>;
end
