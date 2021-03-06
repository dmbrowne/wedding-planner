declare namespace JSX {
  interface IntrinsicElements {
    "ion-icon": {
      size?: "small" | "large";
      class?: string;
    } & ({ src: string } | { name: string });
  }
}

declare module "@storybook/addon-docs/blocks";
