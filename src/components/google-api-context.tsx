import React, { useEffect, useState, createContext } from "react";
import { loadScript } from "../utils";

type TApiStatus = "initial" | "pending" | "ready" | "error";

export const GoogleApiContext = createContext<{ status: TApiStatus }>({
  status: "initial",
});

const GoogleApiContextProvider: React.FC = ({ children }) => {
  const [apiLoadedStatus, setApiLoadedStatus] = useState<"initial" | "pending" | "ready" | "error">("initial");

  useEffect(() => {
    if (!window.google) loadMapScript();
    else if (!window.google.maps) loadMapScript();
    else if (!window.google.maps.places) loadMapScript();
    else {
      setApiLoadedStatus("ready");
    }
  }, []);

  const loadMapScript = () => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB8vAn16SJlQLN-QbdPOaJiyn5QMr7ZHis&libraries=places")
      .then(() => setApiLoadedStatus("ready"))
      .catch((err: Error) => {
        setApiLoadedStatus("error");
        console.error(err.message);
      });
  };

  return <GoogleApiContext.Provider value={{ status: apiLoadedStatus }}>{children}</GoogleApiContext.Provider>;
};

export default GoogleApiContextProvider;
