import React from "react";
import styled from "styled-components";
import { Button } from "grommet";

const Center = styled.div<{ size?: "small" | "medium" | "large" }>`
  max-width: ${({ size }) => (size === "large" ? "900px" : size === "medium" ? "500px" : "200px")};
  width: 100%;
  min-height: 200px;
  margin: auto;
`;

export const ModalUiDisplay: React.FC<{ children: (closeModal: () => void) => React.ReactElement }> = ({ children }) => {
  const [showModal, setShowModal] = React.useState(true);
  return (
    <div>
      <Button onClick={() => setShowModal(true)} label="show/hide modal" />
      {showModal && children(() => setShowModal(false))}
    </div>
  );
};

export default Center;
