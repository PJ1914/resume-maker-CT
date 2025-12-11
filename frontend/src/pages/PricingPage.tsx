import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Check, Sparkles, Zap, Crown } from 'lucide-react'

export default function PricingPage() {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Starter Pack',
      price: '89',
      credits: 50,
      description: 'Perfect for getting started',
      icon: Zap,
      features: [
        '50 Credits',
        'Basic Templates',
        'PDF Export',
      ],
      highlighted: false,
    },
    {
      name: 'Standard Pack',
      price: '199',
      credits: 120,
      description: 'Great for regular usage',
      icon: FileText,
      features: [
        '120 Credits',
        'All Templates',
        'Priority Rendering',
      ],
      highlighted: false,
    },
    {
      name: 'Pro Pack',
      price: '349',
      credits: 220,
      description: 'Best value for professionals',
      icon: Sparkles,
      features: [
        '220 Credits',
        'Advanced AI Tools',
        'Priority Support',
      ],
      highlighted: true,
    },
    {
      name: 'Ultimate Pack',
      price: '559',
      credits: 450,
      description: 'Maximum power for power users',
      icon: Crown,
      features: [
        '450 Credits',
        'Dedicated Support',
        'Early Access Features',
      ],
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="relative h-10 w-10 bg-white rounded-lg flex items-center justify-center group">
                <div className="absolute inset-0 bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <FileText className="h-6 w-6 text-black relative z-10" />
              </div>
              <span className="text-xl font-bold tracking-tight">prativeda</span>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors backdrop-blur-xl text-sm sm:text-base"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="relative px-6 py-2.5 bg-white text-black rounded-lg font-semibold overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative z-10">Get Started</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 sm:mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Choose Your Credit Pack
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl mx-auto font-light">
              Purchase credits as you go. No monthly subscriptions, just pure value.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 border transition-all duration-300 flex flex-col ${plan.highlighted
                  ? 'bg-white/10 border-white/30 scale-105 z-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <div className="p-3 bg-white rounded-lg mb-4 w-fit">
                    <plan.icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ₹{plan.price}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${plan.highlighted
                    ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                    : 'border border-white/20 hover:bg-white/5'
                    }`}
                >
                  Buy Now
                </motion.button>

                <div className="space-y-3 mt-auto">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mt-24 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Do my credits expire?',
                  a: 'No, your credits never expire. They remain in your account until you choose to use them.',
                },
                {
                  q: 'What counts as one credit?',
                  a: 'One credit typically covers one major AI operation, such as generating a resume section or optimizing content.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, UPI, and net banking options.',
                },
                {
                  q: 'Can I buy multiple packs?',
                  a: 'Yes, you can purchase as many packs as you need. Credits heavily stack in your account.',
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                >
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-white/60 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/10 mt-20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center">
                <FileText className="h-5 w-5 text-black" />
              </div>
              <span className="font-semibold">prativeda</span>
            </div>
            <div className="text-white/50 text-sm">© 2025 prativeda. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
