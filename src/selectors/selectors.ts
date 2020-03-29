import { IAmenity, IUser } from "./../store/types";
import { IGuestGroup } from "../store/guest-groups";
import { IRootReducer } from "../store/reducers";
import { createSelector } from "reselect";
import { IGuest, IEventGuest, IEvent } from "../store/types";
import allGuestsListingSelector from "./all-guests-listing";

function subSelector<V>(selector: (state: IRootReducer) => V) {
  return (state: IRootReducer) => selector(state);
}

const getAmenitiesById = subSelector(state => state.events.amenitiesById);
const getAmenitiesOrder = subSelector(state => state.events.amenitiesOrder);

export const eventGuestsSelector = createSelector<IRootReducer, string[], { [id: string]: IEventGuest }, IEventGuest[]>(
  state => state.events.eventGuestOrder,
  state => state.events.eventGuests,
  (order, guestMap) => {
    return order.reduce((accum: IEventGuest[], id) => [...accum, ...(guestMap[id] ? [guestMap[id]] : [])], []);
  }
);

export const uninvitedEventGuestsSelector = createSelector<IRootReducer, IEventGuest[], IGuest[], IGuest[]>(
  eventGuestsSelector,
  allGuestsListingSelector,
  (invitedEventGuests, orderedGuests) => {
    const invitedGuestIds = invitedEventGuests.map(({ guestId }) => guestId);
    return orderedGuests.filter(guest => !invitedGuestIds.includes(guest.id));
  }
);

export const orderedEventsListSelector = createSelector<IRootReducer, string[], { [id: string]: IEvent }, IEvent[]>(
  state => state.events.eventsOrder,
  state => state.events.eventsById,
  (order, eventMap) => order.map(id => eventMap[id])
);

export const distinctPartnerGroups = createSelector<
  IRootReducer,
  { [eventGuestId: string]: IEventGuest },
  { [guestId: string]: string },
  { [id: string]: IGuest },
  Array<[IEventGuest, IEventGuest]>
>(
  state => state.events.eventGuests,
  state => state.events.eventGuestsByGuestId,
  state => state.guests.byId,
  (eventGuests, eventGuestsByGuestId, guests) => {
    const eventGuestsWithCorrespondingGuestsFetchedIds = Object.keys(eventGuestsByGuestId).filter(guestId => !!guests[guestId]);

    const partners: Array<[IEventGuest, IEventGuest]> = [];
    const partnersAlreadyAdded: string[] = [];

    eventGuestsWithCorrespondingGuestsFetchedIds.forEach(guestId => {
      if (partnersAlreadyAdded.includes(guestId)) {
        return;
      }

      const partnerId = guests[guestId].partnerId;
      if (partnerId) {
        if (eventGuests[eventGuestsByGuestId[partnerId]]) {
          if (eventGuests[eventGuestsByGuestId[guestId]].groupId && eventGuests[eventGuestsByGuestId[partnerId]].groupId) {
          } else {
            partners.push([eventGuests[eventGuestsByGuestId[guestId]], eventGuests[eventGuestsByGuestId[partnerId]]]);
            partnersAlreadyAdded.push(guestId, partnerId);
          }
        }
      }
    });

    return partners;
  }
);

export const ungroupedGuestsSelector = createSelector<IRootReducer, IEventGuest[], IEventGuest[]>(eventGuestsSelector, eventGuests =>
  eventGuests.filter(eventGuest => !eventGuest.groupId)
);

export const orderedGuestGroupsSelector = createSelector<IRootReducer, { [id: string]: IGuestGroup }, string[], IGuestGroup[]>(
  state => state.guestGroups.byId,
  state => state.guestGroups.order,
  (groupsById, order) => order.map(groupId => groupsById[groupId])
);

export const orderedAmenitiesSelector = createSelector<IRootReducer, { [id: string]: IAmenity }, string[], IAmenity[]>(
  getAmenitiesById,
  getAmenitiesOrder,
  (amenityById, amenityOrder) => amenityOrder.map(id => amenityById[id])
);

export const weddingCollaboratorsOrderedByEmailSelector = createSelector<IRootReducer, { [id: string]: IUser }, IUser[]>(
  state => state.activeWedding.collaborators,
  collaborators => {
    if (!collaborators) return [];

    return Object.values(collaborators).sort((a, b) => {
      if (a.email > b.email) return 1;
      else if (a.email < b.email) return -1;
      else return 0;
    });
  }
);
