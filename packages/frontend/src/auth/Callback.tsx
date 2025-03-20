import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if a session exists
      const { data: { session }, error } = await supabase.auth.getSession();

      console.log('Session Data:', session);
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session?.user) {
        // If session exists and user is authenticated, redirect to the dashboard or another page
        navigate('/'); // Or wherever you'd like to redirect after login
      } else {
        // No session found, redirect to login page
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
