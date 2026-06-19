import React from 'react';
import { Link } from 'react-router-dom';
import { VellumCard } from '../components/common';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <VellumCard className="max-w-md w-full p-10 text-center border-dashed">
        <div className="flex justify-center mb-6">
          <FileQuestion className="w-16 h-16 text-graphite/40" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-2">404</h1>
        <p className="font-mono text-xs tracking-widest uppercase text-graphite/60 mb-8">
          File Not Found in Registry
        </p>
        <Link 
          to="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 bg-graphite text-vellum font-mono text-sm tracking-widest uppercase transition-colors hover:bg-linework hover:text-deepline"
        >
          Return to Dashboard
        </Link>
      </VellumCard>
    </div>
  );
};
