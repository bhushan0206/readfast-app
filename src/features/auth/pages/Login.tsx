import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Github, ToggleLeft as Google } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, loginWithProvider, loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error is handled in the auth store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-secondary-100/30 dark:from-primary-900/30 dark:to-secondary-900/30" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5076531/pexels-photo-5076531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-10" />
      </div>

      <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-6">
        Sign in to your account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={18} />}
          autoComplete="email"
          required
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock size={18} />}
          autoComplete="current-password"
          required
        />

        <div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => loginWithProvider('google')}
            leftIcon={<Google size={18} />}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => loginWithProvider('github')}
            leftIcon={<Github size={18} />}
          >
            GitHub
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Create one now
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;