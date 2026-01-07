import PropTypes from 'prop-types';
const RatingScale = ({ value, onChange, min = 1, max = 7 }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value || min}
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider"
    />
  );
};

RatingScale.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default RatingScale;
