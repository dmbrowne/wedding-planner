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

#### No Ducks, flat sructure, refactor when needed

The use of the ducks pattern is not being used. With the addition of react (and redux) hooks, there is no need for a separate container from component. while the idea of making components completely dumb sounds like the right way to go, in result it causes a lot of boilerplate and sometimes pointless files. This project believes in refactoring when needed. so a component should be created encpasulating it's data using hooks, should this data need to be separated in the future - then refactor it in the future by simpling "moving the state up". This is why a flat structure has been choosen, as a dev you won't spend pointless time deciding what folder a file belongs in, and how to separate concerns.

#### Datamodel & Typescript

An `interface` has been created for each type document that is stored in firestore. They can be found as `src/store/types.ts`

#### firestore

The application is driven by firestore and its listeners/watchers which update the store on a snapshot change. Due to firestore's offline capabilities there is no need to wait for promises to resolve because firebase handle optimistic updates and always resolve immediately when modifying the database.

It is also preferred to use `onSnapshot()` instead of `get()` because the former resolves instantly with cached data (if available) and allows offline usage which _could_ be a feature in the future

#### Usage firestore, redux and fetching data (from firestore)

fetched data is currently only stored in redux if it foreseen/assumed to be required in more than one route. Otherwise calls to firestore and data retrieval is handled in the component directly using `useEffect` to make calls to firestore and `useState` to store the fetched data.

e.g. The screen for displaying the couples stories, should fetch the stories directly without interacting with redux as the data isnt stored globally and not required to

```tsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { firestore } from 'firebase/app';
import { Pulsar } from 'gestalt'

const OurStories = () => {
  const { current: db } = useRef(firestore());
  const [fetchStatus, setFetchStatus] = useState<'initial' | 'inProgress' | 'success' | 'error'>('initial');
  const [stories, setStories] = useState<IStories[]>([]);
  const { user: auth } = useContext(AuthContext);

  useEffect(() => {
    setFetchStatus('inProgress')
    return db.doc(`stories`).where('_private.owner', '==', auth.user?.uid).onSnapshot(snap => {
      const fetchedStories = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setStories(fetchedStories);
      setFetchStatus('success')
    })
  }, []);

  // this is a defensive coding precaution. This is an "Authenticated" route, which would not render if "auth" is not truthy
  if (!auth) {
    return <Pulsar />
  }

  return (
    <List>
      {stories.map(story => <Story story={story} />)}
    </List>
  )
}

// app level routes.js
export default () => (
  // ...
  return (
    {/*... */}
    <AutheticatedRoute path="/stories" component={OurStories} />
    {/*... */}
  )
)
```

Certain routes such as the `wedding/:weddingId` route is given a component that is wrapped in a component that has a firestore listener. When changes to the wedding _firestore document_ occur, the component fires an action to redux to update the store

```tsx

interface IProps extends RouteComponentProps<{ weddingId: string; }> {}

export const WeddingPlanningRoutes: React.FC<IProps> = ({ match }) => {
  const { weddingId } = match.params;
  const { current: db } = useRef(firestore());
  const dispatch = useDispatch();
  const wedding = useStateSelector(state => state.activeWedding.wedding);

  useEffect(() => {
    return db.doc(`weddings/${weddingId}`).onSnapshot(snap => {
      dispatch(fetchWeddingSuccess({ id: snap.id, ...(snap.data() as IWedding) }));
    });
  }, []);

  return (
    <>
      <AutheticatedRoute path="/weddings/:weddingId/foo" component={Foo} />
      <AutheticatedRoute path="/weddings/:weddingId/bar" component={Bar} />
    </>
  )
}

// app level routes.js
export default () => (
  // ...
  return (
    {/*... */}
    <AutheticatedRoute path="/weddings/:weddingId" component={WeddingPlanningRoutes} />
    {/*... */}
  )
)
```
