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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Insufficient Credits
              </h2>
              <p className="text-red-100 text-sm">
                You need more credits to use this feature
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Feature</span>
              <span className="font-semibold text-gray-900">{featureName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Required Credits</span>
              <div className="flex items-center gap-1 text-orange-600 font-semibold">
                <Coins className="w-4 h-4" />
                {requiredCredits}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Your Balance</span>
              <div className="flex items-center gap-1 text-red-600 font-semibold">
                <Coins className="w-4 h-4" />
                {currentBalance}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">You Need</span>
                <div className="flex items-center gap-1 text-blue-600 font-bold text-lg">
                  <Coins className="w-5 h-5" />
                  {requiredCredits - currentBalance} more
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">
                  Get more credits to continue
                </p>
                <p className="text-blue-700">
                  Purchase a credit package starting from just ₹99 or wait for your monthly free credits to reset.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
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
