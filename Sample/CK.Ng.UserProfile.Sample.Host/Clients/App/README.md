# App: the client application of the sample

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## Development server

The host (`CK.Ng.UserProfile.Sample.Host`) serves this application on `http://localhost:5400/`: in Development, it
starts its development server (`ng serve` on port 4400, the `serve` port of `angular.json` written by the build) and
forwards the requests to it. Open `http://localhost:5400/`, not the port of the development server: the Cris endpoints
are on the host's origin. The application reloads whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
