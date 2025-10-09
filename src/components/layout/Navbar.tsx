import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, User, LogOut, Upload, Home, GraduationCap, Users, Shield } from 'lucide-react';

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
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ResourceHub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {currentUser && (
              <Link 
                to={
                  userProfile?.role === 'student' ? '/student-dashboard' :
                  userProfile?.role === 'teacher' ? '/teacher-dashboard' :
                  userProfile?.role === 'admin' ? '/admin-dashboard' :
                  '/student-dashboard'
                } 
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/semesters?term=odd" className="text-gray-700 hover:text-blue-600 transition-colors">Odd Sem</Link>
            <Link to="/semesters?term=even" className="text-gray-700 hover:text-blue-600 transition-colors">Even Sem</Link>
            <Link to="/resources" className="text-gray-700 hover:text-blue-600 transition-colors">Resources</Link>
            {currentUser && (
              <Link to="/upload" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
            )}
            {userProfile?.role === 'admin' && (
              <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Admin</Link>
            )}
          </div>

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
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
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
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;