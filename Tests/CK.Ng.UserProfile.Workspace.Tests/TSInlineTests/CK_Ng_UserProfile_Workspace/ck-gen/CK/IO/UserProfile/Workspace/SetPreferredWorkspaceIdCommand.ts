import { CommandModel, ICommand } from '../../../Cris/Model';
import { SetPreferredWorkspaceIdCommandResult } from './SetPreferredWorkspaceIdCommandResult';
import { ICommandCurrentCulture } from '../../../Cris/ICommandCurrentCulture';
import { ICommandAuthNormal } from '../../../Auth/ICommandAuthNormal';
import { CTSType } from '../../../Core/CTSType';

class MyCommandModel extends CommandModel<SetPreferredWorkspaceIdCommand> {
protected override doApplyAmbientValues( command: any, a: any, o: any ): void {
if( command.currentCultureName === undefined ) command.currentCultureName = o.currentCultureName !== null ? o.currentCultureName : a.currentCultureName;

if( command.actorId === undefined ) command.actorId = o.actorId !== null ? o.actorId : a.actorId;

}

}
export class SetPreferredWorkspaceIdCommand implements ICommand<SetPreferredWorkspaceIdCommandResult|undefined>, ICommandCurrentCulture, ICommandAuthNormal {
public userId: number;
public workspaceId: number;
/**
 * The current culture name that must be used when handling
 * an event or a command. When null, the currently available CurrentCultureInfo is
 * not changed.
 * (This is a AmbientService Value.)
 **/
public currentCultureName?: string;
/**
 * (This is a AmbientService Value.)
 **/
public actorId?: number;
public constructor()
public constructor(
userId?: number,
workspaceId?: number,
currentCultureName?: string,
actorId?: number)
constructor(
userId?: number,
workspaceId?: number,
currentCultureName?: string,
actorId?: number)
{
this.userId = userId ?? 0;
this.workspaceId = workspaceId ?? 0;
this.currentCultureName = currentCultureName;
this.actorId = actorId;
CTSType["CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommand"].set( this );
}

get commandModel(): CommandModel<this> { return SetPreferredWorkspaceIdCommand.#m; }

static #m: MyCommandModel = new MyCommandModel();
readonly _brand!: ICommand<SetPreferredWorkspaceIdCommandResult|undefined>["_brand"] & ICommandCurrentCulture["_brand"] & ICommandAuthNormal["_brand"] & {"31":any};
}
