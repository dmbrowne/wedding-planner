import * as admin from "firebase-admin";
import * as guests from "./guests";
import * as guestGroups from "./guest-groups";
import * as wedding from "./wedding";
import getAlgoliaSearchKey from "./get-search-key";

admin.initializeApp();

exports.modifyAlgoliaGuest = guests.modifyAlgoliaGuest;
exports.removeGroupIdFromGuestOnGroupDelete = guests.removeGroupIdFromGuestOnGroupDelete;
exports.updatePartnerOnGuestCreateOrDelete = guests.updatePartnerOnGuestCreateOrDelete;
exports.modifyAlgoliaGuestGroup = guestGroups.modifyAlgoliaGuestGroup;
exports.updateGuestGroupMemberIdsOnGuestUpdate = guestGroups.updateGuestGroupMemberIdsOnGuestUpdate;
exports.addMemberIdToGuestGroupOnCreateGuest = guestGroups.addMemberIdToGuestGroupOnCreateGuest;
exports.removeMemberIdFromGuestGroupOnGuestDelete = guestGroups.removeMemberIdFromGuestGroupOnGuestDelete;
exports.getAlgoliaSearchKey = getAlgoliaSearchKey;
exports.removeGuestsAndGroupsOnWeddingDelete = wedding.removeGuestsAndGroupsOnWeddingDelete;
