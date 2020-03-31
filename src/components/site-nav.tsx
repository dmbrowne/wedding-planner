import React, { ReactNode } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { ReactComponent as Logo } from "../icons/jumpbroom.svg";
import { ReactComponent as PicCaption } from "../icons/pic_caption.svg";
import { ReactComponent as HimHer } from "../icons/him_her.svg";
import { ReactComponent as Table } from "../icons/table.svg";
import { Box, Text, Heading, BoxProps } from "grommet";
import { Group, Catalog, Location, Gift } from "grommet-icons";

interface IProps extends RouteComponentProps {
  rootPath?: string;
  onClose: () => void;
}

interface IMenuItemProps extends BoxProps {
  icon?: ReactNode;
  onClick: () => void;
  isActive: boolean;
  label: string;
}

const MenuItem: React.FC<IMenuItemProps> = ({ icon, onClick, isActive, label, ...props }) => (
  <Box
    hoverIndicator="light-3"
    background={isActive ? "light-4" : "transparent"}
    pad={{ vertical: "xsmall", horizontal: "small" }}
    gap="small"
    direction="row"
    align="center"
    onClick={onClick}
    {...props}
  >
    {icon}
    <Text size="small" color={isActive ? "dark-1" : "dark-6"} weight={600} children={label} />
  </Box>
);

const SiteNav: React.FC<IProps> = ({ onClose, history, rootPath = "" }) => {
  const isActive = (path: string) => history.location.pathname.startsWith(`${rootPath}/${path}`);
  const viewRoute = (path: string) => () => {
    history.push(path);
    onClose();
  };

  return (
    <Box pad={{ top: "small" }}>
      <Box pad={{ horizontal: "small" }} children={<Logo />} />
      <MenuItem
        icon={<Box width="24px" height="24px" children={<HimHer />} />}
        isActive={isActive("settings")}
        onClick={viewRoute(`${rootPath}/settings`)}
        label="Wedding details"
        margin={{ top: "medium" }}
      />
      <Heading level={6} margin={{ top: "medium", bottom: "xsmall", left: "large" }} size="small">
        Website sections
      </Heading>
      <MenuItem
        icon={<ion-icon class="medium" name="options-outline" />}
        isActive={isActive("sections")}
        onClick={viewRoute(`${rootPath}/sections`)}
        label="Configure"
      />
      <MenuItem
        icon={<Box width="24px" children={<PicCaption />} />}
        isActive={isActive("cover")}
        onClick={viewRoute(`${rootPath}/cover`)}
        label="Cover"
      />
      <MenuItem icon={<Catalog />} isActive={isActive("stories")} onClick={viewRoute(`${rootPath}/stories`)} label="Stories" />
      <MenuItem icon={<Group />} isActive={isActive("vip")} onClick={viewRoute(`${rootPath}/vip`)} label="Key people" />
      <MenuItem icon={<Location />} isActive={isActive("amenities")} onClick={viewRoute(`${rootPath}/amenities`)} label="Amenities" />
      <MenuItem icon={<Gift />} isActive={isActive("gifts")} onClick={viewRoute(`${rootPath}/gifts`)} label="Gifts" />
      <Heading level={6} margin={{ top: "medium", bottom: "xsmall", left: "large" }} size="small">
        Event planning
      </Heading>
      <MenuItem icon={<Group />} isActive={isActive("guests")} onClick={viewRoute(`${rootPath}/guests`)} label="Guests directory" />
      <MenuItem
        icon={<Box width="24px" height="24px" children={<Table />} />}
        isActive={isActive("table-seating")}
        onClick={viewRoute(`${rootPath}/table-seating`)}
        label="Table seating"
      />
    </Box>
  );
};

export default withRouter(SiteNav);
