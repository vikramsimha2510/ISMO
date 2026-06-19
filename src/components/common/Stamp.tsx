import React from 'react';
import { motion } from 'framer-motion';
import { ProjectStatus, TaskStatus } from '../../types';
import { CheckCircle, CircleDashed, Clock } from 'lucide-react';

interface StampProps {
  status: ProjectStatus | TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  animateIn?: boolean;
}

export const Stamp: React.FC<StampProps> = ({ status, size = 'md', animateIn = false }) => {
  const isCompleted = status === 'Completed' || (status as any) === 'DONE';
  const isInProgress = status === 'In Progress';
  const isPending = status === 'Pending' || status === 'Not Started' || (status as any) === 'OPEN';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 border',
    md: 'text-sm px-3 py-1 border-2',
    lg: 'text-base px-4 py-1.5 border-2',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const getStampConfig = () => {
    if (isCompleted) {
      return {
        className: `border-stamp-green text-stamp-green bg-stamp-green/5 rounded-full flex items-center gap-1.5 ${sizeClasses[size]}`,
        text: 'DONE',
        icon: <CheckCircle size={iconSizes[size]} />,
      };
    }
    if (isInProgress) {
      return {
        // Banner style
        className: `border-linework text-linework bg-linework/5 -skew-x-12 flex items-center gap-1.5 ${sizeClasses[size]}`,
        text: 'IN PROGRESS',
        icon: <Clock size={iconSizes[size]} />,
      };
    }
    return {
      className: `border-graphite/40 border-dashed text-graphite/60 bg-transparent flex items-center gap-1.5 rounded-sm ${sizeClasses[size]}`,
      text: 'OPEN',
      icon: <CircleDashed size={iconSizes[size]} />,
    };
  };

  const config = getStampConfig();

  // Animation variants
  const variants = {
    initial: { scale: 0.6, rotate: -8, opacity: 0 },
    animate: { 
      scale: [0.6, 1.08, 1],
      rotate: [-8, 2, 0],
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 15,
        duration: 0.25,
      }
    }
  };

  // If we shouldn't animate in, just bypass it
  const animationProps = animateIn && isCompleted ? {
    variants,
    initial: "initial",
    animate: "animate",
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  };

  return (
    <motion.div 
      {...animationProps}
      className={`${config.className} font-mono uppercase tracking-widest font-bold whitespace-nowrap inline-flex shadow-sm`}
      style={{
        // Slight ink bleed effect using text-shadow
        textShadow: isCompleted ? '0px 0px 1px rgba(46, 145, 102, 0.4)' : 'none',
        boxShadow: isCompleted ? '0 0 2px rgba(46, 145, 102, 0.2) inset' : 'none'
      }}
    >
      {config.icon}
      {config.text}
    </motion.div>
  );
};
