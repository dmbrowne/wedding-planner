import { IRootReducer } from "../store/reducers";
import { createSelector } from "reselect";
import { IGuest } from "../store/types";

export default createSelector<
  IRootReducer,
  string[],
  {
    [id: string]: IGuest;
  },
  IGuest[]
>(
  state => state.guests.order,
  state => state.guests.byId,
  (order, guestMap) => {
    return order.reduce((accum: IGuest[], id) => [...accum, ...(guestMap[id] ? [guestMap[id]] : [])], []);
  }
);
