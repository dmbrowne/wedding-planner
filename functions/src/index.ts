import * as admin from "firebase-admin";
import * as guests from "./guests";
import * as wedding from "./wedding";
import * as auth from "./auth";
import * as guestGroups from "./group-guests";
import * as eventGuests from "./event-guests";
import getAlgoliaSearchKey from "./get-search-key";

admin.initializeApp();

exports.getAlgoliaSearchKey = getAlgoliaSearchKey;

exports.removeGuestsAndGroupsOnWeddingDelete = wedding.removeGuestsAndGroupsOnWeddingDelete;

exports.createUserOnAccountCreate = auth.createUserOnAccountCreate;

exports.modifyAlgoliaGuest = guests.modifyAlgoliaGuest;
exports.updatePartnerOnGuestCreateOrDelete = guests.updatePartnerOnGuestCreateOrDelete;
exports.updateEventGuestNameOnGuestNameChange = guests.updateEventGuestNameOnGuestNameChange;

exports.modifyAlgoliaGroup = guestGroups.modifyAlgoliaGroup;
exports.remvoveGroupIdFromEventGuestsOnGroupDelete = guestGroups.remvoveGroupIdFromEventGuestsOnGroupDelete;
exports.updateEventTotalGroupsCount = guestGroups.updateEventTotalGroupsCount;

exports.updateGuestRsvpsOnEventServiceChange = eventGuests.updateGuestRsvpsOnEventServiceChange;
exports.removeMemberIdFromGroupOnEventGuestDelete = eventGuests.removeMemberIdFromGroupOnEventGuestDelete;
exports.updateEventTotalGuestsCountOnEventGuestChange = eventGuests.updateEventTotalGuestsCountOnEventGuestChange;
exports.updateEventTotalGuestsCountOnPlusOneChange = eventGuests.updateEventTotalGuestsCountOnPlusOneChange;
