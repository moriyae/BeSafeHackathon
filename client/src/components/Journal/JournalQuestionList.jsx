import QuestionCard from '../Journal/QuestionCard';
import RatingScale from '../Journal/RatingScale.jsx';
import PropTypes from 'prop-types';


const JournalQuestionList = ({questions, answers, onAnswer}) => {

    return (
        <div className="questions">
            {questions.map((question) => (
                <QuestionCard
                    key={question.id}
                    question={question.text}
                    value={answers[question.id] || ''}
                    onChange={(value) => onAnswer(question.id, value)}
                >
                    <RatingScale min={1} max={7} value={answers[question.id]} onChange={(value) => onAnswer(question.id, value)} />
                </QuestionCard>
            ))}
        </div>
    );  
}
JournalQuestionList.propTypes = {
  questions: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  onAnswer: PropTypes.func.isRequired,
};
export default JournalQuestionList;
