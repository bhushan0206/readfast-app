import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { fullName?: string; email?: string; password?: string } = {};
    let isValid = true;

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (error) {
      // Error is handled in the auth store
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-6">Create an account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          id="fullName"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          leftIcon={<User size={18} />}
          autoComplete="name"
          required
        />
        
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
          autoComplete="new-password"
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
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;