import RatingScale from '../Journal/RatingScale.jsx';

const QuestionCard = ({ question, value, onChange }) => {
    return (
        <div className="question-card">
            <h3>{question}</h3>
            <RatingScale value={value} onChange={onChange} min={1} max={7} />
        </div>
    );
}

export default QuestionCard;