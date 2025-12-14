import { Coins, Check, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCreditBalance } from '../hooks/useCredits';
import { usePaymentPlans, usePaymentFlow } from '../hooks/usePayments';

const CreditPurchasePage = () => {
  const navigate = useNavigate();
  const { data: balanceData } = useCreditBalance();
  const { data: plansData, isLoading: loading } = usePaymentPlans();
  const { initiatePayment, isProcessing } = usePaymentFlow();

  const currentBalance = balanceData?.balance || 0;
  const packages = plansData?.plans || [];

  const handlePurchase = async (quantity: number) => {
    await initiatePayment('PLAN#Resume', quantity);
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-black text-secondary-900 dark:text-white py-12 px-4 transition-colors duration-200">
      {loading ? (
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-center">
              <div className="h-4 sm:h-5 bg-secondary-200 dark:bg-white/10 rounded w-20"></div>
            </div>

            <div className="space-y-4 text-center">
              <div className="h-10 sm:h-12 bg-secondary-200 dark:bg-white/10 rounded-lg w-64 mx-auto"></div>
              <div className="h-6 bg-secondary-100 dark:bg-white/5 rounded-lg w-48 mx-auto"></div>
            </div>

            <div className="flex justify-center">
              <div className="h-12 w-64 bg-white dark:bg-white/5 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-6 sm:p-8 space-y-6 border border-secondary-100 dark:border-white/5">
                  <div className="space-y-2">
                    <div className="h-5 bg-secondary-200 dark:bg-white/10 rounded w-32"></div>
                    <div className="h-8 bg-secondary-200 dark:bg-white/10 rounded w-24"></div>
                  </div>

                  <div className="h-12 bg-secondary-100 dark:bg-white/5 rounded-xl"></div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-white/10 shrink-0"></div>
                        <div className="h-4 bg-secondary-100 dark:bg-white/5 rounded w-full"></div>
                      </div>
                    ))}
                  </div>

                  <div className="h-12 bg-secondary-200 dark:bg-white/10 rounded-xl mt-8"></div>
                </div>
              ))}
            </div>

            <div className="h-48 bg-secondary-100 dark:bg-white/5 rounded-2xl"></div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="mb-8 inline-flex items-center gap-2 text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <h1 className="text-4xl sm:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
              Purchase Credits
            </h1>
            <p className="text-lg text-secondary-600 dark:text-white/60 mb-8">
              Choose a package that suits your needs
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/10 rounded-full shadow-sm border border-secondary-200 dark:border-white/10">
              <Coins className="w-5 h-5 text-secondary-900 dark:text-white" />
              <span className="text-secondary-900 dark:text-white font-semibold">
                Current Balance: {currentBalance} Credits
              </span>
            </div>
          </div>

          {/* Packages Grid */}
          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {packages.map((pkg, index) => {
              const isPopular = pkg.popular ?? index === 1;
              const pricePerCredit = (pkg.price / pkg.quantity).toFixed(2);

              return (
                <motion.div
                  key={`${pkg.quantity}-${pkg.price}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:scale-105 ${isPopular
                    ? 'border-secondary-900 dark:border-white ring-1 ring-secondary-900 dark:ring-white shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                    : 'border-secondary-200 dark:border-white/10 hover:border-secondary-300 dark:hover:border-white/20 shadow-lg dark:shadow-none'
                    }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-secondary-900 dark:bg-white" />
                  )}
                  {isPopular && (
                    <div className="absolute top-4 right-4 bg-secondary-900 dark:bg-white text-white dark:text-black px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 sm:p-8 flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-secondary-500 dark:text-white/60 mb-2">
                        {pkg.name || (pkg.quantity === 50 ? 'Starter' : pkg.quantity === 100 ? 'Standard' : pkg.quantity === 200 ? 'Pro' : pkg.quantity >= 400 ? 'Ultimate' : 'Basic Pack')}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-secondary-900 dark:text-white">
                          ₹{pkg.price}
                        </span>
                        <span className="text-sm text-secondary-500 dark:text-white/40">
                          / {pricePerCredit} per credit
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-8 p-3 bg-secondary-50 dark:bg-white/5 rounded-lg border border-secondary-100 dark:border-white/5">
                      <Coins className="w-5 h-5 text-secondary-900 dark:text-white" />
                      <span className="font-bold text-secondary-900 dark:text-white">
                        {pkg.quantity} Credits
                      </span>
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-secondary-600 dark:text-white/70">
                          ~{Math.floor(pkg.quantity / 5)} ATS Score analyses
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-secondary-600 dark:text-white/70">
                          ~{Math.floor(pkg.quantity / 3)} AI content rewrites
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-secondary-600 dark:text-white/70">
                          ~{Math.floor(pkg.quantity / 2)} PDF exports
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-secondary-600 dark:text-white/70">
                          Valid lifetime
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg.quantity)}
                      disabled={isProcessing}
                      className={`w-full py-3 sm:py-4 rounded-xl font-bold transition-all duration-200 ${isPopular
                        ? 'bg-secondary-900 dark:bg-white text-white dark:text-black hover:bg-secondary-800 dark:hover:bg-white/90 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-white dark:bg-white/10 text-secondary-900 dark:text-white border border-secondary-200 dark:border-white/10 hover:bg-secondary-50 dark:hover:bg-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        'Purchase Now'
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Free Monthly Credits Info */}
          {/* Free Monthly Credits Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-green-800/30">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="bg-green-500 dark:bg-green-600 rounded-full p-4 shadow-lg shadow-green-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                  Free Monthly Credits
                </h3>
                <p className="text-secondary-600 dark:text-white/70 mb-6 leading-relaxed max-w-2xl">
                  All users automatically receive <strong className="text-green-600 dark:text-green-400">10 free credits every month</strong> that reset at the beginning of each month.
                  These credits can be used for any feature!
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                    <div className="font-bold text-secondary-900 dark:text-white text-sm mb-1">ATS Scoring</div>
                    <div className="text-secondary-500 dark:text-white/60 text-xs">5 credits per analysis</div>
                  </div>
                  <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                    <div className="font-bold text-secondary-900 dark:text-white text-sm mb-1">AI Rewrite</div>
                    <div className="text-secondary-500 dark:text-white/60 text-xs">3 credits per use</div>
                  </div>
                  <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                    <div className="font-bold text-secondary-900 dark:text-white text-sm mb-1">PDF Export</div>
                    <div className="text-secondary-500 dark:text-white/60 text-xs">2 credits per export</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditPurchasePage;
