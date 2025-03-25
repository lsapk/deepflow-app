
import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side (illustration) - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 flex-col items-center justify-center">
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
          <ul className="space-y-4">
            {['Gestion de tâches avancée', 'Suivi d\'habitudes', 'Focus mode', 'Journaling', 'Analyse IA'].map((feature, index) => (
              <motion.li 
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
      
      {/* Right side (form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8 w-full">
            <Logo size="lg" textColor="text-primary" />
          </div>
          
          {/* Mobile-only features list */}
          <motion.div 
            className="md:hidden mb-8 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-5 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold text-lg mb-3">Pourquoi choisir DeepFlow ?</h3>
            <ul className="space-y-2 text-sm">
              {['Gestion de tâches avancée', 'Suivi d\'habitudes', 'Focus mode', 'Journaling', 'Analyse IA'].map((feature) => (
                <li key={feature} className="flex items-center">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 mr-2">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Créer un compte</h2>
            <SignUpForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
