import { SetPreferredWorkspaceIdCommand } from '../IO/UserProfile/Workspace/SetPreferredWorkspaceIdCommand';
import { SetUserNameCommand } from '../IO/Actor/SetUserNameCommand';
import { UpdateUserCommand } from '../IO/Actor/UpdateUserCommand';
import { GetUserProfileQCommand } from '../IO/Actor/GetUserProfileQCommand';
import { UserProfile } from '../IO/Actor/UserProfile';
import { CrisCallResult } from '../Cris/CrisCallResult';
import { CrisResultError } from '../Cris/CrisResultError';
import { AmbientValues } from '../Cris/AmbientValues/AmbientValues';
import { AmbientValuesCollectCommand } from '../Cris/AmbientValues/AmbientValuesCollectCommand';
import { SimpleUserMessage } from './SimpleUserMessage';
import { UserMessageLevel } from './UserMessageLevel';
import { AuthLevel } from '../AspNet/Auth/AuthLevel';
import { SetUserNameCommandResult } from '../IO/Actor/SetUserNameCommandResult';
import { GroupInfos } from '../IO/UserProfile/Workspace/GroupInfos';
import { SetPreferredWorkspaceIdCommandResult } from '../IO/UserProfile/Workspace/SetPreferredWorkspaceIdCommandResult';
import { UpdateUserCommandResult } from '../IO/Actor/UpdateUserCommandResult';
import { PocoCommandExecutedCommandResult } from '../Cris/PocoCommandExecutedCommandResult';
import { IAbstractCommand } from '../Cris/Model';

export const SymCTS = Symbol.for("CK.CTSType");
/**
 * CTSType is currently &lt;any&gt;. Strongly typing it involves to handle null
 * (detect and raise error) in depth.
 * This is not a validator (the backend is up to date by design) and null handling
 * is a (basic) part of validation.
 */
