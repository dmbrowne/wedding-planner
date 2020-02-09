export interface IGuest {
  id: string;
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

export interface IService {
  id: string;
  name: string;
  description?: string;
  startDateTime: number;
  endDateTime?: number;
}

export interface IEvent {
  id: string;
  name: string;
  description?: string;
  main?: boolean;
  dateTime: number;
  numberOfGuests?: number;
  numberOfGroups?: number;
  numberOfPlusOnes?: number;
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
