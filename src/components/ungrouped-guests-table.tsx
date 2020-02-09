import React, { useState } from "react";
import { useStateSelector } from "../store/redux";

const UngroupedGuestsTable = () => {
  const eventGuests = useStateSelector(state => state.events.eventGuests);

  return <div></div>;
};

export default UngroupedGuestsTable;
