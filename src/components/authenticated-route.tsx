import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import AuthContext from "./auth-context";

const AuthenticatedRoute: React.FC<RouteProps> = ({ component: C, ...componentProps }) => {
  return (
    <AuthContext.Consumer>
      {({ authenticated }) =>
        authenticated ? (
          <Route component={C} {...componentProps} />
        ) : (
          <Route
            render={props => <Redirect to={`/login?redirect=${props.location.pathname}${props.location.search}`} />}
          />
        )
      }
    </AuthContext.Consumer>
  );
};

export default AuthenticatedRoute;
