import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { HttpCrisEndpoint, NgAuthService, RecoverPasswordCommand, SendForgotPasswordEmailCommand } from '@local/ck-gen';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

describe( 'lost password flow', () => {
    let ngAuthService: NgAuthService;
    let cris: HttpCrisEndpoint;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                imports: [AppComponent],
                providers: [...CKGenAppModule.Providers, { provide: ComponentFixtureAutoDetect, useValue: true }]
            } ).compileComponents();

        ngAuthService = TestBed.inject( NgAuthService );
        cris = TestBed.inject( HttpCrisEndpoint );
        await ngAuthService.authService.isInitialized;
        await cris.updateAmbientValuesAsync();
    } );

    /** Builds the command the way password-lost-form does: carrying the site culture. */
    function sendForgotPassword( email: string ) {
        const cmd = new SendForgotPasswordEmailCommand( email );
        cmd.currentCultureName = 'fr';
        return cris.sendOrThrowAsync( cmd );
    }

    it( 'answers the same thing whether the address is known or not', async () => {
        // Both commands are anonymous: no login here.
        const known = await sendForgotPassword( 'testuser@example.com' );
        const unknown = await sendForgotPassword( 'nobody-here@example.com' );

        expect( known ).not.toBeNull();
        expect( unknown ).not.toBeNull();
        // Success in both cases: reporting a failure for an unknown address would disclose it.
        expect( known!.success ).toBe( true );
        expect( unknown!.success ).toBe( true );
        // The command carries currentCultureName = 'fr': the answer comes back translated from the
        // Res/locales set shipped by the package, not from the English fallback in the handler.
        expect( known!.userMessages[0].message ).toContain( 'Si cette adresse' );
        // This is the property that prevents using the form to probe for accounts.
        expect( unknown!.userMessages[0].message ).toBe( known!.userMessages[0].message );
    } );

    it( 'rejects a forged recovery token, answering in the command culture', async () => {
        // Carries the culture like recover-password-form does, which routes the command to the
        // CrisBackgroundExecutor: this also covers that the handler can run there.
        const cmd = new RecoverPasswordCommand( 'not-a-real-token', 'Str0ng$Pwd' );
        cmd.currentCultureName = 'fr';
        const res = await cris.sendOrThrowAsync( cmd );

        expect( res ).not.toBeNull();
        // The token is self-signed: Unprotect fails and the flow answers with its invalid-link message.
        expect( res!.success ).toBe( false );
        expect( res!.userMessages[0].message ).toContain( 'plus valide' );
    } );

    it( 'rejects an empty recovery token', async () => {
        const res = await cris.sendOrThrowAsync( new RecoverPasswordCommand( '', 'Str0ng$Pwd' ) );

        expect( res ).not.toBeNull();
        expect( res!.success ).toBe( false );
        expect( res!.userMessages[0].message ).toContain( 'no longer valid' );
    } );
} );
