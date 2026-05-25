import { ICrisPocoPart } from '../Cris/ICrisPocoPart';

export interface IAuthUnsafePart extends ICrisPocoPart {
actorId?: number;
readonly _brand: ICrisPocoPart["_brand"] & {"60":any};
}
