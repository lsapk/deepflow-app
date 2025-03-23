
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  CheckSquare, 
  Clock, 
  LineChart, 
  Lock, 
  MessageCircle, 
  Target, 
  Zap
} from 'lucide-react';

const features = [
  {
    icon: <CheckSquare size={24} />,
    title: "Gestion de tâches",
    description: "Organisez vos tâches avec des rappels, priorités et deadlines"
  },
  {
    icon: <Calendar size={24} />,
    title: "Suivi d'habitudes",
    description: "Créez et suivez vos habitudes avec des statistiques détaillées"
  },
  {
    icon: <MessageCircle size={24} />,
    title: "Journaling",
    description: "Écrivez vos pensées, ajoutez des images et des émotions"
  },
  {
    icon: <Target size={24} />,
    title: "Objectifs à long terme",
    description: "Planifiez et suivez vos progrès avec des étapes intermédiaires"
  },
  {
    icon: <Clock size={24} />,
    title: "Focus Mode",
    description: "Bloquez les distractions avec un minuteur Pomodoro"
  },
  {
    icon: <Brain size={24} />,
    title: "Analyse IA",
    description: "Une IA qui analyse vos habitudes et propose des améliorations"
  },
  {
    icon: <LineChart size={24} />,
    title: "Statistiques détaillées",
    description: "Visualisez votre productivité avec des graphiques interactifs"
  },
  {
    icon: <Zap size={24} />,
    title: "Challenges",
    description: "Relevez des défis pour maintenir votre motivation"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  const featureVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: 0.3 + i * 0.1
      }
    })
  };

  const parallaxValue = -scrollY * 0.4;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header avec effet parallaxe */}
      <header 
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20 px-4"
        style={{ 
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            transform: `translateY(${parallaxValue}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        
        <motion.div 
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <motion.div variants={itemVariants} className="mb-2">
            <span className="inline-block text-white/80 bg-white/10 px-4 py-1 rounded-full text-sm backdrop-blur-sm">
              <Lock size={14} className="inline mr-1" /> Lancement bientôt
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
          >
            Deep<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Flow</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-white/80"
          >
            L'application tout-en-un pour votre développement personnel,
            <br className="hidden md:block" /> productivité et organisation optimale.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="button-shine bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Commencer gratuitement
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/signin')}
              className="border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              Se connecter
            </Button>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mt-12 md:mt-16 glass-card p-3 md:p-6 rounded-xl mx-auto max-w-sm md:max-w-md backdrop-blur-md border border-white/20"
          >
            <p className="text-white/80 text-sm md:text-base">
              "DeepFlow m'a aidé à augmenter ma productivité de 200% en seulement quelques semaines."
            </p>
            <div className="mt-4 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/20 mr-3"></div>
              <div>
                <h4 className="text-white font-medium text-sm">Alexandre Dupont</h4>
                <p className="text-white/60 text-xs">Entrepreneur</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Découvrir plus</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </motion.div>
      </header>

      {/* Section Fonctionnalités */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Toutes vos fonctionnalités en un seul endroit</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              DeepFlow combine les meilleures fonctionnalités pour optimiser votre organisation, productivité et développement personnel.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={featureVariants}
                className="feature-card bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="mb-4 text-blue-600">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à transformer votre productivité?</h2>
          <p className="text-xl mb-8 text-white/80">
            Rejoignez des milliers d'utilisateurs qui ont déjà amélioré leur organisation et leur bien-être.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/signup')}
            className="button-shine bg-white text-blue-600 hover:bg-gray-100"
          >
            Commencer gratuitement
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-gray-900 text-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">DeepFlow</h3>
              <p className="text-sm">L'organisation et la productivité redéfinies</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">À propos</a>
              <a href="#" className="hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} DeepFlow. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
