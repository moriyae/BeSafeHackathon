import { useState } from "react";
import {useRegister} from "../hooks/useRegister";
import { isValidEmail, isStrongPassword } from "../utils/validation";

export default function RegisterForm({onSuccess}) {
    const [childEmail, setChildEmail] = useState("");
    const [password, setPassword] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [localError, setLocalError] = useState(null);
    const {register, loading, error} = useRegister();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        if (!isValidEmail(childEmail)) {
            setLocalError("Invalid child email.");
            return;
        }
        if (!isStrongPassword(password)) {
            setLocalError("Password is not strong enough.");
            return;
        }
        if (!isValidEmail(parentEmail)) {
            setLocalError("Invalid parent email.");
            return;
        }

        const success = await register({childEmail, password, parentEmail});
        if (success) {
            onSuccess();
        }
        console.log("REGISTER DATA:", {childEmail, password, parentEmail});
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
            <input
                type="email"
                placeholder="Parent Email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                />
            <button disabled={loading}>
                {loading ? "Registering..." : "Register"}
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

