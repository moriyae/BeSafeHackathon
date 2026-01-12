import { useNavigate } from 'react-router-dom';

import dogImg from '../../assets/dog.png';
import catImg from '../../assets/cat.png';
import lionImg from '../../assets/lion.png';
import bunnyImg from '../../assets/bunny.png';
import PropTypes from 'prop-types';
import styles from '../../pages/HomePage/Home.module.css';

const UserBanner = ({ childName, currentAvatar, welcomeMessage }) => {
    const navigate = useNavigate();

    const avatarMap = {
        'dog.png': dogImg,
        'cat.png': catImg,
        'lion.png': lionImg,
        'bunny.png': bunnyImg
    };

    // pull display name from childName prop or localStorage
    const displayName = childName || (localStorage.getItem('username') ? localStorage.getItem('username').split('@')[0] : 'חבר/ה');

   const formatHebrewDate = (date = new Date()) => {
  const hebrewDate = date.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${hebrewDate}`;
};
const formattedDate = formatHebrewDate();

return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            marginTop: '10px',
            marginBottom: '20px',
            padding: '15px 25px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box',
            direction: 'rtl' 
        }}>
            
            {/* שורה עליונה: תמונה + שם (ימין) ותאריך (שמאל) */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%' 
            }}>
                
                {/* צד ימין: אווטאר מוגדל ושם הילד */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img 
                        src={avatarMap[currentAvatar] || dogImg} 
                        alt="Profile" 
                        style={{
                            width: '75px', height: '75px', // 🟢 הגדלנו מ-50px ל-75px
                            borderRadius: '50%', 
                            border: '3px solid rgba(255,255,255,0.8)', 
                            objectFit: 'cover',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    />
                    <h3 style={{ 
                        margin: 0, 
                        color: '#377a5c', 
                        fontFamily: 'Rubik, sans-serif', 
                        fontSize: '1.3rem', // 🟢 הגדלנו מעט גם את גופן השם שיתאים לאייקון
                        fontWeight: '700' 
                    }}>
                        היי, {displayName} 👋
                    </h3>
                </div>

                {/* צד שמאל: התאריך */}
                <span className={styles.journalDate} style={{ color: '#377a5c', opacity: 0.8, fontWeight: '500' }}>
                    {formattedDate}
                </span>
            </div>

            {/* שורה אמצעית: הודעת ברכה - מיושרת לימין בהמשך לשם */}
            <div style={{ textAlign: 'right', width: '100%', paddingRight: '95px' }}> {/* 🟢 paddingRight מוודא שזה מתחיל מתחת לשם ולא מתחת לתמונה */}
                <span className={styles.personalGreeting} style={{ display: 'block' }}>
                    {welcomeMessage}
                </span>
            </div>

            {/* שורה תחתונה: כפתור החלפת דמות מיושר לשמאל */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                width: '100%' 
            }}>
                <button 
                    onClick={() => navigate('/profile')} 
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.7)', 
                        color: '#377a5c',            
                        border: '1px solid rgba(255,255,255, 0.9)', 
                        padding: '8px 18px',         
                        borderRadius: '20px', 
                        cursor: 'pointer', 
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        fontFamily: 'Segoe UI, sans-serif',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.7)'}
                >
                    החלפ/י דמות
                </button>
            </div>
        </div>
    );
};

UserBanner.propTypes = {
    childName: PropTypes.string,
    currentAvatar: PropTypes.string,
};
export default UserBanner;