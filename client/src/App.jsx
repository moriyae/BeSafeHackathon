// שורה 1: הוספתי את Link, והורדתי את BrowserRouter (כי לא צריך אותו כאן)
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import styles from './styles/App.module.css';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import VerificationPage from './pages/VerificationPage/VerificationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';

function App() {
  return (
    // שימי לב: מחקתי מכאן את <BrowserRouter> ואת הסגירה שלו למטה!
    // עכשיו הדיב הוא העוטף הראשי
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <nav className={styles.appNav}>
          {/* עכשיו Link יעבוד כי ייבאנו אותו בשורה 1 */}
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
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 The Guardian</p>
      </footer>
    </div>
  );
}

export default App;