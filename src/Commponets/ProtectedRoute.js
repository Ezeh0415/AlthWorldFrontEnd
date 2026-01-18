import { Navigate } from "react-router-dom";
import ApiService from "./ApiService";

const ProtectedRoute = ({ children }) => {
  const apiServiceAuth = ApiService.isAuthenticated();

  if (!apiServiceAuth) {
    return <Navigate to="/login" replace />;
  }


  return children;
};

export default ProtectedRoute;
