import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Upload, ArrowRight, FileText, Code, Calculator, Eye, Target, Lightbulb, Users, CheckCircle } from 'lucide-react';

// Hero section with overlay, headline and CTA buttons
const HeroSection: React.FC = () => {
  return (
    <section
      className="relative bg-cover bg-center h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/campus.jpg')", // image from public/
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl">

        
        {/* Logo */}
  <img 
    src="/logo.jpg" // <-- make sure this image is placed in the /public folder
    alt="Site Logo"
    className="mx-auto mb-6 w-24 h-auto" // adjust size as needed
  />
        <h1 className="text-5xl font-bold mb-4">
          CS & Engineering <br />
          <span className="text-blue-300">Resource Hub</span>
        </h1>
        <p className="text-lg mb-8">
        Our platform provides teacher-approved materials, including Exam papers, Presentations, Reports and study guides.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
        <Link
  to="/signup"
  className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-md shadow hover:bg-blue-100 transition"
>
  Join Our College Network
</Link>

          <button className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-blue-700 transition">
            Browse Resources
          </button>
        </div>
      </div>
    </section>
  );
};

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
      
       {/* Horizontal College Image */}
       <img
          src="/agadiclg.jpg" // Make sure the image is in your /public folder
          alt="College Banner"
          className="w-full max-w-3xl mx-auto mb-8 rounded-lg shadow-lg"
        />

      {/* Hero Section */}
      <HeroSection />

       {/* Vision & Mission Section */}
<section className="py-16 sm:py-20 bg-blue-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-blue-200">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-3 sm:mb-4">Vision & Mission</h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
          Our guiding principles and goals to empower the next generation of technocrats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Vision */}
        <div className="bg-blue-100 rounded-lg p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-blue-600 text-white rounded-full p-3">
              <Eye className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Vision</h3>
          </div>
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
            Aspire to become a preferred institute by transforming rural youths into global technocrats through continual excellence in engineering education, innovation, lifelong learning, and ethical values.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-blue-100 rounded-lg p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-blue-600 text-white rounded-full p-3">
              <Target className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Mission</h3>
          </div>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <CheckCircle className="text-blue-600 mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                To inculcate outcome-based quality education in engineering through experiential learning with state-of-the-art infrastructure.
              </p>
            </li>
            <li className="flex items-start gap-4">
              <Lightbulb className="text-blue-600 mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                To promote industry-institute collaborations to encourage innovations in thrust areas by providing an ecosystem.
              </p>
            </li>
            <li className="flex items-start gap-4">
              <Users className="text-blue-600 mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                To emphasize on cutting-edge technologies that are sustainable and beneficial to different sectors of society.
              </p>
            </li>
            <li className="flex items-start gap-4">
              <CheckCircle className="text-blue-600 mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                To develop professionals by inculcating discipline, integrity, and ethical values.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>





      {/* Content below hero */}

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


        {/* Horizontal Scroll Semesters - Clean Enhanced Design */}
<section className="py-20 bg-gradient-to-br from-blue-50 to-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-blue-800">Explore by Semester</h2>
      <p className="text-lg text-gray-600 mt-2">
        Quick access to semester-specific study materials and resources.
      </p>
    </div>

    <div className="flex space-x-6 overflow-x-auto scrollbar-hide px-1 pb-4">
      {semesters.map((semester, idx) => (
        <Link
          key={idx}
          to={`/semesters/${semester.number}`}
          className="min-w-[160px] max-w-[160px] bg-white bg-opacity-60 backdrop-blur-md border border-blue-100 shadow-md rounded-2xl p-6 flex-shrink-0 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          <div className="text-center">
            <div className="text-4xl font-extrabold text-blue-700 mb-2">
              {semester.number}
            </div>
            <div className="text-sm text-gray-800 font-medium tracking-wide">
              Semester {semester.number}
            </div>
          </div>
        </Link>
      ))}
    </div>

    <div className="text-center mt-10">
      <Link
        to="/semesters"
        className="inline-flex items-center px-6 py-3 bg-blue-700 text-white rounded-full shadow hover:bg-blue-800 transition"
      >
        View All Semesters <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </div>
  </div>
</section>



  {/* CTA Section */}
<section className="py-24 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white">
  <div className="max-w-5xl mx-auto px-4 text-center">
    <h2 className="text-4xl font-bold mb-4">Ready to Join the Community?</h2>
    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
      Help your fellow CSE students succeed by sharing your knowledge and accessing quality resources.
    </p>
    {!currentUser && (
      <Link
        to="/signup"
        className="inline-flex items-center px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
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