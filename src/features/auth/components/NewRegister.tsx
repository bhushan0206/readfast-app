import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Zap, BookOpen, Sparkles, Star, Brain, Target, TrendingUp, Lightbulb, Clock, Award, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../stores/authStore';

// Google Icon Component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const NewRegister: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp, signInWithGoogle, loading } = useAuthStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      console.log('🚀 Starting registration process...');
      console.log('Email:', email);
      console.log('Full Name:', fullName);
      
      await signUp(email, password, fullName);
      
      console.log('✅ Registration completed successfully');
    } catch (error: unknown) {
      console.error('❌ Registration error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      setErrors({ submit: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-neutral-900 dark:via-emerald-900/10 dark:to-blue-900/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -60, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/30 to-blue-200/30 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -90, 0],
            y: [0, 90, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-purple-200/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl"
        />
        
        {/* Floating elements */}
        {[...Array(12)].map((_, i) => {
          const icons = [UserPlus, BookOpen, Zap, Star, Brain, Target];
          const IconComponent = icons[i % icons.length];
          
          return (
            <motion.div
              key={i}
              animate={{
                y: [0, -25, 0],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 360],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.7,
              }}
              className="absolute"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${15 + (i * 7)}%`,
              }}
            >
              <IconComponent size={10 + (i % 4) * 3} className={`${
                i % 6 === 0 ? 'text-emerald-400/50' :
                i % 6 === 1 ? 'text-blue-400/50' :
                i % 6 === 2 ? 'text-purple-400/50' :
                i % 6 === 3 ? 'text-pink-400/50' :
                i % 6 === 4 ? 'text-indigo-400/50' :
                'text-orange-400/50'
              }`} />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen items-center">
            
            {/* Left Side - Feature Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 lg:pr-8 order-2 lg:order-1"
            >
              {/* Main Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center space-x-2 mb-4"
                >
                  <div className="p-3 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl shadow-lg">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Join ReadFast
                  </h1>
                </motion.div>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                  Start your journey to faster reading with AI-powered technology
                </p>
              </motion.div>

              {/* Feature Cards - 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personalized Training Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg shadow-lg flex-shrink-0"
                    >
                      <Target className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                        Personalized Training Plans
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                        AI creates custom reading exercises based on your skill level.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Real-time Progress Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0"
                    >
                      <TrendingUp className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                        Real-time Progress Tracking
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                        Watch your reading speed improve with detailed analytics.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Smart Content Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-3">
                    <motion.div
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg flex-shrink-0"
                    >
                      <Brain className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                        Smart Content Curation
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                        AI selects reading materials matched to your interests.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Achievement System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-2 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg shadow-lg flex-shrink-0"
                    >
                      <Award className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                        Achievement & Rewards System
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                        Earn badges and unlock features as you master speed reading.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="grid grid-cols-3 gap-3 pt-4"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-3 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
                  >
                    Free
                  </motion.div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Forever Plan</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-3 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    24/7
                  </motion.div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">AI Support</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-3 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    30s
                  </motion.div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Quick Setup</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto order-1 lg:order-2"
            >
              {/* Main Registration Card */}
              <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-neutral-700/50 relative overflow-hidden">
                {/* Sparkle decoration */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-3 right-3"
                >
                  <Sparkles className="w-5 h-5 text-emerald-400/60" />
                </motion.div>

                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-2 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl shadow-lg"
                    >
                      <UserPlus className="w-6 h-6 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Create Account
                    </h1>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-neutral-600 dark:text-neutral-300 text-sm"
                  >
                    Start your speed reading journey today!
                  </motion.p>
                </motion.div>

                {/* Error Display */}
                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
                    >
                      {errors.submit}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Sign Up Button */}
                <motion.button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                    y: -2
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-4 w-full bg-white/90 dark:bg-neutral-700/90 border-2 border-neutral-200 dark:border-neutral-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-neutral-700 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 text-neutral-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg backdrop-blur-sm relative overflow-hidden group text-sm"
                >
                  <motion.div
                    animate={{ rotate: loading ? 360 : 0 }}
                    transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
                  >
                    <GoogleIcon />
                  </motion.div>
                  <span>Continue with Google</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.button>

                {/* Divider */}
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm text-neutral-500 dark:text-neutral-400 rounded-full">
                        Or create with email
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Registration Form */}
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onSubmit={handleSubmit}
                  className="space-y-3"
                >
                  {/* Full Name Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block text-xs font-medium bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className={`w-full pl-9 pr-4 py-2.5 border-2 rounded-lg bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 hover:shadow-lg text-sm ${
                          errors.fullName ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                        disabled={loading}
                      />
                      <motion.div
                        initial={false}
                        animate={{ 
                          scale: fullName ? 1 : 0,
                          opacity: fullName ? 1 : 0 
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-500"
                        >
                          {errors.fullName}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="block text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full pl-9 pr-4 py-2.5 border-2 rounded-lg bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:shadow-lg text-sm ${
                          errors.email ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                        disabled={loading}
                      />
                      <motion.div
                        initial={false}
                        animate={{ 
                          scale: email ? 1 : 0,
                          opacity: email ? 1 : 0 
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-500"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="block text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-purple-500 transition-colors" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className={`w-full pl-9 pr-10 py-2.5 border-2 rounded-lg bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg text-sm ${
                          errors.password ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                        disabled={loading}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-purple-500 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-500"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <label className="block text-xs font-medium bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-1">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-pink-500 transition-colors" size={16} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className={`w-full pl-9 pr-10 py-2.5 border-2 rounded-lg bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300 hover:shadow-lg text-sm ${
                          errors.confirmPassword ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                        disabled={loading}
                      />
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <motion.div
                          initial={false}
                          animate={{ 
                            scale: confirmPassword && password && confirmPassword === password ? 1 : 0,
                            opacity: confirmPassword && password && confirmPassword === password ? 1 : 0 
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        </motion.div>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-pink-500 transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-500"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Create Account Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(16, 185, 129, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 disabled:from-neutral-400 disabled:via-neutral-500 disabled:to-neutral-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg relative overflow-hidden group text-sm"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                      animate={{
                        x: loading ? ['-100%', '100%'] : '0%'
                      }}
                      transition={{
                        duration: loading ? 1.5 : 0,
                        repeat: loading ? Infinity : 0,
                        ease: "linear"
                      }}
                    />
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Create Account</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </span>
                    )}
                  </motion.button>
                </motion.form>

                {/* Sign In Link */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="mt-4 text-center"
                >
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>

                {/* Development Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-6 space-y-2 border-t border-neutral-200/50 dark:border-neutral-600/50 pt-4"
                  >
                    <motion.p 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-neutral-500 text-center font-medium"
                    >
                      🛠️ Development Tools
                    </motion.p>
                    
                    <motion.button
                      type="button"
                      onClick={async () => {
                        console.log('🔍 Checking Supabase auth settings...');
                        const { supabase } = await import('../../../services/auth');
                        
                        try {
                          // Check current session
                          const { data: session } = await supabase.auth.getSession();
                          console.log('Current session:', session);
                          
                          // Check auth settings
                          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
                            headers: {
                              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                            }
                          });
                          
                          if (response.ok) {
                            const settings = await response.json();
                            console.log('Auth settings:', settings);
                          }
                          
                          // Test with demo account
                          const testResult = await supabase.auth.signUp({
                            email: 'test+' + Date.now() + '@demo.com',
                            password: 'password123',
                            options: {
                              data: {
                                full_name: 'Test User'
                              }
                            }
                          });
                          
                          console.log('Test signup result:', testResult);
                          
                        } catch (error) {
                          console.error('Debug error:', error);
                        }
                      }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs py-2.5 px-3 rounded-lg transition-all duration-200 font-medium shadow-sm"
                    >
                      🔍 Debug Auth Settings
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRegister;