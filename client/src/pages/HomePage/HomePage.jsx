import styles from './Home.module.css';
import { useNavigate} from 'react-router-dom';
import { useRef } from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import FreeTextEntry from '../../components/Journal/FreeTextEntry.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';
import UserBanner from '../../components/Journal/UserBanner.jsx';

const Home = () => {
  const navigate = useNavigate();

  // --- State Definitions ---
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [child_name, setChildName] = useState("");
  const [freeText, setFreeText] = useState("");
  
  // 🟢 State חדש למצב הרוח - מתעדכן מה-Database
  const [lastMood, setLastMood] = useState(localStorage.getItem('lastMood') || "normal");

  // טעינת האווטאר
  const currentAvatar = localStorage.getItem('userAvatar') || 'dog.png';

  // --- פונקציית הברכה האישית (משתמשת בסטייט המעודכן) ---
  const getWelcomeMessage = () => {
    const name = child_name || "חבר/ה";

    switch (lastMood) {
      case 'sad':
        return ` שמנו לב שבפעם הקודמת היה לך קצת קשה... איך את/ה מרגיש/ה עכשיו?`;
      case 'happy':
        return ` איזה כיף לראות אותך! נראה שבפעם האחרונה היית במצב רוח מעולה!`;
      case 'ok':
        return ` טוב לראות אותך שוב. איך עבר עליך היום?`;
      default:
        return ` ברוך/ה הבא/ה ל-The Guardian!`;
    }
  };

  // --- Authentication Check ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // --- Data Fetching (Questions & Name + Mood from DB) ---
  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // 1. שליפת שאלות
            const qResponse = await axios.get('http://localhost:5000/api/auth/questions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(qResponse.data);

            // 2. שליפת שם הילד ומצב הרוח האחרון ישירות מה-Database 🟢
            const nResponse = await axios.get('http://localhost:5000/api/auth/getUserName', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (nResponse.data) {
                setChildName(nResponse.data.child_name);
                
                // עדכון הסטייט וה-LocalStorage בנתון שהגיע מה-DB
                const moodFromServer = nResponse.data.lastMood || "normal";
                setLastMood(moodFromServer);
                localStorage.setItem('lastMood', moodFromServer);
                
                console.log("Fetched from DB - Name:", nResponse.data.child_name, "Mood:", moodFromServer);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    fetchData();
  }, []);

  // --- Save Logic ---
  const handleSaveJournal = async () => {
    // checking all questions answered
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
      
      const answersArray = Object.values(answers).map(val => Number(val));
      
      const dataToSend = {
        child_id: userId,
        answers: answersArray,
        freeText: freeText
      };

      await axios.post('http://localhost:5000/api/auth/answers', 
        dataToSend, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("היומן נשמר בהצלחה!");
      setAnswers({});
      setFreeText("");
    } catch (error) {
      console.error("Save error:", error);
      alert("לא הצלחתי לשמור את היומן");
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // מנקה הכל בצורה מסודרת
    navigate('/login');
  };

  return (
    <div className={styles.pageWrapper}>
    <div className={styles.home}>
      <div className={styles.pageContent}>
        
        {/*<h1 className={styles.headline}>The Guardian</h1>*/}
        
        <div className={styles.bannerContainer}>
        <UserBanner childName={child_name} currentAvatar={currentAvatar} />
        </div>

      {/* scroll to journal write */}
        <button className={styles.floatingButton}
        onClick={() =>
          questionsRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      >
         לכתיבה ביומן ↓
      </button>

        {/* list of questions */}
        <div className={styles.cards}>
            <JournalQuestionList 
                questions={questions} 
                answers={answers} 
                onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value })) } 
            />
            <div ref={questionsRef}>
            <FreeTextEntry freeText={freeText} setFreeText={setFreeText} childName={child_name} />
            </div>
          </div>

          <div className={styles.cards}>
              <JournalQuestionList 
                  questions={questions} 
                  answers={answers} 
                  onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value })) } 
              />
              <FreeTextEntry freeText={freeText} setFreeText={setFreeText} childName={child_name}/>
          </div>
        </div>
        {/* buttons */}
        <div className={styles.controls}>
            <button onClick={handleSaveJournal} className={styles.saveButton}>שמור יומן</button>
            <button onClick={handleLogout} className={styles.logoutButton}>נתראה בפעם הבאה :)</button>
            </div>

        

      </div>
    </div>
  );
};

export default Home;