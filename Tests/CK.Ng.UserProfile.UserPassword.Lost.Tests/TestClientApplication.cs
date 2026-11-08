using CK.AppIdentity;
using CK.Core;
using System.Threading.Tasks;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

/// <summary>
/// The tests' party has a default client application (a host with CK.TS.AspNet.Clients contributes its own): the links of
/// the mails target it, on the party's "Local:PublicUrl".
/// </summary>
public sealed class TestClientApplication : ApplicationIdentityFeatureDriver
{
    public TestClientApplication( ApplicationIdentityService s ) : base( s, true ) { }

    protected override void ContributeDescription( ILocalParty party, PartyDescription.Builder builder ) => builder.AddClientApplication( "App", "/" );

    protected override Task<bool> SetupAsync( FeatureLifetimeContext context ) => Task.FromResult( true );

    protected override Task<bool> SetupDynamicRemoteAsync( FeatureLifetimeContext context, IOwnedParty party ) => Task.FromResult( true );

    protected override Task TeardownDynamicRemoteAsync( FeatureLifetimeContext context, IOwnedParty party ) => Task.CompletedTask;

    protected override Task TeardownAsync( FeatureLifetimeContext context ) => Task.CompletedTask;
}
