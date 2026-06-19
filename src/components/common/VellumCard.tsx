import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface VellumCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const VellumCard: React.FC<VellumCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = false,
  ...props 
}) => {
  const hoverProps = hoverable ? {
    whileHover: { y: -2 },
    transition: { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.15 }
  } : {};

  return (
    <motion.div
      {...hoverProps}
      {...props}
      onClick={onClick}
      className={`
        bg-vellum text-graphite group corner-ticks relative
        ${hoverable ? 'cursor-pointer hover:border-linework/50' : ''}
        border border-graphite/10
        ${className}
      `}
      style={{
        boxShadow: hoverable ? undefined : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="corner-ticks-inner"></div>
      <div className="relative z-20">
        {children}
      </div>
    </motion.div>
  );
};
