/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useClients } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { ClientFormModal } from "@/modules/firm/components/ClientFormModal";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiPlus, HiSearch, HiExternalLink } from "react-icons/hi";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { clients, isLoading, error, createClient } = useClients({ query: searchQuery });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: any) => {
    try {
      await createClient(data);
      toast.success("Client registered successfully.");
      setIsModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const getTierClass = (tier: string) => {
    switch (tier) {
      case "STRATEGIC":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "PREFERRED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-field text-ink/80 border-border/60";
    }
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Clients</h1>
          <p className="text-sm text-ink/55 mt-1">Manage institutional and corporate client profiles and configure client portal parameters.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-center"
        >
          <HiPlus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      <div className="relative max-w-md w-full">
        <HiSearch className="absolute left-4 top-3 text-ink/40 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients by name, contact or email..."
          className="w-full pl-11 pr-5 py-2.5 bg-surface border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-ink shadow-sm"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-16 bg-field rounded-xl" />
          <div className="h-16 bg-field rounded-xl" />
          <div className="h-16 bg-field rounded-xl" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border/60 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
          <span className="text-sm text-ink/55">
            {searchQuery ? "No clients match your search criteria." : "No clients registered yet. Click 'Add Client' to register one."}
          </span>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field text-xs font-bold text-ink/65 border-b border-border">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Tier Level</th>
                <th className="px-6 py-4">Primary Contact</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.uid} className="hover:bg-field/50 text-ink transition-colors">
                  <td className="px-6 py-4 font-bold">
                    <Link href={`/clients/${client.uid}`} className="hover:text-primary hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-ink/65 uppercase tracking-wide">
                    {client.type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTierClass(client.tier)}`}>
                      {client.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-ink text-xs">{client.contactName}</span>
                      <span className="text-[10px] text-ink/55 mt-0.5">{client.contactEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-ink/65">{client.country}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/clients/${client.uid}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      View Profile
                      <HiExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
