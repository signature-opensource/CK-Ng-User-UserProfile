import { IStandardResultPart } from '../../Cris/IStandardResultPart';
import { SimpleUserMessage } from '../../Core/SimpleUserMessage';
import { CTSType } from '../../Core/CTSType';

export class SetUserNameCommandResult implements IStandardResultPart {
public userName: string;
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
userName?: string,
success?: boolean,
userMessages?: Array<SimpleUserMessage>)
constructor(
userName?: string,
success?: boolean,
userMessages?: Array<SimpleUserMessage>)
{
this.userName = userName ?? "";
this.success = success ?? true;
this.userMessages = userMessages ?? [];
CTSType["CK.IO.Actor.ISetUserNameCommandResult"].set( this );
}
readonly _brand!: IStandardResultPart["_brand"] & {"21":any};
}
