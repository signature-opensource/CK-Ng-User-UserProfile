import { ICrisPoco } from './Model';

/**
 * Marker interface to define mixable command or event parts.
 * 
 * Parts defined from this type instead of ICommandPart or 
 * IEventPart apply to commands as well as events. They should be suffixed by "Part".
 * 
 * Parts can also be extended: when defining a specialized part that extends an
 * existing ICrisPocoPart, the 
 * CKTypeDefinerAttribute must be
 * applied to the specialized part.
 **/
export interface ICrisPocoPart extends ICrisPoco {
readonly _brand: ICrisPoco["_brand"] & {"78":any};
}
