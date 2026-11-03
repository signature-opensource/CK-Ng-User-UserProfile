using CK.AppIdentity;
using CK.Core;
using System;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

/// <summary>
/// The tests' party has a default client application (a host with CK.TS.AspNet.Clients contributes its own): the links of
/// the mails target it, on the party's "Local:PublicUrl".
/// </summary>
public sealed class TestClientApplication : IPartyDescriptionContributor
{
    public void Activate( IActivityMonitor monitor, Action onChanged ) { }

    public void Contribute( PartyDescription.Builder builder ) => builder.AddClientApplication( "App", "/" );
}
