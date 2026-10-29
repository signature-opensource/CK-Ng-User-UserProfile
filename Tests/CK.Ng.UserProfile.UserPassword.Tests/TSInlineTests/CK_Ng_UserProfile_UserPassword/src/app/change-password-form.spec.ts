import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, NotificationService, SetPasswordCommand } from '@local/ck-gen';
import { ChangePasswordForm } from '@local/ck-gen/CK/Ng/UserProfile/UserPassword/change-password-form/change-password-form';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

// In its own file: the AXIOS instance of CKGenAppModule is created once per file, a second login in another
// file's describe would send anonymous Cris calls.
describe( 'ChangePasswordForm', () => {
    let ngAuthService: NgAuthService;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                providers: [...CKGenAppModule.Providers, provideNoopAnimations()]
            } ).compileComponents();
        ngAuthService = TestBed.inject( NgAuthService );
        await ngAuthService.authService.isInitialized;
        await TestBed.inject( HttpCrisEndpoint ).updateAmbientValuesAsync();
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
    } );

    it( 'asks for a recent login below the Critical level and sends no password', async () => {
        // This host gives no Critical level to the Basic logins (no SchemesCriticalTimeSpan).
        await ngAuthService.authService.basicLogin( 'TestUser', 'success' );
        expect( ngAuthService.authenticationInfo().level ).toBe( AuthLevel.Normal );

        const notif = TestBed.inject( NotificationService );
        const messages: Array<[string, string]> = [];
        jest.spyOn( notif, 'notifySimpleMessage' ).mockImplementation( ( type: any, text: any ) => { messages.push( [type, text] ); } );
        const send = jest.spyOn( TestBed.inject( HttpCrisEndpoint ), 'sendOrThrowAsync' );

        const form = TestBed.createComponent( ChangePasswordForm ).componentInstance;
        form.formGroup.setValue( { password: 'An0ther-Passw0rd!', repeat: 'An0ther-Passw0rd!' } );
        expect( form.formGroup.valid ).toBe( true );
        await expect( form.setPasswordAsync() ).rejects.toBeUndefined();

        // (The UserService of the form reads the profile.)
        expect( send.mock.calls.filter( c => c[0] instanceof SetPasswordCommand ) ).toEqual( [] );
        expect( messages.length ).toBe( 1 );
        expect( messages[0][0] ).toBe( 'error' );
    } );
} );
