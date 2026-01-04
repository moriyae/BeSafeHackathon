import { useNavigate} from 'react-router'; 
import './RegisterPage.css';
import RegisterForm from '../../components/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate(); 

  const handleSuccess = () => {
    // שליחת נתונים לשרת כשיהיה לי את המידע עליו
    navigate('/verify'); 
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h1 className="brand-title">הצטרפות לגרדיאן</h1>
              
        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
export default RegisterPage;