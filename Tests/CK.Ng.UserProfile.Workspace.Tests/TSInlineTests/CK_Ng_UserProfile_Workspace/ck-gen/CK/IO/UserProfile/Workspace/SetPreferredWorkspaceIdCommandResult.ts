import { IStandardResultPart } from '../../../Cris/IStandardResultPart';
import { SimpleUserMessage } from '../../../Core/SimpleUserMessage';
import { CTSType } from '../../../Core/CTSType';

export class SetPreferredWorkspaceIdCommandResult implements IStandardResultPart {
public preferredWorkspaceId: number;
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
preferredWorkspaceId?: number,
success?: boolean,
userMessages?: Array<SimpleUserMessage>)
constructor(
preferredWorkspaceId?: number,
success?: boolean,
userMessages?: Array<SimpleUserMessage>)
{
this.preferredWorkspaceId = preferredWorkspaceId ?? 0;
this.success = success ?? true;
this.userMessages = userMessages ?? [];
CTSType["CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommandResult"].set( this );
}
readonly _brand!: IStandardResultPart["_brand"] & {"30":any};
}
