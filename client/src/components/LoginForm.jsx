import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { isValidEmail } from "../utils/validation";

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
    };
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Child Email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            <button disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
            {localError && <div className="error">{localError}</div>}
            {error && <div className="error">{error}</div>}
        </form>
    );
}