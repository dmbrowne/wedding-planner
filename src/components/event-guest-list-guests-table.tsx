import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableCell, Button, TableBody, Text, CheckBox, Grommet, Box, InfiniteScroll } from "grommet";
import { FormUp } from "grommet-icons";

import { useStateSelector } from "../store/redux";
import GuestListAttendeeRow from "./guest-list-attendee-row";
import GuestlistPlusOneRow from "./guestlist-plus-one-row";
import { IPlusOneGuest, IEvent, IEventGuest } from "../store/types";
import PlusOne from "./plus-one";

interface IProps {
  event: IEvent;
  compactMode?: boolean;
  onViewGuest?: (eventGuestId: string, isPlusOne?: boolean) => void;
  onRemoveGuest: (guestId: string, isPlusOne?: boolean) => void;
  onAddPlusOne?: (guestId: string) => void;
  selectedRows: Set<string>;
  onSelectRows: (selected: Set<string>) => void;
  hidePlusOnes?: boolean;
  hideHeader?: boolean;
  columns?: string[];
  guests: IEventGuest[];
  onLoadMore?: () => void;
}

const EventGuestListGuestsTable: React.FC<IProps> = props => {
  const { compactMode, onViewGuest, onRemoveGuest, onAddPlusOne, selectedRows, onSelectRows, event, onLoadMore } = props;
  const tableHeaderProps = { scope: "col" as "col", background: "dark-1" };
  const plusOnes = useStateSelector(state => state.events.plusOnes);
  const eventGuests = useStateSelector(state => state.events.eventGuests);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const totalRows = Object.keys(plusOnes).length + Object.keys(eventGuests).length;
  const isAllRowsSelected = selectedRows.size === totalRows;

  const columns = props.columns || ["checkbox", "expand", "attendance", "name", "plusOne", ...(!compactMode ? ["email"] : []), "remove"];

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
        return <Box round width="0" height="0" border={{ color, size: "8px" }} />;
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
    return typeof guest.rsvp === "undefined" ? "unresponded" : guest.rsvp ? "full" : "none";
  };

  return (
    <>
      <Box direction="row" gap="small">
        <Text>Key:</Text>
        {[
          ["unresponded", "Not RSVP'd"],
          ["full", "Attending (all)"],
          ["partial", "Attending (some)"],
          ["none", "Not Attending (any)"],
        ].map(([status, text]) => (
          <Box key={status} direction="row" gap="xxsmall" align="center">
            <Box round border={{ color: getAttendanceColour(status as any), size: "8px" }} />
            <Text size="small" color="dark-3" children={text} />
          </Box>
        ))}
      </Box>
      <Table style={{ width: "100%" }} margin={{ top: "small", bottom: "medium" }}>
        {!props.hideHeader && (
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
        )}
        <TableBody>
          <InfiniteScroll items={props.guests} onMore={onLoadMore} renderMarker={marker => <tr children={<td>{marker}</td>} />}>
            {(invitedGuest: IEventGuest) => {
              const plusOneRows =
                Array.isArray(invitedGuest.plusOnes) && invitedGuest.plusOnes.length > 0 && !props.hidePlusOnes
                  ? invitedGuest.plusOnes.map((plusOneGuestId: string) => (
                      <PlusOne eventId={event.id} id={plusOneGuestId} subscribeWhileMounted key={plusOneGuestId}>
                        {({ plusOneGuest }) => (
                          <GuestlistPlusOneRow
                            render={plusOneColumnRenderer.bind(undefined, plusOneGuestId)}
                            show={expandedRows.has(invitedGuest.id)}
                            key={plusOneGuestId}
                            guest={plusOneGuest}
                            cellOrder={columns}
                            onRemove={() => onRemoveGuest(plusOneGuestId, true)}
                          />
                        )}
                      </PlusOne>
                    ))
                  : null;
              return (
                <React.Fragment key={invitedGuest.id}>
                  <GuestListAttendeeRow
                    render={colName => columnRenderer(invitedGuest.id, colName)}
                    onExpand={plusOneRows ? () => toggleExpandedRow(invitedGuest.id) : undefined}
                    expandIcon={expandedRows.has(invitedGuest.id) ? "up" : "down"}
                    eventGuest={invitedGuest}
                    onAddPlusOne={onAddPlusOne ? () => onAddPlusOne(invitedGuest.id) : undefined}
                    cellOrder={columns}
                    onRemove={() => onRemoveGuest(invitedGuest.id)}
                    onClick={onViewGuest ? () => onViewGuest(invitedGuest.id, false) : undefined}
                  />
                  {plusOneRows}
                </React.Fragment>
              );
            }}
          </InfiniteScroll>
        </TableBody>
      </Table>
    </>
  );
};

export default EventGuestListGuestsTable;
