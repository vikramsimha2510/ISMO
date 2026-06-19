import React, { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  highlight?: 'green' | 'amber' | 'red' | 'none';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, highlight = 'none' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 600; // 600ms
    const increment = value / (duration / 16); // 60fps
    
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const highlightColors = {
    none: 'text-graphite',
    green: 'text-stamp-green',
    amber: 'text-amber-flag',
    red: 'text-signal-red',
  };

  return (
    <div className="flex flex-col justify-center p-6 h-full bg-vellum/50 group hover:bg-vellum transition-colors">
      <span className="font-mono text-xs tracking-widest text-graphite/70 uppercase mb-2">
        {label}
      </span>
      <span className={`font-display text-4xl font-bold ${highlightColors[highlight]}`}>
        {displayValue}
      </span>
    </div>
  );
};
