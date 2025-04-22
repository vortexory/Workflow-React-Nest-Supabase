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
      localStorage.setItem('check_email',email);
      navigate("/check");
    }
    if (error) setError(error.message);
    else setSuccess("Signup successful! Check your email for confirmation.");
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
        {/* Left Side */}
      <div className="p-8 bg-[#18181B] text-white flex flex-col">
        <div className="m-5 mb-8">
          <h1 className="text-2xl text-white font-semibold">⌘ WATTGEN</h1>
        </div>

        <div className="flex-grow flex flex-col justify-end">
          <h2 className="text-[#FF4D24] text-5xl font-bold mb-12">
            Automating Processes
          </h2>
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
