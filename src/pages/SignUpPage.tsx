
import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side (illustration) - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Logo size="lg" textColor="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Rejoignez DeepFlow</h1>
          <p className="text-lg mb-8">
            Créez votre compte et commencez à améliorer votre productivité et votre développement personnel dès aujourd'hui.
          </p>
          <ul className="space-y-3">
            {['Gestion de tâches avancée', 'Suivi d\'habitudes', 'Focus mode', 'Journaling', 'Analyse IA'].map((feature, index) => (
              <motion.li 
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                  <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2"/>
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
      
      {/* Right side (form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8 w-full">
            <Logo size="lg" textColor="text-primary" />
          </div>
          
          {/* Mobile-only features list */}
          <motion.div 
            className="md:hidden mb-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold text-lg mb-3">Pourquoi choisir DeepFlow ?</h3>
            <ul className="space-y-2 text-sm">
              {['Gestion de tâches avancée', 'Suivi d\'habitudes', 'Focus mode', 'Journaling', 'Analyse IA'].map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2"/>
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
