import { useContext, useEffect } from "react";
import { useState } from "react";
import { firestore } from "firebase/app";
import { IWedding } from "./../store/types";
import AuthContext from "../components/auth-context";

const useUserWeddingList = () => {
  const db = firestore();
  const { user: auth } = useContext(AuthContext);
  const [user, setUser] = useState<{ email: string; weddingIds?: string[] } | void>();
  const [weddingsList, setWeddingsList] = useState<IWedding[] | null>(null);

  useEffect(() => {
    if (auth) {
      return db.doc(`users/${auth.uid}`).onSnapshot(snap => setUser(snap.data() as any));
    }
  }, [auth]);

  useEffect(() => {
    if (!user) return;
    const { weddingIds } = user;
    if (!weddingIds) return setWeddingsList([]);

    Promise.all(weddingIds.map(id => db.doc(`weddings/${id}`).get())).then(snaps => {
      const weddings = snaps.map(snap => ({ id: snap.id, ...(snap.data() as IWedding) }));
      setWeddingsList(weddings);
    });
  }, [user]);

  return weddingsList;
};

export default useUserWeddingList;
