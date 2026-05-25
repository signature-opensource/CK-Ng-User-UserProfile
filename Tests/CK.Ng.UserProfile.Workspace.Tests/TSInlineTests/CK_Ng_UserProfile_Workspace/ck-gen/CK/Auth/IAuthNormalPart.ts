import { IAuthUnsafePart } from './IAuthUnsafePart';

export interface IAuthNormalPart extends IAuthUnsafePart {
readonly _brand: IAuthUnsafePart["_brand"] & {"57":any};
}
