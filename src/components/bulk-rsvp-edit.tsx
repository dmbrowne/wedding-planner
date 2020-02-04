import React, { useState } from "react";
import { Button, Heading, Box, Layer, Text, CheckBox } from "grommet";
import { Close } from "grommet-icons";
import { IService } from "../store/types";

interface IBulkEditProps {
  services?: IService[];
  onUpdate: (
    attendanceMap:
      | {
          [serviceId: string]: boolean;
        }
      | boolean
  ) => void;
  selectedGuestAmount: number;
  onClose: () => void;
}

export const BulkRsvpEdit: React.FC<IBulkEditProps> = ({ services, onUpdate, selectedGuestAmount, onClose }) => {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const update = (attending?: boolean) => {
    if (services) {
      const attendanceMap = services.reduce(
        (accum, service) => ({
          ...accum,
          [service.id]: selectedServiceIds.includes(service.id)
        }),
        {} as {
          [serviceId: string]: boolean;
        }
      );
      onUpdate(attendanceMap);
    } else if (typeof attending === "boolean") {
      onUpdate(attending);
    }
  };
  const unCheck = (id: string) => {
    const duped = [...selectedServiceIds];
    duped.splice(duped.indexOf(id), 1);
    setSelectedServiceIds(duped);
  };
  const check = (id: string) => {
    setSelectedServiceIds([...selectedServiceIds, id]);
  };
  return (
    <Layer>
      <Box width="500px" height={{ min: "400px", max: "650px" }} overflow="auto" pad="medium">
        <Button alignSelf="end" icon={<Close />} onClick={onClose} />
        <Heading level={3} children="RSVP" />
        {services ? (
          <>
            <Text as="p">
              You have selected <strong>{selectedGuestAmount}</strong> guests, set thier attendance by selecting the
              list of event services below.
            </Text>
            {services.map(service => (
              <CheckBox
                label={service.name}
                checked={selectedServiceIds.includes(service.id)}
                onChange={e => (e.target.checked ? check(service.id) : unCheck(service.id))}
              />
            ))}
            <Text as="p" size="small" color="dark-6">
              Services that are ticked will mark all {selectedGuestAmount} guests as attending for that service.
              Services that are left unticked will result in the selected guests being marked as not attending those
              services.
            </Text>

            <Button primary label="Update" alignSelf="end" margin={{ top: "medium" }} onClick={() => update()} />
          </>
        ) : (
          <>
            <Text>
              You have selected <strong>{selectedGuestAmount}</strong> guests, what would you like to do?
            </Text>
            <Box justify="end" direction="row" gap="small" margin={{ vertical: "medium" }}>
              <Button primary color="status-critical" label="Set as not attending" />
              <Button primary color="neutral-1" label="Set as attending" />
            </Box>
          </>
        )}
      </Box>
    </Layer>
  );
};
