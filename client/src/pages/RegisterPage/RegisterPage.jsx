import { useNavigate, Link } from 'react-router'; 
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate(); 

  const handleRegister = (e) => {
    e.preventDefault(); 
    
    // שליחת נתונים לשרת כשיהיה לי את המידע עליו
    
    
    navigate('/verify'); 
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h1 className="brand-title">הצטרפות לגרדיאן</h1>
        
        
        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">כתובת המייל שלך</label>
            <input type="text" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">כתובת מייל הורה/מורה</label>
            <input type="email" className="form-input" required />
          </div>
          
          <div className="form-group">
           <label htmlFor="password" className="form-label">סיסמא</label>
           <input 
           type="password" 
           id="password" 
           className="form-input" 
          required 
    />
  </div>

  
  
          <button type="submit" className="submit-btn">צור חשבון</button>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;