
const JournalForm = () => {
  return (
    <div className="header-journal">
    <div>
        <h1>היומן שלי</h1>
        <p>{new Date().toLocaleDateString()}</p>
    </div>
</div>
  );
}

export default JournalForm;
