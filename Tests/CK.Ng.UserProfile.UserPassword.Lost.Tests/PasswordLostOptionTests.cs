using CK.Core;
using CK.UserProfile.UserPassword.Lost;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Shouldly;
using System;
using System.Collections.Generic;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

/// <summary>
/// The "PasswordLost" option of the AuthCenter reads its configuration: an invalid one throws.
/// </summary>
[TestFixture]
public class PasswordLostOptionTests
{
    static IConfiguration Section( params (string Key, string Value)[] values )
    {
        var data = new Dictionary<string, string?>();
        foreach( var (k, v) in values ) data[k] = v;
        return new ConfigurationBuilder().AddInMemoryCollection( data ).Build();
    }

    [Test]
    public void the_token_lifetime_defaults_to_2_hours()
    {
        new PasswordLostOption( null ).TokenLifetime.ShouldBe( PasswordLostOption.DefaultTokenLifetime );
        PasswordLostOption.DefaultTokenLifetime.ShouldBe( TimeSpan.FromHours( 2 ) );
    }

    [Test]
    public void the_token_lifetime_is_configured()
    {
        new PasswordLostOption( Section( ("TokenLifetime", "00:45:00") ) ).TokenLifetime.ShouldBe( TimeSpan.FromMinutes( 45 ) );
    }

    [TestCase( "TokenLifetime", "soon", "Invalid \"TokenLifetime\": 'soon'" )]
    [TestCase( "TokenLifetime", "-01:00:00", "Invalid \"TokenLifetime\": '-01:00:00'" )]
    [TestCase( "Lifetime", "01:00:00", "Unknown \"Lifetime\": the keys are TokenLifetime, Sender." )]
    public void an_invalid_configuration_throws( string key, string value, string expected )
    {
        Should.Throw<CKException>( () => new PasswordLostOption( Section( (key, value) ) ) ).Message.ShouldStartWith( expected );
    }
}
