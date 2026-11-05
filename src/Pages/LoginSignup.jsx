import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginSignup.css";

const API_BASE_URL = "http://localhost:8080/api";

function LoginSignup() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhoneChange(event) {
    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
    setMessage("");
  }

  async function readResponse(response) {
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Request failed (${response.status})`
      );
    }
    return data;
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setMessage("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await readResponse(response);
      setOtp("");
      setStep("otp");
      setMessage(data.message || "Demo OTP sent. Use 123456.");
    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage(error.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await readResponse(response);

      const loggedInUser = {
        id: data.id ?? data.userId,
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || phone,
        active: data.active ?? true,
      };

      if (!loggedInUser.id) {
        throw new Error("Backend did not return the customer ID.");
      }

      localStorage.setItem("dinoraUser", JSON.stringify(loggedInUser));
      localStorage.removeItem("dinoraDemoUser");
      localStorage.removeItem("dinoraDemoAddress");

      navigate("/allProducts");
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await readResponse(response);
      setOtp("");
      setMessage(data.message || "Demo OTP resent. Use 123456.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMessage(error.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setMessage("");
  }

  return (
    <main className="dianora-login-page">
      <section className="login-card">
        <Link to="/" className="login-brand">DIANORA</Link>
        <p className="login-eyebrow">YOUR SKINCARE JOURNEY</p>

        {step === "phone" && (
          <>
            <h1>Welcome Back</h1>
            <p className="login-description">
              Enter your mobile number to continue to your DIANORA account.
            </p>

            <form onSubmit={handleSendOtp}>
              <label htmlFor="phone" className="login-label">Mobile Number</label>
              <div className="login-phone-input">
                <span className="login-country-code">🇮🇳 +91</span>
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

              {message && <p className="login-message" role="alert">{message}</p>}

              <button
                type="submit"
                className="login-primary-button"
                disabled={loading}
              >
                {loading ? "PLEASE WAIT..." : "CONTINUE"}
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
              <label htmlFor="otp" className="login-label">Enter OTP</label>
              <input
                id="otp"
                className="login-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setMessage("");
                }}
                maxLength={6}
                required
              />

              {message && <p className="login-message" role="alert">{message}</p>}

              <button
                type="submit"
                className="login-primary-button"
                disabled={loading}
              >
                {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
              </button>
            </form>

            <div className="login-otp-actions">
              <button type="button" onClick={handleResendOtp} disabled={loading}>
                Resend OTP
              </button>
              <button type="button" onClick={handleChangeNumber} disabled={loading}>
                Change Number
              </button>
            </div>

            <p className="login-demo-note">
              Demo only: use <strong>123456</strong> to test. No SMS is sent.
            </p>
          </>
        )}

        <div className="login-footer">
          <span>Simple care. Everyday glow.</span>
        </div>
      </section>
    </main>
  );
}

export default LoginSignup;
