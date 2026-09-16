import { motion } from 'framer-motion';
import { Sparkles, Heart, Award, Cake } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { SectionReveal } from '@/components/Animations';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export function AboutPage() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.pexels.com/photos/5964505/pexels-photo-5964505.jpeg?auto=compress&cs=tinysrgb&h=800&w=1920"
          alt="Notre pâtisserie"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 to-primary-900/50" />
        <SectionReveal className="relative z-10 text-center px-4">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream-50 mb-4">À propos</h1>
          <p className="text-cream-200 text-lg max-w-2xl mx-auto">
            L'histoire d'une passion devenue pâtisserie
          </p>
        </SectionReveal>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8 py-16">
        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <SectionReveal>
            <img
              src="https://images.pexels.com/photos/33393555/pexels-photo-33393555.jpeg?auto=compress&cs=tinysrgb&h=800&w=600"
              alt="Notre pâtissière"
              className="rounded-2xl shadow-xl w-full"
            />
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-accent-600 font-medium uppercase tracking-wider text-sm mb-2">Notre histoire</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-6">
              Une passion née au cœur du Bénin
            </h2>
            <p className="text-primary-600 leading-relaxed mb-4">
              {settings?.about_text || 'Bienvenue chez Délices Dorés, votre pâtisserie artisanale d\'exception au cœur du Bénin. Chaque création est une œuvre d\'art, confectionnée avec passion et les meilleurs ingrédients.'}
            </p>
            <p className="text-primary-600 leading-relaxed">
              Du gâteau de mariage à la tarte aux fruits frais, nous transformons vos moments
              en souvenirs inoubliables. Chaque commande est unique, préparée avec soin et
              attention au détail.
            </p>
          </SectionReveal>
        </div>

        {/* Values */}
        <div className="mb-20">
          <SectionReveal className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900">
              Nos valeurs
            </h2>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: 'Excellence', desc: 'Des ingrédients de qualité supérieure pour un goût incomparable' },
              { icon: Heart, title: 'Passion', desc: 'Chaque création est confectionnée avec amour et dévouement' },
              { icon: Sparkles, title: 'Créativité', desc: 'Des designs uniques qui transforment vos idées en réalité' },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-cream-50" />
                </div>
                <h3 className="font-display text-xl font-semibold text-primary-900 mb-3">{value.title}</h3>
                <p className="text-primary-500 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <SectionReveal className="text-center bg-gradient-chocolate rounded-3xl p-12">
          <Cake className="w-12 h-12 text-accent-400 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-cream-50 mb-4">
            Prête à créer votre prochaine douceur ?
          </h2>
          <p className="text-cream-200 mb-8 max-w-xl mx-auto">
            Contactez-nous pour discuter de votre projet, ou passez une commande personnalisée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WhatsAppButton className="text-base px-8 py-4" />
            <a href="/contact" className="btn-outline border-cream-200 text-cream-50 hover:bg-cream-50 hover:text-primary-900">
              Nous contacter
            </a>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}
export default AboutPage;
