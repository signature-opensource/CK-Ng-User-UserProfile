import { IPoco } from '../Core/IPoco';
import { SimpleUserMessage } from '../Core/SimpleUserMessage';
import { CTSType } from '../Core/CTSType';

/**
 * Simple model for errors: a list of UserMessage.
 **/
export class CrisResultError implements IPoco {
/**
 * Whether the command failed during validation or execution.
 **/
public isValidationError: boolean;
/**
 * The list of user messages.
 * At least one of them should be a UserMessageLevel.error but this is not checked.
 **/
public readonly errors: Array<SimpleUserMessage>;
/**
 * A LogKey that enables to locate the logs of the command execution.
 * It may not always be available.
 **/
public logKey?: string;
public constructor()
public constructor(
isValidationError?: boolean,
errors?: Array<SimpleUserMessage>,
logKey?: string)
constructor(
isValidationError?: boolean,
errors?: Array<SimpleUserMessage>,
logKey?: string)
{
this.isValidationError = isValidationError ?? false;
this.errors = errors ?? [];
this.logKey = logKey;
CTSType["CrisResultError"].set( this );
}
readonly _brand!: IPoco["_brand"] & {"5":any};
}
