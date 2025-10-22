import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Shield, FileText, TrendingUp, AlertTriangle, CheckCircle, Activity, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { deleteFromCloudinaryByToken } from '../utils/cloudinary';

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const ADMIN_EMAIL = 'sksvmacet@gmail.com';

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Enforce that only the single allowed admin email can access this page
  if (userProfile.role !== 'admin' || userProfile.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
          <Shield className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Unauthorized</h2>
          <p className="text-gray-600 text-sm">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const adminUser = userProfile as any; // Type assertion for admin-specific fields

  // Data state
  type AppUser = {
    uid: string;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    semester?: number;
    subjects?: string[];
    blocked?: boolean;
  };
  type Resource = {
    id: string;
    teacherId: string;
    teacherName: string;
    semester: number;
    subject: string;
    academicYear: string;
    term: 'odd' | 'even';
    fileUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    uploadedAt?: any;
  };

  const [users, setUsers] = useState<AppUser[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const uploadsPerSem = useMemo(() => {
    const counts = new Array(8).fill(0);
    for (const r of resources) {
      if (r.semester >= 1 && r.semester <= 8) counts[r.semester - 1]++;
    }
    return counts;
  }, [resources]);
  const uploadsPerTeacher = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of resources) {
      map.set(r.teacherName, (map.get(r.teacherName) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [resources]);
  const topDownloads = useMemo(() => {
    return [...resources]
      .sort((a: any, b: any) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 10);
  }, [resources]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoadingUsers(true);
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData: AppUser[] = usersSnap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }));
        setUsers(usersData);
      } finally {
        setLoadingUsers(false);
      }
      try {
        setLoadingResources(true);
        const q = query(collection(db, 'resources'), orderBy('uploadedAt', 'desc'));
        const resSnap = await getDocs(q);
        const resData: Resource[] = resSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setResources(resData);
      } finally {
        setLoadingResources(false);
      }
    };
    fetchAll();
  }, []);

  const groupedBySemSubject = useMemo(() => {
    const map = new Map<string, Resource[]>();
    for (const r of resources) {
      const key = `Sem ${r.semester} • ${r.subject}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [resources]);

  const toggleBlockUser = async (u: AppUser) => {
    await updateDoc(doc(db, 'users', u.uid), { blocked: !u.blocked });
    setUsers((prev) => prev.map((x) => (x.uid === u.uid ? { ...x, blocked: !u.blocked } : x)));
  };
  const deleteUser = async (u: AppUser) => {
    if (!window.confirm(`Delete user ${u.username} and all their resources?`)) return;
    // Delete Firestore user profile
    await deleteDoc(doc(db, 'users', u.uid));
    setUsers((prev) => prev.filter((x) => x.uid !== u.uid));

    // Also delete this user's resources and Cloudinary files
    const resQ = query(collection(db, 'resources'), where('teacherId', '==', u.uid));
    const resSnap = await getDocs(resQ);
    const deletions: Promise<any>[] = [];
    resSnap.forEach((d) => {
      const data = d.data() as any;
      if (data.deleteToken) {
        deletions.push(deleteFromCloudinaryByToken(data.deleteToken).catch(() => {}));
      }
      deletions.push(deleteDoc(doc(db, 'resources', d.id)));
    });
    await Promise.all(deletions);
  };
  const deleteResource = async (r: Resource) => {
    if (!window.confirm(`Delete resource "${r.fileName}"?`)) return;
    // Delete Cloudinary asset first (best-effort)
    if ((r as any).deleteToken) {
      try { await deleteFromCloudinaryByToken((r as any).deleteToken); } catch (_) {}
    }
    await deleteDoc(doc(db, 'resources', r.id));
    setResources((prev) => prev.filter((x) => x.id !== r.id));
  };

  const stats = [
    { label: 'Total Users', value: '1,234', icon: <Users className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600', change: '+12%' },
    { label: 'Total Resources', value: '2,567', icon: <FileText className="h-5 w-5" />, color: 'bg-green-100 text-green-600', change: '+8%' },
    { label: 'Pending Approvals', value: '23', icon: <AlertTriangle className="h-5 w-5" />, color: 'bg-yellow-100 text-yellow-600', change: '-5%' },
    { label: 'System Health', value: '99.2%', icon: <Activity className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600', change: '+0.1%' },
  ];

  const quickActions = [
    { title: 'Upload Resources', description: 'Upload campus resources as admin', icon: <Upload className="h-6 w-6" />, href: '/admin/upload', color: 'bg-green-500' },
    { title: 'User Management', description: 'Manage users and permissions', icon: <Users className="h-6 w-6" />, href: '/admin/users', color: 'bg-blue-500' },
    { title: 'Content Moderation', description: 'Review and approve content', icon: <Shield className="h-6 w-6" />, href: '/admin/moderation', color: 'bg-red-500' },
    { title: 'System Analytics', description: 'View platform statistics', icon: <TrendingUp className="h-6 w-6" />, href: '/admin/analytics', color: 'bg-green-500' },
    { title: 'System Settings', description: 'Configure platform settings', icon: <FileText className="h-6 w-6" />, href: '/admin/settings', color: 'bg-purple-500' },
  ];

  const recentActivity = [
    { action: 'New user registered', details: 'John Doe (Student)', time: '5 minutes ago', icon: <Users className="h-4 w-4" />, color: 'bg-blue-100 text-blue-600' },
    { action: 'Resource flagged', details: 'Inappropriate content reported', time: '15 minutes ago', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-100 text-red-600' },
    { action: 'Teacher approved', details: 'Dr. Smith verification complete', time: '1 hour ago', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-600' },
    { action: 'System backup', details: 'Daily backup completed', time: '2 hours ago', icon: <Activity className="h-4 w-4" />, color: 'bg-purple-100 text-purple-600' },
  ];

  const pendingApprovals = [
    { type: 'Teacher Registration', name: 'Dr. Sarah Johnson', subject: 'Machine Learning', priority: 'high' },
    { type: 'Resource Upload', name: 'Advanced Algorithms PDF', uploader: 'Mike Chen', priority: 'medium' },
    { type: 'User Report', name: 'Inappropriate behavior', reporter: 'Anonymous', priority: 'high' },
    { type: 'Content Update', name: 'Database Systems Notes', uploader: 'Prof. Williams', priority: 'low' },
  ];

  const userBreakdown = [
    { role: 'Students', count: 1089, percentage: 88, color: 'bg-blue-500' },
    { role: 'Teachers', count: 142, percentage: 11, color: 'bg-green-500' },
    { role: 'Admins', count: 3, percentage: 1, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
              <p className="text-lg opacity-90 mb-4">Welcome, {userProfile.username}</p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span>Role: System Administrator</span>
                <span>•</span>
                <span>Permissions: {adminUser.permissions?.length || 0} granted</span>
                <span>•</span>
                <span>Last login: Today</span>
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 
                  stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Link>
              ))}
            </div>

            {/* Resources Management */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Resources</h3>
                {loadingResources && <span className="text-sm text-gray-500">Loading...</span>}
              </div>
              {groupedBySemSubject.map(([group, items]) => (
                <div key={group} className="mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{group}</h4>
                    <span className="text-xs text-gray-500">{items.length} item(s)</span>
                  </div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Title</th>
                          <th className="px-3 py-2 text-left">Teacher</th>
                          <th className="px-3 py-2 text-left">Year</th>
                          <th className="px-3 py-2 text-left">Term</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Uploaded</th>
                          <th className="px-3 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 truncate max-w-[260px]">{r.fileName}</td>
                            <td className="px-3 py-2">{r.teacherName}</td>
                            <td className="px-3 py-2">{r.academicYear}</td>
                            <td className="px-3 py-2 capitalize">{r.term}</td>
                            <td className="px-3 py-2">{r.fileType?.split('/')[1]?.toUpperCase() || 'File'}</td>
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {r.uploadedAt && (r as any).uploadedAt?.seconds
                                ? new Date((r as any).uploadedAt.seconds * 1000).toLocaleString()
                                : (r.uploadedAt instanceof Date ? r.uploadedAt.toLocaleString() : '-')}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => deleteResource(r)}
                                className="px-3 py-1.5 rounded-md bg-red-600 text-white"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {resources.length === 0 && (
                <div className="text-sm text-gray-500">No resources found.</div>
              )}
            </div>
            {/* User Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                {userBreakdown.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${user.color}`}></div>
                      <span className="font-medium text-gray-900">{user.role}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">{user.count}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${user.color}`} 
                          style={{ width: `${user.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{user.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent System Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${activity.color} flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Uploads per Semester</h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {uploadsPerSem.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-xs text-gray-500">Sem {i + 1}</div>
                    <div className="text-lg font-semibold text-gray-900">{c}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Uploads per Teacher</h3>
              <div className="space-y-2 text-sm">
                {uploadsPerTeacher.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{name}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
                {uploadsPerTeacher.length === 0 && (
                  <div className="text-gray-500 text-sm">No data</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Most Downloaded</h3>
              <div className="space-y-3 text-sm">
                {topDownloads.map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{r.fileName}</span>
                    <span className="text-gray-600">{(r as any).downloads || 0}</span>
                  </div>
                ))}
                {topDownloads.length === 0 && (
                  <div className="text-gray-500 text-sm">No data</div>
                )}
              </div>
            </div>
            {/* Pending Approvals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Pending Approvals</h3>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  {pendingApprovals.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingApprovals.map((approval, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{approval.type}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.priority === 'high' ? 'bg-red-100 text-red-800' :
                        approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {approval.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{approval.name}</p>
                    {approval.uploader && (
                      <p className="text-xs text-gray-500">by {approval.uploader}</p>
                    )}
                    {approval.subject && (
                      <p className="text-xs text-gray-500">Subject: {approval.subject}</p>
                    )}
                    {approval.reporter && (
                      <p className="text-xs text-gray-500">Reporter: {approval.reporter}</p>
                    )}
                  </div>
                ))}
              </div>
              <Link
                to="/admin/approvals"
                className="block text-center mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                View All Approvals
              </Link>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File Storage</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Authentication</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CDN</span>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">Degraded</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="font-bold mb-3">Today's Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Resources Added:</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Reports Resolved:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span>System Uptime:</span>
                  <span className="font-semibold">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;