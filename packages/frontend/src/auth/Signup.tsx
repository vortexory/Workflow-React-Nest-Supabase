import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { signUp, signInWithGitHub } from "./supabase/authService";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { error } = await signUp(email, password);
    if (!error) {
      navigate("/login");
    }
    if (error) setError(error.message);
    else setSuccess("Signup successful! Check your email for confirmation.");
  };

  const handleGitHubSignup = async () => {
    const { error } = await signInWithGitHub();
    if (error) setError(error.message);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="py-[100px] px-[10%] bg-[#18181B] text-white flex justify-between flex-col">
        <h1 className="text-[30px] font-semibold mb-4">⌘ Acme Inc</h1>
        <div className="text-[20px]">
          <blockquote className="text-lg italic">
            “This library has saved me countless hours of work and helped me
            deliver stunning designs to my clients faster than ever before.”
          </blockquote>
          <p className="mt-4">Sofia Davis</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="flex justify-end mb-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
          <h2 className="text-[30px] font-bold mb-2">Create an account</h2>
          <p className="text-gray-500 mb-6 text-[20px]">
            Enter your email below to create your account
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSignUp} className="space-y-5">
            <Input
              type="email"
              placeholder="name@example.com"
              className="py-6 placeholder:text-[16px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              className="py-6 placeholder:text-[16px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="default"
              className="bg-[#18181B] py-2 h-full text-[20px] w-full"
            >
              Sign Up with Email
            </Button>
          </form>

          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-2 text-gray-400">OR CONTINUE WITH</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <Button
            variant="outline"
            onClick={handleGitHubSignup}
            className="w-full flex items-center h-full y-2 text-[20px] justify-center"
          >
            <span className="mr-2">
              <svg
                height="32"
                aria-hidden="true"
                viewBox="0 0 24 24"
                version="1.1"
                width="32"
                data-view-component="true"
                className="octicon octicon-mark-github v-align-middle"
              >
                <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"></path>
              </svg>
            </span>{" "}
            Github
          </Button>

          <p className="text-gray-500 text-sm mt-6">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
