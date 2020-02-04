import { IRootReducer } from "./store/reducers";
import { createSelector } from "reselect";
import { IGuest, IEventGuest, IEvent } from "./store/types";

export const allGuestsListingSelector = createSelector<IRootReducer, string[], { [id: string]: IGuest }, IGuest[]>(
  state => state.guests.order,
  state => state.guests.byId,
  (order, guestMap) => {
    return order.reduce((accum: IGuest[], id) => [...accum, ...(guestMap[id] ? [guestMap[id]] : [])], []);
  }
);

export const eventGuestsSelector = createSelector<IRootReducer, string[], { [id: string]: IEventGuest }, IEventGuest[]>(
  state => state.events.eventGuestOrder,
  state => state.events.eventGuests,
  (order, guestMap) => {
    return order.reduce((accum: IEventGuest[], id) => [...accum, ...(guestMap[id] ? [guestMap[id]] : [])], []);
  }
);

export const uninvitedEventGuestsSelector = createSelector<IRootReducer, string[], IGuest[], IGuest[]>(
  state => state.events.eventGuestOrder,
  allGuestsListingSelector,
  (invitedGuestIds, orderedGuests) => {
    return orderedGuests.filter(guest => !invitedGuestIds.includes(guest.id));
  }
);

export const orderedEventsListSelector = createSelector<IRootReducer, string[], { [id: string]: IEvent }, IEvent[]>(
  state => state.events.eventsOrder,
  state => state.events.eventsById,
  (order, eventMap) => {
    return order.reduce((accum: IEvent[], id) => [...accum, ...(eventMap[id] ? [eventMap[id]] : [])], []);
  }
);
