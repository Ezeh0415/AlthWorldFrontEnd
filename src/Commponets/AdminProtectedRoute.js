import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("AdminToken");
  const isAdmin = localStorage.getItem("isAdmin");

  if (!isAuthenticated) {
    return <Navigate to="/AdminLogin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/AdminLogin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
