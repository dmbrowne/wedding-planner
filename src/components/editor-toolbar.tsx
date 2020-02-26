import React, { ComponentType, useContext } from "react";
import { Button, Box, ThemeContext, Layer } from "grommet";
import { Bold, Italic, Underline, BlockQuote, OrderedList, UnorderedList, IconProps } from "grommet-icons";
import { useSlate } from "slate-react";
import Icon from "@mdi/react";
import { IconProps as MdiIconProps } from "@mdi/react/dist/IconProps";
import { mdiFormatHeader1, mdiFormatHeader2, mdiFormatHeader3 } from "@mdi/js";

import { isBlockActive, toggleBlock, EFormat, isMarkActive, toggleMark } from "./editor";
import { DefaultTheme } from "styled-components";

const onToolbarButtonPress = (cb: () => any) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  e.preventDefault();
  cb();
};

const BlockButton = ({ format, icon: I }: { format: EFormat; icon: ComponentType<IconProps> }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onClick={onToolbarButtonPress(() => toggleBlock(editor, format))}
      children={
        <Box pad="xsmall">
          <I size="20px" />
        </Box>
      }
    />
  );
};

const MarkButton = ({ format, icon: I }: { format: EFormat; icon: ComponentType<IconProps> }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onClick={onToolbarButtonPress(() => toggleMark(editor, format))}
      children={
        <Box pad="xsmall">
          <I size="20px" />
        </Box>
      }
    />
  );
};

const EditorToolbar = () => {
  const themeContext = useContext<DefaultTheme>(ThemeContext);

  const MDIIcon: React.FC<MdiIconProps> = props => (
    <Icon color={(themeContext.global?.colors?.icon as any)?.light} size="24px" {...props} />
  );
  return (
    <Box direction="row" background="white" border={{ side: "bottom", style: "solid" }}>
      <MarkButton format={EFormat.Bold} icon={Bold} />
      <MarkButton format={EFormat.Italic} icon={Italic} />
      <MarkButton format={EFormat.Underline} icon={Underline} />
      <BlockButton format={EFormat.HeadingOne} icon={() => <MDIIcon path={mdiFormatHeader1} />} />
      <BlockButton format={EFormat.HeadingTwo} icon={() => <MDIIcon path={mdiFormatHeader2} />} />
      <BlockButton format={EFormat.HeadingThree} icon={() => <MDIIcon path={mdiFormatHeader3} />} />
      <BlockButton format={EFormat.BlockQuote} icon={BlockQuote} />
      <BlockButton format={EFormat.NumberedList} icon={OrderedList} />
      <BlockButton format={EFormat.BulletedList} icon={UnorderedList} />
    </Box>
  );
};

export default EditorToolbar;
