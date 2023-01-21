## Pre requisites

- Node 14.x.x
- Serverless Framework - 3.x.x - Sign up to serverless.com and install serverless globally: npm i serverless -g

## Serverless Framework

- Fetch a `service.yml` from a peer, this contains all the config for local setup.
- Change variables per your local setup in `service.yml`.
- Push an environment variable using `export SLS_DEBUG=*`.

## Install dependencies

```
npm install or npm i
```

## Login to Serverless

```
serverless login

```

## Install Java JRE

```
This needs to be done from their official Oracle Website. (https://www.java.com/en/download/manual.jsp)

```

## Run Serverless Offline

```
serverless offline
Server runs on: http://localhost:3000/

```

## Contributing

- Create a route in serverless.yml
- It will redirect to controller function. Controller will redirect to use-case.
