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

export default RatingScale;
