# Project Witch

> This project was created with `npx create react app --template typescript`

**Required**

- Typescript 3.7
- yarn
- node 8
- firebase-cli

## Get started

### Installing the application

1. navigate to projects base folder and run

```
yarn
```

2. To start the application

```
yarn start
```

### Installing cloud functions

1. navigate to projects `base folder` > `functions` and run _important: make you use `npm` not `yarn` becuase cloud functions needs to run on node 8_

```
npm install
```

## Intro

### Tech stack

- Firebase firestore
- Firebase storage
- Firebase authentication
- Firebase cloud functions
- Typescript
- React 16.6
- React router 5
- Redux
- Redux thunk (To be removed)
- SlateJS

### Styling

As this is an MVP the following two component libraries are being used for convinience:

- Grommet (https://v2.grommet.io/)
- Gestalt (https://pinterest.github.io/gestalt/)

### Structure

The basic project structure is similar to the standard `create-react-app` setup, but with the addition of the `functions` folder for creating and managing firebase cloud functions. I've also opted for a flat sturcture vs feature/hierachical because it makes refactoring easier during MVP phase:

```
  |- functions/
  |  |- functions for firebase cloud functions, written in typescript
  |
  |- public/
  |  |- static folder used to compile react during development
  |
  |- src/
  |  |- @types/
  |  |  |- declaration files for libraries that dont have typings available
  |  |
  |  |- components/
  |  |
  |  |- hooks/
  |  |
  |  |- icons/
  |  |
  |  |- routes/
  |  |  |- react components that render components for main sections of the app
  |  |
  |  |- screens/
  |  |  |- non-reusable components that tie directly to a url route
  |  |
  |  |- selectors/
  |  |  |- reselect functions to memoise parts of the redux store
  |  |
  |  |- store/
  |  |  |- redux reducers
  |  |  |- files that begin with 'use-*' are react hook reducers
  |  |
  |  |- utils/
```

## Ideology

#### firestore

The application is driven by firestore and its listeners/watchers which update the store on a snapshot change. Due to firestore's offline capabilities there is no need to wait for promises to resolve because firebase handle optimistic updates and always resolve immediately when modifying the database
