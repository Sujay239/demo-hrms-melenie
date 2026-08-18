import React from 'react';
import { cn } from '@/utils/cn';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-10 h-10 text-slate-300" />,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 space-y-3', className)}>
      <div className="p-3 bg-slate-50 rounded-full border border-slate-100">{icon}</div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
