import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { isValidEmail } from "../utils/validation";
import PropTypes from "prop-types";


export default function LoginForm({ onSuccess }) {
    const [childEmail, setChildEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState(null);
    const { login, loading, error } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        if (!isValidEmail(childEmail)) {
            setLocalError("Invalid child email.");
            return;
        }
        const success = await login({childEmail, password});
        if (success) {
            onSuccess();
        }
        console.log("LOGIN DATA:", {childEmail, password});
    };
    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
            <label className="form-label">המייל שלך</label>
            <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                required
            />
            </div>  
            <div className="form-group">
            <label className="form-label">סיסמה</label>
            <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {(localError || error) && (
        <div className="error">{localError || error}</div>)}
            <button className="submit-btn" disabled={loading}>
                {loading ? "מתחבר..." : "התחברות"}
            </button>
            {localError && <div className="error">{localError}</div>}
            {error && <div className="error">{error}</div>}
        </form>
    );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};
