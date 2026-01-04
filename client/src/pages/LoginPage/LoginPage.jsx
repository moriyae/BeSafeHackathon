import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          {/* כאן תוכלי להוסיף את תמונת גארדי בהמשך */}
          <h1 className="brand-title">Guardian</h1>
          <p className="brand-subtitle">רשומה? התחבר/י כעת</p>
        </div>
        
        <form className="login-form" id="loginForm">
          <div className="form-group">
            <label htmlFor="child_username" className="form-label">שם המשתמש/ת</label>
            <input 
              type="email" 
              id="child_username" 
              className="form-input" 
              placeholder="כתובת המייל"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">סיסמה</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="הסיסמה הסודית שלך"
              required 
            />
          </div>
          
          <button type="submit" className="submit-btn">כניסה</button>
        </form>
        
        <p className="signup-text">
          עוד לא נרשמת? <a href="/register" className="signup-link">הירשמ/י כאן</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;