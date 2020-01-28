import React, { useEffect, useContext, useState } from "react";
import { UserAdd, Trash } from "grommet-icons";
import { Heading, Button, Box, DataTable } from "grommet";
import { RouteComponentProps, Link } from "react-router-dom";
import { allGuestsListingSelector } from "../selectors";
import { useStateSelector } from "../store/redux";
import { GuestsContext } from "../components/guests-context";
import Guest from "../components/guest";
import GuestQuickView from "../components/guest-quick-view";
import { IGuest } from "../store/types";

const Guests: React.FC<RouteComponentProps> = ({ match }) => {
  const { unsubscribeGuestListingWatch, guestsListingWatch, getDocumentRef } = useContext(GuestsContext);
  const [guestQuickViewId, setGuestQuickViewId] = useState<string | void>();
  const guests = useStateSelector(allGuestsListingSelector);

  useEffect(() => {
    const alreadyWatching = !!unsubscribeGuestListingWatch;
    if (!alreadyWatching) {
      guestsListingWatch();
    }
  }, []);

  const deleteGuest = (guest: IGuest) => {
    const shouldDelete = window.confirm(`Are you sure you want to delete ${guest.name}`);
    if (shouldDelete) {
      getDocumentRef(guest.id).delete();
    }
  };

  return (
    <>
      <Heading level="1">Guests</Heading>
      <Link to={`${match.url}/create`}>
        <Button as="span" label="Add guest" icon={<UserAdd />} primary />
      </Link>
      <DataTable
        columns={[
          { property: "name", header: "Name" },
          { property: "email", header: "Email" },
          {
            property: "delete?",
            header: "",
            render: datum => (
              <Button
                plain
                onClick={e => {
                  e.stopPropagation();
                  deleteGuest(datum);
                }}
              >
                <Box pad={{ horizontal: "xsmall" }} children={<Trash />} />
              </Button>
            )
          }
        ]}
        data={guests}
        onClickRow={({ datum }: any) => setGuestQuickViewId(datum.id)}
      />
      {!!guestQuickViewId && (
        <Guest id={guestQuickViewId}>
          {({ guest, fetching }) =>
            !!guest && !fetching && <GuestQuickView guest={guest} onClose={() => setGuestQuickViewId()} />
          }
        </Guest>
      )}
    </>
  );
};

export default Guests;
