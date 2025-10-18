// Landing Redirect Component
// Professional redirect page for users coming from landing page

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingRedirect = ({ planId = 'founders-circle' }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to upgrade
        setRedirecting(true);
        setTimeout(() => {
          navigate('/?upgrade=' + planId);
        }, 2000);
      } else {
        // User not logged in, redirect to signup
        setRedirecting(true);
        setTimeout(() => {
          navigate('/?signup=true&plan=' + planId);
        }, 2000);
      }
    }
  }, [user, loading, navigate, planId]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl mb-2">Setting up your account...</h2>
          <p className="text-gray-400">
            {user ? 'Redirecting to upgrade...' : 'Redirecting to signup...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl mb-4">Welcome to Freedom Compass!</h1>
        <p className="text-gray-400">Redirecting you to the app...</p>
      </div>
    </div>
  );
};

export default LandingRedirect;
