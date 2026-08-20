create <ts> transformer on "CK/Ng/AspNet/Auth/authentication-page/routes.ts"
begin
    ensure import { resetPasswordPageGuard } from "@local/ck-gen";

    // Anchored on the tail of the lazy registration the engine writes for the reset page:
    //   { path: "reset-password", loadComponent: () => import( "..." ).then( c => c.ResetPasswordForm ) }
    // The two sibling pages of CK.Ng.UserProfile.UserPassword.Lost are registered the same way, so
    // the class name is what makes this anchor unambiguous.
    insert """
           , canActivate: [resetPasswordPageGuard]
           """
        after single "c.ResetPasswordForm )";
end
