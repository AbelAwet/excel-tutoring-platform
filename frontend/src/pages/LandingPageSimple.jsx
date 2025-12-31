import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiCalendar, FiStar, FiBook, FiAward, FiClock } from 'react-icons/fi';

const LandingPageSimple = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="/images/hero-background.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Excellence in Education,
                <span className="block text-[#f59e0b]">One Student at a Time</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Connect with qualified tutors for personalized learning experiences.
                Book sessions, track progress, and achieve your academic goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/tutors" className="inline-flex items-center bg-white text-[#1e3a5f] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg font-medium transition-colors">
                  Browse Tutors
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link to="/register" className="inline-flex items-center border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3 rounded-lg font-medium transition-colors">
                  Get Started Free
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#f59e0b]">500+</div>
                  <div className="text-sm text-blue-200">Expert Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#f59e0b]">10k+</div>
                  <div className="text-sm text-blue-200">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#f59e0b]">50+</div>
                  <div className="text-sm text-blue-200">Subjects</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hidden lg:block">
              <img 
                src="/images/online-tutoring.png" 
                alt="Online tutoring session"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About EXCEL Tutoring Service
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Founded with a mission to make quality education accessible to everyone, EXCEL Tutoring Service has been connecting students with exceptional tutors since our inception. We believe that every student deserves personalized attention and the opportunity to excel in their academic journey.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Our platform brings together qualified educators and passionate learners in a seamless, technology-driven environment. Whether you're struggling with a specific subject or looking to advance your skills, our expert tutors are here to guide you every step of the way.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-[#3b82f6] mb-2">500+</h4>
                  <p className="text-gray-600 dark:text-gray-400">Verified Tutors</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#3b82f6] mb-2">10,000+</h4>
                  <p className="text-gray-600 dark:text-gray-400">Happy Students</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#3b82f6] mb-2">50+</h4>
                  <p className="text-gray-600 dark:text-gray-400">Subjects Covered</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#3b82f6] mb-2">98%</h4>
                  <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/group-sessions.png" 
                alt="About EXCEL Tutoring Service"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-[#f59e0b] text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <FiAward size={32} className="mx-auto mb-2" />
                  <p className="font-semibold">Excellence Award</p>
                  <p className="text-sm opacity-90">Best Tutoring Platform 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Tutoring Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive learning solutions tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src="/images/one-to-one.png" 
              alt="One-on-one tutoring"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="w-12 h-12 bg-[#1e3a5f] rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                One-to-One Tutoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Personalized attention with expert tutors focused on your individual learning goals
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src="/images/online-tutoring.png" 
              alt="Online tutoring"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center mb-4">
                <FiCalendar className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Online Tutoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from anywhere with flexible scheduling and interactive virtual sessions
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src="/images/group-sessions.png" 
              alt="Group tutoring sessions"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="w-12 h-12 bg-[#f59e0b] rounded-lg flex items-center justify-center mb-4">
                <FiStar className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Group Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Collaborative learning environment with peers and expert guidance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/images/hero-background.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students already achieving their academic goals with EXCEL Tutoring
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center bg-white text-[#1e3a5f] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg font-medium transition-colors">
              Sign Up Now
              <FiArrowRight className="ml-2" />
            </Link>
            <Link to="/tutors" className="inline-flex items-center border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3 rounded-lg font-medium transition-colors">
              Browse Tutors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageSimple;