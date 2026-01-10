import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import JournalForm from '../../components/Journal/JournalForm.jsx';
import JournalQuestionList from '../../components/Journal/JournalQuestionList.jsx';

// --- ייבוא התמונות ---
import dogImg from '../../assets/dog.png';
import catImg from '../../assets/cat.png';
import lionImg from '../../assets/lion.png';
import bunnyImg from '../../assets/bunny.png';

const Home = () => {
  const navigate = useNavigate();

  // המילון שמחבר בין השמות לתמונות
  const avatarMap = {
      'dog.png': dogImg,
      'cat.png': catImg,
      'lion.png': lionImg,
      'bunny.png': bunnyImg
  };

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); 

  // שליפת השם מהזיכרון
  const [displayName] = useState(() => {
      const stored = localStorage.getItem('username');
      return stored ? stored.split('@')[0] : 'חבר/ה';
  });

  // שליפת התמונה מהזיכרון
  const [currentAvatar] = useState(() => {
      return localStorage.getItem('userAvatar') || 'dog.png';
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) { 
        navigate('/login'); 
        return; 
    }

    const getQuestions = async () => {
        try { 
            const response = await axios.get('http://localhost:5000/api/auth/questions'); 
            setQuestions(response.data); 
        } 
        catch (error) { 
            console.error(error); 
        }
    };
    getQuestions();
  }, [navigate]);

  const handleSaveJournal = async () => {
      try {
          const userId = localStorage.getItem('userId');
          if (!userId) { alert("שגיאה: משתמש לא מזוהה"); return; }
          
          await axios.post('http://localhost:5000/api/auth/journal', {
            userId,
            answers
          });
          alert("היומן נשמר בהצלחה!");
          setAnswers({});
      } catch (error) {
          console.error(error);
          alert("שגיאה בשמירת היומן");
      }
  };

  return (
    <div className={styles.home}>
      
      {/* --- באנר עליון חדש: אפקט זכוכית (Glassmorphism) --- */}
      <div style={{
                background: 'rgba(255, 255, 255, 0.4)', // רקע לבן חצי שקוף
                backdropFilter: 'blur(10px)',            // אפקט הטשטוש
                borderRadius: '30px',                    // פינות עגולות
                margin: '20px 20px 0 20px',              // ריווח מהצדדים (מרחף)
                padding: '10px 25px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.5)', // מסגרת עדינה
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'      // צל עדין
            }}>
                
                {/* צד ימין: תמונה ושם */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img 
                        src={avatarMap[currentAvatar] || dogImg} 
                        alt="Profile" 
                        style={{
                            width: '60px', height: '60px', 
                            borderRadius: '50%', 
                            border: '3px solid rgba(255,255,255,0.8)', 
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    <div>
                        <h3 style={{ 
                            margin: 0, 
                            color: '#ffffff', // חום כהה עדין
                            fontFamily: 'Rubik, sans-serif',
                            fontSize: '1.5rem', 
                            fontWeight: '700'
                        }}>
                            היי, {displayName} 👋
                        </h3>
                    </div>
                </div>
            
            {/* צד שמאל: כפתור קטן ועדין */}
            <button 
                onClick={() => navigate('/profile')} 
                style={{
                    backgroundColor: 'rgba(255,255,255,0.7)', 
                    color: '#5d4037',            
                    border: '1px solid rgba(255,255,255, 0.9)', 
                    padding: '6px 16px',         
                    borderRadius: '20px', 
                    cursor: 'pointer', 
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    fontFamily: 'Rubik, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)'}
            >
                    החלפ/י דמות             </button>
      </div>    
      {/* --- סוף הבאנר העליון --- */}

      <div className={styles.mainContainer}>
          <h1 className={styles.headline}>The Guardian</h1>
          
          <div className={styles.cards}>
             <JournalQuestionList 
                questions={questions} 
                answers={answers} 
                onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value })) } 
             />
          </div>
          
          <div className={styles.controls}>
             <button onClick={handleSaveJournal} className={styles.saveButton}>שמור יומן</button>
          </div>
      </div>
    </div>
  );
};

export default Home;