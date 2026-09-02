create <ts> transformer on "CK/Angular/routes.ts"
begin
    // Owns the guard array of the private page so that the packages of this family only ever APPEND
    // into it and never create it themselves. Two packages creating it would give the route object
    // literal the same property twice, which TypeScript rejects outright:
    //   TS1117 - An object literal cannot have multiple properties with the same name.
    // Owning it here, in their common ancestor, is also what lets those packages depend on this one
    // instead of on each other: each appends with
    //   insert "<theirGuard>, " after single "canActivate: [";
    // and none of them has to know which others exist, nor in which order the transformers run.
    //
    // canActivate is emitted EMPTY on purpose: nothing runs until a package appends to it, so an
    // application that references none of them pays nothing.
    //
    // runGuardsAndResolvers: 'always' is emitted with it because an appended guard needs it, and no
    // appending package should have to know that. canActivate alone would not re-run while the private
    // page is retained - which is exactly the case of a navigation back to "" from inside the private
    // area, the "go to home" of a logo. 'always' lifts that restriction. The private page carries no
    // resolver, so re-running costs a signal read.
    //
    // canActivateChild is deliberately NOT set: with 'always' the parent guard already runs on every
    // navigation of the subtree, including from one child to another. And no child route matches "",
    // so canActivateChild would never fire for a landing on the private page itself.
    //
    // Anchored on the children of the private page. CK.Ng.AspNet.Auth's own AppRoutes.t anchors on
    // "component: PrivatePage" and "export default", so the two transformers cannot collide whatever
    // their application order.
    insert """
           ,
           runGuardsAndResolvers: 'always',
           canActivate: []

           """
        after last "children: rPrivatePage";
end
