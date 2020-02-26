import React, { useState } from "react";
import { Heading, Text, Box, FormField, TextInput, Button, CheckBox } from "grommet";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Drag } from "grommet-icons";
import { Switch } from "gestalt";
import SContainer from "../components/container";

enum ESection {
  Cover = "Cover",
  HimHer = "Him & Her",
  OurStory = "Our story",
  Engagement = "The engagement",
  KeyPeople = "Key people",
  Amenities = "Amenities",
  Gifts = "Gifts",
}

const menuMap = {
  [ESection.Cover]: { section: ESection.Cover, title: "Home" },
  [ESection.HimHer]: { section: ESection.HimHer, title: "About him & her" },
  [ESection.OurStory]: { section: ESection.OurStory, title: "Our story" },
  [ESection.Engagement]: { section: ESection.Engagement, title: "The engagement" },
  [ESection.KeyPeople]: { section: ESection.KeyPeople, title: "Key people" },
  [ESection.Amenities]: { section: ESection.Amenities, title: "Nearby" },
  [ESection.Gifts]: { section: ESection.Gifts, title: "Gifts" },
};
const menuOrder = [
  ESection.Cover,
  ESection.HimHer,
  ESection.OurStory,
  ESection.Engagement,
  ESection.KeyPeople,
  ESection.Amenities,
  ESection.Gifts,
];
const menus = menuOrder.map(enumConst => menuMap[enumConst]);

const WebsiteConfig = () => {
  const [menuItems, setMenuItems] = useState(menus);

  const onDragDropEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    const clonedMenuItems = [...menuItems];
    const destinationItem = menuMap[draggableId as ESection];
    console.log(destinationItem);
    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    clonedMenuItems.splice(source.index, 1);
    clonedMenuItems.splice(destination.index, 0, destinationItem);
    setMenuItems(clonedMenuItems);
  };

  return (
    <SContainer>
      <Heading level={1}>Your website settings</Heading>
      <Text>What sections do you want to be displayed on your website</Text>
      <DragDropContext onDragEnd={onDragDropEnd}>
        <Droppable droppableId="menu-order">
          {provided => (
            <Box gap="xsmall" ref={provided.innerRef} {...provided.droppableProps} margin={{ vertical: "medium" }}>
              {menuItems.map((item, idx) => (
                <Draggable key={item.section} index={idx} draggableId={item.section}>
                  {providedDraggable => (
                    <Box
                      pad="small"
                      background="white"
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      direction="row"
                      justify="between"
                    >
                      <div>
                        <header>
                          <strong>{item.section}</strong>
                        </header>
                        <Box direction="row" align="start" gap="small">
                          <Text size="small" margin={{ top: "small" }}>
                            display name:{" "}
                          </Text>
                          <FormField margin="none">
                            <TextInput style={{ paddingLeft: 0 }} size="small" value={item.title} />
                          </FormField>
                        </Box>
                      </div>
                      <Box direction="row" gap="medium" align="center">
                        <Switch id={item.section + "-toggle"} onChange={() => {}} />
                        <Button icon={<Drag />} {...providedDraggable.dragHandleProps} />
                      </Box>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </SContainer>
  );
};

export default WebsiteConfig;
