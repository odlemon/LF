/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, use } from "react";
import { useClientDetail } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiArrowLeft, HiMail, HiUser, HiPlus, HiLockOpen, HiCheck, HiX, HiPencil } from "react-icons/hi";
import { Select } from "@/components/ui/Select";
import { AuditTrailPanel } from "@/components/shared/AuditTrailPanel";

interface ClientDetailPageProps {
  params: Promise<{ uid: string }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { uid } = use(params);
  const { client, portalUsers, isLoading, error, updateClient, invitePortalUser } = useClientDetail(uid);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<any>("CORPORATE");
  const [tier, setTier] = useState<any>("STANDARD");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("GB");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInvitingUser, setIsInvitingUser] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setType(client.type);
      setTier(client.tier);
      setContactName(client.contactName);
      setContactEmail(client.contactEmail);
      setCountry(client.country);
    }
  }, [client]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-6 bg-gray-250 w-1/4 rounded-lg" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 max-w-4xl w-full mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error || "Client profile not found."}
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactName.trim() || !contactEmail.trim()) {
      toast.error("Required fields cannot be empty.");
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateClient({
        name,
        type,
        tier,
        contactName,
        contactEmail,
        country,
      });
      toast.success("Client profile updated.");
      setIsEditingProfile(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Please enter a name and email.");
      return;
    }
    setIsInvitingUser(true);
    try {
      await invitePortalUser({ name: inviteName, email: inviteEmail });
      toast.success(`Portal invitation dispatched to ${inviteEmail}.`);
      setIsInviteModalOpen(false);
      setInviteName("");
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to invite portal user.");
    } finally {
      setIsInvitingUser(false);
    }
  };

  const getTierClass = (t: string) => {
    switch (t) {
      case "STRATEGIC":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "PREFERRED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-150 text-gray-700 border-gray-200/60";
    }
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <HiArrowLeft className="w-3.5 h-3.5" />
          Back to Clients
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{client.name}</h1>
            <div className="flex items-center gap-2.5 mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getTierClass(client.tier)}`}>
                {client.tier}
              </span>
              <span className="text-xs text-gray-500 font-medium capitalize">
                {client.type.toLowerCase().replace("_", " ")}
              </span>
            </div>
          </div>
          {!isEditingProfile && (
            <Button variant="secondary" onClick={() => setIsEditingProfile(true)}>
              <HiPencil className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Client Details
          </h2>

          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Client Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </label>
                  <Select
                    value={type}
                    onChange={(val) => setType(val as any)}
                    options={[
                      { value: "CORPORATE", label: "Corporate" },
                      { value: "INDIVIDUAL", label: "Individual" },
                      { value: "GOVERNMENT", label: "Government" },
                      { value: "FINANCIAL_INSTITUTION", label: "Financial Institution" },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tier
                  </label>
                  <Select
                    value={tier}
                    onChange={(val) => setTier(val as any)}
                    options={[
                      { value: "STANDARD", label: "Standard" },
                      { value: "PREFERRED", label: "Preferred" },
                      { value: "STRATEGIC", label: "Strategic" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Country (ISO)
                  </label>
                  <Select
                    value={country}
                    onChange={setCountry}
                    options={[
                      { value: "GB", label: "United Kingdom (GB)" },
                      { value: "US", label: "United States (US)" },
                      { value: "DE", label: "Germany (DE)" },
                      { value: "FR", label: "France (FR)" },
                      { value: "ZA", label: "South Africa (ZA)" },
                      { value: "AU", label: "Australia (AU)" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isSavingProfile}>
                  Save Details
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-5 text-sm text-gray-900">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Contact</span>
                <span className="font-semibold text-gray-900">{client.contactName}</span>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country</span>
                <span className="font-semibold text-gray-900">{client.country}</span>
              </div>

              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Email</span>
                <span className="font-medium text-gray-700 flex items-center gap-1.5">
                  <HiMail className="w-4 h-4 text-gray-400" />
                  {client.contactEmail}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Portal Logins</h2>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              <HiPlus className="w-3.5 h-3.5" />
              Invite
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {portalUsers.length === 0 ? (
              <div className="text-center py-6 bg-gray-55 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500">
                No portal users configured. Click &apos;Invite&apos; to authorize client representatives.
              </div>
            ) : (
              portalUsers.map((user) => (
                <div
                  key={user.uid}
                  className="p-3.5 border border-gray-100 hover:border-gray-200 rounded-xl flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                      <HiUser className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-gray-900 truncate leading-tight">{user.name}</span>
                      <span className="text-[10px] text-gray-500 truncate mt-0.5">{user.email}</span>
                    </div>
                  </div>
                  <span>
                    {user.active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                        Pending
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity History timeline compliance panel */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mt-2">
        <AuditTrailPanel entityUid={uid} title="Client Account Activity History" />
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 relative animate-fade-in-up border border-gray-100 z-50">
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <HiLockOpen className="w-5 h-5 text-primary" />
              Invite Client Contact
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Authorize {client.name} contacts to view pricing requests, scoping, and negotiate bids directly.
            </p>

            <form onSubmit={handleInviteUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. john@astrazeneca.com"
                  className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-4 pt-3.5 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsInviteModalOpen(false)}
                  disabled={isInvitingUser}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isInvitingUser}>
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
