import React, { useRef, useState, useContext, useEffect } from "react";
import { Box, Text, Drop } from "grommet";
import { withRouter } from "react-router-dom";
import { Avatar } from "gestalt";
import { IUser } from "../store/types";
import { User } from "grommet-icons";
import AuthContext from "./auth-context";
import { firestore, auth } from "firebase/app";

const TopMenu = withRouter(({ history }) => {
  const avatarEl = useRef<HTMLDivElement>(null);
  const [showDropMenu, setShowDropMenu] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const { user: authUser } = useContext(AuthContext);
  useEffect(() => {
    if (authUser) {
      firestore()
        .doc(`users/${authUser.uid}`)
        .get()
        .then(doc => {
          if (doc.exists) setUser({ id: doc.id, ...(doc.data() as IUser) });
        });
    }
  }, [authUser]);
  return (
    <>
      <Box as="div" ref={avatarEl} align="center" width="40px" onClick={() => setShowDropMenu(!showDropMenu)}>
        {user ? <Avatar name={user.name || user.email} /> : <User />}
      </Box>
      {avatarEl.current && showDropMenu && (
        <Drop
          plain
          onClickOutside={() => setShowDropMenu(false)}
          onEsc={() => setShowDropMenu(false)}
          align={{ top: "bottom", right: "right" }}
          target={avatarEl.current}
          style={{ borderRadius: 8, marginTop: 24, boxShadow: "0px 8px 16px rgba(0,0,0,0.20)" }}
        >
          <Box width="small" background="white">
            {user && (
              <Box hoverIndicator="dark-4" pad="small" onClick={() => auth().signOut()}>
                <Text size="small" textAlign="end" children="Log out" />
              </Box>
            )}
            {!user && (
              <Box hoverIndicator="dark-4" pad="small" onClick={() => history.push("/login")}>
                <Text size="small" textAlign="end" children="Login or Register" />
              </Box>
            )}
          </Box>
        </Drop>
      )}
    </>
  );
});

export default TopMenu;
