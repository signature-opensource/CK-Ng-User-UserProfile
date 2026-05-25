import { IPocoCommandExecutedPart } from './IPocoCommandExecutedPart';
import { IAbstractCommand } from './Model';
import { SimpleUserMessage } from '../Core/SimpleUserMessage';
import { CTSType } from '../Core/CTSType';

export class PocoCommandExecutedCommandResult implements IPocoCommandExecutedPart {
/**
 * The command that has been executed.
 **/
public command?: IAbstractCommand;
/**
 * The validation messages.
 **/
public readonly validationMessages: Array<SimpleUserMessage>;
/**
 * The result of the command. See IExecutedCommand.result.
 **/
public result?: {};
public constructor()
public constructor(
command?: IAbstractCommand,
validationMessages?: Array<SimpleUserMessage>,
result?: {})
constructor(
command?: IAbstractCommand,
validationMessages?: Array<SimpleUserMessage>,
result?: {})
{
this.command = command;
this.validationMessages = validationMessages ?? [];
this.result = result;
CTSType["CK.Cris.IPocoCommandExecutedCommandResult"].set( this );
}
readonly _brand!: IPocoCommandExecutedPart["_brand"] & {"29":any};
}
