import React from 'react';
import { useNavigate } from 'react-router-dom';

// ייבוא התמונות כאן - כדי שה-Home יהיה נקי
import dogImg from '../../assets/dog.png';
import catImg from '../../assets/cat.png';
import lionImg from '../../assets/lion.png';
import bunnyImg from '../../assets/bunny.png';

const UserBanner = ({ childName, currentAvatar }) => {
    const navigate = useNavigate();

    const avatarMap = {
        'dog.png': dogImg,
        'cat.png': catImg,
        'lion.png': lionImg,
        'bunny.png': bunnyImg
    };

    // שליפת שם לתצוגה
    const displayName = childName || (localStorage.getItem('username') ? localStorage.getItem('username').split('@')[0] : 'חבר/ה');

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            marginTop: '10px',
            marginBottom: '20px',
            padding: '10px 25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            
            {/* צד ימין: תמונה ושם */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img 
                    src={avatarMap[currentAvatar] || dogImg} 
                    alt="Profile" 
                    style={{
                        width: '50px', height: '50px', 
                        borderRadius: '50%', 
                        border: '3px solid rgba(255,255,255,0.8)', 
                        objectFit: 'cover',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                />
                <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontFamily: 'Rubik, sans-serif', fontSize: '1.2rem', fontWeight: '700' }}>
                        היי, {displayName} 👋
                    </h3>
                </div>
            </div>
        
            {/* צד שמאל: כפתור החלפה */}
            <button 
                onClick={() => navigate('/profile')} 
                style={{
                    backgroundColor: 'rgba(255,255,255,0.7)', 
                    color: '#5d4037',            
                    gap: '5px',
                    border: '1px solid rgba(255,255,255, 0.9)', 
                    padding: '5px 12px',         
                    borderRadius: '20px', 
                    cursor: 'pointer', 
                    fontWeight: '500',
                    fontSize: '0.8rem',
                    fontFamily: 'Rubik, sans-serif',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                החלפ/י דמות
            </button>
        </div>
    );
};

export default UserBanner;