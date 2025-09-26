import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Upload, Download, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';

const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const studentUser = userProfile as any; // Type assertion for student-specific fields

  // Resources state and types
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
    uploadedAt?: { seconds: number; nanoseconds: number } | Date;
  };

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Filters
  const [filterSemester, setFilterSemester] = useState<number | ''>('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterTerm, setFilterTerm] = useState<'odd' | 'even' | ''>('');
  const [filterType, setFilterType] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Preview modal
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [previewType, setPreviewType] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoadingResources(true);
        const q = query(collection(db, 'resources'), orderBy('uploadedAt', 'desc'));
        const snap = await getDocs(q);
        const items: Resource[] = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setResources(items);
      } catch (e) {
        console.error('Failed to load resources', e);
      } finally {
        setIsLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSem = filterSemester ? r.semester === Number(filterSemester) : true;
      const matchesSubj = filterSubject ? r.subject.toLowerCase().includes(filterSubject.toLowerCase()) : true;
      const matchesYear = filterYear ? r.academicYear.toLowerCase().includes(filterYear.toLowerCase()) : true;
      const matchesTerm = filterTerm ? r.term === filterTerm : true;
      const ft = filterType.toLowerCase();
      const matchesType = ft
        ? (ft === 'image' ? r.fileType?.startsWith('image/') : (r.fileType?.toLowerCase().includes(ft) || r.fileName?.toLowerCase().endsWith(ft)))
        : true;
      return matchesSem && matchesSubj && matchesYear && matchesTerm && matchesType;
    });
  }, [resources, filterSemester, filterSubject, filterYear, filterTerm, filterType]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      if (r.subject) set.add(r.subject);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const paginatedResources = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterSemester, filterSubject, filterYear, filterTerm, filterType, pageSize]);

  const openPreview = (fileUrl: string, fileType: string) => {
    setPreviewType(fileType);
    setPreviewUrl(fileUrl);
  };
  const closePreview = () => {
    setPreviewUrl(undefined);
    setPreviewType(undefined);
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isPdf = (type: string, name?: string) => type === 'application/pdf' || (name || '').toLowerCase().endsWith('.pdf');
  const isDoc = (type: string, name?: string) => {
    const t = type.toLowerCase();
    const n = (name || '').toLowerCase();
    return t.includes('msword') || t.includes('officedocument.wordprocessingml') || n.endsWith('.doc') || n.endsWith('.docx');
  };
  const isPpt = (type: string, name?: string) => {
    const t = type.toLowerCase();
    const n = (name || '').toLowerCase();
    return t.includes('powerpoint') || t.includes('officedocument.presentationml') || n.endsWith('.ppt') || n.endsWith('.pptx');
  };

  const stats = [
    { label: 'Resources Downloaded', value: '24', icon: <Download className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Resources Uploaded', value: '8', icon: <Upload className="h-5 w-5" />, color: 'bg-green-100 text-green-600' },
    { label: 'Current Semester', value: studentUser.semester || '4', icon: <BookOpen className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' },
  ];

  const quickActions = [
    { title: 'Browse Resources', description: 'Find study materials for your semester', icon: <BookOpen className="h-6 w-6" />, href: '/resources', color: 'bg-blue-500' },
    { title: 'My Downloads', description: 'View your downloaded resources', icon: <Download className="h-6 w-6" />, href: '/downloads', color: 'bg-purple-500' },
  ];

  // recentActivity removed in favor of resources list

  // removed upcomingDeadlines section

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.username}! 👋</h1>
              <p className="text-lg opacity-90 mb-4">Ready to continue your CSE journey?</p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span>USN: {studentUser.usn}</span>
                <span>•</span>
                <span>Semester: {studentUser.semester || '4'}</span>
                <span>•</span>
                <span>Branch: {studentUser.branch || 'CSE'}</span>
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <BookOpen className="h-12 w-12 text-white" />
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Link>
              ))}
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Campus Resources</h3>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">All Semesters</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
                <input
                  className="border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Subject"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                />
                <input
                  className="border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Academic Year"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value as 'odd' | 'even' | '')}
                >
                  <option value="">Odd/Even</option>
                  <option value="odd">Odd</option>
                  <option value="even">Even</option>
                </select>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="ppt">PPT</option>
                  <option value="pptx">PPTX</option>
                  <option value="doc">DOC</option>
                  <option value="docx">DOCX</option>
                  <option value="image">Images</option>
                </select>
              </div>

              {/* Quick filter toggle */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="text-gray-600">Tip: Use filters to view past semesters.</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterSemester(studentUser.semester || '')}
                    className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    My Semester
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSemester('')}
                    className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    All Semesters
                  </button>
                </div>
              </div>

              {/* Subject quick chips */}
              {uniqueSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {uniqueSubjects.slice(0, 12).map((subj) => {
                    const active = filterSubject.toLowerCase() === subj.toLowerCase();
                    return (
                      <button
                        key={subj}
                        onClick={() => setFilterSubject(active ? '' : subj)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              )}

              {isLoadingResources ? (
                <div className="text-sm text-gray-500">Loading resources...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Title</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Subject</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Sem</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Year</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Term</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Uploaded</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedResources.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900 truncate max-w-[260px]">{r.fileName}</td>
                          <td className="px-4 py-2">{r.subject}</td>
                          <td className="px-4 py-2">{r.semester}</td>
                          <td className="px-4 py-2">{r.academicYear}</td>
                          <td className="px-4 py-2 capitalize">{r.term}</td>
                          <td className="px-4 py-2">{r.fileType?.split('/')[1]?.toUpperCase() || 'File'}</td>
                          <td className="px-4 py-2 text-xs text-gray-600">
                            {r.uploadedAt && 'seconds' in (r.uploadedAt as any)
                              ? new Date((r.uploadedAt as any).seconds * 1000).toLocaleString()
                              : (r.uploadedAt instanceof Date ? r.uploadedAt.toLocaleString() : '-')}
                          </td>
                          <td className="px-4 py-2 space-x-2 text-right">
                            <button
                              onClick={() => openPreview(r.fileUrl, r.fileType)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Preview
                            </button>
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                              download
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                      {filteredResources.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>No resources found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Rows per page:</span>
                  <select
                    className="border border-gray-300 rounded-md px-2 py-1"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Page {page} of {totalPages}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-50"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-50"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Removed Semester Progress */}
          </div>
        </div>
      </div>
    </div>

    {/* Preview Modal */}
    {previewUrl && (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-5xl h-[80vh] rounded-lg overflow-hidden shadow-xl relative">
          <button
            onClick={closePreview}
            className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-full h-full bg-gray-50">
            {isImage(previewType || '') ? (
              <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />
            ) : isPdf(previewType || '') ? (
              <iframe
                title="PDF Preview"
                src={`https://drive.google.com/viewerng/viewer?embedded=1&url=${encodeURIComponent(previewUrl!)}`}
                className="w-full h-full"
              />
            ) : isDoc(previewType || '') || isPpt(previewType || '') ? (
              <iframe
                title="Doc Preview"
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                className="w-full h-full"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                Preview not available for this file type. Use Download instead.
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default StudentDashboard;