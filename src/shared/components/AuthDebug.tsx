import React from 'react';
import { useAuthStore } from '../../store/authStore';

const AuthDebug: React.FC = () => {
  const { user, profile, initialized, loading } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="text-yellow-400 font-bold mb-2">🐛 Auth Debug</div>
      <div>Initialized: {initialized ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '🔄' : '✅'}</div>
      <div>User: {user ? '✅' : '❌'}</div>
      {user && (
        <div className="text-green-400">
          Email: {user.email}
          <br />
          ID: {user.id?.slice(0, 8)}...
        </div>
      )}
      <div>Profile: {profile ? '✅' : '❌'}</div>
      {profile && (
        <div className="text-blue-400">
          Name: {profile.full_name || 'N/A'}
        </div>
      )}
    </div>
  );
};

export default AuthDebug;