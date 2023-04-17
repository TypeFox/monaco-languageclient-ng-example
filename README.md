# monaco-languageclient-ng-example

It does the same as the regular monaco-languageclient [client example](https://github.com/TypeFox/monaco-languageclient#examples) but inside an Angular Component.

## Getting started

npm is required

```shell
npm ci
```

The angular client we start last needs to connect to the language server, therefore start the [server example](https://github.com/TypeFox/monaco-languageclient#examples) found in the main monaco-languageclient repository.

Start the local Angular development server:

```shell
npm run start
```

It serves on the client here: <http://localhost:4200>. You can use the vscode launch config to launch Chrome for debugging.
