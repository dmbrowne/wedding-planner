import React, { useState } from "react";
import { Text, Heading, Box, InfiniteScroll, Button } from "grommet";
import { EventPartnerListing } from "./event-partner-listing";
import { useStateSelector } from "../store/redux";
import { orderedGuestGroupsSelector } from "../selectors/selectors";
import { IGuestGroup } from "../store/guest-groups";
import EventGuest from "./event-guest";
import { Add, Subtract } from "grommet-icons";
import { Pulsar } from "gestalt";
import GuestGroupModal from "./guest-group-modal";

export type TListMode = "full" | "short" | "initial";
interface IProps {
  eventId: string;
  groupListMode: TListMode;
  onChangeGroupListingMode: (mode: Exclude<TListMode, "initial">) => void;
  onLoadMore?: () => void;
  removeEventGuestFromGroup: (eventGuestId: string, groupId: string) => void;
  onUpdateGroupName: (groupId: string, val: string) => void;
  onDeleteGroup: (groupId: string) => void;
}
const EventGroupsListing: React.FC<IProps> = ({
  eventId,
  onChangeGroupListingMode,
  groupListMode,
  removeEventGuestFromGroup,
  onUpdateGroupName,
  onDeleteGroup
}) => {
  const orderedGuestGroups = useStateSelector(orderedGuestGroupsSelector);
  const { numberOfGroups = 0 } = useStateSelector(state => state.events.eventsById[eventId]);
  const [viewGroupId, setViewGroupId] = useState<string | void>();

  const expandButtonProps = {
    width: "medium" as "medium",
    pad: "small" as "small",
    direction: "row" as "row",
    gap: "small" as "small",
    justify: "center" as "center",
    background: "white" as "white",
    hoverIndicator: "light-1" as "light-1"
  };

  const expandButton = (
    <Button plain margin={{ bottom: "xsmall" }} onClick={() => onChangeGroupListingMode("full")}>
      <Box {...expandButtonProps}>
        <Add color="brand" />
        <Text color="brand">Show all groups</Text>
      </Box>
    </Button>
  );

  const condenseButton = (
    <Button plain margin={{ top: "xsmall" }} onClick={() => onChangeGroupListingMode("short")}>
      <Box {...expandButtonProps}>
        <Subtract color="brand" />
        <Text color="brand">Show less groups</Text>
      </Box>
    </Button>
  );

  return (
    <>
      <Heading level={3}>Groups</Heading>
      <Text color="dark-3" margin={{ bottom: "medium" }}>
        Grouped guests recieve an invite addressed to themself plus others, this have the benefit of being able to rsvp
        for others as well. A good use case for this is creating a group for a family (mum, dad, children), that way one
        guest can rsvp on the whole family's behalf.
      </Text>
      {numberOfGroups > 5 ? (groupListMode === "short" ? expandButton : condenseButton) : null}
      <Pulsar paused={groupListMode !== "initial"} />
      <InfiniteScroll items={orderedGuestGroups}>
        {(group: IGuestGroup) => (
          <Box elevation="xsmall" background="white" round="xsmall" pad="small" margin={{ vertical: "small" }}>
            <Heading
              as="header"
              level={4}
              children={group.name}
              margin={{ bottom: "xsmall" }}
              onClick={() => setViewGroupId(group.id)}
            />
            {group.memberIds.map(eventGuestId => (
              <EventGuest key={eventGuestId} id={eventGuestId}>
                {({ eventGuest }) => (
                  <Box pad={{ vertical: "xsmall" }}>
                    <Text color="dark-3" size="small" children={eventGuest.name} />
                  </Box>
                )}
              </EventGuest>
            ))}
          </Box>
        )}
      </InfiniteScroll>
      {numberOfGroups > 5 ? (groupListMode === "short" ? expandButton : condenseButton) : null}
      <Heading level={3}>Partners</Heading>
      <Text color="dark-3" margin={{ bottom: "medium" }}>
        If a guest and thier partner are both invited to the event, they are automatically grouped to have a joint
        invitation, allowing them to RSVP for each other. However if both partners are manually added to a group above,
        the couple will no longer have a joint invitation.
      </Text>
      <EventPartnerListing eventId={eventId} />
      {viewGroupId && (
        <GuestGroupModal
          onClose={() => setViewGroupId()}
          groupId={viewGroupId}
          onUpdateName={val => onUpdateGroupName(viewGroupId, val)}
          removeEventGuestFromGroup={eventGuestId => removeEventGuestFromGroup(eventGuestId, viewGroupId)}
          onDeleteGroup={() => (setViewGroupId(), onDeleteGroup(viewGroupId))}
        />
      )}
    </>
  );
};

export default EventGroupsListing;
