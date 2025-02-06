import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../components/Auth';

const LoginRoute = () => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default LoginRoute;