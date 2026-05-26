import { IPoco } from '../Core/IPoco';
import { SimpleUserMessage } from '../Core/SimpleUserMessage';
import { CTSType } from '../Core/CTSType';

/**
 * Describes the final result of a command.
 * 
 * The result's type of a command is not constrained (the TResult in ICommand`1 can be anything) or
 * a ICrisResultError.
 * 
 * This is mainly for "API adaptation" endpoints that has no available back channel and can be called by agnostic
 * process or (TypeScript front).
 **/
export class CrisCallResult implements IPoco {
/**
 * The error or result object (if any).
 * A ICrisResultError on error.
 * null for a successful a ICommand.
 * The result of a ICommand`1 (that can be null).
 **/
public result?: {};
/**
 * An optional list of UserMessageLevel.info, 
 * UserMessageLevel.warn or 
 * UserMessageLevel.error messages issued by the validation of the command.
 * Validation error messages also appear in the ICrisResultError.errors.
 **/
public validationMessages?: Array<SimpleUserMessage>;
/**
 * An optional correlation identifier.
 **/
public correlationId?: string;
public constructor()
public constructor(
result?: {},
validationMessages?: Array<SimpleUserMessage>,
correlationId?: string)
constructor(
result?: {},
validationMessages?: Array<SimpleUserMessage>,
correlationId?: string)
{
this.result = result;
this.validationMessages = validationMessages;
this.correlationId = correlationId;
CTSType["CrisCallResult"].set( this );
}
readonly _brand!: IPoco["_brand"] & {"5":any};
}
