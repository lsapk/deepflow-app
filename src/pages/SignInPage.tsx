
import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
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
          
          <h1 className="text-4xl font-bold mb-6">Bienvenue sur DeepFlow</h1>
          <p className="text-lg mb-8">
            Votre plateforme tout-en-un pour améliorer votre productivité, suivre vos habitudes et atteindre vos objectifs.
          </p>
          <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-white/10">
            <p className="italic text-white/80 mb-4">
              "DeepFlow m'a permis de mieux organiser mon temps et d'atteindre mes objectifs plus rapidement."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 mr-3"></div>
              <div>
                <h4 className="font-medium">Sophie Martin</h4>
                <p className="text-sm text-white/60">Coach professionnelle</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden flex justify-center mb-8 w-full">
            <Logo size="lg" textColor="text-primary" />
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
