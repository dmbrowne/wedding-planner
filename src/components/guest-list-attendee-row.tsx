import React, { ReactNode } from "react";
import { TableRow, TableCell, Button, Text, Box } from "grommet";
import { IGuest, IEventGuest } from "../store/types";
import { FormUp, FormDown, FormAdd, SubtractCircle } from "grommet-icons";
import Guest from "./guest";

type TCell = "expand" | "name" | "email" | string;

interface IProps {
  onExpand?: () => void;
  expandIcon?: "up" | "down";
  cellOrder: TCell[];
  eventGuest: IEventGuest;
  onAddPlusOne?: () => void;
  onRemove: () => void;
  onClick?: () => void;
  render?: (colName: string, guest: IGuest) => ReactNode;
}

const PlusOneControl: React.FC<{ value: string | number; onAdd: () => void }> = ({ value, onAdd }) => (
  <Box direction="row" align="center" gap="xsmall">
    <Box background="light-1" pad={{ horizontal: "small", vertical: "xsmall" }} border>
      <Text size="small" children={value} />
    </Box>
    <Button plain onClick={onAdd}>
      <Box background="brand" pad="xxsmall" round children={<FormAdd size="small" />} />
    </Button>
  </Box>
);

const GuestListAttendeeRow: React.FC<IProps> = ({
  eventGuest,
  onExpand,
  expandIcon = "up",
  cellOrder,
  onAddPlusOne,
  onRemove,
  onClick,
  render
}) => {
  const getRowContent = (guest: IGuest) => (colName: TCell) => {
    if (render) {
      const content = render(colName, guest);
      if (content) return content;
    }
    switch (colName) {
      case "expand":
        const Icon = expandIcon === "up" ? FormUp : FormDown;
        return !!onExpand ? <Button plain onClick={onExpand} icon={<Icon />} /> : null;
      case "name":
        return <Button plain onClick={() => onClick && onClick()} children={<Text children={guest.name} />} />;
      case "email":
        return <Text children={guest.email} />;
      case "plusOne":
        return onAddPlusOne ? (
          <PlusOneControl onAdd={onAddPlusOne} value={eventGuest.plusOnes ? eventGuest.plusOnes.length : "0"} />
        ) : null;
      case "remove":
        return <Button plain icon={<SubtractCircle />} onClick={onRemove} />;
      default:
        return null;
    }
  };

  return (
    <Guest id={eventGuest.guestId} subscribeWhileMounted>
      {({ guest }) => {
        const renderCell = getRowContent(guest);
        return (
          <TableRow>
            {cellOrder.map(colName => (
              <TableCell key={colName} background="white" children={renderCell(colName)} />
            ))}
          </TableRow>
        );
      }}
    </Guest>
  );
};

export default GuestListAttendeeRow;
