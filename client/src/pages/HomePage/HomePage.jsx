import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import JournalForm from '../../components/Journal/JournalForm.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';

const Home = () => {
  const navigate = useNavigate();
//defining the state
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  //המשתנה שנשמור בו את מה שחוזר מהבק - צריך לעשות useEffect getChildName
  //getChildName will take it from http://localhost:5000/api/auth/getUserName
  //child name ready for Shoval <3
  const [child_name, setChildName] = useState("");

  //שומר הסף: בדיקה אם המשתמש מחובר
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // אם אין טוקן, "תעיף" אותו לדף הלוגין
      navigate('/login');
    }
  }, [navigate]);

  //updated shovi
  useEffect(() => {
  const getQuestions = async () => {
    try {
      // פנייה לראוט שבנינו בשרת
      const token = localStorage.getItem('token'); // שליפת הטוקן
        const response = await axios.get('http://localhost:5000/api/auth/questions', {
          headers: {
            Authorization: `Bearer ${token}` // הוספת הטוקן ל-Header
          }
        });
      
      // השרת מחזיר את המערך מה-Compass עם question_text ו-question_id
      setQuestions(response.data); // המידע מהדיבי נכנס ל-State
    } catch (error) {
      console.error("לא הצלחתי למשוך שאלות מהדיבי:", error);
    }
  };

  getQuestions();
}, []);

// 3. פונקציית שמירה
  const handleSaveJournal = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log("Data being sent:", { userId, answers });
      if (!userId  || !token) {
        alert("צריך להתחבר קודם");
        return;
      }
      // הפיכת אובייקט התשובות למערך של אובייקטים (לפי המבנה ב-Compass)
      const answersArray = Object.values(answers).map(val => Number(val));
      const dataToSend = {
      child_id: userId,
      answers: answersArray // עכשיו זה נראה ככה: [4, 3, 4, 3]
    };

      console.log("שולח נתונים לשרת:", dataToSend);

      // 3. התיקון הקריטי: שולחים את dataToSend עצמו
      await axios.post('http://localhost:5000/api/auth/answers', 
        dataToSend, // כאן הייתה השגיאה - שלחת משתנה שלא קיים
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      alert("היומן נשמר בהצלחה!");
    }catch (error) {
      console.error("שגיאה בשמירה:", error);
      alert("לא הצלחתי לשמור את היומן");
    }
  };
    const handleLogout = () => {
    {/* Perform any necessary logout operations here, such as clearing tokens or user data */}
    {/* ניקוי token (אם יש)*/}
    localStorage.removeItem('userId')
    localStorage.removeItem('token');
    navigate('/login');
  };
  useEffect(() => {
    const getChildName = async () => {
        try {
            const token = localStorage.getItem('token');
            // אם אין טוקן, אין טעם לנסות להביא שם
            if (!token) return; 

            // הפנייה לשרת - שימי לב לכתובת!
            const response = await axios.get('http://localhost:5000/api/auth/getUserName', {
                headers: {
                    Authorization: `Bearer ${token}` // שליחת הטוקן למידלוויר
                }
            });
            console.log("DEBUG Frontend: Data received from Server:", response.data);

            // השרת החזיר: { name: "דני" }
            // אנחנו שומרים את "דני" בתוך ה-State
            if (response.data.child_name) {
                setChildName(response.data.child_name);
                console.log("DEBUG Frontend: State updated with:", response.data.child_name);
            }

        } catch (error) {
            console.error("לא הצלחתי להביא את השם:", error);
        }
    };
    getChildName();
}, []);
  return (
    <div className={styles.home}>
      <div className={styles.pageContent}>
        {/*only for the check*/}
      <h1 className={styles.headline}>The Guardian {child_name}</h1>
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
        <button onClick={handleLogout} className={styles.logoutButton}>נתראה בפעם הבאה :)</button>
      </div>

      {/*navigation links for testing purposes*/}
      {/*<br /> */}
      {/* <Link to="/login">מעבר להתחברות</Link> */}
      {/* <br  */}
      {/* <Link to="/register">הרשמה</Link> */}
    </div>
    </div>
  );
};
  
export default Home;