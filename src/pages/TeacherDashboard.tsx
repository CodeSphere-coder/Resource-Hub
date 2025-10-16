import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Upload, FileText, BookOpen, TrendingUp, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadToCloudinary } from '../utils/cloudinary';

const TeacherDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const teacherUser = userProfile as any; // Type assertion for teacher-specific fields

  // Upload form state
  const [semester, setSemester] = useState<number | ''>('');
  const [subject, setSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState<'odd' | 'even' | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/gif'
  ];

  const resetForm = () => {
    setSemester('');
    setSubject('');
    setAcademicYear('');
    setTerm('');
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!userProfile || userProfile.role !== 'teacher') return;
    if (!semester || !subject || !academicYear || !term) {
      setSubmitMessage('Please fill in all fields.');
      return;
    }
    if (!file) {
      setSubmitMessage('Please select a file to upload.');
      return;
    }
    if (!allowedMimeTypes.includes(file.type)) {
      setSubmitMessage('Unsupported file type. Please upload PDF, PPT, DOC, or an image.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await uploadToCloudinary(file);

      // Save metadata in Firestore (Cloudinary)
      await addDoc(collection(db, 'resources'), {
        teacherId: userProfile.uid,
        teacherName: userProfile.username,
        semester: Number(semester),
        subject,
        academicYear,
        term,
        fileUrl: result.url,
        deleteToken: result.deleteToken || null,
        fileName: file.name,
        fileType: file.type,
        downloads: 0,
        uploadedAt: serverTimestamp(),
      });

      setSubmitMessage('Resource uploaded successfully.');
      resetForm();
    } catch (err) {
      console.error(err);
      setSubmitMessage('Failed to upload resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Resources Shared', value: '45', icon: <Upload className="h-5 w-5" />, color: 'bg-green-100 text-green-600' },
    { label: 'Subjects Teaching', value: teacherUser.subjects?.length.toString() || '0', icon: <BookOpen className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' },
  ];

  const quickActions = [
    { title: 'Upload Materials', description: 'Share teaching resources with students', icon: <Upload className="h-6 w-6" />, href: '/upload', color: 'bg-green-500' },
    { title: 'Manage Resources', description: 'Edit and organize your content', icon: <FileText className="h-6 w-6" />, href: '/manage', color: 'bg-blue-500' },
    { title: 'Student Analytics', description: 'View student engagement metrics', icon: <TrendingUp className="h-6 w-6" />, href: '/analytics', color: 'bg-purple-500' },
    { title: 'Create Assignment', description: 'Post new assignments and tasks', icon: <Calendar className="h-6 w-6" />, href: '/assignments', color: 'bg-orange-500' },
  ];

  const recentActivity = [
    { action: 'Uploaded', item: 'Machine Learning Lecture Notes', time: '2 hours ago', icon: <Upload className="h-4 w-4" />, color: 'bg-green-100 text-green-600' },
    { action: 'Created', item: 'Database Assignment #3', time: '1 day ago', icon: <Calendar className="h-4 w-4" />, color: 'bg-blue-100 text-blue-600' },
  ];

  const topResources = [
    { title: 'Data Structures Complete Guide', downloads: 245, rating: 4.9, subject: 'Data Structures' },
    { title: 'Machine Learning Algorithms', downloads: 189, rating: 4.8, subject: 'Machine Learning' },
    { title: 'Database Design Principles', downloads: 156, rating: 4.7, subject: 'Database Systems' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, Prof. {userProfile.username}! 👨‍🏫</h1>
              <p className="text-lg opacity-90 mb-4">Inspiring minds and sharing knowledge</p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span>Department: {teacherUser.department || 'Computer Science'}</span>
                <span>•</span>
                <span>Subjects: {teacherUser.subjects?.length || 0}</span>
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className={`${action.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Link>
              ))}
            </div>

            {/* Upload Resources */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 text-green-600 mr-2" /> Upload Campus Resources
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : '')}
                      required
                    >
                      <option value="">Select Semester</option>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    {teacherUser.subjects && teacherUser.subjects.length > 0 ? (
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      >
                        <option value="">Select Subject</option>
                        {teacherUser.subjects.map((s: string, idx: number) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Data Structures"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 2024-25"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Odd/Even Semester</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={term}
                      onChange={(e) => setTerm(e.target.value as 'odd' | 'even' | '')}
                      required
                    >
                      <option value="">Select Term</option>
                      <option value="odd">Odd</option>
                      <option value="even">Even</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
                  <input
                    type="file"
                    className="w-full"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Allowed: PDF, PPT, DOC, Images</p>
                </div>

                {submitMessage && (
                  <div className={`text-sm ${submitMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload Resource'}
                </button>
              </form>
            </div>

            {/* Your Subjects */}
            {teacherUser.subjects && teacherUser.subjects.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Subjects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherUser.subjects.map((subject: string, index: number) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-900">{subject}</h4>
                        </div>
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action} {activity.item}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Resources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Top Resources</h3>
              <div className="space-y-4">
                {topResources.map((resource, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900 text-sm">{resource.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{resource.subject}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resources Uploaded</span>
                  <span className="font-semibold text-green-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Student Interactions</span>
                  <span className="font-semibold text-blue-600">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-semibold text-yellow-600">4.8/5</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+15% from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
              <div className="flex items-center mb-3">
                <Award className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="font-bold">Top Contributor</h3>
                  <p className="text-sm opacity-90">This semester</p>
                </div>
              </div>
              <p className="text-sm opacity-90">
                You're in the top 5% of teachers for resource sharing!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;