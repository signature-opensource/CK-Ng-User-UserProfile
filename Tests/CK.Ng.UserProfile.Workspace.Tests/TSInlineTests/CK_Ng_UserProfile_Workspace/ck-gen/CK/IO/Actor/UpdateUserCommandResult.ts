import { ISimpleBatchCommandResultPart } from '../../Cris/ISimpleBatchCommandResultPart';
import { PocoCommandExecutedCommandResult } from '../../Cris/PocoCommandExecutedCommandResult';
import { SimpleUserMessage } from '../../Core/SimpleUserMessage';
import { CTSType } from '../../Core/CTSType';

export class UpdateUserCommandResult implements ISimpleBatchCommandResultPart {
public readonly results: Array<PocoCommandExecutedCommandResult>;
/**
 * Whether the command succeeded or failed.
 * Defaults to true.
 **/
public success: boolean;
/**
 * A mutable list of user messages.
 * It is easier to use UserMessageCollector and 
 * IStandardResultPart.setUserMessages.
 **/
public readonly userMessages: Array<SimpleUserMessage>;
public constructor()
public constructor(
results?: Array<PocoCommandExecutedCommandResult>,
success?: boolean,
userMessages?: Array<SimpleUserMessage>)
constructor(
results?: Array<PocoCommandExecutedCommandResult>,
success?: boolean,
userMessages?: Array<SimpleUserMessage>)
{
this.results = results ?? [];
this.success = success ?? true;
this.userMessages = userMessages ?? [];
CTSType["CK.IO.Actor.IUpdateUserCommandResult"].set( this );
}
readonly _brand!: ISimpleBatchCommandResultPart["_brand"] & {"26":any};
}
