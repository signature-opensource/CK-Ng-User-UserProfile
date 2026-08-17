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

    it( 'answers the same thing whether the address is known or not', async () => {
        // Both commands are anonymous: no login here.
        const known = await cris.sendOrThrowAsync( new SendForgotPasswordEmailCommand( 'testuser@example.com' ) );
        const unknown = await cris.sendOrThrowAsync( new SendForgotPasswordEmailCommand( 'nobody-here@example.com' ) );

        expect( known ).not.toBeNull();
        expect( unknown ).not.toBeNull();
        // This is the property that prevents using the form to probe for accounts.
        expect( unknown!.message ).toBe( known!.message );
    } );

    it( 'rejects a forged recovery token', async () => {
        const res = await cris.sendOrThrowAsync( new RecoverPasswordCommand( 'not-a-real-token', 'Str0ng$Pwd' ) );

        expect( res ).not.toBeNull();
        // The token is self-signed: Unprotect fails and the flow answers with its invalid-link message.
        expect( res!.message ).toContain( 'no longer valid' );
    } );

    it( 'rejects an empty recovery token', async () => {
        const res = await cris.sendOrThrowAsync( new RecoverPasswordCommand( '', 'Str0ng$Pwd' ) );

        expect( res ).not.toBeNull();
        expect( res!.message ).toContain( 'no longer valid' );
    } );
} );
