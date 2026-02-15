import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../../pages/JournalPage/JournalPage.module.css';

// Import assets
import dogImg from '../../assets/dog.png';
import catImg from '../../assets/cat.png';
import lionImg from '../../assets/lion.png';
import bunnyImg from '../../assets/bunny.png';

const avatarMap = {
    'dog.png': dogImg,
    'cat.png': catImg,
    'lion.png': lionImg,
    'bunny.png': bunnyImg
};

const formatHebrewDate = (date = new Date()) => {
    const hebrewDate = date.toLocaleDateString('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return `${hebrewDate}`;
};

const UserBanner = ({ childName, currentAvatar, welcomeMessage }) => {
    const navigate = useNavigate();
    const formattedDate = formatHebrewDate();
    
    // Pull display name from childName prop or localStorage
    const displayName = childName || (localStorage.getItem('username') ? localStorage.getItem('username').split('@')[0] : 'חבר/ה');
    
    return (
        <div className={styles.bannerWrapper}>
            {/* Top Row: Avatar + name and date */}
            <div className={styles.bannerTopRow}>
                
                <div className={styles.userInfoGroup}>
                    <img 
                        src={avatarMap[currentAvatar] || dogImg} 
                        alt="Profile" 
                        className={styles.avatarImage}
                    />
                    <h3 className={styles.userNameHeader}>
                        היי, {displayName} 👋
                    </h3>
                </div>

                {/* Left side: Date */}
                <span className={styles.journalDate}>
                    {formattedDate}
                </span>
            </div>

            {/* Middle Row: Greeting message aligned under the name */}
            <div className={styles.greetingContainer}>
                <span className={styles.personalGreeting}>
                    {welcomeMessage}
                </span>
            </div>

            {/* Bottom Row: Button aligned to the left */}
            <div className={styles.actionButtonContainer}>
                <button 
                    onClick={() => navigate('/profile')} 
                    className={styles.changeAvatarButton}
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
    welcomeMessage: PropTypes.string,
};

export default UserBanner;