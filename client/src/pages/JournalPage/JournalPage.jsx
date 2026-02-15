import styles from './Home.module.css';
import { useNavigate} from 'react-router-dom';
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import FreeTextEntry from '../../components/Journal/FreeTextEntry.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';
import UserBanner from '../../components/Journal/UserBanner.jsx'; // הוספנו את הקומפוננטה החדשה
import StickerBoard from '../../components/Stickers/stickerBoard.jsx';
// Import the API functions from your services
import { getUserName } from '../../api/authApi.js'; 
import { getQuestions, submitJournalEntry } from '../../services/journalApi.js';

const Home = () => {
  const navigate = useNavigate();
  const questionsRef = useRef(null);

  // State Definitions
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [child_name, setChildName] = useState("");
  const [freeText, setFreeText] = useState("");
  
  // Receiving updates from states
  const [lastMood, setLastMood] = useState(localStorage.getItem('lastMood') || "normal");

  // Loading avatar state
  const currentAvatar = localStorage.getItem('userAvatar') || 'dog.png';

  // Welcome message
  const getWelcomeMessage = () => {
    switch (lastMood) {
      case 'sad':
        return 'שמנו לב שבפעם הקודמת היה לך קצת קשה... איך את/ה מרגיש/ה עכשיו?';
      case 'happy':
        return 'איזה כיף לראות אותך! נראה שבפעם האחרונה היית במצב רוח מעולה!';
      case 'ok':
        return 'טוב לראות אותך שוב. איך עבר עליך היום?';
      default:
        return 'ברוך/ה הבא/ה ל-The Guardian!';
    }
  };
  
  // Authentication Check
  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            // 1. fetch questions using journalApi
            const questionsData = await getQuestions();
            setQuestions(questionsData);
  
            // 2. fetch user name and mood from DB
            const userData = await getUserName();
            
            if (userData) {
                setChildName(userData.child_name);
                
                // Update state and localStorage with data from DB
                const moodFromServer = userData.lastMood || "normal";
                setLastMood(moodFromServer);
                localStorage.setItem('lastMood', moodFromServer);
                
                console.log("Fetched from DB - Name:", userData.child_name, "Mood:", moodFromServer);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    fetchData();
    }, [navigate]);

  // Save Logic
  const handleSaveJournal = async () => {
    // Check if any answers or freeText provided
    const hasAnswers = Object.keys(answers).length > 0;
    const hasFreeText = freeText.trim().length > 0;
  
    if (!hasAnswers && !hasFreeText) {
        alert("אופס! לא ענית על אף שאלה ולא כתבת טקסט חופשי.");
        return;
    }
  
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("צריך להתחבר קודם");
        return;
      }
      
      // Prepare payload according to documentation
      const payload = {};
      
      if (hasAnswers) {
        payload.answers = Object.values(answers).map(val => Number(val));
      }
      
      if (hasFreeText) {
        payload.freeText = freeText;
      }
  
      // Use journalApi instead of axios directly
      await submitJournalEntry(payload);
      
      alert("היומן נשמר בהצלחה!");
      setAnswers({});
      setFreeText("");
    } catch (error) {
      console.error("Save error:", error);
      alert("לא הצלחתי לשמור את היומן");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={styles.pageWrapper}>
    <div className={styles.home}>
      <StickerBoard />
      <div className={styles.pageContent}>
        
        {/*<h1 className={styles.headline}>The Guardian</h1>*/}
        
        <div className={styles.bannerContainer}>
        <UserBanner childName={child_name} currentAvatar={currentAvatar} />
        <p className={styles.welcomeMessage}>
        {getWelcomeMessage()}
        </p>

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
        {/* buttons */}
        <div className={styles.controls}>
            <button onClick={handleSaveJournal} className={styles.saveButton}>שמור יומן</button>
            <button onClick={handleLogout} className={styles.logoutButton}>נתראה בפעם הבאה :)</button>
            </div>
      </div>      
      </div>
    </div>
  );
};

export default Home;
