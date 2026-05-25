import { ICommandAuthUnsafe } from './ICommandAuthUnsafe';
import { IAuthNormalPart } from './IAuthNormalPart';

export interface ICommandAuthNormal extends ICommandAuthUnsafe, IAuthNormalPart {
readonly _brand: ICommandAuthUnsafe["_brand"] & IAuthNormalPart["_brand"] & {"39":any};
}
