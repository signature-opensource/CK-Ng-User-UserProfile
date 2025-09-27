using CK.Core;
using CK.TS.Angular;

namespace CK.Ng.UserProfile;

[NgComponent]
[Package<UserProfilePackage>]
[RequiredBy<UserProfilePageComponent>]
[Requires<Zorro.GenericFormComponent>]
public sealed class UserUpdateFormComponent : NgComponent
{
}
