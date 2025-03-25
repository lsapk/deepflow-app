
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
  textColor?: string;
  noRedirect?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  withText = true, 
  className = '',
  textColor = 'text-white',
  noRedirect = false
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

  const brainVariants = {
    hover: { scale: 1.05, rotate: 3 },
    tap: { scale: 0.95 }
  };

  const waveVariants = {
    initial: { opacity: 0.5, pathLength: 0 },
    animate: { 
      opacity: 1, 
      pathLength: 1,
      transition: { 
        duration: 1.5, 
        ease: "easeInOut", 
        repeat: Infinity, 
        repeatType: "reverse" as const,
        repeatDelay: 0.5
      } 
    }
  };

  const circleVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { 
      scale: 1.2, 
      opacity: 1, 
      transition: { 
        duration: 1.2, 
        repeat: Infinity, 
        repeatType: "reverse" as const
      }
    }
  };

  const LogoContent = () => (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <motion.div 
        className={`relative ${logoSizes[size]}`}
        whileHover="hover"
        whileTap="tap"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Brain shape */}
          <motion.path 
            d="M50,15 C35,15 20,25 20,45 C20,65 35,80 50,80 C65,80 80,65 80,45 C80,25 65,15 50,15"
            stroke="currentColor" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            variants={brainVariants}
          />
          
          {/* Inner Lines */}
          <motion.path 
            d="M50,15 C40,25 40,45 40,60" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            className="text-primary"
            variants={brainVariants}
          />
          <motion.path 
            d="M50,15 C60,25 60,45 60,60" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            className="text-primary"
            variants={brainVariants}
          />
          <motion.path 
            d="M35,50 C45,50 55,50 65,50" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
            className="text-primary"
            variants={brainVariants}
          />
          
          {/* Additional neural connections */}
          <motion.path 
            d="M30,35 C40,40 60,40 70,35" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round"
            className="text-primary"
            variants={brainVariants}
          />
          
          {/* Waves */}
          <motion.path 
            d="M30,85 C40,80 60,80 70,85" 
            stroke="#68D9FF" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
            variants={waveVariants}
            initial="initial"
            animate="animate"
          />
          <motion.path 
            d="M25,92 C40,87 60,87 75,92" 
            stroke="#3B99D9" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
            variants={waveVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          />
          
          {/* Circles */}
          <motion.circle 
            cx="70" 
            cy="30" 
            r="3" 
            fill="#68D9FF" 
            variants={circleVariants} 
            initial="initial" 
            animate="animate"
          />
          <motion.circle 
            cx="30" 
            cy="30" 
            r="3" 
            fill="#68D9FF" 
            variants={circleVariants} 
            initial="initial" 
            animate="animate"
            transition={{ delay: 0.3 }}
          />
          <motion.circle 
            cx="50" 
            cy="35" 
            r="2" 
            fill="#3B99D9" 
            variants={circleVariants} 
            initial="initial" 
            animate="animate"
            transition={{ delay: 0.6 }}
          />
          
          {/* Additional highlight elements */}
          <motion.circle 
            cx="40" 
            cy="45" 
            r="1.5" 
            fill="#68D9FF" 
            variants={circleVariants} 
            initial="initial" 
            animate="animate"
            transition={{ delay: 0.9 }}
          />
          <motion.circle 
            cx="60" 
            cy="45" 
            r="1.5" 
            fill="#68D9FF" 
            variants={circleVariants} 
            initial="initial" 
            animate="animate"
            transition={{ delay: 1.2 }}
          />
        </svg>
      </motion.div>
      
      {withText && (
        <motion.span 
          className={`font-bold ${textSizes[size]} ${textColor}`}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          DeepFlow
        </motion.span>
      )}
    </motion.div>
  );

  // Si noRedirect est vrai, on ne redirige pas vers la page d'accueil
  if (noRedirect) {
    return <div><LogoContent /></div>;
  }

  // Sinon, on ajoute le lien vers la page d'accueil (mais sans se déconnecter, donc vers le dashboard)
  return (
    <Link to="/dashboard">
      <LogoContent />
    </Link>
  );
};
