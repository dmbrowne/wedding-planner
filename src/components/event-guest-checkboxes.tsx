import React from "react";
import { CheckBox } from "grommet";
import { ISingleServiceEventGuestModalProps, IEventGuestModalProps } from "./event-guest-modal";

interface ISingleEventGuestCheckBoxesProps extends Pick<ISingleServiceEventGuestModalProps, "kind" | "rsvp"> {
  onRespond: (serviceId?: string) => void;
}

interface IMultiEventGuestCheckBoxesProps extends Pick<IEventGuestModalProps, "kind" | "rsvp" | "services"> {
  onRespond: (serviceId?: string) => void;
}

export const EventGuestCheckBoxes: React.FC<
  ISingleEventGuestCheckBoxesProps | IMultiEventGuestCheckBoxesProps
> = props => {
  const { onRespond } = props;
  return (
    <>
      {props.kind === "multi" ? (
        props.services.map(service => (
          <CheckBox
            label={service.name}
            checked={(props.rsvp && props.rsvp[service.id]) || false}
            onChange={() => onRespond(service.id)}
          />
        ))
      ) : (
        <CheckBox label="Attending?" checked={props.rsvp} onChange={() => onRespond()} />
      )}
    </>
  );
};
