import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { isValidEmail, isStrongPassword } from "../utils/validation";

export default function RegisterForm({ onSuccess }) {
    
    const [childEmail, setChildEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [localError, setLocalError] = useState(null);
    const { register, loading, error } = useRegister();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        // Validations for child email, password, and parent email
        if (!isValidEmail(childEmail)) {
            setLocalError("המייל של הילד לא תקין.");
            return;
        }
        if (!isStrongPassword(password)) {
            setLocalError("הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר.");
            return;
        }
        if (!isValidEmail(parentEmail)) {
            setLocalError("המייל של הורה לא תקין.");
            return;
        }

        const success = await register({ childEmail, password, parentEmail });
        
        if (success) {
            onSuccess(childEmail);         }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <input
                type="email"
                className="form-input"
                placeholder="ChildEmail@example.com"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
            />
            <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="email"
                className="form-input"
                placeholder="ParentEmail@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
            />
            <button className="submit-btn" disabled={loading}>
                {loading ? "Registering..." : "הרשמה"}
            </button>
            {localError && <div className="error">{localError}</div>}   
            {error && <div className="error">{error}</div>}
        </form>
    );
}

import PropTypes from "prop-types";

RegisterForm.propTypes = {
    onSuccess: PropTypes.func.isRequired,
};