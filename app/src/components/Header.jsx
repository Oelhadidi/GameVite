import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import icons from react-icons

const Header = ({ toggleDarkMode, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleOverlay = () => {
    setIsOverlayOpen(!isOverlayOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <header className={`p-4 w-screen text-white `}>
      <div className="container mx-auto flex justify-between items-center" /**${darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-purple-500 to-indigo-600'} */>
        <h1 className="text-3xl font-extrabold tracking-tight">Game Vite</h1>
        {/* Dark mode toggle */}
        <button onClick={toggleDarkMode} className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Hamburger button for mobile */}
        <button onClick={toggleMenu} className="text-white lg:hidden focus:outline-none bg-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={!isOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}></path>
          </svg>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex space-x-6">
          <NavLink to="/" className="text-white hover:text-gray-300 transition-colors duration-300">Dashboard</NavLink>
          <NavLink to="/puissance" className="text-white hover:text-gray-300 transition-colors duration-300">Connect 4</NavLink>
          {user ? (
            <div className="flex items-center cursor-pointer" onClick={toggleOverlay}>
              <svg className="w-6 h-6 rounded-full mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z" />
              </svg>
              <span>{user.username}</span>
            </div>
          ) : (
            <NavLink to="/signin" className="text-white hover:text-gray-300 transition-colors duration-300">Sign In</NavLink>
          )}
        </nav>

        {/* Mobile nav */}
        {isOpen && (
          <nav className={`lg:hidden absolute top-16 left-0 right-0 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-purple-500 to-indigo-600'} flex flex-col items-center space-y-4 p-4`}>
            <NavLink to="/" className="text-white hover:text-gray-300 transition-colors duration-300" onClick={toggleMenu}>Dashboard</NavLink>
            <NavLink to="/puissance" className="text-white hover:text-gray-300 transition-colors duration-300 " onClick={toggleMenu}>Connect 4</NavLink>
            {user ? (
            <div className="flex items-center cursor-pointer" onClick={toggleOverlay}>
              <svg className="w-6 h-6 rounded-full mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z" />
              </svg>
              <span>{user.username}</span>
            </div>
          ) : (
            <NavLink to="/signin" className="text-white hover:text-gray-300 transition-colors duration-300">Sign In</NavLink>
          )}
          </nav>
        )}
      </div>

      {/* Overlay pour la déconnexion */}
      {isOverlayOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-black text-lg font-bold mb-4">Déconnexion</h2>
            <p className='text-black'>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="mt-4 flex justify-end">
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300" onClick={handleLogout}>Déconnexion</button>
              <button className="bg-gray-300 text-black ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300" onClick={toggleOverlay}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
