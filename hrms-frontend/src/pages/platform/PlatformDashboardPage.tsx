import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";
import { mockStorage, KEYS } from "@/services/mock-storage";
import { Ticket } from "@/demo-data/seedData";
import { Building2, Users2, ShieldCheck, Activity, Bug, LifeBuoy, CheckCircle2, Clock, Eye, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const PlatformDashboardPage: React.FC = () => {
  const tenants = mockStorage.getTenants();
  const users = mockStorage.getUsers();

  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const consultants = users.filter((u) => u.role === "CONSULTANT").length;
  const totalEmployees = tenants.reduce((acc, t) => acc + t.employeeCount, 0);

  // Platform Tickets reported by Tenant Admins / HR
  const [allTickets, setAllTickets] = useState<Ticket[]>(() =>
    mockStorage.getTenantItems<Ticket>(KEYS.TICKETS)
  );

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<Ticket["status"]>("IN_PROGRESS");

  const platformTickets = useMemo(() => {
    return allTickets.filter(
      (t) =>
        t.targetScope === "PLATFORM_SUPER_ADMIN" ||
        t.category.includes("Platform") ||
        t.category.includes("Bug") ||
        t.category.includes("Glitch") ||
        t.category.includes("Difficulty")
    );
  }, [allTickets]);

  const openBugTicketsCount = platformTickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  ).length;

  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const updatedComments = [...(selectedTicket.comments || [])];
    if (adminResponse.trim()) {
      updatedComments.push({
        id: `comm-${Date.now()}`,
        authorName: "Platform Super Admin",
        authorRole: "SUPER_ADMIN",
        content: adminResponse.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const updated: Ticket = {
      ...selectedTicket,
      status: newStatus,
      comments: updatedComments,
    };

    mockStorage.updateTenantItem<Ticket>(KEYS.TICKETS, selectedTicket.id, updated);
    setAllTickets(mockStorage.getTenantItems<Ticket>(KEYS.TICKETS));
    setSelectedTicket(null);
    setAdminResponse("");
    toast.success(`🎉 Platform Ticket #${selectedTicket.ticketNumber} updated to ${newStatus}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Platform Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Super Admin platform overview, tenant management, and platform bug ticket controls.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tenants
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {tenants.length}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="font-semibold text-emerald-600">
              {activeTenants} active
            </span>{" "}
            • {tenants.length - activeTenants} inactive
          </p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Tenants
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {activeTenants}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            100% platform availability
          </p>
        </Card>

        <Card className="border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Platform Bug Tickets
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {openBugTicketsCount}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Bug className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="font-semibold text-rose-600">{openBugTicketsCount} open</span> reported by Company Admins
          </p>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Managed Users
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalEmployees + users.length}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Across all customer organizations
          </p>
        </Card>
      </div>

      {/* PLATFORM BUG TICKETS SECTION (Sent by Company Admins & HR) */}
      <Card className="border border-rose-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-rose-50/40 border-b border-rose-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base text-slate-900">Platform Support Tickets & Bug Reports</CardTitle>
                <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
                  Direct Super Admin Inbox
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bug reports, software glitches, and assistance requests submitted by Company Admins & HR.
              </p>
            </div>
          </div>

          <Link to="/admin/tickets">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="bg-white font-bold text-xs">
              View All Support Tickets
            </Button>
          </Link>
        </CardHeader>

        <div className="divide-y divide-slate-100">
          {platformTickets.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">All Clear! No Platform Bugs Reported</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tickets reported by Company Admins and HR directly to Super Admin will appear here in real-time.
              </p>
            </div>
          ) : (
            platformTickets.map((tkt) => {
              const isUrgent = tkt.priority === "HIGH" || tkt.priority === "URGENT";
              return (
                <div
                  key={tkt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                        {tkt.ticketNumber}
                      </span>
                      {tkt.tenantName && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded border border-indigo-100 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{tkt.tenantName}</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] font-semibold rounded">
                        {tkt.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          isUrgent ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tkt.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{tkt.subject}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{tkt.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>Reported by: <strong className="text-slate-700">{tkt.createdByName}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(tkt.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge status={tkt.status} />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(tkt);
                        setNewStatus(tkt.status);
                        setAdminResponse("");
                      }}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="bg-slate-900 hover:bg-slate-800 font-bold text-xs shadow-2xs"
                    >
                      Resolve Bug
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Tenants Table Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Tenants</CardTitle>
            <CardContent className="p-0">
              <p className="text-xs text-slate-500 mt-0.5">
                Recently updated companies on Peopleworkplaces platform
              </p>
            </CardContent>
          </div>
          <Link
            to="/admin/tenants"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View All Tenants →
          </Link>
        </CardHeader>

        <div className="divide-y divide-slate-100">
          {tenants.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                No companies or tenants provisioned yet.
              </p>
              <Link to="/admin/tenants/new">
                <Button variant="primary" size="sm" className="text-xs">
                  Provision First Company / Tenant →
                </Button>
              </Link>
            </div>
          ) : (
            tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt={tenant.name}
                      className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-1"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
                      {tenant.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {tenant.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Peopleworkplaces.hr/{tenant.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge status={tenant.status} />
                  <Link
                    to={`/admin/tenants/${tenant.id}`}
                    className="text-xs font-medium text-slate-600 hover:text-indigo-600 hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* SUPER ADMIN BUG RESOLUTION MODAL */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Platform Bug Resolution: ${selectedTicket.ticketNumber}` : "Resolve Ticket"}
        description="Inspect details, update resolution status, and send an official Super Admin reply."
        maxWidth="2xl"
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs pt-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{selectedTicket.subject}</span>
                <Badge status={selectedTicket.status} />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
                <span>Company: <strong className="text-slate-900">{selectedTicket.tenantName || "Company Portal"}</strong></span>
                <span>•</span>
                <span>Reporter: <strong className="text-slate-900">{selectedTicket.createdByName}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-indigo-600">{selectedTicket.category}</strong></span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs leading-relaxed font-mono">
                {selectedTicket.description}
              </div>
            </div>

            {/* Conversation Log */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ticket Discussion & Resolution History</span>
              </span>

              <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-100/70 rounded-xl border border-slate-200">
                {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                  selectedTicket.comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{c.authorName} ({c.authorRole})</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-2">No comments recorded yet.</p>
                )}
              </div>
            </div>

            {/* Super Admin Update Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Ticket Status</label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  options={[
                    { value: "OPEN", label: "🟡 Open / Pending Investigation" },
                    { value: "IN_PROGRESS", label: "🔵 In Progress (Fixing)" },
                    { value: "RESOLVED", label: "🟢 Resolved / Fix Deployed" },
                    { value: "CLOSED", label: "⚪ Closed" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Response</label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Post resolution notes or fix confirmation..."
                  className="w-full h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-slate-900 font-bold">
                Save & Update Ticket
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
