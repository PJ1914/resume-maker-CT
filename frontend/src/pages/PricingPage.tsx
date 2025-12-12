import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Check, Sparkles, Zap, Crown } from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

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
    <>
      <SEO
        title="Pricing - Prativeda | Affordable Resume & Portfolio Tools"
        description="Transparent pricing for resume building and ATS optimization. Pay per use with credits. No hidden fees."
        keywords="resume pricing, ATS scoring cost, portfolio pricing, affordable resume tools"
        url="https://prativeda.codetapasya.com/pricing"
      />
      <PublicLayout>
        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 sm:mb-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-secondary-200 dark:border-white/20 bg-secondary-100 dark:bg-white/5 backdrop-blur-xl mb-4 sm:mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-semibold">Simple, Transparent Pricing</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                Choose Your Credit Pack
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-secondary-600 dark:text-white/60 max-w-3xl mx-auto font-light">
                Purchase credits as you go. No monthly subscriptions, just pure value.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl p-6 border transition-all duration-300 flex flex-col ${plan.highlighted
                    ? 'bg-secondary-50 dark:bg-white/10 border-secondary-300 dark:border-white/30 sm:scale-105 z-10 shadow-xl dark:shadow-[0_0_50px_rgba(255,255,255,0.2)]'
                    : 'bg-white dark:bg-white/5 border-secondary-200 dark:border-white/10 hover:border-secondary-300 dark:hover:border-white/20 hover:bg-secondary-50 dark:hover:bg-white/10 shadow-lg dark:shadow-none'
                    }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="p-3 bg-secondary-900 dark:bg-white rounded-lg mb-4 w-fit">
                      <plan.icon className="h-6 w-6 text-white dark:text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-secondary-900 dark:text-white">{plan.name}</h3>
                    <p className="text-secondary-600 dark:text-white/60 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-white">
                        ₹{plan.price}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${plan.highlighted
                      ? 'bg-secondary-900 dark:bg-white text-white dark:text-black hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                      : 'border border-secondary-200 dark:border-white/20 hover:bg-secondary-100 dark:hover:bg-white/5 text-secondary-900 dark:text-white'
                      }`}
                  >
                    Buy Now
                  </motion.button>

                  <div className="space-y-3 mt-auto">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-secondary-900 dark:text-white" />
                        <span className="text-sm text-secondary-700 dark:text-white/80">{feature}</span>
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
              className="mt-16 sm:mt-24 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center text-secondary-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4 sm:space-y-6">
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
                    className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl p-5 sm:p-6 border border-secondary-200 dark:border-white/10 shadow-sm dark:shadow-none"
                  >
                    <h3 className="font-bold mb-2 text-base sm:text-lg text-secondary-900 dark:text-white">{faq.q}</h3>
                    <p className="text-secondary-600 dark:text-white/60 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </PublicLayout>
    </>
  )
}
