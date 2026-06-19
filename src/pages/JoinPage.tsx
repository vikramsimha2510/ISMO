import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { membersApi } from '../api';
import { LoadingSpinner } from '../components/common';
import { CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const code = searchParams.get('code') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthenticated'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setErrorMessage('No invite code provided. Please check your invite link.');
      return;
    }

    if (!isAuthenticated) {
      // Store the code for after login
      sessionStorage.setItem('pendingInviteCode', code);
      setStatus('unauthenticated');
      return;
    }

    // Auto-join
    const joinProject = async () => {
      try {
        setStatus('loading');
        const result = await membersApi.joinProject(code);
        setProjectName(result.project.name);
        setStatus('success');
        toast.success(`You joined "${result.project.name}"`);
        // Redirect after a brief moment
        setTimeout(() => {
          navigate(`/projects/${result.project.id}`);
        }, 1500);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 'Failed to join project. The invite code may be invalid or expired.',
        );
      }
    };

    joinProject();
  }, [code, isAuthenticated, navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-deepline p-4">
      <div className="absolute inset-0 blueprint-bg pointer-events-none opacity-50"></div>

      <section className="glass-panel rounded-2xl p-8 sm:p-10 max-w-md w-full relative z-10 text-center" aria-live="polite">
        {status === 'loading' && (
          <div className="space-y-6">
            <LoadingSpinner />
            <p className="font-mono text-sm text-linework tracking-widest uppercase">Joining project...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-stamp-green/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-stamp-green" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-vellum mb-2">You're in!</h1>
              <p className="font-body text-vellum/70">
                Successfully joined <strong className="text-linework">{projectName}</strong>
              </p>
            </div>
            <p className="font-mono text-xs text-vellum/40 tracking-widest uppercase">Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-signal-red/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-signal-red" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-vellum mb-2">Couldn't Join</h1>
              <p className="font-body text-vellum/70">{errorMessage}</p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linework text-deepline font-mono text-sm uppercase tracking-widest font-bold rounded-lg hover:bg-linework-text transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-linework/20 flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-linework" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-vellum mb-2">Login Required</h1>
              <p className="font-body text-vellum/70">
                You need to be logged in to join this project. Log in and we'll bring you right back.
              </p>
            </div>
            <Link
              to={`/login`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-linework text-deepline font-mono text-sm uppercase tracking-widest font-bold rounded-lg hover:bg-linework-text transition-colors"
            >
              <LogIn className="w-4 h-4" /> Log In
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
