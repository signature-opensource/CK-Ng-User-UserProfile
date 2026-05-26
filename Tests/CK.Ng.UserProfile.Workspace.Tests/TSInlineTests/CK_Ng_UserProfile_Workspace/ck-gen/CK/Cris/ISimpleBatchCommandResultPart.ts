import { PocoCommandExecutedCommandResult } from './PocoCommandExecutedCommandResult';
import { IStandardResultPart } from './IStandardResultPart';

export interface ISimpleBatchCommandResultPart extends IStandardResultPart {
readonly results: Array<PocoCommandExecutedCommandResult>;
readonly _brand: IStandardResultPart["_brand"] & {"43":any};
}
