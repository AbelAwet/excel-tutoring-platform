import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiCalendar, FiStar, FiBook, FiAward, FiClock, FiCheckCircle, FiMail } from 'react-icons/fi';
import AnimatedContainer from '../components/AnimatedContainer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Modern Design */}
      <div className="relative min-h-screen flex items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="container-custom py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedContainer animation="fade-in-left" duration={0.8}>
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 animate-fade-in-up">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-green-300">Now Available 24/7</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Excellence in
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-fade-in-up animate-delay-300">
                    Education
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed animate-fade-in-up animate-delay-500">
                  Connect with <span className="text-amber-300 font-semibold">qualified tutors</span> for personalized learning experiences. Book sessions, track progress, and achieve your academic goals.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up animate-delay-700">
                  <Link 
                    to="/tutors" 
                    className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-2xl font-bold text-lg text-white shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                      Browse Tutors
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl font-bold text-lg text-white hover:bg-white/20 hover:border-white/50 transition-all hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                </div>
              
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 animate-fade-in-up animate-delay-1000">
                  <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                    <div className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-1">500+</div>
                    <div className="text-sm text-blue-200">Expert Tutors</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                    <div className="text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">10k+</div>
                    <div className="text-sm text-blue-200">Students</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">50+</div>
                    <div className="text-sm text-blue-200">Subjects</div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
            
            {/* Hero Image */}
            <AnimatedContainer animation="fade-in-right" duration={0.8} delay={0.3}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                
                {/* Image Container */}
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-2 border border-white/20 shadow-2xl">
                  <img 
                    src="/images/online-tutoring.png" 
                    alt="Online tutoring session with EXCEL Tutoring Service"
                    className="rounded-2xl w-full h-auto"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce-in">
                    <div className="flex items-center gap-3">
                      <FiCheckCircle size={24} />
                      <div>
                        <p className="font-bold text-lg">98% Success Rate</p>
                        <p className="text-sm opacity-90">Verified Results</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="container-custom py-20">
        <AnimatedContainer animation="fade-in-up" duration={0.6}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Tutoring Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive learning solutions tailored to your needs
            </p>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* One-to-One Tutoring */}
          <AnimatedContainer animation="fade-in-up" delay={0.1}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all-smooth hover-lift">
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
          </AnimatedContainer>

          {/* Online Tutoring */}
          <AnimatedContainer animation="fade-in-up" delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all-smooth hover-lift">
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
          </AnimatedContainer>

          {/* Group Sessions */}
          <AnimatedContainer animation="fade-in-up" delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all-smooth hover-lift">
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
          </AnimatedContainer>

          {/* Homework Help */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src="/images/homework-help.png" 
              alt="Homework help"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <FiBook className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Homework Help
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get assistance with assignments and projects to improve understanding
              </p>
            </div>
          </div>

          {/* Exam Preparation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src="/images/exam-prep.png" 
              alt="Exam preparation"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FiAward className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Exam Preparation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive test prep strategies to boost your confidence and scores
              </p>
            </div>
          </div>

          {/* Coding & Tech Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              src="/images/coding-skills.png" 
              alt="Coding and technology skills"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <FiCheckCircle className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Coding & Tech Skills
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Master programming and technology with hands-on instruction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <AnimatedContainer animation="fade-in-up">
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
                  className="rounded-2xl shadow-2xl hover-lift transition-all-smooth"
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
          </AnimatedContainer>
        </div>
      </div>

      {/* Our Mission & Vision */}
      <div className="py-20 bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] text-white">
        <div className="container-custom">
          <AnimatedContainer animation="fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Mission & Vision</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Empowering students worldwide through personalized, accessible, and effective education
              </p>
            </div>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatedContainer animation="fade-in-left" delay={0.2}>
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiStar className="text-[#f59e0b]" size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-blue-100 text-lg">
                  To democratize quality education by connecting students with passionate, qualified tutors who can help them achieve their academic goals and unlock their full potential.
                </p>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer animation="fade-in-right" delay={0.4}>
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiBook className="text-[#f59e0b]" size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-blue-100 text-lg">
                  To become the world's leading platform for personalized learning, where every student has access to exceptional education regardless of their location or background.
                </p>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container-custom">
          <AnimatedContainer animation="fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose EXCEL Tutoring?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We're committed to your academic success with proven results
              </p>
            </div>
          </AnimatedContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedContainer animation="fade-in-up" delay={0.1}>
              <div className="text-center hover-lift transition-all-smooth">
                <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4 hover-scale transition-all-smooth">
                  <FiUsers className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Qualified Tutors
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All tutors are verified and experienced professionals
                </p>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer animation="fade-in-up" delay={0.2}>
              <div className="text-center hover-lift transition-all-smooth">
                <div className="w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 hover-scale transition-all-smooth">
                  <FiCalendar className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Book sessions at your convenience, anytime
                </p>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer animation="fade-in-up" delay={0.3}>
              <div className="text-center hover-lift transition-all-smooth">
                <div className="w-16 h-16 bg-[#f59e0b] rounded-full flex items-center justify-center mx-auto mb-4 hover-scale transition-all-smooth">
                  <FiStar className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Rated & Reviewed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Read reviews from other students
                </p>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer animation="fade-in-up" delay={0.4}>
              <div className="text-center hover-lift transition-all-smooth">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale transition-all-smooth">
                  <FiClock className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  24/7 Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get help whenever you need it
                </p>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/images/hero-background.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <AnimatedContainer animation="fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Get In Touch
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </AnimatedContainer>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <AnimatedContainer animation="fade-in-left" delay={0.2}>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                
                {/* Phone */}
                <a 
                  href="tel:+251983048580"
                  className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FiClock className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-white">+251 983 048 580</p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:abelab805@gmail.com"
                  className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FiMail className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-white">abelab805@gmail.com</p>
                  </div>
                </a>

                {/* Social Media */}
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <p className="text-sm text-blue-200 mb-4">Follow Us On Social Media</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Telegram */}
                    <a 
                      href="https://t.me/abelawet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.093.036.306.02.472z"/>
                      </svg>
                      <span className="text-white font-semibold">@abelawet</span>
                    </a>

                    {/* Instagram */}
                    <a 
                      href="https://instagram.com/ABEL11965"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 transition-all hover:scale-105"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-white font-semibold">@ABEL11965</span>
                    </a>

                    {/* Facebook */}
                    <a 
                      href="https://facebook.com/AbelAwet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-white font-semibold">AbelAwet</span>
                    </a>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <p className="text-sm text-blue-200 mb-3">Availability</p>
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white font-bold text-lg">Available 24/7</span>
                    </div>
                    <p className="text-blue-100 text-sm mt-3">
                      We're here for you anytime, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedContainer>

            {/* CTA Card */}
            <AnimatedContainer animation="fade-in-right" delay={0.4}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Start Learning?
                </h3>
                <p className="text-blue-100 mb-6">
                  Join thousands of students already achieving their academic goals with EXCEL Tutoring. Sign up today and get matched with expert tutors!
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400 flex-shrink-0" size={24} />
                    <p className="text-white">Verified & Experienced Tutors</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400 flex-shrink-0" size={24} />
                    <p className="text-white">Flexible Scheduling</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400 flex-shrink-0" size={24} />
                    <p className="text-white">Online & In-Person Sessions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400 flex-shrink-0" size={24} />
                    <p className="text-white">Affordable Rates</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link 
                    to="/register" 
                    className="w-full btn bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg px-8 py-4 hover-lift transition-all-smooth flex items-center justify-center gap-2"
                  >
                    Sign Up Now
                    <FiArrowRight size={20} />
                  </Link>
                  <Link 
                    to="/tutors" 
                    className="w-full btn bg-white/20 hover:bg-white/30 text-white text-lg px-8 py-4 hover-scale transition-all-smooth flex items-center justify-center gap-2 border-2 border-white/30"
                  >
                    Browse Tutors
                    <FiUsers size={20} />
                  </Link>
                </div>

                <p className="text-center text-sm text-blue-200 mt-6">
                  No credit card required • Free to join
                </p>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
