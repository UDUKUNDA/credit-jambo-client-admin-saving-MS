import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * AppHome: Protected landing hub after login.
 * Shows an animated bento-style grid linking to key app pages.
 */
export default function AppHome() {
  const tiles = [
    {
      title: 'Dashboard',
      text: 'View balance and history',
      to: '/dashboard',
      color: 'from-jamboGreen to-brand-600',
    },
    {
      title: 'Deposit',
      text: 'Add funds to your account',
      to: '/deposit',
      color: 'from-brand-600 to-jamboGreen',
    },
    {
      title: 'Withdraw',
      text: 'Take out money confidently',
      to: '/withdraw',
      color: 'from-jamboBlack to-brand-600',
    },
    {
      title: 'Transactions',
      text: 'See all your activity',
      to: '/transactions',
      color: 'from-brand-600 to-jamboBlack',
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, dear friend!
        </h2>
        <p className="text-gray-600">
          Choose your next action. Everything is a smooth ride — like sliding down a rainbow, but greener.
        </p>
      </div>

      {/* Animated bento grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)]"
      >
        {/* Feature hero spans */}
        <motion.div
          className="md:col-span-2 p-6 rounded-xl border bg-white relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-60" />
          <div className="relative space-y-2">
            <h3 className="text-xl font-semibold">Your Savings Command Center</h3>
            <p className="text-gray-600">Quick access to the essentials — it’s all yours.</p>
            <div className="flex gap-3 mt-3">
              <Link to="/dashboard" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-500 transition">
                Dashboard
              </Link>
              <Link to="/transactions" className="px-4 py-2 border rounded hover:bg-gray-50 transition">
                Transactions
              </Link>
            </div>
          </div>
        </motion.div>

        {tiles.map((t, i) => (
          <motion.div
            key={t.title}
            className="p-6 rounded-xl border bg-white relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * (i + 1) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-15 pointer-events-none`} />
            <div className="relative">
              <h4 className="text-lg font-semibold mb-1">{t.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{t.text}</p>
              <Link to={t.to} className="inline-flex items-center gap-2 text-brand-600 hover:underline">
                Go to {t.title}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}