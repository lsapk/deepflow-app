
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Calendar, ListTodo, Clock, BookOpen, TrendingUp, BrainCircuit, LineChart } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Gestion de tâches avancée',
      description: 'Organisez vos tâches avec des priorités, des échéances et des catégories pour rester productif.',
      icon: <ListTodo className="h-12 w-12 text-blue-500" />
    },
    {
      title: 'Suivi d\'habitudes',
      description: 'Développez de bonnes habitudes avec notre système de suivi et visualisez vos progrès sur la durée.',
      icon: <CheckCircle className="h-12 w-12 text-green-500" />
    },
    {
      title: 'Mode Focus',
      description: 'Utilisez la technique Pomodoro pour rester concentré et améliorer votre productivité quotidienne.',
      icon: <Clock className="h-12 w-12 text-red-500" />
    },
    {
      title: 'Journal personnel',
      description: 'Tenez un journal de vos pensées, idées et réflexions pour favoriser la croissance personnelle.',
      icon: <BookOpen className="h-12 w-12 text-purple-500" />
    },
    {
      title: 'Planification intelligente',
      description: 'Planifiez votre journée et votre semaine de manière intelligente pour optimiser votre temps.',
      icon: <Calendar className="h-12 w-12 text-amber-500" />
    },
    {
      title: 'Analyse personnalisée',
      description: 'Obtenez des insights sur vos habitudes et votre productivité grâce à nos analyses détaillées.',
      icon: <LineChart className="h-12 w-12 text-indigo-500" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-6 bg-background">
        <div className="container mx-auto flex justify-between items-center">
          <Logo size="md" />
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/signin">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <motion.section 
        className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Organisez votre vie<br />
                <span className="text-white/90">Développez vos habitudes</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-white/80 max-w-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                DeepFlow est une application complète pour gérer vos tâches, développer de bonnes habitudes, améliorer votre concentration et suivre votre progression personnelle.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-white/90"
                  onClick={() => navigate('/signup')}
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate('/signin')}
                >
                  Se connecter
                </Button>
              </motion.div>
            </div>
            <motion.div 
              className="lg:w-1/2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="aspect-video rounded-lg bg-gray-800/50 flex items-center justify-center">
                  <BrainCircuit className="h-20 w-20 text-blue-300" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Améliorez votre productivité et votre bien-être</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DeepFlow combine tous les outils dont vous avez besoin pour optimiser votre journée et atteindre vos objectifs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Rejoindre DeepFlow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials or Stats section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div 
              className="space-y-2"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-4xl font-bold text-blue-600">100%</p>
              <p className="text-muted-foreground">Gratuit pour utilisation personnelle</p>
            </motion.div>
            <motion.div 
              className="space-y-2"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-4xl font-bold text-green-600">+25%</p>
              <p className="text-muted-foreground">Amélioration de la productivité</p>
            </motion.div>
            <motion.div 
              className="space-y-2"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <p className="text-4xl font-bold text-purple-600">6+</p>
              <p className="text-muted-foreground">Fonctionnalités principales</p>
            </motion.div>
            <motion.div 
              className="space-y-2"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-4xl font-bold text-amber-600">24/7</p>
              <p className="text-muted-foreground">Accessibilité partout</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-12 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Logo size="sm" />
              <p className="text-muted-foreground mt-2">© 2025 DeepFlow. Tous droits réservés.</p>
            </div>
            <div className="flex gap-8">
              <Link to="#" className="text-muted-foreground hover:text-primary">Confidentialité</Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">Conditions</Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">Contact</Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">À propos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
