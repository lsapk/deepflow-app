
import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 lg:p-8">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
        
        <SignInForm />
      </motion.div>
    </div>
  );
};

export default SignInPage;
