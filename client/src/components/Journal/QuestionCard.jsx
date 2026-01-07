import RatingScale from '../Journal/RatingScale.jsx';
import PropTypes from 'prop-types';

const QuestionCard = ({ question, value, onChange }) => {
    return (
        <div className="question-card">
            <h3>{question}</h3>
            <RatingScale value={value} onChange={onChange} min={1} max={7} />
        </div>
    );
}
QuestionCard.propTypes = {
  question: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default QuestionCard;

