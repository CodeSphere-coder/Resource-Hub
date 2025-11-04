import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Home, GraduationCap, Users, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getRoleIcon = () => {
    if (!userProfile) return <User className="h-5 w-5" />;
    switch (userProfile.role) {
      case 'student':
        return <GraduationCap className="h-5 w-5" />;
      case 'teacher':
        return <Users className="h-5 w-5" />;
      case 'admin':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  // Active link styling
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-1 transition-colors ${
      isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="CSE Fortune Logo" className="h-12 w-auto object-contain" />
          </NavLink>

          {/* Main navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentUser && (
              <NavLink
                to={
                  userProfile?.role === 'student'
                    ? '/student-dashboard'
                    : userProfile?.role === 'teacher'
                    ? '/teacher-dashboard'
                    : userProfile?.role === 'admin'
                    ? '/admin-dashboard'
                    : '/student-dashboard'
                }
                className={navLinkClass}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </NavLink>
            )}

            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>

            {userProfile?.role === 'admin' && (
              <NavLink to="/admin-dashboard" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </div>

          {/* Right side profile/logout */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  {getRoleIcon()}
                  <span>{userProfile?.username || 'User'}</span>
                  {userProfile?.role && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {userProfile.role}
                    </span>
                  )}
                </div>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center space-x-1 transition-colors ${
                      isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                    }`
                  }
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded transition-colors ${
                      isActive ? 'text-blue-600 font-semibold' : 'text-blue-600 hover:text-blue-800'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isActive ? 'font-semibold' : ''
                    }`
                  }
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
