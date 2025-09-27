using CK.Core;
using CK.TS.Angular;

namespace CK.Ng.UserProfile;

[NgRoutedComponent<INgPrivatePageComponent>( Route = "profile" )]
[Package<UserProfilePackage>]
[OptionalRequires<INgUserInfoBoxComponent>]
public sealed class UserProfilePageComponent : NgRoutedComponent
{
}
