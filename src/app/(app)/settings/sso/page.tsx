"use client";

import React, { useState } from "react";
import { useIdentityProviders } from "@/modules/sso/hooks/useSso";
import { IdentityProviderFormModal } from "@/modules/sso/components/IdentityProviderFormModal";
import { IdentityProviderConfig } from "@/modules/sso/types";
import { Button } from "@/components/ui/Button";
import { getPublicApiBase } from "@/lib/api/baseUrl";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineKey, HiPencil, HiExternalLink } from "react-icons/hi";

export default function SsoAdminPage() {
  const { providers, isLoading, createProvider, updateProvider, refetch } = useIdentityProviders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<IdentityProviderConfig | null>(null);

  const handleSave = async (cmd: any) => {
    if (editingProvider) {
      await updateProvider(editingProvider.uid, cmd);
      toast.success("Identity provider updated.");
    } else {
      await createProvider(cmd);
      toast.success("Identity provider created.");
    }
    refetch();
  };

  const openCreate = () => {
    setEditingProvider(null);
    setIsFormOpen(true);
  };

  const openEdit = (provider: IdentityProviderConfig) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-ink/90">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <HiOutlineKey className="w-7 h-7 text-primary" /> SSO Admin
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Configure single sign-on so your firm&apos;s users can log in with their existing identity provider.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <HiPlus className="w-4.5 h-4.5" /> New Identity Provider
        </Button>
      </div>

      <div className="bg-surface border border-border/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto rates-scrollable">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-field">
              <tr>
                <th className="px-5 py-3.5 text-left font-bold text-ink/60 uppercase tracking-wider">Provider</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/60 uppercase tracking-wider">Client ID</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/60 uppercase tracking-wider">Email Domain</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/60 uppercase tracking-wider">Default Role</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/60 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/60 uppercase tracking-wider">Login URL</th>
                <th className="px-5 py-3.5 text-right font-bold text-ink/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-ink/80">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-field/20">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-field rounded w-5/6" />
                    </td>
                  </tr>
                ))
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink/60">
                    No identity providers configured yet. Click &quot;New Identity Provider&quot; to enable SSO.
                  </td>
                </tr>
              ) : (
                providers.map((p) => (
                  <tr key={p.uid} className="hover:bg-field/30 transition-colors">
                    <td className="px-5 py-4 text-ink font-extrabold">{p.providerName}</td>
                    <td className="px-5 py-4 text-ink/65 max-w-[180px] truncate">{p.clientId}</td>
                    <td className="px-5 py-4 text-ink/65">{p.emailDomain}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 border border-border/80 rounded bg-field text-ink/60 font-bold text-[10px] uppercase">
                        {p.defaultRoleName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-field text-ink/60 border border-border/60">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`${getPublicApiBase()}/api/oauth2/authorization/${p.providerName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-bold py-1.5 -my-1.5 rounded"
                      >
                        Test <HiExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 hover:bg-field rounded-lg text-ink/60 hover:text-ink/80 transition-colors"
                      >
                        <HiPencil className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IdentityProviderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        existingConfig={editingProvider}
      />
    </div>
  );
}
