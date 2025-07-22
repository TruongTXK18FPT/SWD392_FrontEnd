import { useState, useEffect } from 'react';
import Tab from '../components/Tab';
import Alert from '../components/Alert';
import { 
  FaUsers, FaQuestionCircle, FaCalendarAlt,
 FaArrowUp,
} from 'react-icons/fa';
import QuizManagement from '../components/admin/QuizManagement';
import UserManagement from '../components/admin/UserManagement';
import '../styles/Admin.css';
import UniversityManagementPage from '@/components/admin/UniversityManagementPage';
import CareerManagement from '@/components/admin/CareerManagement';


type AlertType = 'success' | 'info' | 'warning' | 'error';
type ActiveView = 'users' | 'quizzes' | 'events' |
                  'universities'| 'careers';

const Admin = () => {
  const [activeView, setActiveView] = useState<ActiveView>('quizzes');
  const [alerts, setAlerts] = useState<Array<{ id: number; type: AlertType; message: string }>>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    // Simulate loading stats with counting animation

    // Show scroll to top button on scroll
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    showAlert('info', 'Welcome to the admin dashboard');

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showAlert = (type: AlertType, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      case 'quizzes':
        return <QuizManagement onAlert={showAlert} />;
      case 'universities':
        return <UniversityManagementPage/>;
      case 'careers':
        return <CareerManagement/>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      <Tab 
        activeTab={activeView}
        onTabChange={(tabId) => setActiveView(tabId as ActiveView)}
      />
      
      <main className="admin-main">

        <div className="admin-content">
          {renderContent()}
        </div>

        {showScrollTop && (
          <button
            className="scroll-top-btn"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <FaArrowUp />
          </button>
        )}

        <div className="admin-alerts">
          {alerts.map(({ id, type, message }) => (
            <Alert
              key={id}
              type={type}
              message={message}
              onClose={() => setAlerts(prev => prev.filter(alert => alert.id !== id))}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;