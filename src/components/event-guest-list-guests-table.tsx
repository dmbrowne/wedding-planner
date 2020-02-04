import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableCell, Button, TableBody, Text, CheckBox, Grommet, Box } from "grommet";
import { FormUp } from "grommet-icons";

import { useStateSelector } from "../store/redux";
import { eventGuestsSelector } from "../selectors";
import GuestListAttendeeRow from "./guest-list-attendee-row";
import GuestlistPlusOneRow from "./guestlist-plus-one-row";
import { IGuest, IPlusOneGuest, IEvent, IEventGuest } from "../store/types";

interface IProps {
  event: IEvent;
  compactMode?: boolean;
  onViewGuest: (guest: IGuest | IPlusOneGuest, isPlusOne?: boolean) => void;
  onRemoveGuest: (guestId: string, isPlusOne?: boolean) => void;
  onAddPlusOne: (guestId: string) => void;
  selectedRows: Set<string>;
  onSelectRows: (selected: Set<string>) => void;
}

const EventGuestListGuestsTable: React.FC<IProps> = props => {
  const { compactMode, onViewGuest, onRemoveGuest, onAddPlusOne, selectedRows, onSelectRows, event } = props;
  const tableHeaderProps = { scope: "col" as "col", background: "dark-1" };
  const invitedGuests = useStateSelector(eventGuestsSelector);
  const plusOnes = useStateSelector(state => state.events.plusOnes);
  const eventGuests = useStateSelector(state => state.events.eventGuests);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const totalRows = Object.keys(plusOnes).length + Object.keys(eventGuests).length;
  const isAllRowsSelected = selectedRows.size === totalRows;

  const columns = ["checkbox", "expand", "attendance", "name", "plusOne", ...(!compactMode ? ["email"] : []), "remove"];

  const toggleAll = () => {
    const updatedSet = new Set(selectedRows);

    isAllRowsSelected
      ? updatedSet.forEach(v => updatedSet.delete(v))
      : [...Object.keys(plusOnes), ...Object.keys(eventGuests)].forEach(eventGuestId => updatedSet.add(eventGuestId));

    onSelectRows(updatedSet);
  };

  const toggleGuestCheckbox = (guestId: string, value: boolean) => {
    const guestPlusOneIds = (eventGuests[guestId] && eventGuests[guestId].plusOnes) || [];
    const updatedSet = new Set(selectedRows);
    const operation = value ? "add" : "delete";

    updatedSet[operation](guestId);
    if (guestPlusOneIds.length > 0) guestPlusOneIds.forEach(plusOneId => updatedSet[operation](plusOneId));

    onSelectRows(updatedSet);
  };

  const getAttendanceColour = (attendance: "full" | "partial" | "none" | "unresponded") => {
    switch (attendance) {
      case "full":
        return "status-ok";
      case "partial":
        return "status-warning";
      case "none":
        return "status-critical";
      case "unresponded":
        return "status-unknown";
    }
  };
  const columnRenderer = (id: string, colName: string) => {
    switch (colName) {
      case "attendance": {
        const guest = eventGuests[id] || plusOnes[id];
        const attendance = getAttendance(guest);
        const color = getAttendanceColour(attendance);
        return <Box round width="0" height="0" border={{ color, size: "large" }} />;
      }
      case "checkbox":
        return <CheckBox checked={selectedRows.has(id)} onChange={e => toggleGuestCheckbox(id, e.target.checked)} />;
      default:
        return undefined;
    }
  };

  const plusOneColumnRenderer = (id: string, colName: string) => {
    const content = columnRenderer(id, colName);
    switch (colName) {
      case "checkbox":
        return null;
      case "expand":
        return <CheckBox checked={selectedRows.has(id)} onChange={e => toggleGuestCheckbox(id, e.target.checked)} />;
      default:
        return content;
    }
  };

  const toggleExpandedRow = (guestId: string) => {
    const updatedExpandedRows = new Set(expandedRows);

    if (updatedExpandedRows.has(guestId)) updatedExpandedRows.delete(guestId);
    else updatedExpandedRows.add(guestId);

    setExpandedRows(updatedExpandedRows);
  };

  const getAttendance = (guest: IPlusOneGuest | IEventGuest) => {
    if (event.services) {
      if (typeof guest.rsvp !== "object") return "unresponded";

      const serviceIds = Object.keys(event.services);
      const attendingServiceIds =
        typeof guest.rsvp === "object"
          ? Object.entries(guest.rsvp).reduce((accum, [k, v]) => [...accum, ...(v ? [k] : [])], [] as string[])
          : [];

      if (attendingServiceIds.length === serviceIds.length) return "full";
      if (attendingServiceIds.length === 0) return "none";
      return "partial";
    }
    return guest.rsvp ? "full" : "none";
  };

  return (
    <>
      <Box direction="row" margin={{ top: "medium" }} gap="small">
        <Text>Key:</Text>
        <Box direction="row" gap="xxsmall" align="center">
          <Box round border={{ color: getAttendanceColour("unresponded"), size: "large" }} />
          <Text size="small" color="dark-3">
            Not RSVP'd
          </Text>
        </Box>
        <Box direction="row" gap="xxsmall" align="center">
          <Box round border={{ color: getAttendanceColour("full"), size: "large" }} />
          <Text size="small" color="dark-3">
            Attending (all)
          </Text>
        </Box>
        <Box direction="row" gap="xxsmall" align="center">
          <Box round border={{ color: getAttendanceColour("partial"), size: "large" }} />
          <Text size="small" color="dark-3">
            Attending (some)
          </Text>
        </Box>
        <Box direction="row" gap="xxsmall" align="center">
          <Box round border={{ color: getAttendanceColour("none"), size: "large" }} />
          <Text size="small" color="dark-3">
            Not Attending (any)
          </Text>
        </Box>
      </Box>
      <Table style={{ width: "100%" }} margin={{ top: "small", bottom: "medium" }}>
        <TableHeader>
          <TableRow>
            <TableCell {...tableHeaderProps}>
              <Grommet
                theme={{ checkBox: { border: { color: "light-6" }, hover: { border: { color: "light-1" } } } }}
                children={<CheckBox checked={isAllRowsSelected} onChange={() => toggleAll()} />}
              />
            </TableCell>
            <TableCell {...tableHeaderProps}>
              <Button plain icon={<FormUp color="white" />} margin={{ right: "xxsmall" }} />
            </TableCell>
            <TableCell {...tableHeaderProps} size="xxsmall" children="" />
            <TableCell {...tableHeaderProps} size="1/2" children="Name" />
            <TableCell {...tableHeaderProps} size="xsmall" children="+1's" />
            {!compactMode && <TableCell {...tableHeaderProps} size="1/3" children={<Text>Email</Text>} />}
            <TableCell {...tableHeaderProps} size="xxsmall" children="" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitedGuests.map(invitedGuest => {
            const plusOneRows = Array.isArray(invitedGuest.plusOnes)
              ? invitedGuest.plusOnes.map((plusOneGuestId: string) => {
                  if (!plusOnes[plusOneGuestId]) return null;
                  return (
                    <GuestlistPlusOneRow
                      render={plusOneColumnRenderer.bind(undefined, plusOneGuestId)}
                      show={expandedRows.has(invitedGuest.id)}
                      key={plusOneGuestId}
                      guest={plusOnes[plusOneGuestId]}
                      cellOrder={columns}
                      onClick={() => onViewGuest(plusOnes[plusOneGuestId], true)}
                      onRemove={() => onRemoveGuest(plusOneGuestId, true)}
                    />
                  );
                })
              : null;
            return (
              <React.Fragment key={invitedGuest.id}>
                <GuestListAttendeeRow
                  render={colName => columnRenderer(invitedGuest.id, colName)}
                  onExpand={plusOneRows ? () => toggleExpandedRow(invitedGuest.id) : undefined}
                  expandIcon={expandedRows.has(invitedGuest.id) ? "up" : "down"}
                  eventGuest={invitedGuest}
                  guestId={invitedGuest.id}
                  onAddPlusOne={() => onAddPlusOne(invitedGuest.id)}
                  cellOrder={columns}
                  onRemove={onRemoveGuest}
                  onClick={guest => onViewGuest(guest, false)}
                />
                {plusOneRows}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default EventGuestListGuestsTable;
