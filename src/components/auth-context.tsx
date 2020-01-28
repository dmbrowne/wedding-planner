import React, { useState, useEffect, createContext } from "react";
import firebase, { User } from "firebase/app";

const AuthContext = createContext<{ authenticated: false; user: null } | { authenticated: true; user: User }>({
  authenticated: false,
  user: null
});

export const AuthProvider: React.FC = ({ children }) => {
  const [fetchState, setFetchState] = useState<"loading" | "success" | "error">("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user);
      setFetchState("success");
    });
  }, []);

  return (
    <AuthContext.Provider value={!!user ? { authenticated: true, user } : { authenticated: false, user: null }}>
      {fetchState === "loading" ? "Loading..." : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
