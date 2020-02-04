import * as admin from "firebase-admin";
import * as guests from "./guests";
import * as wedding from "./wedding";
import * as auth from "./auth";
import * as eventGuests from "./event-guests";
import getAlgoliaSearchKey from "./get-search-key";

admin.initializeApp();

exports.modifyAlgoliaGuest = guests.modifyAlgoliaGuest;
exports.removeGroupIdFromGuestOnGroupDelete = guests.removeGroupIdFromGuestOnGroupDelete;
exports.updatePartnerOnGuestCreateOrDelete = guests.updatePartnerOnGuestCreateOrDelete;
exports.getAlgoliaSearchKey = getAlgoliaSearchKey;
exports.removeGuestsAndGroupsOnWeddingDelete = wedding.removeGuestsAndGroupsOnWeddingDelete;
exports.createUserOnAccountCreate = auth.createUserOnAccountCreate;
exports.deletePlusOnesOnEventGuestDelete = eventGuests.deletePlusOnesOnEventGuestDelete;
exports.removePlusOneFromGuestOnPlusOneDelete = eventGuests.removePlusOneFromGuestOnPlusOneDelete;
exports.updateRsvpsOnChangeEventType = eventGuests.updateRsvpsOnChangeEventType;
exports.createPartnerGroupOnEventGuestAdd = eventGuests.createPartnerGroupOnEventGuestAdd;
exports.removePartnerGroupOnEventGuestDelete = eventGuests.removePartnerGroupOnEventGuestDelete;
exports.cleanUpGroupIdFieldsOnGroupDelete = eventGuests.cleanUpGroupIdFieldsOnGroupDelete;
