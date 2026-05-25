import { AuthService } from '@local/ck-gen/CK/AspNet/Auth/AuthService';
import { AuthenticationPage } from '../Ng/AspNet/Auth/authentication-page/authentication-page';
import rAuthenticationPage from '../Ng/AspNet/Auth/authentication-page/routes';
import { PrivatePage } from '../Ng/AspNet/Auth/private-page/private-page';
import rPrivatePage from '../Ng/AspNet/Auth/private-page/routes';

import { inject } from "@angular/core";
import { DefaultUrlSerializer, Route, Router } from '@angular/router';

let router: Router | null = null;
let urlSerializer: DefaultUrlSerializer | null = null;

let authService: AuthService | null = null;
export default [
{ path: "auth", component: AuthenticationPage, children: rAuthenticationPage

 },
{ path: "", component: PrivatePage,
canMatch: [() => (authService ??= inject( AuthService )).authenticationInfo.user.userId > 0]
, children: rPrivatePage

 },
{
  path: '**',
  redirectTo: () =>
  {
      router ??= inject( Router );
      const currentRoute = router.currentNavigation()?.initialUrl;
      const targetUrl = router.parseUrl( '/auth' );
      targetUrl.queryParams[ 'redirectTo' ] = currentRoute
            ? (urlSerializer ??= new DefaultUrlSerializer()).serialize(currentRoute)
            : undefined;
      return targetUrl;
   }
}
] as Route[];