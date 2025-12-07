import { AlertCircle, Coins, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredCredits: number;
  currentBalance: number;
}

const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  featureName,
  requiredCredits,
  currentBalance
}: InsufficientCreditsModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePurchase = () => {
    onClose();
    navigate('/credits/purchase');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-2xl max-w-md w-full border-4 border-secondary-900 dark:border-white">
        {/* Header */}
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-secondary-100 dark:bg-secondary-800 rounded-full p-3">
              <AlertCircle className="w-6 h-6 text-secondary-900 dark:text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                Insufficient Credits
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                You need more credits to use this feature
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 space-y-3 border border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 dark:text-secondary-400">Feature</span>
              <span className="font-semibold text-secondary-900 dark:text-white">{featureName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 dark:text-secondary-400">Required Credits</span>
              <div className="flex items-center gap-1 text-secondary-900 dark:text-white font-semibold">
                <Coins className="w-4 h-4" />
                {requiredCredits}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 dark:text-secondary-400">Your Balance</span>
              <div className="flex items-center gap-1 text-secondary-900 dark:text-white font-semibold">
                <Coins className="w-4 h-4" />
                {currentBalance}
              </div>
            </div>
            <div className="pt-3 border-t border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <span className="text-secondary-900 dark:text-white font-medium">You Need</span>
                <div className="flex items-center gap-1 text-secondary-900 dark:text-white font-bold text-lg">
                  <Coins className="w-5 h-5" />
                  {requiredCredits - currentBalance} more
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 text-secondary-900 dark:text-white flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-secondary-900 dark:text-white font-medium mb-1">
                  Get more credits to continue
                </p>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Purchase a credit package starting from just ₹99 or wait for your monthly free credits to reset.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="flex-1 px-4 py-3 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 rounded-lg font-medium hover:bg-secondary-800 dark:hover:bg-secondary-100 transition-colors"
            >
              Purchase Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;
