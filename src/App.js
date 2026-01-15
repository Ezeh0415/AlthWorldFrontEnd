import "./App.css";
import { Routes, Route } from "react-router-dom";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import Dashboard from "./Pages/DashBoard";
import Wallet from "./Pages/Wallet";
import Investment from "./Pages/Investment";
import Transactions from "./Pages/Transactions";
import ProtectedRoute from "./Commponets/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        {/* sing in or login route  for user */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* dashboard route for user */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <ProtectedRoute>
              <Investment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
