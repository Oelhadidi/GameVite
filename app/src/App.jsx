import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Puissance from './pages/Puissance';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import VerifyAccount from './components/VerifyAccount';

const Layout = ({ children, toggleDarkMode, darkMode }) => (
  <>
    <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
    {children}
  </>
);

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for dark mode preference
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode) {
      setDarkMode(JSON.parse(storedMode));
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/puissance" element={<Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Puissance /></Layout>} />
          <Route path="/" element={<Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Dashboard /></Layout>} />
          <Route path="/signin" element={<SignIn darkMode={darkMode} />} />
          <Route path="/signup" element={<SignUp darkMode={darkMode} />} />
          <Route path="/verify" element={<VerifyAccount darkMode={darkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
