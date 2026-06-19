import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { membersApi } from '../../api';
import { VellumCard, LoadingSpinner } from '../common';
import { InviteModal } from './InviteModal';
import type { ProjectMemberInfo, MemberRole } from '../../types';
import { Users, UserPlus, ChevronDown, ChevronUp, UserMinus, Crown, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface MembersPanelProps {
  projectId: string;
  userRole: MemberRole;
}

export const MembersPanel: React.FC<MembersPanelProps> = ({ projectId, userRole }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMemberInfo[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteEnabled, setInviteEnabled] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await membersApi.getMembers(projectId);
      setMembers(data.members);
      if (data.inviteCode) setInviteCode(data.inviteCode);
      if (data.inviteEnabled !== undefined) setInviteEnabled(data.inviteEnabled);
      if (data.inviteLink) setInviteLink(data.inviteLink);
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this project?`)) return;
    try {
      await membersApi.removeMember(projectId, userId);
      toast.success(`${name} has been removed`);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const isOwner = userRole === 'OWNER';

  return (
    <>
      <VellumCard className="!p-0 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-5 flex items-center justify-between bg-vellum/50 hover:bg-vellum/70 transition-colors text-left"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linework/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-linework" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-deepline">Team Members</h3>
              <p className="font-mono text-xs text-graphite/50 uppercase tracking-widest">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isOwner && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInviteModal(true);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setShowInviteModal(true); } }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-linework/10 text-linework font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-linework/20 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Invite
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-graphite/40" />
            ) : (
              <ChevronDown className="w-5 h-5 text-graphite/40" />
            )}
          </div>
        </button>

        {/* Members List */}
        {isExpanded && (
          <div className="border-t border-graphite/10">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ul className="divide-y divide-graphite/5" role="list">
                {members.map((member) => {
                  const isCurrentUser = member.userId === user?.id;
                  const isMemberOwner = member.role === 'OWNER';

                  return (
                    <li
                      key={member.userId}
                      className="flex items-center justify-between px-5 py-4 hover:bg-graphite/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.fullName}
                          className="w-9 h-9 rounded-full border-2 border-vellum object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-body text-sm font-semibold text-deepline truncate">
                              {member.fullName}
                            </span>
                            {isCurrentUser && (
                              <span className="font-mono text-[10px] text-linework bg-linework/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                you
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-graphite/50 uppercase tracking-widest">
                            Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider ${
                            isMemberOwner
                              ? 'bg-amber-flag/10 text-amber-flag'
                              : 'bg-graphite/10 text-graphite/60'
                          }`}
                        >
                          {isMemberOwner ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {member.role}
                        </span>

                        {isOwner && !isMemberOwner && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(member.userId, member.fullName)}
                            className="p-1.5 text-graphite/30 hover:text-signal-red transition-colors rounded-lg hover:bg-signal-red/10"
                            aria-label={`Remove ${member.fullName}`}
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </VellumCard>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          inviteCode={inviteCode}
          inviteEnabled={inviteEnabled}
          inviteLink={inviteLink}
          projectId={projectId}
          onClose={() => setShowInviteModal(false)}
          onUpdate={(data) => {
            setInviteCode(data.inviteCode);
            setInviteEnabled(data.inviteEnabled);
          }}
        />
      )}
    </>
  );
};
