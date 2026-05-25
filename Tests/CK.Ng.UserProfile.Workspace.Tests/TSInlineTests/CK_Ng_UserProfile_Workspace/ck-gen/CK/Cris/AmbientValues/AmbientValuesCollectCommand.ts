import { CommandModel, ICommand } from '../Model';
import { AmbientValues } from './AmbientValues';
import { CTSType } from '../../Core/CTSType';

class MyCommandModel extends CommandModel<AmbientValuesCollectCommand> {
protected override doApplyAmbientValues( command: any, a: any, o: any ): void {
// This command has no AmbientValue property.

}

}
/**
 * The command that returns the IAmbientValues.
 * 
 * This standard command comes with a default but rather definitive command handler (AmbientValuesService.getValues)
 * that instantiates an empty IAmbientValues instance: then, any number of CommandPostHandlerAttribute can be used to set
 * the values.
 **/
export class AmbientValuesCollectCommand implements ICommand<AmbientValues|undefined> {
public constructor()
public constructor()
constructor()
{
CTSType["CK.Cris.AmbientValues.IAmbientValuesCollectCommand"].set( this );
}

get commandModel(): CommandModel<this> { return AmbientValuesCollectCommand.#m; }

static #m: MyCommandModel = new MyCommandModel();
readonly _brand!: ICommand<AmbientValues|undefined>["_brand"] & {"6":any};
}
