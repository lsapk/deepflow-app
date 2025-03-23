
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
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Brain shape */}
            <path 
              d="M50,15 C35,15 20,25 20,45 C20,65 35,80 50,80 C65,80 80,65 80,45 C80,25 65,15 50,15"
              stroke="currentColor" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
            
            {/* Inner Lines */}
            <path 
              d="M50,15 C40,25 40,45 40,60" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              className="text-primary"
            />
            <path 
              d="M50,15 C60,25 60,45 60,60" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              className="text-primary"
            />
            
            {/* Waves */}
            <path 
              d="M30,85 C40,80 60,80 70,85" 
              stroke="#68D9FF" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d="M25,92 C40,87 60,87 75,92" 
              stroke="#3B99D9" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
            />
            
            {/* Circles */}
            <circle cx="70" cy="30" r="3" fill="#68D9FF" />
            <circle cx="30" cy="30" r="3" fill="#68D9FF" />
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
