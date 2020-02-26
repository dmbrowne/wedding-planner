import React, { useEffect, useContext, useState } from "react";
import { UserAdd, Trash } from "grommet-icons";
import { Heading, Button, Box, DataTable } from "grommet";
import { RouteComponentProps, Link } from "react-router-dom";
import allGuestsListingSelector from "../selectors/all-guests-listing";
import { useStateSelector } from "../store/redux";
import { GuestsContext } from "../components/guests-context";
import Guest from "../components/guest";
import GuestQuickView from "../components/guest-quick-view";
import { IGuest } from "../store/types";
import SContainer from "../components/container";

const Guests: React.FC<RouteComponentProps> = ({ match }) => {
  const { loadMore, getDocumentRef } = useContext(GuestsContext);
  const [guestQuickViewId, setGuestQuickViewId] = useState<string | void>();
  const guests = useStateSelector(allGuestsListingSelector);

  const deleteGuest = (guest: IGuest) => {
    const shouldDelete = window.confirm(`Are you sure you want to delete ${guest.name}`);
    if (shouldDelete) {
      getDocumentRef(guest.id).delete();
    }
  };

  return (
    <SContainer>
      <Heading level="1">Guests</Heading>
      <Link to={`${match.url}/create`}>
        <Button as="span" label="Add guest" icon={<UserAdd />} primary />
      </Link>
      <DataTable
        margin={{ vertical: "medium" }}
        onMore={loadMore}
        columns={[
          { property: "name", header: "Name" },
          { property: "email", header: "Email" },
          {
            property: "delete?",
            header: "",
            render: datum =>
              datum.weddingTitle === "groom" || datum.weddingTitle === "bride" ? null : (
                <Button
                  plain
                  onClick={e => {
                    e.stopPropagation();
                    deleteGuest(datum);
                  }}
                >
                  <Box pad={{ horizontal: "xsmall" }} children={<Trash />} />
                </Button>
              ),
          },
        ]}
        data={guests}
        onClickRow={({ datum }: any) => setGuestQuickViewId(datum.id)}
      />
      {!!guestQuickViewId && (
        <Guest id={guestQuickViewId}>{({ guest }) => <GuestQuickView guest={guest} onClose={() => setGuestQuickViewId()} />}</Guest>
      )}
    </SContainer>
  );
};

export default Guests;
