import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Coins, AlertCircle, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    name: string;
    price_inr: number;
    price_credits: number;
    thumbnail_url: string;
  };
  userCredits: number;
  onConfirm: (paymentMethod: 'credits' | 'inr') => void;
  isProcessing?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  template,
  userCredits,
  onConfirm,
  isProcessing = false
}) => {
  const [selectedMethod, setSelectedMethod] = React.useState<'credits' | 'inr'>('credits');
  const hasEnoughCredits = userCredits >= template.price_credits;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative">
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-2xl font-bold text-white mb-1">{template.name}</h3>
                <p className="text-white/80 text-sm">Unlock this premium template</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Payment Method
                </label>

                {/* Credits Option */}
                <button
                  onClick={() => setSelectedMethod('credits')}
                  disabled={!hasEnoughCredits}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === 'credits'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!hasEnoughCredits ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMethod === 'credits' ? 'bg-indigo-500' : 'bg-gray-200'
                      }`}>
                        <Coins className={`w-5 h-5 ${
                          selectedMethod === 'credits' ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Use Credits</div>
                        <div className="text-sm text-gray-500">
                          You have {userCredits} credits
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {template.price_credits}
                      </span>
                      <span className="text-sm text-gray-500">credits</span>
                      {selectedMethod === 'credits' && (
                        <Check className="w-5 h-5 text-indigo-500 ml-2" />
                      )}
                    </div>
                  </div>
                </button>

                {/* INR Option (Coming Soon) */}
                <button
                  onClick={() => setSelectedMethod('inr')}
                  disabled={true}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-200">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Pay with Card</div>
                        <div className="text-sm text-gray-500">Coming soon</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{template.price_inr}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Warning for insufficient credits */}
              {!hasEnoughCredits && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Insufficient Credits</p>
                    <p>
                      You need {template.price_credits - userCredits} more credits to unlock this template.
                      Please purchase credits or choose a different payment method.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(selectedMethod)}
                  disabled={isProcessing || (selectedMethod === 'credits' && !hasEnoughCredits)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Unlock Template'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
