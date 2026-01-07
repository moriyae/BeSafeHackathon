import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import CircleLogo from '../../components/CircleLogo';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate('/');
  }
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <CircleLogo/>
        <div className="login-header">
          {/* כאן תוכלי להוסיף את תמונת גארדי בהמשך */}
          <h1 className="brand-title">Guardian</h1>
          <p className="brand-subtitle">רשומה? התחבר/י כעת</p>
        </div>
        
        <LoginForm onSuccess={handleSuccess} />
        
        <p className="signup-text">
          עוד לא נרשמת? <a href="/register" className="signup-link">הירשמ/י כאן</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;