import { combineReducers } from "redux";
import guestGroupsReducer, { IReducer as IGuestGroupReducer } from "./guest-groups";
import guestsReducder, { IGuestsReducer } from "./guests-reducer";

export interface IWedding {
  name: string;
  couple: {
    [id: string]: {
      name: string;
    };
  };
  administrators: string[];
}

export interface ISubscriptionPaths {
  [path: string]: boolean;
}

export interface IRootReducer {
  guestGroups: IGuestGroupReducer;
  activeWeddingId: string;
  guests: IGuestsReducer;
  subscriptions: ISubscriptionPaths;
}

export const setWeddingId = (id: string) => ({
  type: "SET_WEDDING_ID" as "SET_WEDDING_ID",
  payload: id
});

export const subscribeToPath = (path: string) => ({
  type: "SUBSCRIBE_TO_FIRESTORE_PATH" as "SUBSCRIBE_TO_FIRESTORE_PATH",
  payload: path
});
export const unsubscribeFromPath = (path: string) => ({
  type: "UNSUBSCRIBE_FROM_FIRESTORE_PATH" as "UNSUBSCRIBE_FROM_FIRESTORE_PATH",
  payload: path
});

function activeWeddingIdReducer(state = "", action: ReturnType<typeof setWeddingId>) {
  switch (action.type) {
    case "SET_WEDDING_ID":
      return action.payload;
    default:
      return state;
  }
}

function pathSubscriptionsReducer(
  state = {},
  action: ReturnType<typeof subscribeToPath | typeof unsubscribeFromPath>
): ISubscriptionPaths {
  switch (action.type) {
    case "SUBSCRIBE_TO_FIRESTORE_PATH":
      return {
        ...state,
        [action.payload]: true
      };
    case "UNSUBSCRIBE_FROM_FIRESTORE_PATH":
      return {
        ...state,
        [action.payload]: false
      };
    default:
      return state;
  }
}

const reducers = combineReducers({
  activeWeddingId: activeWeddingIdReducer,
  guestGroups: guestGroupsReducer,
  guests: guestsReducder,
  subscriptions: pathSubscriptionsReducer
});

export default reducers;
