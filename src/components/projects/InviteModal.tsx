import React, { useState } from 'react';
import { membersApi } from '../../api';
import { VellumCard } from '../common';
import { Copy, Check, RefreshCw, X, Link2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteModalProps {
  inviteCode: string;
  inviteEnabled: boolean;
  inviteLink: string;
  projectId: string;
  onClose: () => void;
  onUpdate: (data: { inviteCode: string; inviteEnabled: boolean }) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  inviteCode,
  inviteEnabled,
  inviteLink,
  projectId,
  onClose,
  onUpdate,
}) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Format code with center dot: ABCD·1234
  const formattedCode =
    inviteCode.length > 4
      ? `${inviteCode.slice(0, 4)}·${inviteCode.slice(4)}`
      : inviteCode;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate the invite code? The old code will stop working.')) return;
    try {
      setIsRegenerating(true);
      const result = await membersApi.regenerateInvite(projectId);
      onUpdate(result);
      toast.success('Invite code regenerated');
    } catch {
      toast.error('Failed to regenerate invite');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      const result = await membersApi.toggleInvite(projectId);
      onUpdate(result);
    } catch {
      toast.error('Failed to toggle invites');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-deepline/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Invite to project"
    >
      <div onClick={(e) => e.stopPropagation()}>
      <VellumCard
        className="w-full max-w-md p-6 sm:p-8 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-graphite/40 hover:text-graphite transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-2xl font-bold text-deepline mb-6">
          Invite to Linework
        </h2>

        {/* Invite Code Display */}
        <div className="mb-6">
          <p className="font-mono text-xs text-graphite/60 uppercase tracking-widest mb-3">
            Share this code
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-deepline/5 border border-graphite/15 rounded-xl px-5 py-4 text-center">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-deepline tracking-[0.15em] select-all">
                {formattedCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-3 rounded-xl border transition-all duration-200 shrink-0 ${
                codeCopied
                  ? 'bg-stamp-green/10 border-stamp-green/30 text-stamp-green'
                  : 'bg-graphite/5 border-graphite/15 text-graphite/60 hover:border-linework hover:text-linework'
              }`}
              aria-label="Copy invite code"
            >
              {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Copy Link */}
        <div className="mb-8">
          <p className="font-mono text-xs text-graphite/60 uppercase tracking-widest mb-3">
            Or share the link
          </p>
          <button
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-mono text-sm uppercase tracking-widest transition-all duration-200 ${
              linkCopied
                ? 'bg-stamp-green/10 border-stamp-green/30 text-stamp-green'
                : 'bg-graphite/5 border-graphite/15 text-graphite/70 hover:border-linework hover:text-linework'
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4" /> Copied ✓
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" /> Copy Invite Link
              </>
            )}
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-graphite/10">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-graphite/70 hover:text-deepline transition-colors disabled:opacity-50"
          >
            {inviteEnabled ? (
              <ToggleRight className="w-5 h-5 text-stamp-green" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-graphite/40" />
            )}
            {inviteEnabled ? 'Invites enabled' : 'Invites disabled'}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-graphite/50 hover:text-signal-red transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </VellumCard>
      </div>
    </div>
  );
};
