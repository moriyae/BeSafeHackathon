import QuestionCard from '../Journal/QuestionCard';
import RatingScale from '../Journal/RatingScale.jsx';
import PropTypes from 'prop-types';
import styles from '../../pages/HomePage/Home.module.css';


const JournalQuestionList = ({questions, answers, onAnswer}) => {

    return (
        <div className={styles.questionsTab}>
            {questions.map((question) => (
                <QuestionCard
                    key={question._id} //changed to ._id like in db
                    question={question.question_text} //i changed to question_text like in db
                    value={answers[question.question_id] || ''}
                    onChange={(value) => onAnswer(question.question_id, value)}
                    category={question.category}
                >
                    <RatingScale min={1} max={7} value={answers[question.id]} onChange={(value) => onAnswer(question.id, value)} category={question.category} />
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
