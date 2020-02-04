import React, { ReactNode } from "react";
import { TableRow, TableCell, Text, Button } from "grommet";
import { IPlusOneGuest } from "../store/types";
import { SubtractCircle } from "grommet-icons";

interface IProps<C = string> {
  show?: boolean;
  cellOrder: C[];
  guest: IPlusOneGuest;
  render?: (colName: C) => ReactNode;
  onClick?: () => void;
  onRemove: () => void;
}

const GuestlistPlusOneRow: React.FC<IProps> = ({ guest, show, cellOrder, render, onClick, onRemove }) => {
  const getRowContent = (colName: string) => {
    if (render) {
      const content = render(colName);
      if (content !== undefined) return content;
    }

    switch (colName) {
      case "name":
        return (
          <Button plain onClick={onClick} children={<Text size="small" children={guest.name || "Unamed guest"} />} />
        );
      case "remove":
        return <Button icon={<SubtractCircle />} plain onClick={onRemove} />;
      default:
        return null;
    }
  };
  return (
    <TableRow style={{ display: show ? "table-row" : "none" }}>
      {cellOrder.map(colName => (
        <TableCell key={colName} background="light-1">
          {getRowContent(colName)}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default GuestlistPlusOneRow;
