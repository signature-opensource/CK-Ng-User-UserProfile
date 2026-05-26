import { IPoco } from '../../Core/IPoco';
import { GroupInfos } from '../UserProfile/Workspace/GroupInfos';
import { CTSType } from '../../Core/CTSType';

export class UserProfile implements IPoco {
public userId: number;
public userName: string;
public preferredWorkspaceId: number;
public readonly groups: Array<GroupInfos>;
public constructor()
public constructor(
userId?: number,
userName?: string,
preferredWorkspaceId?: number,
groups?: Array<GroupInfos>)
constructor(
userId?: number,
userName?: string,
preferredWorkspaceId?: number,
groups?: Array<GroupInfos>)
{
this.userId = userId ?? 0;
this.userName = userName ?? "";
this.preferredWorkspaceId = preferredWorkspaceId ?? 0;
this.groups = groups ?? [];
CTSType["CK.IO.Actor.IUserProfile"].set( this );
}
readonly _brand!: IPoco["_brand"] & {"22":any};
}
