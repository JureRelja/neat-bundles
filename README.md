# Neat Bundles Shopify App

## Local setup

Run the following command:

```sh
npm install -g @shopify/cli@latest
npm i
```

## What's inside?

This repo includes the following packages/apps:

### Apps and Packages

- `frontend`: Remix app that is currently the core behind Neat Bundles Shopify app
- `backend`: Nest.js app where the backend logic from frontend will be migrated
- `@db/server`: database package shared between frontend and backend. All the migrations and db configurations are done inside this package
- `@repo/shared-types`: share DTOs between frontend and backend. These are used as a contract between backend and frontend. Once types in this folder are created, frontend can directly use them in it's code, while backend needs to create a class for every type in this repo where it implements the type. The reason backend needs to first implement the type inside the class is to utilize Nest.js class validation functionalities.

### Build

To build all apps and packages, navigate to the root and run the following command:

```
npm run build
```

### Develop

To develop all apps and packages, run the following command from the root:

```
npm run dev
```

This command will run all packages and backend and frontend apps in parallel. You will be able to navigate between proceses using arrow keys.

It will also start a Cloudflare tunnel and connect it with backend app. Sometimes the dev command fails the first time because the tunnel won't start. Just run it again and everything should work proprly. Also, shopify app is run using sudo, so you will need to enter your password in terminal.

On this that is required to be done after every run is replace proxy url command is Shopify Partners / Neat Bundles / Proxy link with the newly generated tunnel url.

### Env files

Each app/package has it's own .env file.
