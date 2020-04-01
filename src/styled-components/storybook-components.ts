import styled from "styled-components";

const Center = styled.div<{ size?: "small" | "medium" | "large" }>`
  max-width: ${({ size }) => (size === "large" ? "900px" : size === "medium" ? "500px" : "200px")};
  width: 100%;
  min-height: 200px;
`;

export default Center;
