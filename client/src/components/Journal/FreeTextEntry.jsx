import PropTypes from 'prop-types';
import styles from '../../pages/HomePage/Home.module.css';



const FreeTextEntry = ({ freeText, setFreeText, childName }) => {
  // שליפת שם לתצוגה
    const displayName = childName || (localStorage.getItem('username') ? localStorage.getItem('username').split('@')[0] : 'חבר/ה');
  return (
    <div className={styles.questionCard}>
      <h3>רשום איך אתה מרגיש היום:</h3>
      <textarea className={styles.freeTextArea} 
      value={freeText} 
      onChange={(e) => setFreeText(e.target.value)} 
      placeholder={`היי ${displayName}, זה המקום לכתוב את מה שאת/ה מרגיש/ה...`} rows={6} />
    {/*<div style={{ marginTop: '20px' }}>
      //<label htmlFor="freeText">רשום איך אתה מרגיש היום:</label>
      <textarea
        id="freeText"
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="כתוב כאן את מה שאתה מרגיש..."
        rows={5}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          marginTop: '5px',
        }}
      />
    </div>*/}

    
    </div>
  );
};

FreeTextEntry.propTypes = {
  freeText: PropTypes.string.isRequired,
  setFreeText: PropTypes.func.isRequired,
  childName: PropTypes.string
};

export default FreeTextEntry;
