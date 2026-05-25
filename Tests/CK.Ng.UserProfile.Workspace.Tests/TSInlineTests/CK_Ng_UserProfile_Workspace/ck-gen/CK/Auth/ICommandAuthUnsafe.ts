import { ICommandPart } from '../Cris/ICommandPart';
import { IAuthUnsafePart } from './IAuthUnsafePart';

export interface ICommandAuthUnsafe extends ICommandPart, IAuthUnsafePart {
readonly _brand: ICommandPart["_brand"] & IAuthUnsafePart["_brand"] & {"42":any};
}
