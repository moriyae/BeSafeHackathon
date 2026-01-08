import { BrowserRouter, Routes, Route, Link } from 'react-router'
import Home from './pages/HomePage/HomePage';
import styles from './styles/App.module.css';
<<<<<<< Updated upstream
=======
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import VerificationPage from './pages/VerificationPage/VerificationPage';
>>>>>>> Stashed changes

import projectLogo from './assets/project-logo.png'

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <img src={projectLogo} alt="Logo" className={styles.appLogo} />
          <nav className={styles.appNav}>
            <Link to="/" className={styles.appLink}>Home</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <Routes>
<<<<<<< Updated upstream
            <Route path="/" element={<Home />} />
=======
            <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/register" element={<RegisterPage />} />
>>>>>>> Stashed changes
          </Routes>
        </main>
        <footer className={styles.footer}>
          <p>&copy; 2025 The Guardian</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;