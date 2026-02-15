import styles from './JournalPage.module.css'; // using modules
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import FreeTextEntry from '../../components/Journal/FreeTextEntry.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';
import UserBanner from '../../components/Journal/UserBanner.jsx';
import StickerBoard from '../../components/Stickers/stickerBoard.jsx';
import { getUserName } from '../../api/authApi.js'; 
import { getQuestions, submitJournalEntry } from '../../services/journalApi.js';

const JournalPage = () => {
  const navigate = useNavigate();
  const questionsRef = useRef(null);

  // State Definitions
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [child_name, setChildName] = useState("");
  const [freeText, setFreeText] = useState("");
  const [lastMood, setLastMood] = useState(localStorage.getItem('lastMood') || "normal");

  const currentAvatar = localStorage.getItem('userAvatar') || 'dog.png';

  const getWelcomeMessage = () => {
    switch (lastMood) {
      case 'sad': return 'שמנו לב שבפעם הקודמת היה לך קצת קשה... איך את/ה מרגיש/ה עכשיו?';
      case 'happy': return 'איזה כיף לראות אותך! נראה שבפעם האחרונה היית במצב רוח מעולה!';
      case 'ok': return 'טוב לראות אותך שוב. איך עבר עליך היום?';
      default: return 'ברוך/ה הבא/ה ל-The Guardian!';
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const questionsData = await getQuestions();
            setQuestions(questionsData);
  
            const userData = await getUserName();
            if (userData) {
                setChildName(userData.child_name);
                const moodFromServer = userData.lastMood || "normal";
                setLastMood(moodFromServer);
                localStorage.setItem('lastMood', moodFromServer);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };
    fetchData();
  }, [navigate]);

  const handleSaveJournal = async () => {
    const hasAnswers = Object.keys(answers).length > 0;
    const hasFreeText = freeText.trim().length > 0;
  
    if (!hasAnswers && !hasFreeText) {
        alert("אופס! לא ענית על אף שאלה ולא כתבת טקסט חופשי.");
        return;
    }
  
    try {
      const payload = {
        ...(hasAnswers && { answers: Object.values(answers).map(val => Number(val)) }),
        ...(hasFreeText && { freeText })
      };
  
      await submitJournalEntry(payload);
      alert("היומן נשמר בהצלחה!");
      setAnswers({});
      setFreeText("");
    } catch (saveError) { 
      console.error("Save error:", saveError);
      alert("לא הצלחתי לשמור את היומן");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (questions.length === 0 && !child_name) {
    return (
      <div className={styles.loadingContainer}>
        <h2>טוען נתונים...</h2>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.home}>
        <StickerBoard />
        <div className={styles.pageContent}>
          
          <div className={styles.bannerContainer}>
            <UserBanner childName={child_name} currentAvatar={currentAvatar} />
            <p className={styles.welcomeMessage}>
              {getWelcomeMessage()}
            </p>
          </div>

          <button 
            className={styles.floatingButton}
            onClick={() => questionsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            לכתיבה ביומן ↓
          </button>

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

          <div className={styles.controls}>
            <button onClick={handleSaveJournal} className={styles.saveButton}>שמור יומן</button>
            <button onClick={handleLogout} className={styles.logoutButton}>נתראה בפעם הבאה :)</button>
          </div>
        </div>      
      </div>
    </div>
  );
};

export default JournalPage;