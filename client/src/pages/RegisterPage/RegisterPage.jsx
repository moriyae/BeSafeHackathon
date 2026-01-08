import { useNavigate } from 'react-router-dom'; 
import './RegisterPage.css';
import RegisterForm from '../../components/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate(); 

  const handleSuccess = (childEmail) => {
    // אנחנו מעבירים את המייל של הילד לדף ה-Verify כדי שהוא יופיע שם אוטומטית
    // navigate('/verify', { state: { childEmail } }); 
    //rn without verification
    navigate('/login', { state: { childEmail, message: "נרשמת בהצלחה! אפשר להתחבר" } });
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h1 className="brand-title">הצטרפות לגרדיאן</h1>
              
        {/* הפורם יקרא ל-handleSuccess עם המייל של הילד בסיום ההרשמה */}
        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;