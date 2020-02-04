export interface IGuest {
  id: string;
  name: string;
  email?: string;
  preferredName?: string;
  partnerId?: string;
  groupIds?: string[];
  fetching?: boolean;
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
  plusOnes?: string[];
  eventId: string;
  weddingId: string;
  rsvp?:
    | {
        [serviceId: string]: boolean;
      }
    | boolean;
}

export interface IPlusOneGuest extends Omit<IEventGuest, "plusOnes"> {
  dietryRequirements?: string;
  guestId: string;
  name?: string;
}
