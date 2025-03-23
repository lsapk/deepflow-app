
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  withText = true, 
  className = '',
  textColor = 'text-white'
}) => {
  const logoSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link to="/">
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <div className={`relative ${logoSizes[size]}`}>
          {/* Logo cerebral */}
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Cerveau */}
            <path 
              d="M45,20 C35,20 20,25 20,45 C20,60 35,70 50,70 C65,70 80,60 80,45 C80,25 65,20 55,20" 
              stroke="white" 
              strokeWidth="8" 
              fill="none" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Vagues */}
            <path 
              d="M30,80 C40,75 60,75 70,80" 
              stroke="#68D9FF" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d="M25,90 C40,83 60,83 75,90" 
              stroke="#3B99D9" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
            />
            
            {/* Points */}
            <circle cx="80" cy="30" r="4" fill="#68D9FF" />
            <circle cx="70" cy="20" r="3" fill="#68D9FF" />
          </svg>
        </div>
        
        {withText && (
          <span className={`font-bold ${textSizes[size]} ${textColor}`}>
            DeepFlow
          </span>
        )}
      </motion.div>
    </Link>
  );
};
