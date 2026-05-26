import { ICrisPocoPart } from './ICrisPocoPart';

/**
 * Command or Event part that specifies the CurrentCultureInfo.
 **/
export interface ICurrentCulturePart extends ICrisPocoPart {
/**
 * Gets or sets the current culture name that must be used when handling
 * an event or a command. When null, the currently available CurrentCultureInfo is
 * not changed.
 **/
currentCultureName?: string;
readonly _brand: ICrisPocoPart["_brand"] & {"69":any};
}
