import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase/supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      setLoading(true);

      try {
        // Get current session
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          navigate("/login"); // Redirect to login on failure
          return;
        }

        console.log("Session Data CallBack:", data);
        
        if (data?.user) {
          navigate("/"); // Redirect to home/dashboard
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth State Changed:", event, session);
      if (session) {
        navigate("/");
      }
    });

    // Cleanup listener on unmount
    return () => {
      listener.subscription?.unsubscribe();
    };
  }, [navigate]);

  return <div>{loading ? "Loading..." : "Redirecting..."}</div>;
};

export default AuthCallback;
