import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerify } from '../../hooks/useVerify'; 
import './VerificationPage.css';

const VerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const { verify, loading, error } = useVerify();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. שינוי מ-username ל-childEmail כדי למשוך את הנתון הנכון מה-state
  const childEmail = location.state?.childEmail || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    //בדיקה, למחוק אחר כך
    console.log("SENDING TO SERVER:", { 
        username: childEmail, 
        verificationCode 
    });
    
    // 2. שליחת המפתח הנכון ל-Hook
    const success = await verify({ 
      username: childEmail, 
      verificationCode 
    });

    if (success) {
      alert('החשבון אומת! ניתן להתחבר כעת');
      navigate('/login');
    }
  };

  return (
    <div className="pageWrapper">
    <div className="verification-wrapper">
      <div className="verification-container">
        <h1 className="brand-title">אימות חשבון</h1>
        
        {childEmail ? (
          <p className="brand-subtitle">
            הזן את הקוד שנשלח למייל של ההורה עבור המשתמש: <b>{childEmail}</b>
          </p>
        ) : (
          <p className="brand-subtitle">אנא הזן את קוד האימות שנשלח להוריך</p>
        )}

        <form className="verification-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="קוד בן 6 ספרות"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'מאמת...' : 'אמת חשבון'}
          </button>
        </form>

        {/* הצגת שגיאת Axios המפורטת (כמו "קוד שגוי") שסידרנו ב-Hook */}
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        
        <p className="signup-text">
          לא קיבלת קוד? <button onClick={() => window.location.reload()} className="resend-link">שלח שוב</button>
        </p>
      </div>
    </div>
    </div>
  );
};

export default VerificationPage;