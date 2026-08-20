create <ts> transformer on "CK/Angular/routes.ts"
begin
    ensure import { temporaryPasswordGuard } from "@local/ck-gen";

    // The private page is the "" route, and the two properties below are both required — dropping
    // either one is covered by a failing test in integration.spec.ts:
    //  - canActivate alone would not re-run while the private page is retained, which is the case of
    //    a navigation back to "" from inside the private area (the "go to home" of a logo);
    //  - runGuardsAndResolvers: 'always' lifts exactly that restriction. The private page carries no
    //    resolver, so re-running costs a signal read.
    // canActivateChild is deliberately NOT set: with 'always' the parent guard already runs on every
    // navigation of the subtree, including from one child to another.
    //
    // The reset page this guard redirects to is NOT under the private page: it is a child of the
    // authentication page, guarded by resetPasswordPageGuard (see AuthRoutes.t). No exemption is
    // needed here, and the "auth" route being a sibling of "" the redirection cannot loop.
    //
    // Anchored on the children of the private page: CK.Ng.AspNet.Auth's own AppRoutes.t anchors on
    // "component: PrivatePage" and "export default", so the two transformers cannot collide
    // whatever their application order. Extending its canMatch array instead would give up exactly
    // that property — see the ResetPasswordFormComponent history for why it was not done.
    insert """
           ,
           runGuardsAndResolvers: 'always',
           canActivate: [temporaryPasswordGuard]

           """
        after last "children: rPrivatePage";
end
