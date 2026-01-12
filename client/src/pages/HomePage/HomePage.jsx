import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

// ייבוא הקומפוננטות
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';
import UserBanner from '../../components/Journal/UserBanner.jsx'; // הוספנו את הקומפוננטה החדשה

const Home = () => {
  const navigate = useNavigate();

  // --- State Definitions ---
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [child_name, setChildName] = useState("");
  
  // טעינת האווטאר (מספיק לעשות את זה כאן פשוט)
  const currentAvatar = localStorage.getItem('userAvatar') || 'dog.png';

  // --- Authentication Check ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // --- Data Fetching (Questions & Name) ---
  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
             // 1. Get Questions
            const qResponse = await axios.get('http://localhost:5000/api/auth/questions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(qResponse.data);

            // 2. Get Child Name
            const nResponse = await axios.get('http://localhost:5000/api/auth/getUserName', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (nResponse.data.child_name) {
                setChildName(nResponse.data.child_name);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    fetchData();
  }, []);


  // --- Save Logic (User's Robust Version) ---
  const handleSaveJournal = async () => {
    // הגנה: בדיקה אם ענו על שאלות
    if (Object.keys(answers).length === 0) {
        alert("אופס! לא ענית על אף שאלה עדיין.");
        return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!userId || !token) {
        alert("צריך להתחבר קודם");
        return;
      }
      
      // המרה למערך - קריטי לשרת שלנו!
      const answersArray = Object.values(answers).map(val => Number(val));
      
      const dataToSend = {
        child_id: userId,
        answers: answersArray
      };

      console.log("Sending to server:", dataToSend);

      await axios.post('http://localhost:5000/api/auth/answers', 
        dataToSend, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("היומן נשמר בהצלחה!");
      setAnswers({}); // איפוס
    } catch (error) {
      console.error("Save error:", error);
      alert("לא הצלחתי לשמור את היומן");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={styles.pageWrapper}>
    <div className={styles.home}>
      <div className={styles.pageContent}>
        
        {/*<h1 className={styles.headline}>The Guardian</h1>*/}
        
        <div className={styles.bannerContainer}>
        {/* כאן נכנס כל העיצוב שלך בצורה נקייה ומסודרת */}
        <UserBanner childName={child_name} currentAvatar={currentAvatar} />

        {/* כפתורים */}
        <div className={styles.controls}>
            <button onClick={handleSaveJournal} className={styles.saveButton}>שמור יומן</button>
            <button onClick={handleLogout} className={styles.logoutButton}>נתראה בפעם הבאה :)</button>
            </div>
        </div>

        {/* רשימת השאלות */}
        <div className={styles.cards}>
            <JournalQuestionList 
                questions={questions} 
                answers={answers} 
                onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value })) } 
            />
<<<<<<< HEAD
<<<<<<< HEAD
=======
            <FreeTextEntry freeText={freeText} setFreeText={setFreeText} childName={child_name}/>
>>>>>>> 4881700 (Added free text component to the HomePage.jsx)
=======
            <FreeTextEntry freeText={freeText} setFreeText={setFreeText} childName={child_name}/>
>>>>>>> 4881700 (Added free text component to the HomePage.jsx)
        </div>

        

      </div>
    </div>
    </div>
  );
};

export default Home;