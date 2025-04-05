
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';
import { motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle, Clock, Sparkles, Target, TrendingUp, Brain, Bell, Zap, Globe } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="py-4 px-6 md:px-8 flex items-center justify-between">
        <Logo size="md" withText textColor="text-white" noRedirect={true} />
        <div className="flex items-center gap-4">
          <Link to="/signin">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Connexion
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium px-6 py-2 rounded-md shadow-lg">
              Inscription
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-12 md:py-24 px-6 md:px-8 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
              Améliorez votre productivité et atteignez vos objectifs
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
              DeepFlow est votre assistant personnel pour gérer vos tâches, créer des habitudes et maximiser votre concentration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-medium px-8 py-6 text-lg rounded-md shadow-lg w-full sm:w-auto">
                  Commencer maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8 py-6 text-lg w-full sm:w-auto">
                  Se connecter
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="py-16 px-6 md:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="mb-4 bg-primary/20 p-3 rounded-full w-fit">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestion de tâches</h3>
              <p className="text-slate-300">Organisez vos tâches par priorité et suivez votre progression facilement.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="mb-4 bg-green-500/20 p-3 rounded-full w-fit">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi d'habitudes</h3>
              <p className="text-slate-300">Créez et suivez des habitudes positives pour atteindre vos objectifs à long terme.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="mb-4 bg-orange-500/20 p-3 rounded-full w-fit">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Technique Pomodoro</h3>
              <p className="text-slate-300">Maximisez votre concentration avec des sessions de travail chronométrées.</p>
            </div>
          </motion.div>
        </section>

        <section className="py-16 px-6 md:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center">
              Nouvelles fonctionnalités
            </h2>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="flex gap-4">
                <div className="bg-purple-500/20 p-3 h-fit rounded-full">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Assistant IA avancé</h3>
                  <p className="text-slate-300">Notre IA analyse vos données et vous fournit des recommandations personnalisées pour améliorer votre productivité.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-blue-500/20 p-3 h-fit rounded-full">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Support multilingue</h3>
                  <p className="text-slate-300">Application désormais disponible en français, anglais et espagnol pour une meilleure expérience utilisateur.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-yellow-500/20 p-3 h-fit rounded-full">
                  <Bell className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Notifications et sons</h3>
                  <p className="text-slate-300">Restez informé grâce à notre nouveau système de notifications et sons personnalisables.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-green-500/20 p-3 h-fit rounded-full">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Mode Focus amélioré</h3>
                  <p className="text-slate-300">Éliminez les distractions avec notre nouveau mode focus qui vous aide à rester concentré sur vos tâches importantes.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-8 px-6 md:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <Logo size="sm" withText textColor="text-white" noRedirect={true} />
          <p className="text-slate-400 mt-4 md:mt-0">© {new Date().getFullYear()} DeepFlow. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
