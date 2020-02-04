import React from "react";
import { Heading, Box, Text, Button, BoxProps } from "grommet";
import styled from "styled-components";
import RoundedCard from "../components/rounded-card";
import { AddCircle, LinkNext } from "grommet-icons";
import { RouteComponentProps } from "react-router-dom";

const Container = styled(Box).attrs({ vertical: "medium" })`
  display: block;
`;

const SHorizontalScrollContainer = styled(Box).attrs({ wrap: false, direction: "row", pad: { right: "medium" } })`
  overflow: auto;
`;
const SHorizontalScrollItem = styled<any>(Box).attrs({
  margin: (props: any) =>
    props.first
      ? { left: "medium", right: "small" }
      : props.last
      ? { right: "medium", left: "small" }
      : { horizontal: "small" }
})`
  flex: 0 0 auto;
`;

type TSectionHeading = { title: string } & (
  | { onClick?: () => void; buttonLabel?: string }
  | { onClick: () => void; buttonLabel: string }
);

const SectionHeading: React.FC<TSectionHeading> = ({ title, onClick, buttonLabel, ...props }) => (
  <Box as="header" direction="row" align="center" {...props}>
    <Heading level={2} children={title} />
    {!!onClick && (
      <Box pad={{ top: "small", left: "small" }}>
        <Button plain onClick={onClick}>
          <Box direction="row" gap="xxsmall">
            <Text color="brand" children={buttonLabel} />
            <LinkNext color="brand" />
          </Box>
        </Button>
      </Box>
    )}
  </Box>
);

const Section: React.FC<Omit<TSectionHeading, "title"> & BoxProps & { title?: string; titleProps?: BoxProps }> = ({
  children,
  title,
  onClick,
  buttonLabel,
  titleProps,
  ...props
}) => (
  <Box as="section" margin={{ horizontal: "medium", bottom: "medium" }} {...props}>
    {title && <SectionHeading title={title} onClick={onClick} buttonLabel={buttonLabel} {...titleProps} />}
    {children}
  </Box>
);

const EventDetail: React.FC<RouteComponentProps> = ({ match, history }) => {
  const services = [
    { name: "Ceremony", date: new Date("April 24, 2020 13:00:00") },
    { name: "Dinner", date: new Date("April 24, 2020 16:00:00") },
    { name: "Reception", date: new Date("April 24, 2020 19:00:00") }
  ];
  return (
    <Container>
      <Heading level={1} margin={{ horizontal: "medium" }} children="The Wedding" />

      <Section
        title="Guests"
        onClick={() => history.push(`${match.url}/guestlist`)}
        buttonLabel="View / edit guestlist"
      >
        <Text as="p" margin={{ top: "0" }}>
          <Text size="large" as="span" children="64 " />
          Guests currently invited in total, including the bride and groom
        </Text>
        <Text as="p" color="dark-3" margin="none">
          <Text as="span" color="neutral-1" children="31 " />
          Attending
        </Text>
        <Text as="p" color="dark-3" margin="none">
          <Text as="span" color="status-critical" children="13 " />
          Not attending
        </Text>
        <Text as="p" color="dark-3" margin="none">
          <Text as="span" color="status-warning" children="20 " />
          Not confirmed
        </Text>
      </Section>

      <Section margin={{ vertical: "medium" }}>
        <Heading level={2} margin={{ horizontal: "medium" }} children="Services" />
        <SHorizontalScrollContainer>
          {services.map((service, idx) => (
            <SHorizontalScrollItem first={idx === 0}>
              <RoundedCard
                margin={{ vertical: "xxsmall" }}
                elevation="xsmall"
                width="350px"
                height="200px"
                pad="medium"
              >
                <Heading level="3" size="small" as="header" children={service.name} />
              </RoundedCard>
            </SHorizontalScrollItem>
          ))}
          <SHorizontalScrollItem align="center" justify="center" pad="medium" width={{ min: "200px" }} last>
            <Text color="brand" size="large" children="Add service" />
            <Button icon={<AddCircle color="brand" size="32px" />} />
          </SHorizontalScrollItem>
          <Box width={{ min: "1px" }} />
        </SHorizontalScrollContainer>
      </Section>

      <Section
        titleProps={{ margin: { horizontal: "medium" } }}
        margin={{ vertical: "medium" }}
        title="Nearby amenities"
        onClick={() => {}}
        buttonLabel="View all / edit amenities order"
      >
        <SHorizontalScrollContainer>
          {services.map((service, idx) => (
            <SHorizontalScrollItem first={idx === 0}>
              <RoundedCard
                margin={{ vertical: "xxsmall" }}
                elevation="xsmall"
                width="350px"
                height="200px"
                pad="medium"
              >
                <Heading level="3" size="small" as="header" children={service.name} />
              </RoundedCard>
            </SHorizontalScrollItem>
          ))}
          <SHorizontalScrollItem align="center" justify="center" pad="medium" width={{ min: "200px" }} last>
            <Text color="brand" size="large" children="Add amenity" />
            <Button icon={<AddCircle color="brand" size="32px" />} />
          </SHorizontalScrollItem>
          <Box width={{ min: "1px" }} />
        </SHorizontalScrollContainer>
      </Section>
    </Container>
  );
};

export default EventDetail;
