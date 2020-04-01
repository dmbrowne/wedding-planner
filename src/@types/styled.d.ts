import { grommet } from "grommet";
import "styled-components";

type Theme = typeof grommet;

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
