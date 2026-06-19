import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export const Layout = () => {
  const [gridVisible, setGridVisible] = useState(false);

  useEffect(() => {
    // Only fade in the grid once on first load
    setGridVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-deepline flex flex-col relative overflow-hidden">
      {/* Background grid lines */}
      <motion.div 
        className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: gridVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Navbar layer */}
      <Navbar />

      {/* Main content layer */}
      <main className="flex-1 relative z-10 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
