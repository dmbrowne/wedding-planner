import { IWeddngReducerState, activeWeddingReducer } from "./active-wedding";
import { combineReducers } from "redux";
import guestGroupsReducer, { IReducer as IGuestGroupReducer } from "./guest-groups";
import guestsReducder, { IGuestsReducer } from "./guests-reducer";
import eventsReducer, { IReducer as IEventReducer } from "./events";

export interface IRootReducer {
  guestGroups: IGuestGroupReducer;
  activeWedding: IWeddngReducerState;
  guests: IGuestsReducer;
  events: IEventReducer;
}

const reducers = combineReducers({
  guestGroups: guestGroupsReducer,
  guests: guestsReducder,
  events: eventsReducer,
  activeWedding: activeWeddingReducer,
});

export default reducers;
