import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { updateAvatar } from '../../api/authApi';

import dogImg from '../../assets/dog.png';
import catImg from '../../assets/cat.png';
import lionImg from '../../assets/lion.png';
import bunnyImg from '../../assets/bunny.png';

const ProfilePage = () => {
    const navigate = useNavigate();
    
    const avatarMap = {
        'dog.png': dogImg,
        'cat.png': catImg,
        'lion.png': lionImg,
        'bunny.png': bunnyImg
    };

    const avatars = Object.keys(avatarMap);
    const [selected, setSelected] = useState(localStorage.getItem('userAvatar') || 'dog.png');

    const handleSave = async () => {
        try {
            const userId = localStorage.getItem('userId');
            
            // use authApi instead of axios directly
            await updateAvatar({ 
                userId, 
                avatarName: selected 
            });
    
            localStorage.setItem('userAvatar', selected);
            
            alert("הדמות עודכנה בהצלחה! 🎉");
            navigate('/'); 
        } catch (e) {
            console.error(e);
            alert("שגיאה בשמירה, נסה שנית");
        }
    };

    return (
        <div className="pageWrapper">
        <div className="profile-container">
            <div className="profile-card">
                <h1 className="title">בחרי את הדמות האהובה עלייך</h1>
               
                
                <div className="avatars-grid">
                    {avatars.map(avName => (
                        <img 
                            key={avName} 
                            src={avatarMap[avName]} 
                            alt={avName}
                            className={`avatar-img ${selected === avName ? 'selected' : ''}`}
                            onClick={() => setSelected(avName)}
                        />
                    ))}
                </div>
                
                <button onClick={handleSave} className="save-btn">
                   שמירה וחזרה לדף הבית
                </button>
            </div>
        </div>
        </div>
    );
};

export default ProfilePage;