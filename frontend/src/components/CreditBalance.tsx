import { Coins, Crown } from 'lucide-react';
import { useCreditBalance } from '../hooks/useCredits';

const CreditBalance = () => {
  const { data, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
        <Coins className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">...</span>
      </div>
    );
  }

  const balance = data?.balance || 0;
  const isAdmin = data?.is_admin || false;
  const isLow = !isAdmin && balance < 10;

  // Admin badge - unlimited credits
  if (isAdmin) {
    return (
      <div
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300"
        title="Admin - Unlimited Credits"
      >
        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
        <span className="text-xs sm:text-sm font-medium text-yellow-700">
          <span className="sm:hidden">Unlim.</span>
          <span className="hidden sm:inline">Unlimited</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full cursor-pointer transition-colors ${isLow
          ? 'bg-red-50 hover:bg-red-100'
          : 'bg-blue-50 hover:bg-blue-100'
        }`}
      onClick={() => window.location.href = '/credits/purchase'}
      title="Click to purchase credits"
    >
      <Coins className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLow ? 'text-red-600' : 'text-blue-600'}`} />
      <span className={`text-xs sm:text-sm font-medium ${isLow ? 'text-red-700' : 'text-blue-700'}`}>
        {balance} <span className="hidden sm:inline">Credits</span>
      </span>
    </div>
  );
};

export default CreditBalance;
