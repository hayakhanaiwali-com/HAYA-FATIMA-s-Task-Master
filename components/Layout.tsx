import React from 'react';
import { CheckSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-slate-950">
      
      <div className="w-full max-w-2xl z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 space-x-3">
             <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                <CheckSquare className="text-white" size={28} />
             </div>
             <div>
                <h1 className="font-bold text-3xl tracking-tight text-white">Task<span className="text-emerald-400">Master</span></h1>
                <p className="text-slate-400 text-sm font-medium">Get things done, smarter.</p>
             </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
           {children}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-600 text-xs">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};