import React, { useState } from 'react';
import { membersApi } from '../../api';
import { Button, VellumCard, LoadingSpinner } from '../common';
import toast from 'react-hot-toast';
import { KeyRound, X } from 'lucide-react';

interface JoinProjectModalProps {
  onJoin: () => void;
  onCancel: () => void;
}

export const JoinProjectModal: React.FC<JoinProjectModalProps> = ({ onJoin, onCancel }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await membersApi.joinProject(inviteCode.trim());
      toast.success(`Successfully joined project: ${res.project.name}`);
      onJoin();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join project. Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-deepline/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <VellumCard className="w-full max-w-md relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-graphite/40 hover:text-deepline hover:bg-graphite/5 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-bold text-2xl text-deepline mb-2">Join a Project</h2>
        <p className="font-body text-sm text-graphite/60 mb-6">
          Enter the invite code provided by the project owner to collaborate.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs text-graphite/50 uppercase tracking-widest mb-2">
              Invite Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                className="w-full bg-vellum border border-graphite/20 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-deepline focus:outline-none focus:border-linework focus:ring-1 focus:ring-linework transition-all placeholder:text-graphite/30"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite/10">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={!inviteCode.trim() || isSubmitting}>
              {isSubmitting ? <LoadingSpinner /> : 'Join Project'}
            </Button>
          </div>
        </form>
      </VellumCard>
    </div>
  );
};
