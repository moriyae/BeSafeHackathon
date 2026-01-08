import styles from './Home.module.css';
<<<<<<< Updated upstream
import RandomDuck from '../../components/RandomDuck/RandomDuck.jsx';

=======
// import RandomDuck from '../../components/RandomDuck/RandomDuck.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import JournalForm from '../../components/Journal/JournalForm.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';
import { fetchDailyQuestions } from '../../services/journalApi.js';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      <h1 className={styles.headline}>Duck It</h1>
      <RandomDuck />
=======
      <h1 className={styles.headline}>The Guardian</h1>
      {/*linking to journal components*/}
      <JournalForm onLogout={handleLogout}/>
      {/* פה יבוא גוף היומן בהמשך */}

      <div className={styles.cards}>
      {/*linking to journal question list component*/}
      <JournalQuestionList questions={questions} answers={answers} onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value })) } />
      </div>

      <button onClick={handleLogout}>נתראה בפעם הבאה :)</button>
      <br />

      {/*יימחק בהמשך*/}
      <Link to="/login">מעבר להתחברות</Link>
      <br />
      <Link to="/register">הרשמה</Link>

>>>>>>> Stashed changes
    </div>
  );
};

export default Home;