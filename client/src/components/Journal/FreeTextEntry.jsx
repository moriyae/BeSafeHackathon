import PropTypes from 'prop-types';
import styles from '../../pages/JournalPage/JournalPage.module.css';



const FreeTextEntry = ({ freeText, setFreeText, childName }) => {
  // Pull display name from childName prop or localStorage
    const displayName = childName || (localStorage.getItem('username') ? localStorage.getItem('username').split('@')[0] : 'חבר/ה');
  return (
    <div className={styles.questionCard}>
      <h3>רשום איך אתה מרגיש היום:</h3>
      <textarea className={styles.freeTextArea} 
      value={freeText} 
      onChange={(e) => setFreeText(e.target.value)} 
      placeholder={`היי ${displayName}, זה המקום לכתוב את מה שאת/ה מרגיש/ה...`} rows={6} />

    
    </div>
  );
};

FreeTextEntry.propTypes = {
  freeText: PropTypes.string.isRequired,
  setFreeText: PropTypes.func.isRequired,
  childName: PropTypes.string
};

export default FreeTextEntry;
