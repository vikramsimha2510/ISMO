import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-linework animate-spin" />
      <span className="font-mono text-xs tracking-widest text-linework uppercase">
        Loading...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepline">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center p-8">{spinner}</div>;
};
