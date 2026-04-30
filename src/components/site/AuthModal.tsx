import { FormEvent, useState } from "react";
import { MessageCircleMore, Smartphone, X } from "lucide-react";
import { useCommerce } from "@/lib/commerce";

const whatsappSupportLink =
  "https://wa.me/919704668710?text=Hi%20iksha%20gifts%2C%20I%20need%20help%20with%20my%20account%20or%20order.";

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
          name: String(form.get("name") || ""),
          phone: String(form.get("phone") || ""),
        });
        setOtpRequested(true);
        return;
      }

      if (isRegister && otpRequested) {
        await verifySignupOtp({
          otp: String(form.get("otp") || ""),
        });
        setOtpRequested(false);
        return;
      }

      if (!otpRequested) {
        const result = await login({
          phone: String(form.get("phone") || ""),
        });
        if (result?.otpRequested) {
          setOtpRequested(true);
        }
        return;
      }

      await login({
        phone: String(form.get("phone") || ""),
        otp: String(form.get("otp") || ""),
      });
      setOtpRequested(false);
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
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Mobile account</p>
            <h2 className="mt-1 font-display text-3xl text-foreground">
              {isRegister
                ? otpRequested
                  ? "Verify your mobile"
                  : "Create your account"
                : otpRequested
                  ? "Enter your OTP"
                  : "Track your orders"}
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
            <label className="block text-sm font-medium text-foreground">
              First Name
              <input
                required
                name="name"
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="Your first name"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-foreground">
            Mobile Number
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-background px-4 py-3">
              <Smartphone size={18} className="text-primary" />
              <input
                required
                name="phone"
                inputMode="tel"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </label>

          {otpRequested && (
            <>
              <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                Enter the OTP sent to your mobile number to continue.
              </p>
              <label className="block text-sm font-medium text-foreground">
                OTP Verification
                <input
                  required
                  name="otp"
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
                  ? "Verify Mobile OTP"
                  : "Send Mobile OTP"
                : otpRequested
                  ? "Log In with OTP"
                  : "Continue with Mobile"}
          </button>
        </form>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={switchMode}
            className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
          </button>

          <a
            href={whatsappSupportLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <MessageCircleMore size={16} className="text-primary" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

