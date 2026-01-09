import styles from './Home.module.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import JournalForm from '../../components/Journal/JournalForm.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';

const Home = () => {
  const navigate = useNavigate();
//defining the state
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); 

  //שומר הסף: בדיקה אם המשתמש מחובר
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // אם אין טוקן, "תעיף" אותו לדף הלוגין
      navigate('/login');
    }
  }, [navigate]);


  {/*for now in a comment - to check without the server*/}

//no need for the hardcoded questions - back is ready
//   {/*temporary hardcoded questions until backend is ready*/}
//   const [questions, setQuestions] = useState([
//   { id: 'emotion', text: 'איך הרגשת היום?' },
//   { id: 'energy', text: 'עד כמה היום היה קל עבורך?' },
//   { id: 'social', text: 'איך היה לך היום עם אחרים?' },
// ]);
  const handleLogout = () => {
    {/* Perform any necessary logout operations here, such as clearing tokens or user data */}
    {/* ניקוי token (אם יש)*/}
    localStorage.removeItem('token');
    navigate('/login');
  };

  //updated shovi
  useEffect(() => {
  const getQuestions = async () => {
    try {
      // פנייה לראוט שבנינו בשרת
      const response = await axios.get('http://localhost:5000/api/auth/questions');
      
      // השרת מחזיר את המערך מה-Compass עם question_text ו-question_id
      setQuestions(response.data); // המידע מהדיבי נכנס ל-State
    } catch (error) {
      console.error("לא הצלחתי למשוך שאלות מהדיבי:", error);
    }
  };

  getQuestions();
}, []);

// 3. פונקציית שמירה (זו הפונקציה שהייתה חסרה לך!)
  const handleSaveJournal = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert("צריך להתחבר קודם");
        return;
      }
      await axios.post('http://localhost:5000/api/auth/answers', {
        userId,
        answers 
      });
      alert("היומן נשמר בהצלחה!");
    } catch (error) {
      console.error("שגיאה בשמירה:", error);
      alert("לא הצלחתי לשמור את היומן");
    }
  };

  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>The Guardian</h1>
      {/*linking to journal components*/}
      <JournalForm onLogout={handleLogout}/>
      {/* פה יבוא גוף היומן בהמשך */}

      <div className={styles.cards}>
      {/*linking to journal question list component*/}
      <JournalQuestionList questions={questions} answers={answers} onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value })) } />
      </div>
      {/* כל הכפתורים חייבים להיות בתוך ה-div הראשי */}
      <div className={styles.controls}>
        <button onClick={handleSaveJournal} className={styles.saveButton}>שמור יומן</button>
        <button onClick={handleLogout}>נתראה בפעם הבאה :)</button>
      </div>
      <br />
      <Link to="/login">מעבר להתחברות</Link>
      <br />
      <Link to="/register">הרשמה</Link>
    </div>
  );
};
export default Home;