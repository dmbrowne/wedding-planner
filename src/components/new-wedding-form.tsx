import React, { useState, useContext } from "react";
import { Box, Button, Text, Heading, Form, FormField, TextInput, ResponsiveContext } from "grommet";
import styled from "styled-components";
import { Close } from "grommet-icons";

interface IProps {
  onCancel: () => any;
  onSubmit: (values: { weddingName: string; partner1Name: string; partner2Name: string }) => any;
}

const PlainFieldSet = styled.fieldset`
  border: none;
  margin: 40px 0;
  padding: 0;
`;
const PartnerNamesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
  grid-gap: ${({ theme }) => theme.global?.spacing};
`;

const NewWeddingForm: React.FC<IProps> = ({ onCancel, onSubmit }) => {
  const [weddingPartner1, setweddingPartner1] = useState("");
  const [weddingPartner2, setweddingPartner2] = useState("");
  const [weddingDayName, setWeddingDayName] = useState("");
  const screenSize = useContext(ResponsiveContext);

  const NameContainerEl = screenSize === "small" ? Box : PartnerNamesGrid;
  const weddingDayNamePlaceholder =
    weddingPartner1 && weddingPartner2 && !weddingDayName ? `${weddingPartner1} and ${weddingPartner2}` : "";

  const nameChange = (partner1: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const update = partner1 ? setweddingPartner1 : setweddingPartner2;
    update(e.target.value);
  };

  return (
    <>
      <Box direction="row" gap="medium">
        <Button icon={<Close />} plain onClick={onCancel} />
        <Heading level={1}>It's time to jump the broom!</Heading>
      </Box>
      <Form
        onSubmit={() =>
          onSubmit({
            weddingName: weddingDayName ? weddingDayName : weddingDayNamePlaceholder,
            partner1Name: weddingPartner1,
            partner2Name: weddingPartner2
          })
        }
      >
        <PlainFieldSet>
          <Heading level={2} as="legend" margin={{ bottom: "medium" }} children="Who's tying the knot?" />
          <NameContainerEl>
            <FormField htmlFor="wedding-partner-1">
              <TextInput
                placeholder="Name"
                id="wedding-partner-1"
                value={weddingPartner1}
                onChange={nameChange(true)}
              />
            </FormField>
            <Box
              align="center"
              margin={screenSize === "small" ? { vertical: "large" } : undefined}
              justify={screenSize === "small" ? "start" : "center"}
            >
              <Text color="dark-6" children="and" />
            </Box>
            <FormField htmlFor="wedding-partner-2">
              <TextInput
                placeholder="Name"
                id="wedding-partner-2"
                value={weddingPartner2}
                onChange={nameChange(false)}
              />
            </FormField>
          </NameContainerEl>
        </PlainFieldSet>
        <PlainFieldSet>
          <Heading level={3} as="legend" margin={{ bottom: "medium" }} children="Give it a name..." />
          <FormField htmlFor="wedding-day-name">
            <TextInput
              placeholder={weddingDayNamePlaceholder}
              id="wedding-day-name"
              value={weddingDayName}
              onChange={e => setWeddingDayName(e.target.value)}
            />
          </FormField>
        </PlainFieldSet>
        <Box direction="row" justify="end" gap="medium">
          <Button label="Cancel" onClick={onCancel} />
          <Button type="submit" primary label="Create" />
        </Box>
      </Form>
    </>
  );
};

export default NewWeddingForm;
