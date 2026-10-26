
import { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginSignup.css";

function LoginSignup() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  function handlePhoneChange(event) {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setPhone(value);
    setMessage("");
  }

  function handleSendOtp(event) {
    event.preventDefault();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Demo only. Connect an SMS OTP service for real login.
    setStep("otp");
    setOtp("");
    setMessage("Demo mode: Enter 123456 to test the login flow.");
  }

  function handleVerifyOtp(event) {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    // Demo OTP only. This does not authenticate a real user.
    if (otp !== "123456") {
      setMessage("Incorrect OTP. Please try again.");
      return;
    }

    setIsVerified(true);
    setStep("success");
    setMessage("");
  }

  function handleResendOtp() {
    setOtp("");
    setMessage("Demo mode: Your test OTP is 123456.");
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setMessage("");
    setIsVerified(false);
  }

  return (
    <main className="dianora-login-page">
      <section className="login-card">
        <Link to="/" className="login-brand">
          DIANORA
        </Link>

        <p className="login-eyebrow">
          YOUR SKINCARE JOURNEY
        </p>

        {step === "phone" && (
          <>
            <h1>Welcome Back</h1>

            <p className="login-description">
              Enter your mobile number to continue to your
              DIANORA account.
            </p>

            <form onSubmit={handleSendOtp}>
              <label
                htmlFor="phone"
                className="login-label"
              >
                Mobile Number
              </label>

              <div className="login-phone-input">
                <span className="login-country-code">
                  🇮🇳 +91
                </span>

                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  required
                />
              </div>

              {message && (
                <p className="login-message" role="alert">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="login-primary-button"
              >
                CONTINUE
              </button>
            </form>

            <p className="login-terms">
              By continuing, you agree to our{" "}
              <Link to="/aboutUs">Terms and Policies</Link>.
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <h1>Verify Your Number</h1>

            <p className="login-description">
              Enter the 6-digit verification code for
              <strong> +91 {phone}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp}>
              <label
                htmlFor="otp"
                className="login-label"
              >
                Enter OTP
              </label>

              <input
                id="otp"
                className="login-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => {
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  );
                  setMessage("");
                }}
                maxLength={6}
                required
              />

              {message && (
                <p className="login-message" role="status">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="login-primary-button"
              >
                VERIFY &amp; CONTINUE
              </button>
            </form>

            <div className="login-otp-actions">
              <button type="button" onClick={handleResendOtp}>
                Resend OTP
              </button>

              <button type="button" onClick={handleChangeNumber}>
                Change Number
              </button>
            </div>

            <p className="login-demo-note">
              Demo only: use <strong>123456</strong> to test.
              No SMS is sent.
            </p>
          </>
        )}

        {step === "success" && isVerified && (
          <div className="login-success">
            <div className="login-success-icon">✓</div>

            <h1>You're In!</h1>

            <p className="login-description">
              Demo verification successful for +91 {phone}.
            </p>

            <Link
              to="/allProducts"
              className="login-primary-button login-shop-link"
            >
              EXPLORE PRODUCTS
            </Link>

            <button
              type="button"
              className="login-change-account"
              onClick={handleChangeNumber}
            >
              Use another number
            </button>
          </div>
        )}

        <div className="login-footer">
          <span>Simple care. Everyday glow.</span>
        </div>
      </section>
    </main>
  );
}

export default LoginSignup;
