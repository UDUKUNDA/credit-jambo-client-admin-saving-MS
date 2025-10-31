import { motion } from 'framer-motion';

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
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Savings that grow with you.
          </h1>
          <p className="text-gray-600">
            Track balances, automate deposits, and reach your goals with a modern savings experience.
          </p>
          <div className="flex gap-3">
            <a href="/register" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-500 transition">
              Get Started
            </a>
            <a href="/login" className="px-4 py-2 border rounded hover:bg-gray-50 transition">
              I have an account
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-64 md:h-80 bg-gradient-to-br from-brand-50 to-white rounded-lg border"
        >
          <div className="absolute inset-0 animate-pulse opacity-20 rounded-lg bg-brand-500" />
        </motion.div>
      </div>
    </section>
  );
}