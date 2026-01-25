import "./App.css";
import { Routes, Route } from "react-router-dom";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import Dashboard from "./Pages/DashBoard";
import Wallet from "./Pages/Wallet";
import Investment from "./Pages/Investment";
import Transactions from "./Pages/Transactions";
import ProtectedRoute from "./Commponets/ProtectedRoute";
import Deposit from "./Pages/Deposit";
import AdminSignUp from "./Pages/Admin/AdminSignUp";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminHomePage from "./Pages/Admin/AdminHomePage";
import AdminTransaction from "./Pages/Admin/AdminTransaction";
import Withdraw from "./Pages/Withdraw";
import AdminAddWallet from "./Pages/Admin/AdminAddWallet";

function App() {
  return (
    <>
      <Routes>
        {/* sing in or login route  for user */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* admin signin or login */}
        <Route path="/AdminSignUp" element={<AdminSignUp />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />

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

        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          }
        />

        {/* admin Routes */}
        <Route
          path="/adminHomePage"
          element={
            <ProtectedRoute>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminTransactions"
          element={
            <ProtectedRoute>
              <AdminTransaction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminAddWallet"
          element={
            <ProtectedRoute>
              <AdminAddWallet />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
