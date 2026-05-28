create <ts> transformer
begin
    ensure import { GroupInfos } from '@local/ck-gen';

    inject """
           readonly #currentWorkspace: WritableSignal<GroupInfos | undefined> = signal( undefined );
           readonly currentWorkspace: Signal<GroupInfos | undefined> = this.#currentWorkspace.asReadonly();

           """ into <PostLocalVariables>;

    inject """
           if ( this.#currentWorkspace() === undefined ) {
               this.setCurrentWorkspace( res?.preferredWorkspaceId );
           }
           this.#cris.ambientValuesOverride.currentWorkspaceId = this.#currentWorkspace()?.groupId ?? 0;

           """ into <PostUserProfileRefresh>;

    insert """

             public setCurrentWorkspace( groupId: number | undefined ): void {
               if ( groupId === undefined ) {
                 this.#currentWorkspace.set( undefined );
                 this.#cris.ambientValuesOverride.currentWorkspaceId = 0;
                 return;
               }
               this.#currentWorkspace.set( this.userProfile()?.groups.find( g => g.group.groupId === groupId )?.group );
               this.#cris.ambientValuesOverride.currentWorkspaceId = this.#currentWorkspace()?.groupId ?? 0;
             }

           """ before last "}";
end
