"use client";

import React, { useState } from "react";
import { UserPlus, Mail, Trash2, Clock } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { MemberRole } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function TeamSettingsPage() {
  const {
    memberships: members,
    invitations,
    currentUser,
    inviteMember,
    revokeInvitation,
    updateMemberRole,
    removeMember,
  } = useStore();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");
  const [inviteError, setInviteError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  /**
   * Awaited: the modal must not close until the row is written. The duplicate
   * checks above only see loaded state, and the table enforces its own
   * UNIQUE (org_id, email) — a collision surfaces here rather than closing the
   * modal on an invitation that was never created.
   */
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    if (members.some((m) => m.profile?.email.toLowerCase() === email)) {
      setInviteError("That person is already a member of this workspace.");
      return;
    }
    if (invitations.some((inv) => inv.email.toLowerCase() === email)) {
      setInviteError("An invitation has already been sent to that address.");
      return;
    }

    setInviteError("");
    setIsInviting(true);
    try {
      await inviteMember(email, inviteRole);
      setInviteEmail("");
      setInviteRole("member");
      setIsInviteModalOpen(false);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsInviting(false);
    }
  };

  /**
   * These three write and then let the store report failure: it re-reads the
   * workspace on error and renders the message in the WorkspaceGate banner, so
   * the row reappears if the delete was rejected. The catch is only here to
   * keep a rejection from becoming an unhandled promise rejection.
   */
  const reportedByStore = () => {};

  const handleRemoveMember = (membershipId: string, name?: string) => {
    if (!confirm(`Remove ${name || "this member"} from the workspace?`)) return;
    removeMember(membershipId).catch(reportedByStore);
  };

  return (
    <div className="space-y-6">
      {/* Team Members Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Team Members</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              People in your organization with access to submit orders and review deliverables.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setInviteError("");
              setIsInviteModalOpen(true);
            }}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Invite Member
          </Button>
        </div>

        {/* Members Table */}
        <div className="divide-y divide-neutral-100">
          {members.map((member) => {
            const isOwner = member.role === "owner";
            const isSelf = member.user_id === currentUser.id;

            return (
              <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={member.profile?.avatar_url}
                    alt={member.profile?.full_name}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-200"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 truncate">
                      {member.profile?.full_name}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] font-semibold text-neutral-400">
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {member.profile?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOwner ? (
                    <span className="text-xs px-2.5 py-1 rounded-lg font-bold capitalize bg-neutral-900 text-white">
                      Owner
                    </span>
                  ) : (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateMemberRole(
                            member.id,
                            e.target.value as MemberRole
                          ).catch(reportedByStore)
                        }
                        className="h-8 px-2 bg-white text-neutral-900 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-semibold capitalize cursor-pointer"
                        aria-label={`Role for ${member.profile?.full_name}`}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleRemoveMember(member.id, member.profile?.full_name)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                        title="Remove from workspace"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Card */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Pending Invitations ({invitations.length})
            </h3>
            <p className="text-xs text-neutral-500">Invitations expire in 7 days.</p>
          </div>

          <div className="divide-y divide-neutral-100">
            {invitations.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-neutral-900">{inv.email}</span>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Invited as{" "}
                    <strong className="text-neutral-700 capitalize">{inv.role}</strong> by{" "}
                    {inv.invited_by}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200/60 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                  <button
                    onClick={() => revokeInvitation(inv.id).catch(reportedByStore)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                    title="Revoke Invite"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        description="Send an email invite to collaborate on your client dashboard."
        maxWidth="md"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@yourcompany.com"
            value={inviteEmail}
            onChange={(e) => {
              setInviteEmail(e.target.value);
              setInviteError("");
            }}
            leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
            required
          />

          {inviteError && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {inviteError}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">Workspace Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="w-full h-10 px-3.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-medium cursor-pointer"
            >
              <option value="member">Member (Can order &amp; review content)</option>
              <option value="admin">Admin (Can manage team &amp; billing)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isInviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
