import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from '@/components/ui/Toast';

export const AuthShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Cyrcalur Logo" className="h-12 w-auto max-w-[220px] object-contain" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200/80 sm:px-10">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
