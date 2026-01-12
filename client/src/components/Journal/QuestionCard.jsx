import RatingScale from '../Journal/RatingScale.jsx';
import PropTypes from 'prop-types';
import styles from '../../pages/HomePage/Home.module.css';

const QuestionCard = ({ question, value, onChange, category }) => {
    return (
        <div className={styles.questionCard}>
            <h3>{question}</h3>
            <RatingScale value={value} onChange={onChange} min={1} max={7} category={category} />
        </div>
    );
}
QuestionCard.propTypes = {
  question: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  category: PropTypes.string,
};

export default QuestionCard;

