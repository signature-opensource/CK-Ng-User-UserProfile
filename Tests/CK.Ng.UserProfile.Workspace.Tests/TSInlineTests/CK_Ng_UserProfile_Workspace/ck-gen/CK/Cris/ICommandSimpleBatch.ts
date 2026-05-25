import { IAbstractCommand, ICommand } from './Model';
import { ICommandPart } from './ICommandPart';
import { ISimpleBatchCommandResultPart } from './ISimpleBatchCommandResultPart';

export interface ICommandSimpleBatch extends ICommandPart, ICommand<ISimpleBatchCommandResultPart|undefined> {
readonly commands: Array<{command: IAbstractCommand, description?: string}>;
readonly _brand: ICommandPart["_brand"] & ICommand<ISimpleBatchCommandResultPart|undefined>["_brand"] & {"43":any};
}
