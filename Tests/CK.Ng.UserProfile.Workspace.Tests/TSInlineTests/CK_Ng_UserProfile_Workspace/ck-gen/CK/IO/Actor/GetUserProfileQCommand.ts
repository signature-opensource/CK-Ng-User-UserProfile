import { CommandModel, ICommand } from '../../Cris/Model';
import { UserProfile } from './UserProfile';
import { ICommandAuthNormal } from '../../Auth/ICommandAuthNormal';
import { CTSType } from '../../Core/CTSType';

class MyCommandModel extends CommandModel<GetUserProfileQCommand> {
protected override doApplyAmbientValues( command: any, a: any, o: any ): void {
if( command.actorId === undefined ) command.actorId = o.actorId !== null ? o.actorId : a.actorId;

}

}
export class GetUserProfileQCommand implements ICommand<UserProfile|undefined>, ICommandAuthNormal {
public userId: number;
/**
 * (This is a AmbientService Value.)
 **/
public actorId?: number;
public constructor()
public constructor(
userId?: number,
actorId?: number)
constructor(
userId?: number,
actorId?: number)
{
this.userId = userId ?? 0;
this.actorId = actorId;
CTSType["CK.IO.Actor.IGetUserProfileQCommand"].set( this );
}

get commandModel(): CommandModel<this> { return GetUserProfileQCommand.#m; }

static #m: MyCommandModel = new MyCommandModel();
readonly _brand!: ICommand<UserProfile|undefined>["_brand"] & ICommandAuthNormal["_brand"] & {"16":any};
}
