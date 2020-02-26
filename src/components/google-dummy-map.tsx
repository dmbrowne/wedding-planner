import React, { useRef, ReactNode, useLayoutEffect, useState } from "react";

interface IProps {
  children: (el: HTMLDivElement) => ReactNode;
}

const GoogleDummyMap: React.FC<IProps> = ({ children }) => {
  const element = useRef<HTMLDivElement | null>(null);
  const [forceReload, setForceReload] = useState(0);
  const el = element.current;

  // rerender component and its children to send down updated mutable reference
  useLayoutEffect(() => {
    setForceReload(forceReload + 1);
  }, []);

  return (
    <>
      <div ref={element} />
      {el && children(el)}
    </>
  );
};
export function withDummyMap<P>(Component: React.ComponentType<P & { dummyEl: HTMLDivElement }>) {
  return (props: P) => <GoogleDummyMap>{dummyEl => <Component {...props} dummyEl={dummyEl} />}</GoogleDummyMap>;
}

export default GoogleDummyMap;
