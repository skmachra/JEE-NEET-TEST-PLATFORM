import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../components/Auth';

const AdminRoute = () => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || user?.isadmin === false) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminRoute;