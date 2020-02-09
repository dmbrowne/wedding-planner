import React from "react";
import { Button, Heading, Box, Layer } from "grommet";
import { Close, Trash } from "grommet-icons";
import { useStateSelector } from "../store/redux";
import { IPlusOneGuest, IService, IEventGuest } from "../store/types";
import { EventGuestCheckBoxes } from "./event-guest-checkboxes";
import EventGuestModalPlusOne from "./event-guest-modal-plus-one";

type TOnRsvp = (response: { eventGuestId: string; serviceId?: string; value: boolean }) => void;
type TEventGuest = (IEventGuest & { isPlusOne: false }) | (IPlusOneGuest & { isPlusOne: true });
interface IEventGuestModal {
  eventGuest: TEventGuest;
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
  const { eventGuest, onRsvp, onPlusOneRsvp, onClose, onUpdatePlusOneName, onRemovePlusOne, removeGuest } = props;
  // const eventGuest = useStateSelector(state => state.events.eventGuests[guest.id]);
  const allPlusOnes = useStateSelector(state => state.events.plusOnes);
  const plusOnes = eventGuest.isPlusOne ? null : eventGuest.plusOnes && eventGuest.plusOnes.map(id => allPlusOnes[id]);

  return (
    <Layer>
      <Box pad="medium" width="500px" height="600px">
        <Button icon={<Close />} onClick={onClose} alignSelf="end" />
        <Heading level={3} children={eventGuest.name || "Unamed guest (+1)"} />
        <EventGuestCheckBoxes
          {...props}
          onRespond={serviceId => {
            serviceId && props.kind === "multi"
              ? onRsvp({
                  eventGuestId: eventGuest.id,
                  serviceId,
                  value: typeof props.rsvp === "object" ? !props.rsvp[serviceId] : true
                })
              : onRsvp({ eventGuestId: eventGuest.id, value: !props.rsvp });
          }}
        />
        {plusOnes && plusOnes.length > 0 && (
          <Box margin={{ vertical: "medium" }}>
            <Heading level={4} children="+1's:" />
            {plusOnes.map(
              plusOneGuest =>
                plusOneGuest && (
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
                              eventGuestId: plusOneGuest.id,
                              serviceId,
                              value: typeof plusOneGuest.rsvp === "object" ? !plusOneGuest.rsvp[serviceId] : true
                            })
                          : onPlusOneRsvp({ eventGuestId: plusOneGuest.id, value: !plusOneGuest.rsvp });
                      }}
                    />
                  </EventGuestModalPlusOne>
                )
            )}
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
      </Box>
    </Layer>
  );
};
