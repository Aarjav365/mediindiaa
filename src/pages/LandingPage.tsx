import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  UserRound, 
  Stethoscope, 
  Shield, 
  Share2, 
  Clock, 
  ChevronRight,
  Star,
  Users,
  Zap,
  Heart,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  Globe,
  Award,
  TrendingUp
} from 'lucide-react';
import Button from '../components/ui/Button';
import TypewriterText from '../components/ui/TypewriterText';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const LandingPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const stats = [
    { number: 10000, label: 'Patients Served', suffix: '+' },
    { number: 500, label: 'Healthcare Providers', suffix: '+' },
    { number: 99.9, label: 'Uptime', suffix: '%' },
    { number: 4.9, label: 'User Rating', suffix: '/5' }
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Bank-Level Security',
      description: 'Your health data is encrypted and protected with industry-leading security standards.',
      color: 'from-blue-500 to-blue-600',
      delay: 0.1
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: 'Instant Access',
      description: 'Access your medical records anytime, anywhere with our lightning-fast platform.',
      color: 'from-purple-500 to-purple-600',
      delay: 0.2
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Family Management',
      description: 'Manage health records for your entire family from a single, unified dashboard.',
      color: 'from-green-500 to-green-600',
      delay: 0.3
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: 'AI Health Insights',
      description: 'Get personalized health recommendations powered by AI technology.',
      color: 'from-red-500 to-red-600',
      delay: 0.4
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Cardiologist',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      quote: 'MediIndia has revolutionized how I manage patient records. The digital prescription feature saves me hours every day.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Patient',
      image: 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      quote: 'Finally, all my family\'s health records in one place. The reminder system has been a game-changer for my elderly parents.',
      rating: 5
    },
    {
      name: 'Dr. Anita Patel',
      role: 'General Physician',
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      quote: 'The QR code prescriptions are brilliant. My patients love how easy it is to access their medications and instructions.',
      rating: 5
    }
  ];

  const typewriterTexts = [
    'organized and secure',
    'accessible anywhere',
    'AI-powered insights',
    'family-friendly',
    'doctor-approved'
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.05), transparent 40%)`
          }}
        />
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img className="h-8 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MediIndia</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How it Works', 'Testimonials'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors relative"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>
            <motion.div 
              className="flex space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/login">
                <Button variant="ghost" size="md">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="md">Get Started</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Zap size={16} className="mr-2" />
                  Trusted by 10,000+ patients
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="block">Your health records,</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent min-h-[1.2em]">
                  <TypewriterText 
                    texts={typewriterTexts}
                    speed={100}
                    deleteSpeed={50}
                    pauseTime={2000}
                  />
                </span>
              </motion.h1>
              
              <motion.p 
                className="mt-6 text-lg text-gray-600 sm:text-xl lg:text-lg xl:text-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                The most advanced digital health platform in India. Securely store, manage, and share your family's medical records with AI-powered insights and seamless doctor integration.
              </motion.p>
              
              <motion.div 
                className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="flex-1">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200" 
                        rightIcon={<ArrowRight size={18} />}
                      >
                        Start Free Today
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full border-2 hover:bg-gray-50"
                        leftIcon={<Play size={18} />}
                      >
                        Watch Demo
                      </Button>
                    </motion.div>
                  </Link>
                </div>
                
                <motion.div 
                  className="mt-6 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {['Free forever', 'No credit card', 'Setup in 2 minutes'].map((item, index) => (
                    <div key={item} className="flex items-center">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      {item}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <div className="relative mx-auto w-full rounded-lg">
                <motion.img
                  className="w-full rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5"
                  src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="MediIndia Dashboard"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20"></div>
                
                {/* Floating UI Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">Live Updates</span>
                  </div>
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-blue-500" />
                    <span className="text-xs font-medium text-gray-700">Secure</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section 
        className="py-12 bg-white relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for modern healthcare
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Built for patients, doctors, and healthcare providers with cutting-edge technology
            </p>
          </motion.div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <motion.div 
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <UserRound size={24} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">For Patients</h3>
                  <p className="text-gray-600">Complete health record management</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Store all medical records securely',
                  'Family health management',
                  'AI-powered health insights',
                  'Medication reminders'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle size={16} className="text-green-500 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <Stethoscope size={24} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">For Doctors</h3>
                  <p className="text-gray-600">Streamlined patient management</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Digital prescription creation',
                  'Patient record management',
                  'Appointment scheduling',
                  'Analytics and insights'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle size={16} className="text-green-500 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get started in minutes
            </p>
          </motion.div>

          <div className="mt-16">
            <div className="relative">
              <motion.div 
                className="absolute inset-0 flex items-center" 
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-full border-t border-gray-200"></div>
              </motion.div>
              
              <div className="relative flex justify-between">
                {[
                  { step: '1', title: 'Sign Up', desc: 'Create your account in seconds' },
                  { step: '2', title: 'Add Records', desc: 'Upload or create health records' },
                  { step: '3', title: 'Share Securely', desc: 'Control who sees your data' }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <motion.span 
                      className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold mx-auto shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {item.step}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      />
                    </motion.span>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by patients and doctors
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star size={16} className="text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <motion.img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.name}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="block">Ready to transform your healthcare?</span>
            <span className="block text-blue-200 mt-2">Join thousands of satisfied users today.</span>
          </motion.h2>
          <motion.p 
            className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Start managing your health records digitally and experience the future of healthcare management.
          </motion.p>
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Get Started Free
                </Button>
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <motion.p 
            className="mt-6 text-sm text-blue-200"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            No credit card required • Free forever • Setup in 2 minutes
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 relative z-10">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <img className="h-8 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
                <span className="ml-2 text-xl font-bold text-white">MediIndia</span>
              </div>
              <p className="mt-4 text-gray-400 text-sm max-w-md">
                Revolutionizing healthcare in India with secure, digital health record management for patients and healthcare providers.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-400">
                  Founded by <a href="https://www.linkedin.com/in/aarjav-shah-71bbb1265" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-400 hover:text-blue-300">Aarjav Shah</a>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Making healthcare accessible and secure for every Indian family
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</a></li>
                <li><a href="/signup" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-8 pt-8 border-t border-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-center text-sm text-gray-400">
              &copy; 2025 MediIndia. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;