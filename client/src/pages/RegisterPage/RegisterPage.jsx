import { useNavigate } from 'react-router-dom'; 
import './RegisterPage.css';
import RegisterForm from '../../components/RegisterForm';
import CircleLogo from '../../components/CircleLogo.jsx';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate(); 

  const handleSuccess = (childEmail) => {
    // move childs name to navigate('/verify', { state: { childEmail } }); 
    //rn without verification
    navigate('/verify', { state: { childEmail } });
};

  return (
    <div className="pageWrapper">
    <div className="register-wrapper">
      <div className="register-container">
        <CircleLogo />
        <h1 className="brand-title">ברוכים הבאים לגרדיאן</h1>
        <p className="brand-subtitle">צרו חשבון כדי להתחיל</p>
              
        <RegisterForm onSuccess={handleSuccess} />

        <div className="form-footer">
          <Link to="/login" className="login-link"> כבר יש לך חשבון? התחבר </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RegisterPage;