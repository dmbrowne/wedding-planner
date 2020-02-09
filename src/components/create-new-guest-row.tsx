import React, { useEffect } from "react";
import { TableRow, TableCell, Box, CheckBox, FormField, TextInput, ThemeContext, Button, Text } from "grommet";
import styled from "styled-components";
import * as yup from "yup";
import { Formik, Field } from "formik";

import { INewGuest } from "../store/use-new-guests-reducer";
import { ReactComponent as CoupleIcon } from "../icons/couple.svg";
import { useStateSelector } from "../store/redux";
import { fetchGuest } from "../store/guests-actions";
import { IGuest } from "../store/types";
import { useDispatch } from "react-redux";

interface IProps {
  guest: INewGuest;
  partner?: INewGuest | IGuest;
  checkIsDisabled?: boolean;
  isChecked?: boolean;
  onCheck: (guestId: string) => any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof INewGuest, id: string) => any;
  onAddNewPartner?: () => any;
  onRemovePartner?: () => any;
  validate?: boolean;
}

const RowIndicator = styled.div<{ color: string }>`
  top: 0;
  left: 0;
  position: "absolute";
  width: "50%";
  height: "100%";
  background-color: ${({ color }) => color};
`;

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  preferredName: yup.string(),
  email: yup.string().email()
});

export const CreateNewGuestRowComponent: React.FC<IProps> = ({
  guest,
  checkIsDisabled,
  isChecked,
  onCheck,
  onChange,
  partner,
  onAddNewPartner,
  onRemovePartner,
  validate
}) => {
  return (
    <ThemeContext.Consumer>
      {({ global: { colors } }: any) => (
        <Formik
          onSubmit={() => {}}
          initialValues={{
            name: guest.name,
            preferredName: guest.preferredName,
            email: guest.email
          }}
          validationSchema={validationSchema}
          enableReinitialize={true}
          validateOnMount={validate}
        >
          <TableRow key={`new-guest-${guest.id}`}>
            <TableCell verticalAlign="top" size="xxsmall">
              <Box margin={{ top: "xsmall" }}>
                <CheckBox disabled={checkIsDisabled} checked={isChecked} onChange={() => onCheck(guest.id)} />
              </Box>
            </TableCell>
            <td style={{ width: 20, position: "relative" }}>
              <RowIndicator color={colors["accent-2"]} />
            </td>
            <td style={{ width: 20, position: "relative" }}>
              <RowIndicator color={colors["accent-3"]} />
            </td>
            <TableCell>
              <Box margin={{ bottom: "large" }}>
                <Box direction="row" alignContent="end" gap="medium">
                  <Field name="name">
                    {({ field, meta }: any) => (
                      <FormField
                        error={meta.error}
                        style={{ flex: 1 }}
                        label="Name"
                        help="Full name"
                        htmlFor={`new-guest-name-${guest.id}`}
                      >
                        <TextInput
                          id={`new-guest-name-${guest.id}`}
                          name="name"
                          value={field.value || ""}
                          onChange={e => onChange(e, "name", guest.id)}
                        />
                      </FormField>
                    )}
                  </Field>
                  <Field name="preferredName">
                    {({ field, meta }: any) => (
                      <FormField
                        error={meta.error}
                        style={{ flex: 1 }}
                        label="Preferred name"
                        htmlFor={`new-guest-invitation-name-${guest.id}`}
                        help="(Optional, to be shown on invitations)"
                      >
                        <TextInput
                          id={`new-guest-invitation-name-${guest.id}`}
                          name="preferred-name"
                          value={field.value || ""}
                          placeholder={guest.name}
                          onChange={e => onChange(e, "preferredName", guest.id)}
                        />
                      </FormField>
                    )}
                  </Field>
                </Box>
                <Field name="email">
                  {({ field, meta }: any) => (
                    <FormField label="Email" error={meta.error} htmlFor={`new-guest-invitation-email-${guest.id}`}>
                      <TextInput
                        id={`new-guest-invitation-email-${guest.id}`}
                        type="email"
                        value={field.value || ""}
                        onChange={e => onChange(e, "email", guest.id)}
                      />
                    </FormField>
                  )}
                </Field>
                {guest.partnerId ? (
                  <Button alignSelf="start" plain onClick={onRemovePartner}>
                    <Box pad="small" direction="row" gap="xsmall" background="accent-2">
                      <CoupleIcon color="#fff" style={{ height: 24 }} />
                      <Text color="white">{(partner && partner.name) || guest.partnerId}</Text>
                    </Box>
                  </Button>
                ) : (
                  <Button alignSelf="start" active onClick={onAddNewPartner}>
                    <Box direction="row" pad="small">
                      <CoupleIcon style={{ height: 24 }} />
                    </Box>
                  </Button>
                )}
              </Box>
            </TableCell>
          </TableRow>
        </Formik>
      )}
    </ThemeContext.Consumer>
  );
};

interface ICreateNewGuestRowProps extends Omit<IProps, "onRemovePartner"> {
  getNewGuestById: (id: string) => INewGuest | IGuest;
  onRemovePartner?: (guest: IGuest) => any;
}

const CreateNewGuestRow: React.FC<ICreateNewGuestRowProps> = ({ getNewGuestById, onRemovePartner, ...props }) => {
  const dispatch = useDispatch();
  const savedGuests = useStateSelector(state => state.guests.byId);

  useEffect(() => {
    const partnerId = props.guest.partnerId;
    if (partnerId && !getNewGuestById(partnerId) && !savedGuests[partnerId]) {
      dispatch(fetchGuest(partnerId));
    }
  });

  const partner = props.guest.partnerId
    ? getNewGuestById(props.guest.partnerId) || savedGuests[props.guest.partnerId]
    : undefined;

  return (
    <CreateNewGuestRowComponent
      {...props}
      partner={partner}
      onRemovePartner={onRemovePartner ? () => onRemovePartner(partner as IGuest) : undefined}
    />
  );
};

export default CreateNewGuestRow;
