import PropTypes from 'prop-types';
import styles from '../../pages/JournalPage/JournalPage.module.css';

const COLORS = [
  '#C7C9CC', // 1
  '#BFD7FF', // 2
  '#f3e6ab', // 3
  '#b3d9bd', // 4
  '#6ED3C2', // 5
  '#4FA3A5', // 6
  '#2F8F83', // 7
];

const CATEGORY_LABELS = {
  emotional: { low: 'מרגיש/ה רע מאוד', high: 'מרגיש/ה מעולה' },
  social: { low: 'בודד/ה מאוד', high: 'מוקף/ת בחברים' },
  school: { low: 'בכלל לא', high: 'במידה רבה מאוד' },
  safety: { low: 'לא בטוח/ה בכלל', high: 'בטוח/ה לגמרי' },
  default: { low: 'קשה מאוד', high: 'נהדר' },
};

const RatingScale = ({ value, onChange, min = 1, max = 7, category }) => {
  const numbers = Array.from(
    { length: max - min + 1 },
    (_, i) => min + i
  );

  const labels = CATEGORY_LABELS[category] || CATEGORY_LABELS.default;

  return (
    <div className={styles.ratingWrapper}>
    <div className={styles.ratingScale}>
      {numbers.map((num) => {
        const isActive = value === num;

        return (
          <button
            key={num}
            type="button"
            className={`${styles.ratingCircle} ${isActive ? styles.active : ''}`}
            style={{ backgroundColor: COLORS[num - 1] }}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        );
      })}
    </div>

    {/* labels מתחת לסקייל */}
    <div className={styles.ratingLabels}>
      <span>{labels.low}</span>
      <span>{labels.high}</span>
    </div>
  </div>
  );
};

RatingScale.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  category: PropTypes.oneOf(['emotional', 'social', 'school', 'safety']),
};

export default RatingScale;
