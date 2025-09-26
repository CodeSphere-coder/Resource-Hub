import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Code, Calculator, Users } from 'lucide-react';

const Semesters: React.FC = () => {
  const semesterData = [
    {
      number: 1,
      title: "Foundation Semester",
      subjects: [
        { name: "Engineering Mathematics I", resources: 25, icon: <Calculator className="h-5 w-5" /> },
        { name: "Engineering Physics", resources: 18, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Engineering Chemistry", resources: 20, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Programming for Problem Solving", resources: 35, icon: <Code className="h-5 w-5" /> },
        { name: "English for Communication", resources: 12, icon: <FileText className="h-5 w-5" /> }
      ],
      totalResources: 110,
      activeStudents: 45
    },
    {
      number: 2,
      title: "Core Fundamentals",
      subjects: [
        { name: "Engineering Mathematics II", resources: 28, icon: <Calculator className="h-5 w-5" /> },
        { name: "Data Structures", resources: 42, icon: <Code className="h-5 w-5" /> },
        { name: "Digital Logic Design", resources: 30, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Object Oriented Programming", resources: 38, icon: <Code className="h-5 w-5" /> },
        { name: "Discrete Mathematics", resources: 22, icon: <Calculator className="h-5 w-5" /> }
      ],
      totalResources: 160,
      activeStudents: 52
    },
    {
      number: 3,
      title: "Core Computer Science",
      subjects: [
        { name: "Algorithms", resources: 45, icon: <Code className="h-5 w-5" /> },
        { name: "Database Management Systems", resources: 35, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Computer Networks", resources: 28, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Operating Systems", resources: 32, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Software Engineering", resources: 25, icon: <FileText className="h-5 w-5" /> }
      ],
      totalResources: 165,
      activeStudents: 48
    },
    {
      number: 4,
      title: "Advanced Concepts",
      subjects: [
        { name: "Machine Learning", resources: 40, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Web Development", resources: 55, icon: <Code className="h-5 w-5" /> },
        { name: "Theory of Computation", resources: 20, icon: <Calculator className="h-5 w-5" /> },
        { name: "Computer Graphics", resources: 18, icon: <BookOpen className="h-5 w-5" /> },
        { name: "Human Computer Interaction", resources: 15, icon: <FileText className="h-5 w-5" /> }
      ],
      totalResources: 148,
      activeStudents: 42
    }
  ];

  const getGradientClass = (semesterNumber: number) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-purple-500 to-pink-600", 
      "from-green-500 to-blue-600",
      "from-orange-500 to-red-600"
    ];
    return gradients[(semesterNumber - 1) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CSE Curriculum by Semester</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore resources organized by semester and subject. From foundational mathematics 
            to advanced machine learning concepts.
          </p>
        </div>

        {/* Semesters Grid */}
        <div className="space-y-8">
          {semesterData.map((semester) => (
            <div key={semester.number} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Semester Header */}
              <div className={`bg-gradient-to-r ${getGradientClass(semester.number)} text-white p-8`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Semester {semester.number}</h2>
                    <p className="text-xl opacity-90">{semester.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{semester.totalResources}</div>
                    <div className="text-sm opacity-90">Resources</div>
                  </div>
                </div>
              </div>

              {/* Semester Content */}
              <div className="p-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{semester.totalResources}</div>
                    <div className="text-sm text-gray-600">Total Resources</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{semester.activeStudents}</div>
                    <div className="text-sm text-gray-600">Active Students</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{semester.subjects.length}</div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semester.subjects.map((subject, index) => (
                    <Link
                      key={index}
                      to={`/subject/${semester.number}/${encodeURIComponent(subject.name)}`}
                      className="block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 bg-white rounded-lg p-2 group-hover:bg-blue-50 transition-colors">
                          <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                            {subject.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {subject.name}
                          </h3>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {subject.resources} resources
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                  <Link
                    to={`/semester/${semester.number}`}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View All Semester {semester.number} Resources
                    <BookOpen className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Semesters Coming Soon */}
        <div className="text-center mt-12 bg-white rounded-2xl shadow-lg p-12">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Semesters 5-8 Coming Soon!</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're actively working on adding resources for advanced semesters including 
            Artificial Intelligence, Distributed Systems, Cybersecurity, and Final Year Projects.
          </p>
          <button className="mt-6 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Get Notified
          </button>
        </div>
      </div>
    </div>
  );
};

export default Semesters;