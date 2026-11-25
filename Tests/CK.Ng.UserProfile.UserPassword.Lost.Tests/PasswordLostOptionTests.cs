using CK.Core;
using CK.Setup;
using CK.UserProfile.UserPassword.Lost;
using NUnit.Framework;
using Shouldly;
using System;
using System.Linq;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

/// <summary>
/// The "PasswordLost" option of the AuthCenter: its configuration model (an invalid section is an error of its model).
/// </summary>
[TestFixture]
public class PasswordLostOptionTests
{
    static PasswordLostOptionConfiguration? Read( string json, out string[] errors )
    {
        var collector = new UserMessageCollector( new CurrentCultureInfo( new TranslationService(), NormalizedCultureInfo.CodeDefault ) );
        ConfigurationModelReader.TryRead<PasswordLostOptionConfiguration>( ImmutableConfigurationSection.CreateFromJson( "Test", "PasswordLost", json ),
                                                                           "PasswordLost",
                                                                           collector,
                                                                           out var model );
        errors = collector.UserMessages.Where( m => m.Level == UserMessageLevel.Error ).Select( m => m.Text ).ToArray();
        return model;
    }

    [Test]
    public void the_token_lifetime_defaults_to_2_hours()
    {
        new PasswordLostOption( new PasswordLostOptionConfiguration() ).TokenLifetime.ShouldBe( PasswordLostOption.DefaultTokenLifetime );
        PasswordLostOption.DefaultTokenLifetime.ShouldBe( TimeSpan.FromHours( 2 ) );
    }

    [Test]
    public void the_token_lifetime_is_configured()
    {
        var model = Read( """{ "TokenLifetime": "00:45:00", "Sender": "Support" }""", out var errors ).ShouldNotBeNull( string.Join( ", ", errors ) );
        var option = new PasswordLostOption( model );
        option.TokenLifetime.ShouldBe( TimeSpan.FromMinutes( 45 ) );
        option.Sender.ShouldBe( "Support" );
    }

    [TestCase( """{ "TokenLifetime": "soon" }""", "'Test:PasswordLost:TokenLifetime' = 'soon'" )]
    [TestCase( """{ "TokenLifetime": "-01:00:00" }""", "'PasswordLost:TokenLifetime' = '-01:00:00': a positive time span is expected" )]
    [TestCase( """{ "Lifetime": "01:00:00" }""", "Unknown key 'Test:PasswordLost:Lifetime'" )]
    public void an_invalid_configuration_is_an_error( string json, string expected )
    {
        Read( json, out var errors ).ShouldBeNull();
        errors.ShouldContain( e => e.StartsWith( expected ), string.Join( ", ", errors ) );
    }
}
