import styles from './Home.module.css';
const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    {/* Perform any necessary logout operations here, such as clearing tokens or user data */}
    {/* ניקוי token (אם יש)*/}
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  {/*for now in a comment - to check without the server*/}
  {/*const [questions, setQuestions] = useState([]);*/}

  {/*temporary hardcoded questions until backend is ready*/}
  const [questions, setQuestions] = useState([
  { id: 'emotion', text: 'איך הרגשת היום?' },
  { id: 'energy', text: 'עד כמה היום היה קל עבורך?' },
  { id: 'social', text: 'איך היה לך היום עם אחרים?' },
]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchDailyQuestions().then(setQuestions);
  }, []);

  return (
    <div className={styles.home}>
    </div>
  );
};

export default Home;