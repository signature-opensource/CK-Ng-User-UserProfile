import { SimpleUserMessage } from '../Core/SimpleUserMessage';
import { IPoco } from '../Core/IPoco';

/**
 * Defines a standard result part with a IStandardResultPart.success flag and a list of 
 * UserMessage.
 * 
 * Use the IStandardResultPart.setUserMessages method to easily configure this part from a 
 * UserMessageCollector.
 **/
export interface IStandardResultPart extends IPoco {
/**
 * Gets or sets whether the command succeeded or failed.
 * Defaults to true.
 **/
success: boolean;
/**
 * Gets a mutable list of user messages.
 * It is easier to use UserMessageCollector and 
 * IStandardResultPart.setUserMessages.
 **/
readonly userMessages: Array<SimpleUserMessage>;
readonly _brand: IPoco["_brand"] & {"34":any};
}
