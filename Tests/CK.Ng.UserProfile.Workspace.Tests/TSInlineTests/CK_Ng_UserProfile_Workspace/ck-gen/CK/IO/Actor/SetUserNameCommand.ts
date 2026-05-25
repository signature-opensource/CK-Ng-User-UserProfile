import { CommandModel, ICommand } from '../../Cris/Model';
import { SetUserNameCommandResult } from './SetUserNameCommandResult';
import { ICommandCurrentCulture } from '../../Cris/ICommandCurrentCulture';
import { ICommandAuthNormal } from '../../Auth/ICommandAuthNormal';
import { CTSType } from '../../Core/CTSType';

class MyCommandModel extends CommandModel<SetUserNameCommand> {
protected override doApplyAmbientValues( command: any, a: any, o: any ): void {
if( command.currentCultureName === undefined ) command.currentCultureName = o.currentCultureName !== null ? o.currentCultureName : a.currentCultureName;

if( command.actorId === undefined ) command.actorId = o.actorId !== null ? o.actorId : a.actorId;

}

}
export class SetUserNameCommand implements ICommand<SetUserNameCommandResult|undefined>, ICommandCurrentCulture, ICommandAuthNormal {
public userId: number;
public userName: string;
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
userName?: string,
currentCultureName?: string,
actorId?: number)
constructor(
userId?: number,
userName?: string,
currentCultureName?: string,
actorId?: number)
{
this.userId = userId ?? 0;
this.userName = userName ?? "";
this.currentCultureName = currentCultureName;
this.actorId = actorId;
CTSType["CK.IO.Actor.ISetUserNameCommand"].set( this );
}

get commandModel(): CommandModel<this> { return SetUserNameCommand.#m; }

static #m: MyCommandModel = new MyCommandModel();
readonly _brand!: ICommand<SetUserNameCommandResult|undefined>["_brand"] & ICommandCurrentCulture["_brand"] & ICommandAuthNormal["_brand"] & {"19":any};
}
