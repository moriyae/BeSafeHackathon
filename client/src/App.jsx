import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import styles from './styles/App.module.css';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import VerificationPage from './pages/VerificationPage/VerificationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <nav className={styles.appNav}>
          <Link to="/" className={styles.appLink}>Home</Link>
          <Link to="/profile" className={styles.appLink}>Profile</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      <footer className={styles.footer}>
        <p>&copy; 2025 The Guardian</p>
      </footer>
      </main>

      
    </div>
  );
}

export default App;
