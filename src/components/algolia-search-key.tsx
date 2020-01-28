import React, { useState, useEffect } from "react";
import * as firebase from "firebase/app";
import { useStateSelector } from "../store/redux";

export const AlgoliaSearchKeyContext = React.createContext({
  key: "",
  fetching: false
});

const PROJECT_ID = "wedlock-316f8";

export const AlgoliaSearchKeyProvider: React.FC = ({ children }) => {
  const weddingId = useStateSelector(state => state.activeWeddingId);
  const algoliaSearchKey = weddingId && window.sessionStorage.getItem(`algoliaSearchKey-${weddingId}`);
  const [searchkey, setsearchkey] = useState(algoliaSearchKey || "");
  const [fetchInProgress, setfetchInProgress] = useState(false);

  const user = firebase.auth().currentUser;

  if (!user) {
    throw Error("user not found. Make sure AlgoliaSearchProvider is wrapped within an AuthProvider");
  }

  useEffect(() => {
    if (!weddingId) {
      return;
    }

    if (!algoliaSearchKey) {
      setfetchInProgress(true);
      user
        .getIdToken()
        .then(token => {
          return fetch("https://us-central1-" + PROJECT_ID + ".cloudfunctions.net/getAlgoliaSearchKey/", {
            method: "post",
            body: JSON.stringify({ weddingId }),
            headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }
          });
        })
        .then(response => response.json())
        .then(data => {
          setfetchInProgress(false);
          window.sessionStorage.setItem(`algoliaSearchKey-${weddingId}`, data.key);
          setsearchkey(data.key as string);
        })
        .catch(err => {
          throw Error(err);
        });
    }
  }, [weddingId]);

  return (
    <AlgoliaSearchKeyContext.Provider value={{ key: searchkey, fetching: fetchInProgress }}>
      {children}
    </AlgoliaSearchKeyContext.Provider>
  );
};