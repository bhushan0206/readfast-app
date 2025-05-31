import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, BookOpen, Sparkles, Star, Brain, Target, TrendingUp, Lightbulb, Clock, Award } from 'lucide-react';
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

const NewLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signInWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // OAuth redirect will handle the rest
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-neutral-900 dark:via-blue-900/10 dark:to-purple-900/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl"
        />
        
        {/* Floating reading elements */}
        {[...Array(12)].map((_, i) => {
          const icons = [BookOpen, Zap, Star, Brain, Target, TrendingUp];
          const IconComponent = icons[i % icons.length];
          
          return (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.8,
              }}
              className="absolute"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${15 + (i * 6)}%`,
              }}
            >
              <IconComponent size={10 + (i % 4) * 3} className={`${
                i % 6 === 0 ? 'text-blue-400/40' :
                i % 6 === 1 ? 'text-purple-400/40' :
                i % 6 === 2 ? 'text-indigo-400/40' :
                i % 6 === 3 ? 'text-pink-400/40' :
                i % 6 === 4 ? 'text-emerald-400/40' :
                'text-orange-400/40'
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
              className="space-y-8 lg:pr-8"
            >
              {/* Main Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center space-x-3 mb-6"
                >
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ReadFast AI
                  </h1>
                </motion.div>
                <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
                  Supercharge your reading with AI-powered speed reading technology
                </p>
              </motion.div>

              {/* Feature Cards */}
              <div className="grid gap-6">
                {/* AI Speed Reading Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"
                    >
                      <Zap className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        AI-Powered Speed Reading
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        Advanced algorithms adapt to your reading patterns and optimize text presentation for maximum comprehension and speed.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Smart Analytics Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg"
                    >
                      <TrendingUp className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        Smart Progress Analytics
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        AI tracks your reading metrics, comprehension rates, and provides personalized insights to improve your skills.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Adaptive Learning Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="p-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl shadow-lg"
                    >
                      <Target className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        Adaptive Learning System
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        Machine learning adjusts difficulty levels and training exercises based on your performance and learning style.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Smart Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-neutral-700/50 shadow-xl relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-start space-x-4">
                    <motion.div
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 6, repeat: Infinity }}
                      className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg"
                    >
                      <Lightbulb className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        AI Reading Recommendations
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        Get personalized content suggestions and reading strategies powered by AI to maximize your learning potential.
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
                className="grid grid-cols-3 gap-4 pt-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    3x
                  </motion.div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Faster Reading</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                  >
                    95%
                  </motion.div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Comprehension</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    50K+
                  </motion.div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Users</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Auth Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
            >
          {/* Main Login Card */}
          <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-neutral-700/50 relative overflow-hidden">
            {/* Sparkle decoration */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="w-6 h-6 text-yellow-400/60" />
            </motion.div>

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ReadFast
                </h1>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-neutral-600 dark:text-neutral-300 text-lg"
              >
                Welcome back! Ready to boost your reading speed?
              </motion.p>
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:shadow-lg ${
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
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
            transition={{ delay: 0.7 }}
          >
            <label className="block text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-white/80 dark:bg-neutral-700/80 backdrop-blur-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:shadow-lg ${
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

          {/* Sign In Button */}
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-neutral-400 disabled:via-neutral-500 disabled:to-neutral-600 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg relative overflow-hidden group"
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
                <span>Sign In</span>
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

        {/* Divider */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm text-neutral-500 dark:text-neutral-400 rounded-full">
                Or continue with
              </span>
            </div>
          </div>
        </motion.div>

        {/* Google Sign In */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            y: -2
          }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full bg-white/90 dark:bg-neutral-700/90 border-2 border-neutral-200 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-neutral-700 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 text-neutral-900 dark:text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg backdrop-blur-sm relative overflow-hidden group"
        >
          <motion.div
            animate={{ rotate: loading ? 360 : 0 }}
            transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
          >
            <GoogleIcon />
          </motion.div>
          <span>Continue with Google</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </motion.button>

        {/* Sign Up Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm text-neutral-500 dark:text-neutral-400 rounded-full">
                New to ReadFast?
              </span>
            </div>
          </div>
          
          <motion.div 
            className="mt-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/register" 
              className="inline-flex items-center space-x-2 font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={18} className="text-emerald-200" />
              </motion.div>
              <span>Create your account</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </Link>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-sm text-neutral-500 dark:text-neutral-400 mt-3"
          >
            Join thousands of speed readers improving their skills
          </motion.p>
        </motion.div>

        {/* Development Test Buttons */}
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
                try {
                  console.log('🧪 Testing with demo account...');
                  setEmail('test@demo.com');
                  setPassword('password123');
                  
                  // Try to sign up first, then sign in
                  try {
                    const { signUp } = useAuthStore.getState();
                    await signUp('test@demo.com', 'password123', 'Demo User');
                    console.log('✅ Demo account created');
                  } catch (signUpError: any) {
                    console.log('Demo account may already exist, trying to sign in...');
                  }
                  
                  await signIn('test@demo.com', 'password123');
                } catch (error: any) {
                  console.error('❌ Demo login error:', error);
                }
              }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs py-2.5 px-3 rounded-lg transition-all duration-200 font-medium shadow-sm"
            >
              🧪 Use Demo Account
            </motion.button>

            <motion.button
              type="button"
              onClick={async () => {
                console.log('🔍 Current auth state:');
                const { supabase } = await import('../../../services/auth');
                const { data: session } = await supabase.auth.getSession();
                const { user, profile, initialized, loading } = useAuthStore.getState();
                
                console.log('Session:', session);
                console.log('Store State:', { 
                  user: user?.email || 'none', 
                  profile: profile?.full_name || 'none', 
                  initialized, 
                  loading 
                });
                
                // Test Supabase connection
                const { data: testData, error } = await supabase.from('profiles').select('count').limit(1);
                console.log('Supabase connection test:', { data: testData, error });
              }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs py-2.5 px-3 rounded-lg transition-all duration-200 font-medium shadow-sm"
            >
              🔍 Debug Auth State
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

export default NewLogin;