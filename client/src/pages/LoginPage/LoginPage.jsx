import { useNavigate } from 'react-router-dom'; 
import LoginForm from '../../components/LoginForm'; 
import './LoginPage.css';

const LoginPage = () => {

   const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // הפונקציה הזו תופעל מהפורם רק כשהלוגין יצליח
    navigate('/dashboard'); 
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          {/* כאן תוכלי להוסיף את תמונת גארדי בהמשך */}
          <h1 className="brand-title">Guardian</h1>
          <p className="brand-subtitle">רשומה? התחבר/י כעת</p>
        </div>
        
        {/* אנחנו משתמשים בקומפוננטה המוכנה ומעבירים לה מה לעשות בהצלחה */}
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <p className="signup-text">
          עוד לא נרשמת? <a href="/register" className="signup-link">הירשמ/י כאן</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;