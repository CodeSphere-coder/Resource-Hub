import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Upload, ArrowRight, FileText, Code, Calculator } from 'lucide-react';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Study Notes",
      description: "Access comprehensive notes for all subjects across 8 semesters"
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Programming Resources",
      description: "Code snippets, projects, and programming tutorials"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Previous Year Papers",
      description: "Question papers and solutions from previous examinations"
    },
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Easy Sharing",
      description: "Upload and share your resources with fellow students"
    }
  ];

  const semesters = Array.from({ length: 8 }, (_, i) => ({ number: i + 1 }));

  const stats = [
    { number: "500+", label: "Resources Shared" },
    { number: "200+", label: "Active Students" },
    { number: "8", label: "Semesters Covered" },
    { number: "50+", label: "Subjects" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              CSE Resource Sharing Platform
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
              A collaborative platform where Computer Science Engineering students share notes, 
              assignments, and study materials across all 8 semesters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <>
                  <Link
                    to="/resources"
                    className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Browse Resources <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/upload"
                    className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Resource
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for CSE Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From first semester basics to final year reports , find all the resources you need in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Semester Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Organized by Semester
            </h2>
            <p className="text-xl text-gray-600">
              Find resources specifically tailored to your current semester
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {semesters.map((semester, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                    {semester.number}
                  </div>
                  <h3 className="text-lg font-semibold">Semester {semester.number}</h3>
                </div>
                {/* Subjects intentionally omitted as they can change annually */}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              to="/semesters"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Semesters <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Help your fellow CSE students succeed by sharing your knowledge and accessing quality resources.
          </p>
          {!currentUser && (
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;