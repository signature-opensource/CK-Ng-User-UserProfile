import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { passwordComplexity, passwordsMatch } from '@local/ck-gen';

// Errors are asserted whole with toStrictEqual: signal forms add a `fieldTree` pointing at the field
// that holds the error, and toStrictEqual also rejects a `message: undefined` key.
const complexityForm = ( password: string, options?: { message?: string } ) =>
    TestBed.runInInjectionContext( () => form( signal( { password } ), p => passwordComplexity( p.password, options ) ) );

const matchForm = ( password: string, confirm: string, options?: { message?: string } ) => {
    const model = signal( { password, confirm } );
    const f = TestBed.runInInjectionContext( () => form( model, p => passwordsMatch( p.password, p.confirm, options ) ) );
    return { model, f };
};

describe( 'passwordComplexity', () => {
    it( 'reports every unmet criterion at once, in display order', () => {
        const f = complexityForm( 'abc' );
        expect( f.password().errors() ).toStrictEqual( [
            { kind: 'passwordComplexity', unmet: ['MinLength', 'Digit', 'Upper', 'Special'], fieldTree: f.password }
        ] );
    } );

    it( 'accepts a password that meets every criterion', () => {
        expect( complexityForm( 'Abcdef1!' ).password().errors() ).toStrictEqual( [] );
    } );

    it( 'says nothing about an empty value, which is what required is for', () => {
        expect( complexityForm( '' ).password().errors() ).toStrictEqual( [] );
    } );

    it( 'carries the message it is given', () => {
        const f = complexityForm( 'abc', { message: 'K.Weak' } );
        expect( f.password().errors() ).toStrictEqual( [
            { kind: 'passwordComplexity', unmet: ['MinLength', 'Digit', 'Upper', 'Special'], message: 'K.Weak', fieldTree: f.password }
        ] );
    } );
} );

describe( 'passwordsMatch', () => {
    it( 'reports a mismatch on the confirm field only', () => {
        const { f } = matchForm( 'Abcdef1!', 'Abcdef1?' );
        expect( f.confirm().errors() ).toStrictEqual( [{ kind: 'passwordMismatch', fieldTree: f.confirm }] );
        expect( f.password().errors() ).toStrictEqual( [] );
    } );

    it( 'says nothing while the confirm field is empty', () => {
        expect( matchForm( 'Abcdef1!', '' ).f.confirm().errors() ).toStrictEqual( [] );
    } );

    it( 'says nothing while the password field is empty', () => {
        expect( matchForm( '', 'Abcdef1!' ).f.confirm().errors() ).toStrictEqual( [] );
    } );

    it( 'reports a mismatch when the password changes after the confirm field matched', () => {
        const { model, f } = matchForm( 'Abcdef1!', 'Abcdef1!' );
        expect( f.confirm().errors() ).toStrictEqual( [] );
        model.update( m => ( { ...m, password: 'Abcdef1?' } ) );
        expect( f.confirm().errors() ).toStrictEqual( [{ kind: 'passwordMismatch', fieldTree: f.confirm }] );
    } );

    it( 'carries the message it is given', () => {
        const { f } = matchForm( 'Abcdef1!', 'Abcdef1?', { message: 'K.Mismatch' } );
        expect( f.confirm().errors() ).toStrictEqual( [{ kind: 'passwordMismatch', message: 'K.Mismatch', fieldTree: f.confirm }] );
    } );
} );
