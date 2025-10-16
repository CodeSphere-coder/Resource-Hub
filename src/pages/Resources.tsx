import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, FileText, Code, Calculator, BookOpen, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { getUserRole } from '../utils/getUserRole';
import { deleteFromCloudinaryByToken } from '../utils/cloudinary';

const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: <FileText className="h-6 w-6" />, name: 'Notes', count: 150, color: 'bg-blue-100 text-blue-600' },
    { icon: <Code className="h-6 w-6" />, name: 'Code', count: 89, color: 'bg-green-100 text-green-600' },
    { icon: <Calculator className="h-6 w-6" />, name: 'Previous Papers', count: 45, color: 'bg-purple-100 text-purple-600' },
    { icon: <BookOpen className="h-6 w-6" />, name: 'Books', count: 32, color: 'bg-orange-100 text-orange-600' },
  ];

  type Role = 'admin' | 'teacher' | 'student';

  type Resource = {
    id: string;
    teacherId?: string;
    teacherName?: string;
    semester: number;
    subject: string;
    academicYear: string;
    term: 'odd' | 'even';
    fileUrl: string; // normalized from fileUrl or url
    fileName: string;
    fileType: string;
    downloads?: number;
    uploadedAt?: any; // Firestore Timestamp or Date
    uploadedBy?: string | null;
    deleteToken?: string | null;
  };
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const user = auth.currentUser;

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const term = params.get('term'); // 'odd' | 'even' | null

  useEffect(() => {
    let mounted = true;
    const loadRole = async () => {
      if (!user?.uid) {
        setRole(null);
        return;
      }
      try {
        const r = await getUserRole(user.uid);
        if (!mounted) return;
        setRole((r as Role) || null);
      } catch {
        if (!mounted) return;
        setRole(null);
      }
    };
    loadRole();
    return () => { mounted = false; };
  }, [user?.uid]);

  const canDelete = React.useCallback((r: Resource): boolean => {
    if (!role) return false;
    if (role === 'admin') return true;
    if (role === 'teacher') return (r.uploadedBy && user?.uid) ? r.uploadedBy === user.uid : false;
    return false;
  }, [role, user?.uid]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch without requiring a specific order, then normalize and sort client-side
        const snap = await getDocs(query(collection(db, 'resources')));
        const list: Resource[] = snap.docs.map((d) => {
          const data: any = d.data();
          const normalized: Resource = {
            id: d.id,
            teacherId: data.teacherId,
            teacherName: data.teacherName || (data.role === 'admin' ? 'Admin' : data.teacherName),
            semester: Number(data.semester) || 0,
            subject: data.subject || '',
            academicYear: data.academicYear || '',
            term: data.term as 'odd' | 'even',
            fileUrl: data.fileUrl || data.url, // support Cloudinary and Firebase Storage
            fileName: data.fileName || data.originalFilename || 'Untitled',
            fileType: data.fileType || data.format || 'file',
            downloads: data.downloads || 0,
            uploadedAt: data.uploadedAt || data.timestamp || null,
            uploadedBy: data.uploadedBy || data.teacherId || null,
            deleteToken: data.deleteToken || null,
          };
          return normalized;
        });
        // Sort by uploadedAt/timestamp desc
        list.sort((a, b) => {
          const at = a.uploadedAt;
          const bt = b.uploadedAt;
          const aMs = at?.seconds ? at.seconds * 1000 : (at instanceof Date ? at.getTime() : 0);
          const bMs = bt?.seconds ? bt.seconds * 1000 : (bt instanceof Date ? bt.getTime() : 0);
          return bMs - aMs;
        });
        setItems(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = React.useCallback(async (r: Resource) => {
    if (!canDelete(r)) return;
    const confirmed = window.confirm(`Delete resource "${r.fileName}"?`);
    if (!confirmed) return;
    try {
      if (r.deleteToken) {
        try {
          await deleteFromCloudinaryByToken(r.deleteToken);
        } catch {
          // best effort
        }
      }
      await deleteDoc(doc(db, 'resources', r.id));
      setItems((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete. Please try again.');
    }
  }, [canDelete]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((r) => {
      const matchesTerm = term ? (term === 'odd' ? r.semester % 2 === 1 : r.semester % 2 === 0) : true;
      const matchesQuery = q ? (r.fileName.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)) : true;
      return matchesTerm && matchesQuery;
    });
  }, [items, searchQuery, term]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Resources</h1>
          <p className="text-gray-600">Discover and download resources shared by CSE students</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Semesters</option>
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Semester 3</option>
                <option>Semester 4</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Types</option>
                <option>Notes</option>
                <option>Code</option>
                <option>Previous Papers</option>
                <option>Books</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
          {/* Quick Odd/Even chips */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Link
              to="/resources?term=odd"
              className={`px-3 py-1.5 rounded-full border ${term === 'odd' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Odd Sem
            </Link>
            <Link
              to="/resources?term=even"
              className={`px-3 py-1.5 rounded-full border ${term === 'even' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Even Sem
            </Link>
            {term && (
              <Link
                to="/resources"
                className="px-3 py-1.5 rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Clear
              </Link>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-gray-600">{category.count} resources</p>
            </div>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-sm text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-sm text-gray-500">No resources found.</div>
          ) : filtered.map((resource) => (
            <div key={resource.id} className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{resource.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                  <span className="text-xs text-gray-500">Sem {resource.semester}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{resource.fileName}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {resource.subject}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>By {resource.teacherName || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">{resource.downloads || 0} downloads</div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const isPdf = (resource.fileType || '').toLowerCase().includes('pdf') || (resource.fileName || '').toLowerCase().endsWith('.pdf');
                      const directUrl = resource.fileUrl;
                      return (
                        <div className="flex items-center gap-2">
                          <a href={directUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Open</a>
                          {isPdf && (
                            <a
                              href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(directUrl)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              View (PDF.js)
                            </a>
                          )}
                        </div>
                      );
                    })()}
                    {canDelete(resource) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(resource)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Load More Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;