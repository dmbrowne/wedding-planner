import React, { useEffect, useState } from "react";
import { Heading, Box, Button, Table, TableBody, Layer } from "grommet";
import shortId from "shortid";
import { Trash } from "grommet-icons";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { ReactComponent as CoupleIcon } from "../icons/couple.svg";
import useNewGuestsReducer, { INewGuest } from "../store/use-new-guests-reducer";

import FileInput from "../components/file-input";
import CreateNewGuestRow from "../components/create-new-guest-row";
import { addNewGuests } from "../store/guests-actions";
import AddPartner from "../components/add-partner";
import { RouteChildrenProps } from "react-router-dom";
import SContainer from "../styled-components/container";

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  preferredName: yup.string(),
  email: yup.string().email(),
});

const NewGuests: React.FC<RouteChildrenProps<{ weddingId: string }>> = ({ history, match }) => {
  const dispatch = useDispatch();
  const { byId, guests, checkedGuests, actions, checkedList } = useNewGuestsReducer();
  const [isValid, setIsValid] = useState(false);
  const [modalPartner, setModalPartner] = useState<INewGuest | void>();

  useEffect(() => {
    if (guests.length === 1) {
      setIsValid(false);
    } else {
      const arr = [...guests];
      arr.pop();
      const valid = arr.every(({ name, preferredName, email }) => validationSchema.isValidSync({ name, preferredName, email }));
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
    dispatch(addNewGuests(guests.slice(0, guests.length - 1)));
    history.push(`/weddings/${match?.params.weddingId}/guests`);
  };

  const onSelectPartner = (guestId: string) => {
    if (modalPartner) {
      actions.linkCouple(modalPartner.id, guestId);
      closeModal();
    }
  };

  const closeModal = () => setModalPartner();

  return (
    <SContainer>
      <Heading level={1}>Create new guest(s)</Heading>
      <Box direction="row" justify="end" margin={{ bottom: "medium" }}>
        <FileInput name="upload-csv" label="Upload a CSV" onChange={uploadCsv} />
      </Box>
      <Box direction="row" margin={{ bottom: "medium" }}>
        <Button onClick={onRemove} icon={<Trash />} disabled={checkedList.length < 1} />
        <Button disabled={checkedList.length !== 2} icon={<CoupleIcon style={{ height: 24 }} />} onClick={() => {}} />
      </Box>
      <Table>
        <TableBody>
          {guests.map((newGuest, idx, arr) => (
            <CreateNewGuestRow
              key={`new-guest-${newGuest.id}`}
              getNewGuestById={id => byId[id]}
              guest={newGuest}
              checkIsDisabled={idx === arr.length - 1}
              isChecked={!!checkedGuests[newGuest.id]}
              onCheck={() => setChecked(newGuest.id)}
              onChange={(e, fieldName, id) => updateGuest(fieldName, id)(e)}
              onAddNewPartner={() => setModalPartner(newGuest)}
              onRemovePartner={partner => {
                const shouldRemove = window.confirm("Remove partnership?");
                if (shouldRemove) {
                  actions.unlinkCouple(newGuest.id, partner.id);
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
      {!!modalPartner && (
        <Layer onClickOutside={closeModal} onEsc={closeModal}>
          <Box pad="large" width={{ min: "650px" }} height={{ min: "400px" }} justify="between">
            <Box>
              <AddPartner
                onSelectPartner={({ id }) => onSelectPartner(id)}
                unsavedGuests={guests.slice(0, guests.length - 1).filter(newGuests => newGuests.id !== modalPartner.id)}
                hideGuests={[modalPartner.id]}
              />
            </Box>
            <Button label="close" onClick={closeModal} margin={{ top: "medium" }} alignSelf="end" />
          </Box>
        </Layer>
      )}
    </SContainer>
  );
};

export default NewGuests;
