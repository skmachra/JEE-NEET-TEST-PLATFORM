import { Navigate } from "react-router-dom";
import { useAuth } from "./components/Auth";

const ProtectedRoute = ({ children }) => {
  const { user, isLoggedIn, setIsLoggedIn } = useAuth();
    console.log(user)

  return children;
};

export default ProtectedRoute;