export const CTSType : any = {
    get typeFilterName(): string {return "TypeScript"; },
    toTypedJson( o: any ) : [string,unknown]|null {
        if( o == null ) return null;
        const t = o[SymCTS];
        if( !t ) throw new Error( "Untyped object. A type must be specified with CTSType." );
        return [t.name, t.json( o )];
    },
    fromTypedJson( o: any ) : unknown {
        if( o == null ) return undefined;
        if( !(o instanceof Array && o.length === 2) ) throw new Error( "Expected 2-cells array." );
        const t = (<any>CTSType)[o[0]];
        if( !t ) throw new Error( `Invalid type name: ${o[0]}.` );
        if( !t.set ) throw new Error( `Type name '${o[0]}' is not serializable.` );
        const j = t.nosj( o[1] );
        return j !== null && typeof j === 'object' ? t.set( j ) : j;
   },
   stringify( o: any, withType: boolean = true ) : string {
       const t = CTSType.toTypedJson( o );
       return JSON.stringify( withType ? t : t[1] );
   },
   parse( s: string ) : unknown {
       return CTSType.fromTypedJson( JSON.parse( s ) );
   },
"CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommand": {
name: "CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommand",
set( o: SetPreferredWorkspaceIdCommand ): SetPreferredWorkspaceIdCommand {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new SetPreferredWorkspaceIdCommand(
CTSType["int"].nosj( o.userId ),
CTSType["int"].nosj( o.workspaceId ),
CTSType["string"].nosj( o.currentCultureName ),
CTSType["int"].nosj( o.actorId ) );
},
},
"CK.IO.Actor.ISetUserNameCommand": {
name: "CK.IO.Actor.ISetUserNameCommand",
set( o: SetUserNameCommand ): SetUserNameCommand {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new SetUserNameCommand(
CTSType["int"].nosj( o.userId ),
CTSType["string"].nosj( o.userName ),
CTSType["string"].nosj( o.currentCultureName ),
CTSType["int"].nosj( o.actorId ) );
},
},
"CK.IO.Actor.IUpdateUserCommand": {
name: "CK.IO.Actor.IUpdateUserCommand",
set( o: UpdateUserCommand ): UpdateUserCommand {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {if( !o ) return null;
let r = {} as any;
r.commands = CTSType["L((CK.Cris.IAbstractCommand:Command,string?:Description))"].json( o.commands );
r.currentCultureName = o.currentCultureName;
r.actorId = o.actorId;
return r;
},
nosj( o: any ) {if( o == null ) return undefined;
return new UpdateUserCommand(
CTSType["L((CK.Cris.IAbstractCommand:Command,string?:Description))"].nosj( o.commands ),
CTSType["string"].nosj( o.currentCultureName ),
CTSType["int"].nosj( o.actorId ) );
},
},
"CK.IO.Actor.IGetUserProfileQCommand": {
name: "CK.IO.Actor.IGetUserProfileQCommand",
set( o: GetUserProfileQCommand ): GetUserProfileQCommand {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new GetUserProfileQCommand(
CTSType["int"].nosj( o.userId ),
CTSType["int"].nosj( o.actorId ) );
},
},
"CK.IO.Actor.IUserProfile": {
name: "CK.IO.Actor.IUserProfile",
set( o: UserProfile ): UserProfile {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new UserProfile(
CTSType["int"].nosj( o.userId ),
CTSType["string"].nosj( o.userName ),
CTSType["int"].nosj( o.preferredWorkspaceId ),
CTSType["L(CK.IO.UserProfile.Workspace.IGroupInfos)"].nosj( o.groups ) );
},
},
"CrisCallResult": {
name: "CrisCallResult",
set( o: CrisCallResult ): CrisCallResult {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {if( !o ) return null;
let r = {} as any;
r.result = CTSType.toTypedJson( o.result );
r.validationMessages = o.validationMessages;
r.correlationId = o.correlationId;
return r;
},
nosj( o: any ) {if( o == null ) return undefined;
return new CrisCallResult(
CTSType.fromTypedJson( o.result ),
CTSType["L(UserMessage)"].nosj( o.validationMessages ),
CTSType["string"].nosj( o.correlationId ) );
},
},
"CrisResultError": {
name: "CrisResultError",
set( o: CrisResultError ): CrisResultError {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new CrisResultError(
CTSType["bool"].nosj( o.isValidationError ),
CTSType["L(UserMessage)"].nosj( o.errors ),
CTSType["string"].nosj( o.logKey ) );
},
},
"CK.Cris.AmbientValues.IAmbientValues": {
name: "CK.Cris.AmbientValues.IAmbientValues",
set( o: AmbientValues ): AmbientValues {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new AmbientValues(
CTSType["string"].nosj( o.currentCultureName ),
CTSType["int"].nosj( o.actorId ),
CTSType["int"].nosj( o.actualActorId ),
CTSType["string"].nosj( o.deviceId ),
CTSType["int"].nosj( o.currentWorkspaceId ) );
},
},
"CK.Cris.AmbientValues.IAmbientValuesCollectCommand": {
name: "CK.Cris.AmbientValues.IAmbientValuesCollectCommand",
set( o: AmbientValuesCollectCommand ): AmbientValuesCollectCommand {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new AmbientValuesCollectCommand(
 );
},
},
"SimpleUserMessage": {
name: "SimpleUserMessage",
set( o: SimpleUserMessage ): SimpleUserMessage {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o; },
nosj( o: any ) {return o != null ? SimpleUserMessage.parse( o ) : undefined; },
},
"CK.Core.UserMessageLevel": {
name: "CK.Core.UserMessageLevel",
set( o: UserMessageLevel ): UserMessageLevel { o = <UserMessageLevel>new Number( o ); (o as any)[SymCTS] = this; return o; },
json( o: any ) { return o; },
nosj( o: any ) { return o == null ? undefined : o; },
},
"CK.Auth.AuthLevel": {
name: "CK.Auth.AuthLevel",
set( o: AuthLevel ): AuthLevel { o = <AuthLevel>new Number( o ); (o as any)[SymCTS] = this; return o; },
json( o: any ) { return o; },
nosj( o: any ) { return o == null ? undefined : o; },
},
"CK.IO.Actor.ISetUserNameCommandResult": {
name: "CK.IO.Actor.ISetUserNameCommandResult",
set( o: SetUserNameCommandResult ): SetUserNameCommandResult {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new SetUserNameCommandResult(
CTSType["string"].nosj( o.userName ),
CTSType["bool"].nosj( o.success ),
CTSType["L(UserMessage)"].nosj( o.userMessages ) );
},
},
"CK.IO.UserProfile.Workspace.IGroupInfos": {
name: "CK.IO.UserProfile.Workspace.IGroupInfos",
set( o: GroupInfos ): GroupInfos {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new GroupInfos(
CTSType["int"].nosj( o.groupId ),
CTSType["string"].nosj( o.groupName ),
CTSType["bool"].nosj( o.isZone ),
CTSType["int"].nosj( o.zoneId ),
CTSType["string"].nosj( o.zoneName ) );
},
},
"CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommandResult": {
name: "CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommandResult",
set( o: SetPreferredWorkspaceIdCommandResult ): SetPreferredWorkspaceIdCommandResult {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o;
},
nosj( o: any ) {if( o == null ) return undefined;
return new SetPreferredWorkspaceIdCommandResult(
CTSType["int"].nosj( o.preferredWorkspaceId ),
CTSType["bool"].nosj( o.success ),
CTSType["L(UserMessage)"].nosj( o.userMessages ) );
},
},
"CK.IO.Actor.IUpdateUserCommandResult": {
name: "CK.IO.Actor.IUpdateUserCommandResult",
set( o: UpdateUserCommandResult ): UpdateUserCommandResult {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {if( !o ) return null;
let r = {} as any;
r.results = CTSType["L(CK.Cris.IPocoCommandExecutedCommandResult)"].json( o.results );
r.success = o.success;
r.userMessages = o.userMessages;
return r;
},
nosj( o: any ) {if( o == null ) return undefined;
return new UpdateUserCommandResult(
CTSType["L(CK.Cris.IPocoCommandExecutedCommandResult)"].nosj( o.results ),
CTSType["bool"].nosj( o.success ),
CTSType["L(UserMessage)"].nosj( o.userMessages ) );
},
},
"CK.Cris.IPocoCommandExecutedCommandResult": {
name: "CK.Cris.IPocoCommandExecutedCommandResult",
set( o: PocoCommandExecutedCommandResult ): PocoCommandExecutedCommandResult {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {if( !o ) return null;
let r = {} as any;
r.command = CTSType.toTypedJson( o.command );
r.validationMessages = o.validationMessages;
r.result = CTSType.toTypedJson( o.result );
return r;
},
nosj( o: any ) {if( o == null ) return undefined;
return new PocoCommandExecutedCommandResult(
CTSType.fromTypedJson( o.command ),
CTSType["L(UserMessage)"].nosj( o.validationMessages ),
CTSType.fromTypedJson( o.result ) );
},
},
"CK.Cris.ISimpleBatchCommandResultPart": {
name: "CK.Cris.ISimpleBatchCommandResultPart",
},
"CK.Cris.IStandardResultPart": {
name: "CK.Cris.IStandardResultPart",
},
"CK.Cris.ICommand<CK.Cris.AmbientValues.IAmbientValues>": {
name: "CK.Cris.ICommand<CK.Cris.AmbientValues.IAmbientValues>",
},
"CK.Cris.ICommandCurrentCulture": {
name: "CK.Cris.ICommandCurrentCulture",
},
"CK.Auth.ICommandAuthNormal": {
name: "CK.Auth.ICommandAuthNormal",
},
"CK.Auth.ICommandAuthUnsafe": {
name: "CK.Auth.ICommandAuthUnsafe",
},
"CK.Cris.ICommandSimpleBatch": {
name: "CK.Cris.ICommandSimpleBatch",
},
"CK.Cris.ICommandPart": {
name: "CK.Cris.ICommandPart",
},
"CK.Cris.ICommand<CK.IO.Actor.IUserProfile>": {
name: "CK.Cris.ICommand<CK.IO.Actor.IUserProfile>",
},
"CK.Cris.ICommand<CK.IO.Actor.ISetUserNameCommandResult>": {
name: "CK.Cris.ICommand<CK.IO.Actor.ISetUserNameCommandResult>",
},
"CK.Cris.ICommand<CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommandResult>": {
name: "CK.Cris.ICommand<CK.IO.UserProfile.Workspace.ISetPreferredWorkspaceIdCommandResult>",
},
"CK.Cris.ICommand<CK.IO.Actor.IUpdateUserCommandResult>": {
name: "CK.Cris.ICommand<CK.IO.Actor.IUpdateUserCommandResult>",
},
"CK.Cris.ICommand<CK.Cris.ISimpleBatchCommandResultPart>": {
name: "CK.Cris.ICommand<CK.Cris.ISimpleBatchCommandResultPart>",
},
"CK.Cris.IAbstractCommand": {
name: "CK.Cris.IAbstractCommand",
},
"CK.Cris.ICurrentCulturePart": {
name: "CK.Cris.ICurrentCulturePart",
},
"CK.Auth.IAuthNormalPart": {
name: "CK.Auth.IAuthNormalPart",
},
"CK.Auth.IAuthUnsafePart": {
name: "CK.Auth.IAuthUnsafePart",
},
"CK.Cris.ICrisPocoPart": {
name: "CK.Cris.ICrisPocoPart",
},
"CK.Cris.ICrisPoco": {
name: "CK.Cris.ICrisPoco",
},
"CK.Cris.IPocoCommandExecutedPart": {
name: "CK.Cris.IPocoCommandExecutedPart",
},
"CK.Core.IPoco": {
name: "CK.Core.IPoco",
},
"bool": {
name: "bool",
set( o: boolean ): boolean { o = Object( o ); (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o; },
nosj( o: any ) {return o == null ? undefined : o; },
},
"string": {
name: "string",
set( o: string ): string { o = Object( o ); (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o; },
nosj( o: any ) {return o == null ? undefined : o; },
},
"int": {
name: "int",
set( o: number ): number { o = Object( o ); (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o; },
nosj( o: any ) {return o == null ? undefined : o; },
},
"UserMessage": {
name: "UserMessage",
set( o: SimpleUserMessage ): SimpleUserMessage {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {return o; },
nosj( o: any ) {return o != null ? SimpleUserMessage.parse( o ) : undefined; },
},
"L(UserMessage)": {
name: "L(UserMessage)",
set( o: Array<SimpleUserMessage> ): Array<SimpleUserMessage> {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {
return o;
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["UserMessage"];
return o.map( t.nosj );
},
},
"object": {
name: "object",
},
"L(CK.IO.UserProfile.Workspace.IGroupInfos?)": {
name: "L(CK.IO.UserProfile.Workspace.IGroupInfos?)",
set( o: Array<GroupInfos|undefined> ): Array<GroupInfos|undefined> {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {
return o;
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["CK.IO.UserProfile.Workspace.IGroupInfos"];
return o.map( t.nosj );
},
},
"L(CK.IO.UserProfile.Workspace.IGroupInfos)": {
name: "L(CK.IO.UserProfile.Workspace.IGroupInfos)",
json( o: any ) {
return o;
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["CK.IO.UserProfile.Workspace.IGroupInfos"];
return o.map( t.nosj );
},
},
"(CK.Cris.IAbstractCommand?,string?)": {
name: "(CK.Cris.IAbstractCommand?,string?)",
set( o: [IAbstractCommand?, string?] ): [IAbstractCommand?, string?] {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {if( !o ) return null;
return [ CTSType.toTypedJson( o[0] ), o[1] ];
},
nosj( o: any ) {if( o == null ) return undefined;
return [
CTSType.fromTypedJson( o[0] ),
CTSType["string"].nosj( o[1] )];
},
},
"(CK.Cris.IAbstractCommand,string?)": {
name: "(CK.Cris.IAbstractCommand,string?)",
json( o: any ) {if( !o ) return null;
return [ CTSType.toTypedJson( o[0] ), o[1] ];
},
nosj( o: any ) {if( o == null ) return undefined;
return [
CTSType.fromTypedJson( o[0] ),
CTSType["string"].nosj( o[1] )];
},
},
"(CK.Cris.IAbstractCommand:Command,string?:Description)": {
name: "(CK.Cris.IAbstractCommand:Command,string?:Description)",
json( o: any ) {if( !o ) return null;
return [ CTSType.toTypedJson( o.command ), o.description ];
},
nosj( o: any ) {if( o == null ) return undefined;
return {
command: CTSType.fromTypedJson( o[0] ),
description: CTSType["string"].nosj( o[1] )};
},
},
"L((CK.Cris.IAbstractCommand?,string?))": {
name: "L((CK.Cris.IAbstractCommand?,string?))",
set( o: Array<[IAbstractCommand?, string?]> ): Array<[IAbstractCommand?, string?]> {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {
if( o == null ) return null;
const t = CTSType["(CK.Cris.IAbstractCommand?,string?)"];
return o.map( t.json );
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["(CK.Cris.IAbstractCommand?,string?)"];
return o.map( t.nosj );
},
},
"L((CK.Cris.IAbstractCommand,string?))": {
name: "L((CK.Cris.IAbstractCommand,string?))",
json( o: any ) {
if( o == null ) return null;
const t = CTSType["(CK.Cris.IAbstractCommand,string?)"];
return o.map( t.json );
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["(CK.Cris.IAbstractCommand,string?)"];
return o.map( t.nosj );
},
},
"L((CK.Cris.IAbstractCommand:Command,string?:Description))": {
name: "L((CK.Cris.IAbstractCommand:Command,string?:Description))",
json( o: any ) {
if( o == null ) return null;
const t = CTSType["(CK.Cris.IAbstractCommand:Command,string?:Description)"];
return o.map( t.json );
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["(CK.Cris.IAbstractCommand:Command,string?:Description)"];
return o.map( t.nosj );
},
},
"L(CK.Cris.IPocoCommandExecutedCommandResult?)": {
name: "L(CK.Cris.IPocoCommandExecutedCommandResult?)",
set( o: Array<PocoCommandExecutedCommandResult|undefined> ): Array<PocoCommandExecutedCommandResult|undefined> {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {
if( o == null ) return null;
const t = CTSType["CK.Cris.IPocoCommandExecutedCommandResult"];
return o.map( t.json );
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["CK.Cris.IPocoCommandExecutedCommandResult"];
return o.map( t.nosj );
},
},
"L(CK.Cris.IPocoCommandExecutedCommandResult)": {
name: "L(CK.Cris.IPocoCommandExecutedCommandResult)",
json( o: any ) {
if( o == null ) return null;
const t = CTSType["CK.Cris.IPocoCommandExecutedCommandResult"];
return o.map( t.json );
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
const t = CTSType["CK.Cris.IPocoCommandExecutedCommandResult"];
return o.map( t.nosj );
},
},
"O(CK.Cris.IAbstractCommand?)": {
name: "O(CK.Cris.IAbstractCommand?)",
set( o: Map<string,IAbstractCommand|undefined> ): Map<string,IAbstractCommand|undefined> {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {
if( !o ) return null;
let r = {} as any;
for( const i of o ) {
    r[i[0]] = CTSType.toTypedJson(i[1]);
}
return r;
},
nosj( o: any ) {
if( o == null ) return undefined;
const isA = o instanceof Array;
if( !isA && typeof o !== 'object' ) throw new Error( 'Expected Array or Object.' );
if( isA ) {
const r = new Map();
for( const i of o ) {
    r.set( i[0], CTSType.fromTypedJson(i[1]) );
}
return r;
}
const r = new Map();
for( const p in o ) {
    r.set( p, CTSType.fromTypedJson(o[p]) );
}
return r;
},
},
"O(CK.Cris.IAbstractCommand)": {
name: "O(CK.Cris.IAbstractCommand)",
json( o: any ) {
if( !o ) return null;
let r = {} as any;
for( const i of o ) {
    r[i[0]] = CTSType.toTypedJson(i[1]);
}
return r;
},
nosj( o: any ) {
if( o == null ) return undefined;
const isA = o instanceof Array;
if( !isA && typeof o !== 'object' ) throw new Error( 'Expected Array or Object.' );
if( isA ) {
const r = new Map();
for( const i of o ) {
    r.set( i[0], CTSType.fromTypedJson(i[1]) );
}
return r;
}
const r = new Map();
for( const p in o ) {
    r.set( p, CTSType.fromTypedJson(o[p]) );
}
return r;
},
},
"L(CK.Cris.IAbstractCommand?)": {
name: "L(CK.Cris.IAbstractCommand?)",
set( o: Array<IAbstractCommand|undefined> ): Array<IAbstractCommand|undefined> {  (o as any)[SymCTS] = this; return o; },
json( o: any ) {
return o != null ? o.map( CTSType.toTypedJson ) : null;
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
return o.map( CTSType.fromTypedJson );
},
},
"L(CK.Cris.IAbstractCommand)": {
name: "L(CK.Cris.IAbstractCommand)",
json( o: any ) {
return o != null ? o.map( CTSType.toTypedJson ) : null;
},
nosj( o: any ) {
if( o == null ) return undefined;
if( !(o instanceof Array) ) throw new Error( 'Expected Array.' );
return o.map( CTSType.fromTypedJson );
},
},
}
