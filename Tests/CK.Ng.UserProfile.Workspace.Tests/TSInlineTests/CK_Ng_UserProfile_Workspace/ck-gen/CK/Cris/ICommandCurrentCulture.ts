import { ICommandPart } from './ICommandPart';
import { ICurrentCulturePart } from './ICurrentCulturePart';

/**
 * Command part that specifies the CurrentCultureInfo that must be available
 * when validating and handling the command.
 **/
export interface ICommandCurrentCulture extends ICommandPart, ICurrentCulturePart {
readonly _brand: ICommandPart["_brand"] & ICurrentCulturePart["_brand"] & {"47":any};
}
