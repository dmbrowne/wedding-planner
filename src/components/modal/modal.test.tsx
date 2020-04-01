import React from "react";
import { fireEvent } from "@testing-library/react";
import Modal from "./modal";
import { renderWithTheme } from "../../test-support/theme";

// remove animation from modal so tests don't have to wait for the animation to end
const modalProps = { layerProps: { animation: false } };

describe("Components/modal", () => {
  test("should render the title prop text", () => {
    const onClose = jest.fn();

    const { getByText } = renderWithTheme(
      <Modal title="modal title" onClose={onClose} {...modalProps}>
        <div />
      </Modal>
    );

    expect(getByText("modal title")).toBeTruthy();
  });

  test("should render the content", () => {
    const onClose = jest.fn();

    const { getByText } = renderWithTheme(
      <Modal title="modal title" onClose={onClose} {...modalProps}>
        <div>modal content</div>
      </Modal>
    );

    expect(getByText("modal content")).toBeTruthy();
  });

  test("fires onClose prop when ", () => {
    const onClose = jest.fn();

    const { getByLabelText } = renderWithTheme(
      <Modal title="modal title" onClose={onClose} {...modalProps}>
        <div />
      </Modal>
    );

    fireEvent.click(getByLabelText("close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
