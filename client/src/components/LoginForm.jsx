import { useState } from "react";
import axios from 'axios'; // --- הוספה: חובה לייבא את אקסיוס ---
import { isValidEmail } from "../utils/validation";
import PropTypes from "prop-types";

export default function LoginForm({ onSuccess }) {
    const [childEmail, setChildEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState(null);
    const [loading, setLoading] = useState(false); // הוספנו סטייט לטעינה באופן ידני

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        
        if (!isValidEmail(childEmail)) {
            setLocalError("המייל של הילד לא תקין.");
            return;
        }

        

        setLoading(true);

        try {
            // --- חיבור ישיר לשרת כדי לוודא שמירת נתונים ---
            const res = await axios.post('http://localhost:5000/api/auth/login', { 
                child_email: childEmail, // שימי לב שהשרת מצפה ל-child_email
                password 
            });

            const data = res.data;
            console.log("LOGIN SUCCESS, DATA:", data);

            // --- שמירת הנתונים הקריטיים ---
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);
            localStorage.setItem('userAvatar', data.avatar); // הכלב או תמונה אחרת

            // סיום
            setLoading(false);
            if (onSuccess) {
                onSuccess();
            }

        } catch (err) {
            console.error(err);
            setLoading(false);
            setLocalError(err.response?.data?.message || "שגיאה בהתחברות");
        }
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
            
            {localError && <div className="error">{localError}</div>}
            
            <button className="submit-btn" disabled={loading}>
                {loading ? "מתחבר..." : "התחברות"}
            </button>
        </form>
    );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};