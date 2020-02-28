import { Node } from "slate";
import firebase from "firebase/app";

interface IPrivateDetails {
  _private: {
    owner: string;
    collaborators?: string[];
  };
}

interface IRTE {
  slate: Node[];
  html?: string;
}

export interface IWedding extends IPrivateDetails {
  readonly id: string;
  name: string;
  couple: [string, string];
  cover?: {
    imageRef?: string;
    message?: IRTE;
    showWelcome?: boolean;
    welcomeImageRef?: string;
    welcomeMessage?: IRTE;
    backgroundColor?: string;
  };
}

export interface IGuest {
  readonly id: string;
  name: string;
  email?: string;
  preferredName?: string;
  partnerId?: string;
  groupIds?: string[];
  weddingId: string;
  weddingTitle?: string;
  weddingParty?: "groom" | "bridal";
  dietryRequirements?: string;
}

interface IAddress {
  street_number?: string;
  route?: string;
  country?: string;
  postal_code?: string;
  postal_town?: string;
}

export interface IService {
  id: string;
  name: string;
  description?: string;
  startDate: firebase.firestore.Timestamp;
  startTime?: string;
  endDate?: firebase.firestore.Timestamp;
  address?: IAddress;
  location?: {
    lat: number;
    lng: number;
  };
}

export enum EAmenityTypes {
  restaurant = "restaurant",
  bar = "bar",
  cafe = "cafe",
  parking = "parking",
  lodging = "lodging",
  other = "other",
}

export interface IAmenity {
  id: string;
  icon?: string;
  place_id: string;
  name: string;
  formatted_address: string;
  notes?: string;
  type: EAmenityTypes;
  location?: { lat: number; lng: number };
  address?: Partial<{
    street_number: string;
    route: string;
    country: string;
    postal_code: string;
    postal_town: string;
  }>;
  createdAt: firebase.firestore.Timestamp;
}
export interface IEvent extends IPrivateDetails {
  id: string;
  weddingId: string;
  name: string;
  description?: string;
  main?: boolean;
  startDate: firebase.firestore.Timestamp;
  startTime?: string;
  numberOfGuests?: number;
  numberOfGroups?: number;
  numberOfPlusOnes?: number;
  allowRsvpPerService?: boolean;
  attending?: number;
  notAttending?: number;
  location?: {
    lat: number;
    lng: number;
  };
  address?: IAddress;
  services?: {
    [serviceId: string]: IService;
  };
  guests?: {
    [guestId: string]: IEventGuest;
  };
  plusOnes?: {
    [id: string]: IPlusOneGuest;
  };
}

export interface IEventGuest {
  id: string;
  guestId: string;
  name: string;
  plusOnes?: string[];
  eventId: string;
  weddingId: string;
  groupId?: string;
  rsvp?:
    | {
        [serviceId: string]: boolean;
      }
    | boolean;
}

export interface IPlusOneGuest extends Omit<IEventGuest, "plusOnes" | "name" | "guestId" | "groupId"> {
  dietryRequirements?: string;
  mainEventGuestId: string;
  name?: string;
}

export interface IUser {
  readonly id: string;
  email: string;
  name?: string;
  weddingIds: string[];
  eventIds?: string[];
  readonly accountType: "normal" | "planner";
}

export interface IAdminInvite {
  id: string;
  email: string;
  weddingId: string;
  expires: firebase.firestore.Timestamp;
  from: string;
}

export type TEventFormData = {
  name: string;
  description: string;
  date: string;
  serviceHasTime?: boolean;
  time?: string;
  multiService?: boolean;
  place?: google.maps.places.PlaceResult;
};

export interface IStory extends IPrivateDetails {
  readonly id: string;
  name: string;
  weddingId: string;
}
export interface IChapter {
  readonly id: string;
  imageRef?: string;
  text?: IRTE;
  order: number;
}
