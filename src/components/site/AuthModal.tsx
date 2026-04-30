import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useCommerce } from "@/lib/commerce";

export function AuthModal() {
  const { authOpen, authMode, closeAuth, login, requestSignupOtp, verifySignupOtp, openAuth } =
    useCommerce();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  if (!authOpen) return null;

  const isRegister = authMode === "register";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      if (isRegister && !otpRequested) {
        await requestSignupOtp({
          name: String(form.get("name")),
          email: String(form.get("email")),
          phone: String(form.get("phone")),
          password: String(form.get("password")),
        });
        setOtpRequested(true);
        return;
      }

      if (isRegister && otpRequested) {
        await verifySignupOtp({
          emailOtp: String(form.get("emailOtp")),
          phoneOtp: String(form.get("phoneOtp")),
        });
        setOtpRequested(false);
        return;
      }

      await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setOtpRequested(false);
    setError("");
    openAuth(isRegister ? "login" : "register");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Account</p>
            <h2 className="mt-1 font-display text-3xl text-foreground">
              {isRegister
                ? otpRequested
                  ? "Verify your details"
                  : "Create your account"
                : "Welcome back"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary"
            aria-label="Close account dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {isRegister && !otpRequested && (
            <>
              <label className="block text-sm font-medium text-foreground">
                Customer name
                <input
                  required
                  name="name"
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Your full name"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Phone
                <input
                  required
                  name="phone"
                  inputMode="tel"
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="+91 98765 43210"
                />
              </label>
            </>
          )}

          {!otpRequested && (
            <>
              <label className="block text-sm font-medium text-foreground">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Password
                <input
                  required
                  type="password"
                  name="password"
                  minLength={6}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Minimum 6 characters"
                />
              </label>
            </>
          )}

          {isRegister && otpRequested && (
            <>
              <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                We sent one OTP to your email and one OTP to your phone. Enter both to complete
                signup.
              </p>
              <label className="block text-sm font-medium text-foreground">
                Email OTP
                <input
                  required
                  name="emailOtp"
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="6-digit code"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Phone OTP
                <input
                  required
                  name="phoneOtp"
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="6-digit code"
                />
              </label>
            </>
          )}

          {error && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? otpRequested
                  ? "Verify and create account"
                  : "Send OTPs"
                : "Log in"}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-5 w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
