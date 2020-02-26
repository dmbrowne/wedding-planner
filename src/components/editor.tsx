import React, { useCallback, useMemo, useState } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, Slate, RenderElementProps, RenderLeafProps, ReactEditor } from "slate-react";
import { Editor, Transforms, createEditor, Node } from "slate";
import { withHistory } from "slate-history";
import EditorToolbar from "./editor-toolbar";
import { Text, Box } from "grommet";
import { EditableProps } from "slate-react/dist/components/editable";

export enum EFormat {
  Bold = "bold",
  Italic = "italic",
  Underline = "underline",
  Code = "code",
  HeadingOne = "heading-one",
  HeadingTwo = "heading-two",
  HeadingThree = "heading-three",
  BlockQuote = "block-quote",
  NumberedList = "numbered-list",
  BulletedList = "bulleted-list",
}

export const EHotKeys = {
  "mod+b": EFormat.Bold,
  "mod+i": EFormat.Italic,
  "mod+u": EFormat.Underline,
  "mod+`": EFormat.Code,
};

export const LIST_TYPES = ["numbered-list", "bulleted-list"];

export const toggleBlock = (editor: Editor & ReactEditor, format: EFormat) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor: Editor & ReactEditor, format: EFormat) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const isBlockActive = (editor: Editor & ReactEditor, format: EFormat) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor: Editor & ReactEditor, format: EFormat) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "heading-three":
      return <h3 {...attributes}>{children}</h3>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.code) children = <code>{children}</code>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;

  return <span {...attributes}>{children}</span>;
};

interface IRichTextProps extends Omit<EditableProps, "renderElement" | "renderLeaf" | "onKeyDown"> {
  initialValue?: Node[];
  onValueUpdate?: (val: Node[]) => any;
}

const RichText: React.FC<IRichTextProps> = ({ initialValue, onValueUpdate, ...props }) => {
  const defaultValue: Node[] = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];
  const [value, setValue] = useState(initialValue || defaultValue);
  const renderElement = useCallback<(renderProps: RenderElementProps) => JSX.Element>(props => <Element {...props} />, []);
  const renderLeaf = useCallback<(renderProps: RenderLeafProps) => JSX.Element>(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const onSlateChange = (value: Node[]) => {
    setValue(value);
    if (onValueUpdate) onValueUpdate(value);
  };

  return (
    <Slate editor={editor} value={value} onChange={onSlateChange}>
      <EditorToolbar />
      <Box pad={{ horizontal: "small" }} background="light-1" fill="vertical" overflow="auto">
        <Editable
          {...props}
          readOnly={props.readOnly || props.disabled}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          onKeyDown={event => {
            for (const hotkey in EHotKeys) {
              if (isHotkey(hotkey, (event as unknown) as KeyboardEvent)) {
                event.preventDefault();
                const mark = (EHotKeys[hotkey as keyof typeof EHotKeys] as unknown) as EFormat;
                toggleMark(editor, mark);
              }
            }
          }}
        />
      </Box>
    </Slate>
  );
};

export default RichText;
