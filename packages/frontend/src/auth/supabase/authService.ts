import { supabase } from "../supabase/supabaseClient"; // Adjust the path as needed

// Email & Password Signup
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

// Email & Password Signin
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in error:", error);
  }

  return { data, error };
};

// GitHub OAuth Login (Signup also works)
export const signInWithGitHub = async () => { 
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });

  return { data, error };
};

// Sign out
export const signOut = async () => {
  await supabase.auth.signOut();
};

// Get current user
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};
