import { Login } from '../login/login';

// import { Route } from '@angular/router';

export default [
{ path: "", component: Login },
{ path: "logout", loadComponent: () => import( "../logout/logout" ).then( c => c.Logout ) }
]; // as Route[];