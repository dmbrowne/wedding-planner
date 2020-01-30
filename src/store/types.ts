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
  isPlusOne?: boolean;
}
