import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage';
import styles from './styles/App.module.css';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';

//import projectLogo from './assets/project-logo.png'

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <header className={styles.appHeader}>
          {/*<img src={projectLogo} alt="Logo" className={styles.appLogo} />*/}
          <nav className={styles.appNav}>
            <Link to="/" className={styles.appLink}>Home</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <footer className={styles.footer}>
          <p>&copy; 2024 My App</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
