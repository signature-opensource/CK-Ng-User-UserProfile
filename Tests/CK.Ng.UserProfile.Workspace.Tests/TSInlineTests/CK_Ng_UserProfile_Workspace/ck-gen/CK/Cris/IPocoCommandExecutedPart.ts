import { IAbstractCommand } from './Model';
import { SimpleUserMessage } from '../Core/SimpleUserMessage';
import { IPoco } from '../Core/IPoco';

/**
 * A command part that captures a IExecutedCommand.
 * IPocoCommandExecutedPart.initialize can be used to initialize it.
 **/
export interface IPocoCommandExecutedPart extends IPoco {
/**
 * Gets the command that has been executed.
 **/
command?: IAbstractCommand;
/**
 * Gets the validation messages.
 **/
readonly validationMessages: Array<SimpleUserMessage>;
/**
 * Gets the result of the command. See IExecutedCommand.result.
 **/
result?: {};
readonly _brand: IPoco["_brand"] & {"66":any};
}
