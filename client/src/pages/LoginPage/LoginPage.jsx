import { useNavigate } from 'react-router-dom'; 
import LoginForm from '../../components/LoginForm'; 
import './LoginPage.css';
import CircleLogo from '../../components/CircleLogo.jsx';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // הפונקציה הזו תופעל מהפורם רק כשהלוגין יצליח
    navigate('/'); 
  };

  return (
    <div className="pageWrapper">
    <div className="login-wrapper">
      <div className="login-container">
        <CircleLogo />
        <div className="login-header">
          <h1 className="brand-title">Guardian</h1>
          <p className="brand-subtitle">ברוכים השבים! התחברו כדי להמשיך</p>
        </div>

        {/* אנחנו משתמשים בקומפוננטה המוכנה ומעבירים לה מה לעשות בהצלחה */}
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <p className="signup-text">
          עוד לא נרשמת? <a href="/register" className="signup-link">הירשמ/י כאן</a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;