import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockStorage } from '@/services/mock-storage';
import { CheckCircle2, Circle, FileText, UserCheck, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';

export const OnboardingDashboardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const tasks = [
    { id: '1', name: 'Personal Details & Fun Fact', completed: true, path: `/${slug}/onboarding/details` },
    { id: '2', name: 'Offer Letter Review & External Signed Copy', completed: true, path: `/${slug}/onboarding/offer` },
    { id: '3', name: 'Required Documents Submission', completed: false, path: `/${slug}/onboarding/documents` },
    { id: '4', name: 'Policy Acknowledgement (Name, Place, Date)', completed: true, path: `/${slug}/onboarding/acknowledgement` },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-md border border-indigo-500/40">
            Pre-Employment Onboarding
          </span>
          <h2 className="text-2xl font-bold mt-2">Welcome to {currentTenant.name}, {currentUser.name}!</h2>
          <p className="text-xs text-slate-300 mt-1">
            Complete your required onboarding tasks below to prepare for your first day.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center shrink-0">
          <p className="text-xs font-semibold text-indigo-200 uppercase">Onboarding Completion</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{progressPct}%</h3>
          <p className="text-[11px] text-slate-300 mt-0.5">{completedCount} of {tasks.length} tasks done</p>
        </div>
      </div>

      {/* Task Checklist Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" /> Onboarding Checklist Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-all"
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{task.name}</h4>
                  <span className="text-xs text-slate-500">
                    {task.completed ? 'Completed' : 'Pending Action'}
                  </span>
                </div>
              </div>

              <Link to={task.path}>
                <Button variant={task.completed ? 'outline' : 'primary'} size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {task.completed ? 'Review' : 'Start Task'}
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
