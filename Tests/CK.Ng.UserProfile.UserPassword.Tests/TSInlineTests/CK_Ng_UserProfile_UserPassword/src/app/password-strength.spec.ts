import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { PASSWORD_CRITERIA, PASSWORD_MIN_LENGTH, passwordComplexity, PasswordStrength } from '@local/ck-gen';
import { appConfig } from './app.config';

// Satisfies every criterion, and is the base the samples below are derived from.
const VALID = 'Abcdefg1!';

// One sample per criterion, breaking that criterion AND ONLY IT. The test right below pins this
// map against PASSWORD_CRITERIA: adding a criterion without a sample here fails loudly rather
// than leaving it silently untested.
const BREAKS_ONLY: Readonly<Record<string, string>> = {
    MinLength: 'Ab1!',
    Digit: 'Abcdefgh!',
    Lower: 'ABCDEFG1!',
    Upper: 'abcdefg1!',
    Special: 'Abcdefg1'
};

// The errors passwordComplexity puts on a password field, without the `fieldTree` signal forms add.
// The empty value and the full error shape are pinned in password-rules.spec.ts.
const validate = ( value: string ) =>
    TestBed.runInInjectionContext( () => form( signal( { password: value } ), p => passwordComplexity( p.password ) ) )
        .password().errors().map( e => ( { kind: e.kind, unmet: ( e as { unmet?: string[] } ).unmet } ) );

describe( 'password criteria', () => {
    it( 'has exactly one breaking sample per criterion', () => {
        expect( Object.keys( BREAKS_ONLY ).sort() ).toEqual( PASSWORD_CRITERIA.map( c => c.key ).sort() );
    } );

    it( 'accepts a password that satisfies them all', () => {
        expect( VALID.length ).toBeGreaterThanOrEqual( PASSWORD_MIN_LENGTH );
        expect( PASSWORD_CRITERIA.every( c => c.test( VALID ) ) ).toBe( true );
    } );

    // The point of the whole table: the criterion the user sees unchecked is exactly the key the
    // rule reports. If the two ever drift apart, this is what catches it.
    for ( const [key, sample] of Object.entries( BREAKS_ONLY ) ) {
        it( `reports ${key}, and only it, for '${sample}'`, () => {
            expect( validate( sample ) ).toEqual( [{ kind: 'passwordComplexity', unmet: [key] }] );
            expect( PASSWORD_CRITERIA.filter( c => !c.test( sample ) ).map( c => c.key ) ).toEqual( [key] );
        } );
    }
} );

describe( 'ck-password-strength', () => {
    let fixture: ComponentFixture<PasswordStrength>;

    const render = ( password: string ) => {
        fixture.componentRef.setInput( 'password', password );
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    };

    beforeEach( async () => {
        await TestBed.configureTestingModule( {
            // Added by CK.TS.AngularEngine: DI is fully configured and available in tests.
            providers: appConfig.providers,
            imports: [PasswordStrength]
        } ).compileComponents();
        fixture = TestBed.createComponent( PasswordStrength );
    } );

    // Asserted on the structure rather than on the translated text: the labels come from the
    // ngx-translate sets, which are loaded asynchronously.
    it( 'shows nothing while the field is empty', () => {
        const el = render( '' );
        expect( el.querySelector( '.ck-password-strength-track' ) ).toBeNull();
        expect( el.querySelectorAll( 'li' ).length ).toBe( 0 );
    } );

    it( 'appears on the first keystroke, with one line per criterion', () => {
        const el = render( 'a' );
        expect( el.querySelector( '.ck-password-strength-track' ) ).not.toBeNull();
        expect( el.querySelectorAll( 'li' ).length ).toBe( PASSWORD_CRITERIA.length );
        // 'a' only satisfies the lowercase criterion.
        expect( el.querySelectorAll( 'li.met' ).length ).toBe( 1 );
    } );

    it( 'ticks a criterion as soon as it is satisfied', () => {
        expect( render( 'a' ).querySelectorAll( 'li.met' ).length ).toBe( 1 );
        expect( render( 'aB' ).querySelectorAll( 'li.met' ).length ).toBe( 2 );
        expect( render( 'aB1' ).querySelectorAll( 'li.met' ).length ).toBe( 3 );
        expect( render( 'aB1!' ).querySelectorAll( 'li.met' ).length ).toBe( 4 );
        expect( render( VALID ).querySelectorAll( 'li.met' ).length ).toBe( PASSWORD_CRITERIA.length );
    } );

    it( 'grades weak, then medium, then strong', () => {
        const fill = () => fixture.nativeElement.querySelector( '.ck-password-strength-fill' ) as HTMLElement;

        render( 'a' );
        expect( fill().classList ).toContain( 'weak' );

        // Four criteria out of five: everything but the special character.
        render( 'Abcdefg1' );
        expect( fill().classList ).toContain( 'medium' );

        // Only a fully compliant password is strong — it is also the only one the form accepts.
        render( VALID );
        expect( fill().classList ).toContain( 'strong' );
        expect( fill().style.width ).toBe( '100%' );
    } );
} );
