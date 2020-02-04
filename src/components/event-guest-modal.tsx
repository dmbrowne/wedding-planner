import React, { ReactNode } from "react";
import { Button, Heading, Box, Layer } from "grommet";
import { Close, Trash } from "grommet-icons";
import { useStateSelector } from "../store/redux";
import { IPlusOneGuest, IService, IGuest } from "../store/types";
import { EventGuestCheckBoxes } from "./event-guest-checkboxes";
import EventGuestModalPlusOne from "./event-guest-modal-plus-one";

type TOnRsvp = (response: { guestId: string; serviceId?: string; value: boolean }) => void;

interface IEventGuestModal {
  guest: IGuest | IPlusOneGuest;
  onRsvp: TOnRsvp;
  onPlusOneRsvp: TOnRsvp;
  onClose: () => void;
  onUpdatePlusOneName: (plusOneId: string, name: string) => void;
  onRemovePlusOne: (plusOneId: string) => void;
  removeGuest: () => void;
}

export interface ISingleServiceEventGuestModalProps extends IEventGuestModal {
  kind: "single";
  rsvp: boolean;
}

export interface IEventGuestModalProps extends IEventGuestModal {
  kind: "multi";
  rsvp: {
    [serviceId: string]: boolean;
  };
  services: IService[];
}

export const EventGuestModal: React.FC<ISingleServiceEventGuestModalProps | IEventGuestModalProps> = props => {
  const { guest, onRsvp, onPlusOneRsvp, onClose, onUpdatePlusOneName, onRemovePlusOne, removeGuest } = props;
  const eventGuest = useStateSelector(state => state.events.eventGuests[guest.id]);
  const allPlusOnes = useStateSelector(state => state.events.plusOnes);
  const plusOnes =
    eventGuest && eventGuest.plusOnes && eventGuest.plusOnes.map(plusOneGuestId => allPlusOnes[plusOneGuestId]);

  return (
    <Layer>
      <Box pad="medium" width="500px" height="600px">
        <Button icon={<Close />} onClick={onClose} alignSelf="end" />
        <Heading level={3} children={guest.name || "Unamed guest (+1)"} />
        <EventGuestCheckBoxes
          {...props}
          onRespond={serviceId => {
            serviceId && props.kind === "multi"
              ? onRsvp({
                  guestId: guest.id,
                  serviceId,
                  value: typeof props.rsvp === "object" ? !props.rsvp[serviceId] : true
                })
              : onRsvp({ guestId: guest.id, value: !props.rsvp });
          }}
        />
        {plusOnes && plusOnes.length > 0 && (
          <Box margin={{ vertical: "medium" }}>
            <Heading level={4} children="+1's:" />
            {plusOnes.reduce(
              (accum, plusOneGuest) =>
                plusOneGuest
                  ? [
                      ...accum,
                      <EventGuestModalPlusOne
                        key={plusOneGuest.id}
                        onDelete={() => onRemovePlusOne(plusOneGuest.id)}
                        plusOneGuest={plusOneGuest}
                        onUpdateName={name => onUpdatePlusOneName(plusOneGuest.id, name)}
                      >
                        <EventGuestCheckBoxes
                          {...(props.kind === "multi"
                            ? {
                                kind: "multi",
                                rsvp: plusOneGuest.rsvp as {
                                  [serviceId: string]: boolean;
                                },
                                services: props.services
                              }
                            : { kind: "single", rsvp: plusOneGuest.rsvp as boolean })}
                          onRespond={serviceId => {
                            serviceId
                              ? onPlusOneRsvp({
                                  guestId: plusOneGuest.id,
                                  serviceId,
                                  value: typeof plusOneGuest.rsvp === "object" ? !plusOneGuest.rsvp[serviceId] : true
                                })
                              : onPlusOneRsvp({ guestId: plusOneGuest.id, value: !plusOneGuest.rsvp });
                          }}
                        />
                      </EventGuestModalPlusOne>
                    ]
                  : accum,
              [] as ReactNode[]
            )}
          </Box>
        )}
        <Button
          alignSelf="start"
          margin={{ top: "large" }}
          icon={<Trash />}
          label={`Remove ${guest.name} from event`}
          color="status-critical"
          onClick={removeGuest}
        />
      </Box>
    </Layer>
  );
};
