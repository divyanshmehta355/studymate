import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  LogOut,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <BookOpen size={22} />
            <span>StudyMate</span>
          </div>
          <button className="btn btn-ghost btn-icon sidebar-close" onClick={onToggle}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="sidebar-link" onClick={onToggle}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/chat" className="sidebar-link" onClick={onToggle}>
            <MessageSquare size={18} />
            <span>Chat</span>
          </NavLink>
          <NavLink to="/study" className="sidebar-link" onClick={onToggle}>
            <GraduationCap size={18} />
            <span>Study Tools</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user?.full_name || user?.email?.split('@')[0]}
              </span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
