import { IUser } from "./types";
import { combineReducers } from "redux";
import guestGroupsReducer, { IReducer as IGuestGroupReducer } from "./guest-groups";
import guestsReducder, { IGuestsReducer } from "./guests-reducer";
import eventsReducer, { IReducer as IEventReducer } from "./events";
import { IWedding } from "./types";

export interface IRootReducer {
  guestGroups: IGuestGroupReducer;
  activeWedding: IWeddngReducerState;
  guests: IGuestsReducer;
  events: IEventReducer;
  collaborators: IUser[];
}

export const fetchWeddingSuccess = (wedding: IWedding) => ({
  type: "active-wedding/FETCH_SUCCESS" as "active-wedding/FETCH_SUCCESS",
  payload: wedding,
});

interface IWeddngReducerState {
  wedding: IWedding | null;
}

const initialState: IWeddngReducerState = { wedding: null };

function activeWeddingReducer(state: IWeddngReducerState = initialState, action: ReturnType<typeof fetchWeddingSuccess>) {
  switch (action.type) {
    case "active-wedding/FETCH_SUCCESS":
      return { wedding: action.payload };
    default:
      return state;
  }
}

const reducers = combineReducers({
  guestGroups: guestGroupsReducer,
  guests: guestsReducder,
  events: eventsReducer,
  activeWedding: activeWeddingReducer,
});

export default reducers;
