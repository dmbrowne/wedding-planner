import React from "react";
import { Button, Heading, Box, Layer, CheckBox } from "grommet";
import { Close, Trash } from "grommet-icons";
import { useStateSelector } from "../store/redux";
import { IPlusOneGuest, IEventGuest } from "../store/types";
import EventGuestModalPlusOne from "./event-guest-modal-plus-one";
import Modal from "./modal";

type TOnRsvp = (response: { eventGuestId: string; serviceId?: string; value: boolean }) => void;
type TEventGuest = (IEventGuest & { isPlusOne: false }) | (IPlusOneGuest & { isPlusOne: true });
interface IEventGuestModal {
  eventGuest: TEventGuest;
  onRsvp: TOnRsvp;
  onPlusOneRsvp: TOnRsvp;
  rsvp: boolean;
  onClose: () => void;
  onUpdatePlusOneName: (plusOneId: string, name: string) => void;
  onRemovePlusOne: (plusOneId: string) => void;
  removeGuest: () => void;
}

export const EventGuestModal: React.FC<IEventGuestModal> = props => {
  const { eventGuest, onRsvp, onPlusOneRsvp, onClose, onUpdatePlusOneName, onRemovePlusOne, removeGuest } = props;
  const allPlusOnes = useStateSelector(state => state.events.plusOnes);
  const plusOnes = eventGuest.isPlusOne ? null : eventGuest.plusOnes && eventGuest.plusOnes.map(id => allPlusOnes[id]);

  return (
    <Modal title={eventGuest.name || "Unamed guest (+1)"} onClose={onClose}>
      <CheckBox label="Attending?" checked={props.rsvp} onChange={() => onRsvp({ eventGuestId: eventGuest.id, value: !props.rsvp })} />
      {plusOnes && plusOnes.length > 0 && (
        <Box margin={{ vertical: "medium" }}>
          <Heading level={4} children="+1's:" />
          {plusOnes.map(plusOneGuest => (
            <EventGuestModalPlusOne
              key={plusOneGuest.id}
              onDelete={() => onRemovePlusOne(plusOneGuest.id)}
              plusOneGuest={plusOneGuest}
              onUpdateName={name => onUpdatePlusOneName(plusOneGuest.id, name)}
            >
              <CheckBox
                label="Attending?"
                checked={props.rsvp}
                onChange={() => onPlusOneRsvp({ eventGuestId: plusOneGuest.id, value: !plusOneGuest.rsvp })}
              />
            </EventGuestModalPlusOne>
          ))}
        </Box>
      )}
      <Button
        alignSelf="start"
        margin={{ top: "large" }}
        icon={<Trash />}
        label={`Remove ${eventGuest.name} from event`}
        color="status-critical"
        onClick={removeGuest}
      />
    </Modal>
  );
};
