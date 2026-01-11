import PropTypes from 'prop-types';
import styles from '../../pages/HomePage/Home.module.css';

const COLORS = [
  '#C7C9CC', // 1
  '#BFD7FF', // 2
  '#FDF0B3', // 3
  '#C7F3D2', // 4
  '#6ED3C2', // 5
  '#4FA3A5', // 6
  '#2F8F83', // 7
];
const RatingScale = ({ value, onChange, min = 1, max = 7 }) => {
  const numbers = Array.from(
    { length: max - min + 1 },
    (_, i) => min + i
  );
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
      <span>קשה מאוד</span>
      <span>נהדר</span>
    </div>
  </div>
  );
};

RatingScale.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default RatingScale;
