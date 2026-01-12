import styles from '../../pages/HomePage/Home.module.css';

const formatHebrewDate = (date = new Date()) => {
  const hebrewDate = date.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${hebrewDate}`;
};

const user = { name: 'משתמש' }; // Placeholder for user name

const formattedDate = formatHebrewDate();
const JournalForm = () => {
  return (
    <div className="header-journal">
    <div className={styles.journalHeader}>
        <h2 className={styles.journalTitle}>היומן של {user.name}</h2>
        <span className={styles.journalDate}>{formattedDate}</span>
    </div>
</div>
  );
}

export default JournalForm;
