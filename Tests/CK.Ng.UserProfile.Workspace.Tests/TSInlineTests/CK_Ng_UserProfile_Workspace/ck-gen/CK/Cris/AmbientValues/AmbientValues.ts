import { IPoco } from '../../Core/IPoco';
import { CTSType } from '../../Core/CTSType';

/**
 * Defines an extensible set of properties that are always available. Their values come from ambient or
 * processwisde services.
 * This can be any kind of information like authentication informations (that is an ambient information),
 * public keys (that would be managed by a processwide singleton), etc.
 * 
 * Commands (quite always ICommandPart) can define these properties thanks to the 
 * AmbientServiceValueAttribute.
 * 
 * These properties cannot be null: they necessarily exist and a [PostHandler] method with the
 * IAmbientValuesCollectCommand must set them.
 * Retrieves ICurrentCulturePart.currentCultureName value.
 **/
export class AmbientValues implements IPoco {
/**
 * The current culture name.
 **/
public currentCultureName: string;
public actorId: number;
public actualActorId: number;
public deviceId: string;
public currentWorkspaceId: number;
public constructor()
public constructor(
currentCultureName?: string,
actorId?: number,
actualActorId?: number,
deviceId?: string,
currentWorkspaceId?: number)
constructor(
currentCultureName?: string,
actorId?: number,
actualActorId?: number,
deviceId?: string,
currentWorkspaceId?: number)
{
this.currentCultureName = currentCultureName ?? "";
this.actorId = actorId ?? 0;
this.actualActorId = actualActorId ?? 0;
this.deviceId = deviceId ?? "";
this.currentWorkspaceId = currentWorkspaceId ?? 0;
CTSType["CK.Cris.AmbientValues.IAmbientValues"].set( this );
}
readonly _brand!: IPoco["_brand"] & {"0":any};
}
