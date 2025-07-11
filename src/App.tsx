import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import './App.css'
import Login from './pages/LoginForm'
import Admin from './pages/Admin'
import Quiz from './pages/Quiz'
import Authenticate from './components/authenticate/Authenticate'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import SeminarListPage from './pages/SeminarListPage'
import SeminarDetailPage from './pages/SeminarDetailPage'
import CreateSeminarPage from './pages/CreateSeminarPage'
import CreateUserForm from './pages/CreateUserForm'
import EditSeminarPage from './pages/EditSeminarPage'
function App() {
  // Example authentication state and logout handler
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Add any additional logout logic here
  };

  return (
    <div className="app-container">
      <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/event" element={<SeminarListPage />} />
          <Route path="/seminars/:id" element={<SeminarDetailPage />} />
          <Route path="/admin/event-create" element={<CreateSeminarPage />} />
          <Route
            path="/admin/user-create"
            element={
              <CreateUserForm
          onCancel={() => {
            window.location.href = '/admin';
          }}
              />
            }
          />
          <Route path="/admin/event-edit/:id" element={<EditSeminarPage />} />
          {/* Add more routes as needed */}
        </Routes>
        
      </main>
    </div>
  );
}

export default App;
