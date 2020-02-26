export default {
  global: {
    colors: {
      icon: {
        "0": "#" as "#",
        "1": "6" as "6",
        "2": "6" as "6",
        "3": "6" as "6",
        "4": "6" as "6",
        "5": "6" as "6",
        "6": "6" as "6",
        dark: "#f8f8f8" as "#f8f8f8",
        light: "#666666" as "#666666",
      },
      active: "rgba(221,221,221,0.5)" as "rgba(221,221,221,0.5)",
      black: "#000000" as "#000000",
      border: {
        dark: "rgba(255,255,255,0.33)" as "rgba(255,255,255,0.33)",
        light: "rgba(0,0,0,0.33)" as "rgba(0,0,0,0.33)",
      },
      brand: "#0072c6" as "#0072c6",
      control: {
        dark: "#f8f8f8" as "#f8f8f8",
        light: "#444444" as "#444444",
      },
      focus: "#6FFFB0" as "#6FFFB0",
      placeholder: "#AAAAAA" as "#AAAAAA",
      selected: "brand" as "brand",
      text: {
        dark: "#f8f8f8" as "#f8f8f8",
        light: "#444444" as "#444444",
      },
      white: "#FFFFFF" as "#FFFFFF",
      "accent-1": "#d6b12c" as "#d6b12c",
      "accent-2": "#128023" as "#128023",
      "accent-3": "#0050ef" as "#0050ef",
      "accent-4": "#d80073" as "#d80073",
      "dark-1": "#333333" as "#333333",
      "dark-2": "#555555" as "#555555",
      "dark-3": "#777777" as "#777777",
      "dark-4": "#999999" as "#999999",
      "dark-5": "#999999" as "#999999",
      "dark-6": "#999999" as "#999999",
      "light-1": "#F8F8F8" as "#F8F8F8",
      "light-2": "#F2F2F2" as "#F2F2F2",
      "light-3": "#EDEDED" as "#EDEDED",
      "light-4": "#DADADA" as "#DADADA",
      "light-5": "#DADADA" as "#DADADA",
      "light-6": "#DADADA" as "#DADADA",
      "neutral-1": "#a4c400" as "#a4c400",
      "neutral-2": "#00aba9" as "#00aba9",
      "neutral-3": "#BF5A15" as "#BF5A15",
      "neutral-4": "#8F6C53" as "#8F6C53",
      "status-critical": "#FF4040" as "#FF4040",
      "status-error": "#FF4040" as "#FF4040",
      "status-warning": "#FFAA15" as "#FFAA15",
      "status-ok": "#00C781" as "#00C781",
      "status-unknown": "#CCCCCC" as "#CCCCCC",
      "status-disabled": "#CCCCCC" as "#CCCCCC",
      "neutral-5": "#9A1616" as "#9A1616",
    },
    animation: {
      duration: "1s" as "1s",
      jiggle: {
        duration: "0.1s" as "0.1s",
      },
    },
    borderSize: {
      xsmall: "1px" as "1px",
      small: "2px" as "2px",
      medium: "4px" as "4px",
      large: "12px" as "12px",
      xlarge: "24px" as "24px",
    },
    breakpoints: {
      small: {
        value: 768,
        borderSize: {
          xsmall: "1px" as "1px",
          small: "2px" as "2px",
          medium: "4px" as "4px",
          large: "6px" as "6px",
          xlarge: "12px" as "12px",
        },
        edgeSize: {
          none: "0px" as "0px",
          hair: "1px" as "1px",
          xxsmall: "2px" as "2px",
          xsmall: "3px" as "3px",
          small: "6px" as "6px",
          medium: "12px" as "12px",
          large: "24px" as "24px",
          xlarge: "48px" as "48px",
        },
        size: {
          xxsmall: "24px" as "24px",
          xsmall: "48px" as "48px",
          small: "96px" as "96px",
          medium: "192px" as "192px",
          large: "384px" as "384px",
          xlarge: "768px" as "768px",
          full: "100%" as "100%",
        },
      },
      medium: {
        value: 1536,
      },
      large: {},
    },
    deviceBreakpoints: {
      phone: "small" as "small",
      tablet: "medium" as "medium",
      computer: "large" as "large",
    },
    control: {
      border: {
        width: "1px" as "1px",
        radius: "0px" as "0px",
        color: "border" as "border",
      },
    },
    debounceDelay: 300,
    drop: {
      background: "#005696" as "#005696",
      border: {
        width: "0px" as "0px",
        radius: "0px" as "0px",
      },
      shadowSize: "small" as "small",
      zIndex: "20" as "20",
    },
    edgeSize: {
      none: "0px" as "0px",
      hair: "1px" as "1px",
      xxsmall: "3px" as "3px",
      xsmall: "6px" as "6px",
      small: "12px" as "12px",
      medium: "24px" as "24px",
      large: "48px" as "48px",
      xlarge: "96px" as "96px",
      responsiveBreakpoint: "small" as "small",
    },
    elevation: {
      light: {
        none: "none" as "none",
        xsmall: "0px 1px 2px rgba(0, 0, 0, 0.20)" as "0px 1px 2px rgba(0, 0, 0, 0.20)",
        small: "0px 2px 4px rgba(0, 0, 0, 0.20)" as "0px 2px 4px rgba(0, 0, 0, 0.20)",
        medium: "0px 4px 8px rgba(0, 0, 0, 0.20)" as "0px 4px 8px rgba(0, 0, 0, 0.20)",
        large: "0px 8px 16px rgba(0, 0, 0, 0.20)" as "0px 8px 16px rgba(0, 0, 0, 0.20)",
        xlarge: "0px 12px 24px rgba(0, 0, 0, 0.20)" as "0px 12px 24px rgba(0, 0, 0, 0.20)",
      },
      dark: {
        none: "none" as "none",
        xsmall: "0px 2px 2px rgba(255, 255, 255, 0.40)" as "0px 2px 2px rgba(255, 255, 255, 0.40)",
        small: "0px 4px 4px rgba(255, 255, 255, 0.40)" as "0px 4px 4px rgba(255, 255, 255, 0.40)",
        medium: "0px 6px 8px rgba(255, 255, 255, 0.40)" as "0px 6px 8px rgba(255, 255, 255, 0.40)",
        large: "0px 8px 16px rgba(255, 255, 255, 0.40)" as "0px 8px 16px rgba(255, 255, 255, 0.40)",
        xlarge: "0px 12px 24px rgba(255, 255, 255, 0.40)" as "0px 12px 24px rgba(255, 255, 255, 0.40)",
      },
    },
    focus: {
      border: {
        color: {
          "0": "f" as "f",
          "1": "o" as "o",
          "2": "c" as "c",
          "3": "u" as "u",
          "4": "s" as "s",
          light: "#0072c6" as "#0072c6",
          dark: "#003967" as "#003967",
        },
      },
    },
    font: {
      size: "18px" as "18px",
      height: "24px" as "24px",
      maxWidth: "432px" as "432px",
      family: '"Montserrat", "Ubuntu", "Helvetica Neue", "Segoe UI", -apple-system, system-ui, BlinkMacSystemFont, sans-serif',
    },
    hover: {
      background: {
        dark: "#0093ff" as "#0093ff",
        light: "#003967" as "#003967",
      },
      color: {
        dark: "#333333" as "#333333",
        light: "#ffffff" as "#ffffff",
      },
    },
    input: {
      padding: "12px" as "12px",
      weight: 600,
    },
    opacity: {
      strong: 0.8,
      medium: 0.4,
      weak: 0.1,
    },
    selected: {
      background: "selected" as "selected",
      color: "white" as "white",
    },
    spacing: "24px" as "24px",
    size: {
      xxsmall: "48px" as "48px",
      xsmall: "96px" as "96px",
      small: "192px" as "192px",
      medium: "384px" as "384px",
      large: "768px" as "768px",
      xlarge: "1152px" as "1152px",
      xxlarge: "1536px" as "1536px",
      full: "100%" as "100%",
    },
  },
  icon: {
    size: {
      small: "12px" as "12px",
      medium: "24px" as "24px",
      large: "48px" as "48px",
      xlarge: "96px" as "96px",
    },
  },
  accordion: {
    icons: {},
  },
  anchor: {
    textDecoration: "none" as "none",
    fontWeight: 600,
    color: {
      dark: "#ffffff" as "#ffffff",
      light: "#0078D4" as "#0078D4",
    },
    hover: {
      textDecoration: "underline" as "underline",
    },
  },
  box: {
    responsiveBreakpoint: "small" as "small",
  },
  button: {
    border: {
      width: "2px" as "2px",
      radius: "0px" as "0px",
    },
    primary: {
      color: {
        light: "#0072c6" as "#0072c6",
        dark: "accent-1" as "accent-1",
      },
    },
    disabled: {
      opacity: 0.3,
    },
    minWidth: "96px" as "96px",
    maxWidth: "384px" as "384px",
    padding: {
      vertical: "4px" as "4px",
      horizontal: "22px" as "22px",
    },
  },
  calendar: {
    small: {
      fontSize: "14px" as "14px",
      lineHeight: 1.375,
      daySize: "27.428571428571427px" as "27.428571428571427px",
      slideDuration: "0.2s" as "0.2s",
    },
    medium: {
      fontSize: "18px" as "18px",
      lineHeight: 1.45,
      daySize: "54.857142857142854px" as "54.857142857142854px",
      slideDuration: "0.5s" as "0.5s",
    },
    large: {
      fontSize: "30px" as "30px",
      lineHeight: 1.11,
      daySize: "109.71428571428571px" as "109.71428571428571px",
      slideDuration: "0.8s" as "0.8s",
    },
    icons: {
      small: {},
    },
  },
  carousel: {
    icons: {},
  },
  chart: {},
  checkBox: {
    border: {
      color: {
        dark: "rgba(255, 255, 255, 0.5)" as "rgba(255, 255, 255, 0.5)",
        light: "rgba(0, 98, 186, 0.5)" as "rgba(0, 98, 186, 0.5)",
      },
      width: "2px" as "2px",
    },
    check: {
      radius: "0px" as "0px",
      thickness: "4px" as "4px",
    },
    icon: {},
    icons: {},
    hover: {
      border: {
        color: {
          dark: "white" as "white",
          light: "black" as "black",
        },
      },
    },
    size: "24px" as "24px",
    toggle: {
      color: {
        dark: "#bdbdbd" as "#bdbdbd",
        light: "#0072c6" as "#0072c6",
      },
      radius: "0px" as "0px",
      size: "48px" as "48px",
      knob: {},
    },
    color: {
      light: "#0072c6" as "#0072c6",
      dark: "#a6cfff" as "#a6cfff",
    },
  },
  clock: {
    analog: {
      hour: {
        color: {
          dark: "light-2" as "light-2",
          light: "dark-3" as "dark-3",
        },
        width: "8px" as "8px",
        size: "24px" as "24px",
        shape: "round" as "round",
      },
      minute: {
        color: {
          dark: "light-4" as "light-4",
          light: "dark-3" as "dark-3",
        },
        width: "4px" as "4px",
        size: "12px" as "12px",
        shape: "round" as "round",
      },
      second: {
        color: {
          dark: "accent-1" as "accent-1",
          light: "accent-1" as "accent-1",
        },
        width: "3px" as "3px",
        size: "9px" as "9px",
        shape: "round" as "round",
      },
      size: {
        small: "72px" as "72px",
        medium: "96px" as "96px",
        large: "144px" as "144px",
        xlarge: "216px" as "216px",
        huge: "288px" as "288px",
      },
    },
    digital: {
      text: {
        xsmall: {
          size: "10px" as "10px",
          height: 1.5,
        },
        small: {
          size: "14px" as "14px",
          height: 1.43,
        },
        medium: {
          size: "18px" as "18px",
          height: 1.375,
        },
        large: {
          size: "22px" as "22px",
          height: 1.167,
        },
        xlarge: {
          size: "26px" as "26px",
          height: 1.1875,
        },
        xxlarge: {
          size: "34px" as "34px",
          height: 1.125,
        },
      },
    },
  },
  collapsible: {
    minSpeed: 200,
    baseline: 500,
  },
  dataTable: {
    header: {},
    groupHeader: {
      border: {
        side: "bottom" as "bottom",
        size: "xsmall" as "xsmall",
      },
      fill: "vertical" as "vertical",
      pad: {
        horizontal: "small" as "small",
        vertical: "xsmall" as "xsmall",
      },
      background: {
        dark: "dark-2" as "dark-2",
        light: "light-2" as "light-2",
      },
    },
    icons: {},
    resize: {
      border: {
        side: "right" as "right",
        color: "border" as "border",
      },
    },
    primary: {
      weight: "bold" as "bold",
    },
  },
  diagram: {
    line: {
      color: "accent-1" as "accent-1",
    },
  },
  formField: {
    border: {
      color: "border" as "border",
      position: "inner" as "inner",
      side: "bottom" as "bottom",
      error: {
        color: {
          dark: "white" as "white",
          light: "status-critical" as "status-critical",
        },
      },
    },
    content: {
      pad: {
        horizontal: "small" as "small",
        bottom: "small" as "small",
      },
    },
    error: {
      margin: {
        vertical: "xsmall" as "xsmall",
        horizontal: "small" as "small",
      },
      color: {
        dark: "status-critical" as "status-critical",
        light: "status-critical" as "status-critical",
      },
    },
    help: {
      margin: {
        left: "small" as "small",
      },
      color: {
        dark: "dark-3" as "dark-3",
        light: "dark-3" as "dark-3",
      },
    },
    label: {
      margin: {
        vertical: "xsmall" as "xsmall",
        horizontal: "small" as "small",
      },
    },
    margin: {
      bottom: "small" as "small",
    },
  },
  grommet: {},
  heading: {
    font: {},
    level: {
      "1": {
        font: {},
        small: {
          size: "34px" as "34px",
          height: "40px" as "40px",
          maxWidth: "816px" as "816px",
        },
        medium: {
          size: "50px" as "50px",
          height: "56px" as "56px",
          maxWidth: "1200px" as "1200px",
        },
        large: {
          size: "82px" as "82px",
          height: "88px" as "88px",
          maxWidth: "1968px" as "1968px",
        },
        xlarge: {
          size: "114px" as "114px",
          height: "120px" as "120px",
          maxWidth: "2736px" as "2736px",
        },
      },
      "2": {
        font: {},
        small: {
          size: "26px" as "26px",
          height: "32px" as "32px",
          maxWidth: "624px" as "624px",
        },
        medium: {
          size: "34px" as "34px",
          height: "40px" as "40px",
          maxWidth: "816px" as "816px",
        },
        large: {
          size: "50px" as "50px",
          height: "56px" as "56px",
          maxWidth: "1200px" as "1200px",
        },
        xlarge: {
          size: "66px" as "66px",
          height: "72px" as "72px",
          maxWidth: "1584px" as "1584px",
        },
      },
      "3": {
        font: {},
        small: {
          size: "22px" as "22px",
          height: "28px" as "28px",
          maxWidth: "528px" as "528px",
        },
        medium: {
          size: "26px" as "26px",
          height: "32px" as "32px",
          maxWidth: "624px" as "624px",
        },
        large: {
          size: "34px" as "34px",
          height: "40px" as "40px",
          maxWidth: "816px" as "816px",
        },
        xlarge: {
          size: "42px" as "42px",
          height: "48px" as "48px",
          maxWidth: "1008px" as "1008px",
        },
      },
      "4": {
        font: {},
        small: {
          size: "18px" as "18px",
          height: "24px" as "24px",
          maxWidth: "432px" as "432px",
        },
        medium: {
          size: "18px" as "18px",
          height: "24px" as "24px",
          maxWidth: "432px" as "432px",
        },
        large: {
          size: "18px" as "18px",
          height: "24px" as "24px",
          maxWidth: "432px" as "432px",
        },
        xlarge: {
          size: "18px" as "18px",
          height: "24px" as "24px",
          maxWidth: "432px" as "432px",
        },
      },
      "5": {
        font: {},
        small: {
          size: "16px" as "16px",
          height: "22px" as "22px",
          maxWidth: "384px" as "384px",
        },
        medium: {
          size: "16px" as "16px",
          height: "22px" as "22px",
          maxWidth: "384px" as "384px",
        },
        large: {
          size: "16px" as "16px",
          height: "22px" as "22px",
          maxWidth: "384px" as "384px",
        },
        xlarge: {
          size: "16px" as "16px",
          height: "22px" as "22px",
          maxWidth: "384px" as "384px",
        },
      },
      "6": {
        font: {},
        small: {
          size: "14px" as "14px",
          height: "20px" as "20px",
          maxWidth: "336px" as "336px",
        },
        medium: {
          size: "14px" as "14px",
          height: "20px" as "20px",
          maxWidth: "336px" as "336px",
        },
        large: {
          size: "14px" as "14px",
          height: "20px" as "20px",
          maxWidth: "336px" as "336px",
        },
        xlarge: {
          size: "14px" as "14px",
          height: "20px" as "20px",
          maxWidth: "336px" as "336px",
        },
      },
    },
    responsiveBreakpoint: "small" as "small",
    weight: 600,
  },
  layer: {
    background: "white" as "white",
    border: {
      radius: "0px" as "0px",
    },
    container: {
      zIndex: "15" as "15",
    },
    overlay: {
      background: "rgba(0, 0, 0, 0.5)" as "rgba(0, 0, 0, 0.5)",
    },
    responsiveBreakpoint: "small" as "small",
    zIndex: "10" as "10",
    backgroundColor: "#eef3fc" as "#eef3fc",
  },
  menu: {
    icons: {},
  },
  meter: {
    color: "accent-1" as "accent-1",
  },
  paragraph: {
    small: {
      size: "14px" as "14px",
      height: "20px" as "20px",
      maxWidth: "336px" as "336px",
    },
    medium: {
      size: "18px" as "18px",
      height: "24px" as "24px",
      maxWidth: "432px" as "432px",
    },
    large: {
      size: "22px" as "22px",
      height: "28px" as "28px",
      maxWidth: "528px" as "528px",
    },
    xlarge: {
      size: "26px" as "26px",
      height: "32px" as "32px",
      maxWidth: "624px" as "624px",
    },
    xxlarge: {
      size: "34px" as "34px",
      height: "40px" as "40px",
      maxWidth: "816px" as "816px",
    },
  },
  radioButton: {
    border: {
      color: {
        dark: "rgba(255, 255, 255, 0.5)" as "rgba(255, 255, 255, 0.5)",
        light: "rgba(0, 98, 186, 0.5)" as "rgba(0, 98, 186, 0.5)",
      },
      width: "2px" as "2px",
    },
    check: {
      radius: "100%" as "100%",
    },
    hover: {
      border: {
        color: {
          dark: "white" as "white",
          light: "black" as "black",
        },
      },
    },
    icon: {},
    icons: {},
    gap: "small" as "small",
    size: "24px" as "24px",
  },
  rangeInput: {
    track: {
      height: "4px" as "4px",
      color: [null, ";"],
    },
    thumb: {},
  },
  rangeSelector: {
    background: {
      invert: {
        color: "light-4" as "light-4",
      },
    },
  },
  select: {
    container: {},
    control: {},
    icons: {},
    options: {
      box: {
        align: "start" as "start",
        pad: "small" as "small",
      },
      text: {
        margin: "none" as "none",
      },
    },
    step: 20,
  },
  tab: {
    active: {
      color: "text" as "text",
    },
    border: {
      side: "bottom" as "bottom",
      size: "small" as "small",
      color: {
        dark: "accent-1" as "accent-1",
        light: "brand" as "brand",
      },
      active: {
        color: {
          dark: "white" as "white",
          light: "black" as "black",
        },
      },
      hover: {
        color: {
          dark: "white" as "white",
          light: "black" as "black",
        },
      },
    },
    color: "control" as "control",
    hover: {
      color: {
        dark: "white" as "white",
        light: "black" as "black",
      },
    },
    margin: {
      vertical: "xxsmall" as "xxsmall",
      horizontal: "small" as "small",
    },
    pad: {
      bottom: "xsmall" as "xsmall",
    },
  },
  tabs: {
    header: {},
    panel: {},
  },
  table: {
    header: {
      align: "start" as "start",
      pad: {
        horizontal: "small" as "small",
        vertical: "xsmall" as "xsmall",
      },
      border: "bottom" as "bottom",
      verticalAlign: "bottom" as "bottom",
      fill: "vertical" as "vertical",
    },
    body: {
      align: "start" as "start",
      pad: {
        horizontal: "small" as "small",
        vertical: "xsmall" as "xsmall",
      },
    },
    footer: {
      align: "start" as "start",
      pad: {
        horizontal: "small" as "small",
        vertical: "xsmall" as "xsmall",
      },
      border: "top" as "top",
      verticalAlign: "top" as "top",
      fill: "vertical" as "vertical",
    },
  },
  text: {
    xsmall: {
      size: "12px" as "12px",
      height: "18px" as "18px",
      maxWidth: "288px" as "288px",
    },
    small: {
      size: "14px" as "14px",
      height: "20px" as "20px",
      maxWidth: "336px" as "336px",
    },
    medium: {
      size: "18px" as "18px",
      height: "24px" as "24px",
      maxWidth: "432px" as "432px",
    },
    large: {
      size: "22px" as "22px",
      height: "28px" as "28px",
      maxWidth: "528px" as "528px",
    },
    xlarge: {
      size: "26px" as "26px",
      height: "32px" as "32px",
      maxWidth: "624px" as "624px",
    },
    xxlarge: {
      size: "34px" as "34px",
      height: "40px" as "40px",
      maxWidth: "816px" as "816px",
    },
  },
  video: {
    captions: {
      background: "rgba(0, 0, 0, 0.7)" as "rgba(0, 0, 0, 0.7)",
    },
    icons: {},
    scrubber: {
      color: "light-4" as "light-4",
    },
  },
  worldMap: {
    color: "light-3" as "light-3",
    continent: {
      active: "8px" as "8px",
      base: "6px" as "6px",
    },
    hover: {
      color: "light-4" as "light-4",
    },
    place: {
      active: "20px" as "20px",
      base: "8px" as "8px",
    },
  },
};
