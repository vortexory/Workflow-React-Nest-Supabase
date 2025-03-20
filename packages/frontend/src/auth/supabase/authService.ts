import { supabase } from "./supabaseClient";

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
  return { data, error };
};

// GitHub OAuth Login (also works for Signup)
export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
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
