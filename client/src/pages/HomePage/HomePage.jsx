import styles from './Home.module.css';
// import RandomDuck from '../../components/RandomDuck/RandomDuck.jsx';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className={styles.home}>
      <h1 className={styles.headline}>The Guardian</h1>
      {/* <RandomDuck /> */}
      <Link to="/login">מעבר להתחברות</Link>
      <br />
      <Link to="/register">הרשמה</Link>

    </div>
  );
};

export default Home;
