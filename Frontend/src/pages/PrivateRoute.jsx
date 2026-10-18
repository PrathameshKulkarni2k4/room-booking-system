import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards a route. Pass role="user" or role="owner" to also require that role;
// omit it to require only that someone is signed in.
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = role === "owner" ? "/owner-login" : "/user-login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && currentRole !== role) {
    const home = currentRole === "owner" ? "/owner-profile" : "/rooms";
    return <Navigate to={home} replace />;
  }

  return children;
};

export default PrivateRoute;
