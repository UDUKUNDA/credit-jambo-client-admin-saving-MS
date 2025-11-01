import { motion } from 'framer-motion';
import m1 from '../assets/m1.jpg';
import m2 from '../assets/m2.jpg';
import m3 from '../assets/m3.jpg';

/**
 * Hero
 * Top-of-page marketing section with animated, layered imagery.
 * The right pane uses framer-motion to float three images in a modern,
 * futuristic composition with soft glows and subtle parallax.
 */

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-jamboBlack">
            Savings that grow with you.
          </h1>
          <p className="text-jamboBlack/60">
            Track balances, automate deposits, and reach your goals with a modern savings experience.
          </p>
          <div className="flex gap-3">
            <a href="/register" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition">
              Get Started
            </a>
            <a href="/login" className="px-4 py-2 border border-brand-500/30 rounded hover:bg-brand-50 transition">
              I have an account
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-64 md:h-80 rounded-lg border border-brand-500/20 overflow-hidden"
        >
          {/* Ambient gradient glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
          <div className="absolute -top-16 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30 bg-brand-300" />
          <div className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30 bg-brand-500" />

          {/* Floating image stack: three cards with subtle motion */}
          <motion.img
            src={m1}
            alt="Savings dashboard preview"
            initial={{ y: 18, rotate: -3, opacity: 0 }}
            animate={{ y: [18, 10, 18], rotate: -3, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            className="absolute left-6 top-6 w-40 h-28 object-cover rounded-xl shadow-xl ring-1 ring-brand-500/20"
          />

          <motion.img
            src={m2}
            alt="Mobile app card preview"
            initial={{ y: -4, rotate: 4, opacity: 0 }}
            animate={{ y: [-4, 4, -4], rotate: 4, opacity: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.3 }}
            className="absolute left-24 top-24 w-44 h-32 object-cover rounded-xl shadow-2xl ring-1 ring-brand-500/20"
          />

          <motion.img
            src={m3}
            alt="Transactions analytics preview"
            initial={{ y: 12, rotate: -1, opacity: 0 }}
            animate={{ y: [12, 0, 12], rotate: -1, opacity: 1 }}
            transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.6 }}
            className="absolute right-6 bottom-6 w-40 h-28 object-cover rounded-xl shadow-xl ring-1 ring-brand-500/20"
          />

          {/* Glass overlay for depth */}
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay" />
        </motion.div>
      </div>
    </section>
  );
}