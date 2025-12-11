import { Coins, Crown } from 'lucide-react';
import { useCreditBalance } from '../hooks/useCredits';

const CreditBalance = () => {
  const { data, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
        <Coins className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">...</span>
      </div>
    );
  }

  const balance = data?.balance || 0;
  const isAdmin = data?.is_admin || false;

  // Admin badge - unlimited credits
  if (isAdmin) {
    return (
      <div
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20"
        title="Admin - Unlimited Credits"
      >
        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
        <span className="text-xs sm:text-sm font-medium text-yellow-400">
          <span className="sm:hidden">Unlim.</span>
          <span className="hidden sm:inline">Unlimited</span>
        </span>
      </div>
    );
  }

  const isLow = !isAdmin && balance < 20;

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full cursor-pointer transition-colors ${isLow
        ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
        : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
        }`}
      onClick={() => window.location.href = '/credits/purchase'}
      title="Click to purchase credits"
    >
      <Coins className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLow ? 'text-yellow-400' : 'text-blue-400'}`} />
      <span className={`text-xs sm:text-sm font-medium`}>
        {balance} <span className="hidden sm:inline">Credits</span>
      </span>
    </div>
  );
};

export default CreditBalance;
