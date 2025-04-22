import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { supabase } from "./supabase/supabaseClient";

export default function CheckEmail() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const check_email = localStorage.getItem("check_email");

  const handleResendEmail = async () => {
    if (!check_email) {
      setMessage("No email found. Please sign up again.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: check_email,
    });

    if (error) {
      setMessage("Error resending email. Please try again.");
    } else {
      setMessage("Verification email resent successfully!");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center flex-1 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Check your email
        </h1>

        <p className="text-muted-foreground">
          We've sent you a verification email. Please check your inbox and
          follow the instructions to verify your account.
        </p>

        {message && <p className="text-sm text-green-600">{message}</p>}

        <div className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Return to login</Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={handleResendEmail}
              disabled={loading}
            >
              {loading ? "Resending..." : "Click here to resend"}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}