import { FormEvent, useEffect, useMemo, useState } from "react";
import { Mail, MessageCircleMore, UserRound, X } from "lucide-react";
import { useCommerce } from "@/lib/commerce";

const whatsappSupportLink =
  "https://wa.me/919704668710?text=Hi%20iksha%20gifts%2C%20I%20need%20help%20with%20my%20account%20or%20order.";
const OTP_RETRY_STORAGE_PREFIX = "iksha-email-otp-retry-at:";

function getRetryKey(email: string) {
  return `${OTP_RETRY_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

function formatCooldown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes <= 0) return `${remainder}s`;
  return `${minutes}m ${remainder.toString().padStart(2, "0")}s`;
}

export function AuthModal() {
  const { authOpen, closeAuth, login, verifySignupOtp } = useCommerce();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  const normalizedEmail = email.trim().toLowerCase();
  const cooldownSeconds = useMemo(
    () => Math.max(0, Math.ceil((retryAt - now) / 1000)),
    [now, retryAt],
  );

  useEffect(() => {
    if (!normalizedEmail) {
      setRetryAt(0);
      return;
    }
    const savedRetryAt = Number(window.localStorage.getItem(getRetryKey(normalizedEmail)) || 0);
    setRetryAt(Number.isFinite(savedRetryAt) ? savedRetryAt : 0);
  }, [normalizedEmail]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const rememberRetryAt = (seconds: number) => {
    if (!normalizedEmail) return;
    const nextRetryAt = Date.now() + seconds * 1000;
    window.localStorage.setItem(getRetryKey(normalizedEmail), String(nextRetryAt));
    setRetryAt(nextRetryAt);
    setNow(Date.now());
  };

  if (!authOpen) return null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      if (!otpRequested) {
        if (cooldownSeconds > 0) {
          setError(`Please wait ${formatCooldown(cooldownSeconds)} before requesting another OTP.`);
          return;
        }
        const result = await login({
          email: normalizedEmail,
          firstName,
        });
        if (result?.pendingId) setPendingId(result.pendingId);
        rememberRetryAt(60);
        setOtpRequested(true);
        return;
      }

      const otp = String(form.get("otp") || "");
      if (!pendingId) throw new Error("Please request a new OTP first.");
      await verifySignupOtp({
        email: normalizedEmail,
        firstName,
        pendingId,
        otp,
      });
      setOtpRequested(false);
      setPendingId("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to continue.";
      if (/rate limit|429/i.test(message)) {
        rememberRetryAt(60);
        setError("Too many OTP emails were requested. Please wait 1 minute, then resend OTP.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2E2320]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#C6A769]/30 bg-[#F3E8E2] p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8B6F5A]">Email account</p>
            <h2 className="mt-1 font-display text-3xl text-[#2E2320]">
              {otpRequested ? "Verify Email OTP" : "Login or register"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#C6A769]/40 text-[#8B6F5A] transition-colors hover:text-[#2E2320]"
            aria-label="Close account dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[#2E2320]">
            First Name
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#C6A769]/45 bg-white/55 px-4 py-3">
              <UserRound size={18} className="text-[#8B6F5A]" />
              <input
                required
                readOnly={otpRequested}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full bg-transparent text-sm outline-none read-only:text-[#8B6F5A]"
                placeholder="Your first name"
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-[#2E2320]">
            Email Address
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#C6A769]/45 bg-white/55 px-4 py-3">
              <Mail size={18} className="text-[#8B6F5A]" />
              <input
                required
                readOnly={otpRequested}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full bg-transparent text-sm outline-none read-only:text-[#8B6F5A]"
                placeholder="you@example.com"
              />
            </div>
          </label>

          {otpRequested && (
            <>
              <p className="rounded-2xl bg-white/60 px-4 py-3 text-sm text-[#2E2320]">
                Enter the OTP sent to your email address (Check In Spam Mail).
              </p>
              <label className="block text-sm font-medium text-[#2E2320]">
                OTP Verification
                <input
                  required
                  name="otp"
                  inputMode="numeric"
                  maxLength={8}
                  className="mt-2 w-full rounded-2xl border border-[#C6A769]/45 bg-white/55 px-4 py-3 text-sm outline-none focus:border-[#8B6F5A]"
                  placeholder="Enter email OTP"
                />
              </label>
            </>
          )}

          {error && (
            <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {!otpRequested && cooldownSeconds > 0 && (
            <p className="rounded-2xl bg-white/60 px-4 py-3 text-sm text-[#2E2320]">
              You can request another OTP in {formatCooldown(cooldownSeconds)}.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (!otpRequested && cooldownSeconds > 0)}
            className="w-full rounded-full bg-[#2E2320] px-6 py-3 text-sm font-semibold text-[#F3E8E2] transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : otpRequested
                ? "Verify OTP"
                : cooldownSeconds > 0
                  ? `Wait ${formatCooldown(cooldownSeconds)}`
                  : "Send OTP"}
          </button>
        </form>

        <div className="mt-5">
          <a
            href={whatsappSupportLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#C6A769]/45 px-5 py-3 text-sm font-semibold text-[#2E2320] transition-colors hover:bg-white/50"
          >
            <MessageCircleMore size={16} className="text-[#8B6F5A]" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
