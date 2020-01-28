import React, { useEffect, useState } from "react";
import { Heading, Box, Button, Table, TableBody, Layer } from "grommet";
import shortId from "shortid";
import { Trash, Group } from "grommet-icons";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { ReactComponent as CoupleIcon } from "../icons/couple.svg";
import useNewGuestsReducer, { INewGuest } from "../store/use-new-guests-reducer";

import FileInput from "../components/file-input";
import CreateNewGuestRow from "../components/create-new-guest-row";
import { addNewGuests } from "../store/guests-actions";
import { IGuest } from "../store/types";
import { createGuestGroups } from "../store/guest-groups";
import AddToGroup from "../components/add-to-group";
import { IGuestGroup } from "../store/guest-groups";
import AddPartner from "../components/add-partner";
import { RouteChildrenProps } from "react-router-dom";

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  preferredName: yup.string(),
  email: yup.string().email()
});

const NewGuests: React.FC<RouteChildrenProps<{ weddingId: string }>> = ({ history, match }) => {
  const dispatch = useDispatch();
  const { byId, newGroups, guests, checkedGuests, actions, checkedList } = useNewGuestsReducer();
  const [isValid, setIsValid] = useState(false);
  const [partner, setpartner] = useState<IGuest | undefined>(undefined);
  const [modalType, setModalType] = useState<"group" | "partner" | "">("");

  useEffect(() => {
    if (guests.length === 1) {
      setIsValid(false);
    } else {
      const arr = [...guests];
      arr.pop();
      const valid = arr.every(({ name, preferredName, email }) =>
        validationSchema.isValidSync({ name, preferredName, email })
      );
      setIsValid(valid);
    }
  }, [guests]);

  useEffect(() => {
    if (!!guests[guests.length - 1].name) {
      actions.append();
    }
    if (guests.length > 1 && !guests[guests.length - 2].name) {
      actions.remove([guests[guests.length - 1].id]);
    }
  });

  const onRemove = () => (actions.remove(checkedList), actions.tick());
  const setChecked = (id: string) => actions.tick(id);
  const updateGuest = (keyName: keyof INewGuest, id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.update(id, { [keyName]: e.target.value });
  };

  const uploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const [headRow, ...lines] = reader.result.toString().split("\n");
        const headings = headRow.split(",");
        const emailHeadingIdx = headings.findIndex(str => str.trim() === "email address");
        const nameHeadingIdx = headings.findIndex(str => str.trim() === "name");

        const guestsToAdd = lines.map(line => {
          const data = line.split(",");
          const name = data[nameHeadingIdx];
          const email = data[emailHeadingIdx];
          return { id: shortId.generate(), name, email };
        });

        actions.append(guestsToAdd);
      }
    };
    reader.readAsText(e.target.files[0], "UTF-8");
  };

  const addGuests = () => {
    dispatch(createGuestGroups(Object.values(newGroups)));
    dispatch(addNewGuests(guests.slice(0, guests.length - 1)));
    history.push(`/wedding/${match?.params.weddingId}/guests`);
  };

  const onSelectPartner = (guest: IGuest) => {
    if (partner) {
      actions.linkCouple(partner.id, guest.id);
      closeModal();
    }
  };

  const onSelectGroup = (group: IGuestGroup) => {
    if (partner) {
      if (partner.groupIds && partner.groupIds.includes(group.id)) {
        actions.removeGuestFromGroup(partner.id, group.id);
      } else {
        actions.addGuestToGroup(partner.id, group.id);
      }
    }
  };

  const closeModal = () => {
    setModalType("");
    setpartner(undefined);
  };

  return (
    <>
      <Heading level={1}>Create new guest(s)</Heading>
      <Box direction="row" justify="end" margin={{ bottom: "medium" }}>
        <FileInput name="upload-csv" label="Upload a CSV" onChange={uploadCsv} />
      </Box>
      <Box direction="row" margin={{ bottom: "medium" }}>
        <Button onClick={onRemove} icon={<Trash />} disabled={checkedList.length < 1} />
        <Button disabled={checkedList.length !== 2} icon={<CoupleIcon style={{ height: 24 }} />} onClick={() => {}} />
        <Button disabled={checkedList.length < 2} icon={<Group />} onClick={() => {}} />
      </Box>
      <Table>
        <TableBody>
          {guests.map((newGuest, idx, arr) => (
            <CreateNewGuestRow
              key={`new-guest-${newGuest.id}`}
              getNewGuestById={id => byId[id]}
              getNewGroupById={id => newGroups[id]}
              guest={newGuest}
              checkIsDisabled={idx === arr.length - 1}
              isChecked={!!checkedGuests[newGuest.id]}
              onCheck={() => setChecked(newGuest.id)}
              onChange={(e, fieldName, id) => updateGuest(fieldName, id)(e)}
              onAddNewPartner={() => {
                setpartner(newGuest);
                setModalType("partner");
              }}
              onRemovePartner={partner => {
                const shouldRemove = window.confirm("Remove partnership?");
                if (shouldRemove) {
                  actions.unlinkCouple(newGuest.id, partner.id);
                }
              }}
              onAddGroup={() => {
                setModalType("group");
                setpartner(newGuest);
              }}
              onRemoveGroup={group => {
                const shouldRemove = window.confirm("Remove from group?");
                if (shouldRemove) {
                  actions.removeGuestFromGroup(newGuest.id, group.id);
                }
              }}
              validate={idx !== arr.length - 1}
            />
          ))}
        </TableBody>
      </Table>
      <Box align="start" justify="end" margin="medium" direction="row" gap="medium">
        <Button primary label="Add" onClick={addGuests} disabled={!isValid} />
      </Box>
      {!!modalType && !!partner && (
        <Layer onClickOutside={closeModal} onEsc={closeModal}>
          <Box pad="large" width={{ min: "650px" }} height={{ min: "400px" }} justify="between">
            <Box>
              {modalType === "partner" && (
                <AddPartner
                  onSelectPartner={onSelectPartner}
                  unsavedGuests={guests.slice(0, guests.length - 1).filter(newGuests => newGuests.id !== partner.id)}
                  hideGuests={[partner.id]}
                />
              )}
              {modalType === "group" && (
                <AddToGroup
                  onSelect={onSelectGroup}
                  unsavedGroups={Object.values(newGroups)}
                  selectedIds={partner && partner.groupIds}
                  onCreateNewGroup={name => {
                    actions.addNewGroup({ name, members: [partner.id] });
                    closeModal();
                  }}
                />
              )}
            </Box>
            <Button label="close" onClick={closeModal} margin={{ top: "medium" }} alignSelf="end" />
          </Box>
        </Layer>
      )}
    </>
  );
};

export default NewGuests;
