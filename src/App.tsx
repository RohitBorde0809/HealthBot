import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuth = (userData: any, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route 
          path="/signin" 
          element={!isAuthenticated ? <SignIn onAuth={handleAuth} /> : <Navigate to="/chat" />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <SignUp onAuth={handleAuth} /> : <Navigate to="/chat" />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <Chat user={user} /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/signin" />} 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/signin"} />} />
      </Routes>
    </Router>
  );
}

export default App; 