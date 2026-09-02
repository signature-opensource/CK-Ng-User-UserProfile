create <ts> transformer on "CK/Angular/routes.ts"
begin
    ensure import { temporaryPasswordGuard } from "@local/ck-gen";

    // Appends into the canActivate array of the private page. The array and the
    // runGuardsAndResolvers: 'always' that makes an appended guard re-run are both emitted upstream by
    // CK.Ng.UserProfile (see its Res/AppRoutes.t for why); this package neither creates nor needs to
    // know about them, and so does not depend on the other packages that append here.
    //
    // Both properties are covered by a failing test if either goes missing:
    // integration.spec.ts, "registers temporaryPasswordGuard as the canActivate of the private page,
    // re-run on every navigation". It asserts with toContain, precisely so that other guards may share
    // the array.
    //
    // The reset page this guard redirects to is NOT under the private page: it is a child of the
    // authentication page, guarded by resetPasswordPageGuard (see AuthRoutes.t). No exemption is
    // needed here, and the "auth" route being a sibling of "" the redirection cannot loop.
    insert "temporaryPasswordGuard, " after single "canActivate: [";
end
