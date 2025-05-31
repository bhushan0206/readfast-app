import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Target, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import Button from '../../../shared/components/Button';

const Login: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSignUpMode = location.pathname === '/signup';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        
        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className={`absolute w-2 h-2 bg-gradient-to-r ${
              i % 3 === 0 ? 'from-blue-400 to-purple-400' :
              i % 3 === 1 ? 'from-purple-400 to-pink-400' :
              'from-pink-400 to-red-400'
            } rounded-full`}
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 10)}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Features & Branding */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left space-y-8"
            >
              {/* Logo & Title */}
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center justify-center lg:justify-start space-x-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-2 h-2 text-white" />
                    </motion.div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ReadFast
                  </h1>
                </motion.div>
                
                <motion.h2 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {isSignUpMode ? 'Start Your Reading Journey' : 'Welcome Back, Reader!'}
                </motion.h2>
                
                <motion.p 
                  className="text-lg text-neutral-600 dark:text-neutral-300 max-w-lg mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  {isSignUpMode 
                    ? 'Join thousands of readers improving their speed and comprehension with AI-powered insights.'
                    : 'Continue your journey to becoming a faster, more efficient reader.'
                  }
                </motion.p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
                {[
                  { icon: Zap, title: 'Speed Reading', desc: 'Boost your WPM', color: 'from-yellow-400 to-orange-500' },
                  { icon: Target, title: 'Track Progress', desc: 'Monitor your growth', color: 'from-green-400 to-blue-500' },
                  { icon: Users, title: 'Comprehension', desc: 'Understand better', color: 'from-purple-400 to-pink-500' },
                  { icon: BookOpen, title: 'Rich Library', desc: 'Diverse content', color: 'from-blue-400 to-indigo-500' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-neutral-700/50 shadow-lg"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-2`}>
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Auth Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-neutral-700/50 p-8 sm:p-10">
                <div className="text-center mb-8">
                  <motion.h3 
                    className="text-2xl font-bold text-neutral-900 dark:text-white mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {isSignUpMode ? 'Create Account' : 'Sign In'}
                  </motion.h3>
                  <motion.p 
                    className="text-neutral-600 dark:text-neutral-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {isSignUpMode ? 'Get started in seconds' : 'Welcome back to ReadFast'}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <Button
                    onClick={handleGoogleAuth}
                    className="w-full mb-6 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    leftIcon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    }
                  >
                    Continue with Google
                  </Button>

                  <div className="text-center">
                    <motion.p 
                      className="text-sm text-neutral-600 dark:text-neutral-400"
                      whileHover={{ scale: 1.05 }}
                    >
                      {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        onClick={() => navigate(isSignUpMode ? '/login' : '/signup')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors duration-200"
                      >
                        {isSignUpMode ? 'Sign In' : 'Sign Up'}
                      </button>
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;