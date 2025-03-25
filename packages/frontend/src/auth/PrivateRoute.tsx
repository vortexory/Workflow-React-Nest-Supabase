import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

export const PrivateRoute = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <p>Loading...</p>; // ✅ Prevents premature redirect
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};
