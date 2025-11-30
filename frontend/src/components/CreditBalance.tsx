import { Coins } from 'lucide-react';
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
  const isLow = balance < 10;

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
        isLow 
          ? 'bg-red-50 hover:bg-red-100' 
          : 'bg-blue-50 hover:bg-blue-100'
      }`}
      onClick={() => window.location.href = '/credits/purchase'}
      title="Click to purchase credits"
    >
      <Coins className={`w-4 h-4 ${isLow ? 'text-red-600' : 'text-blue-600'}`} />
      <span className={`text-sm font-medium ${isLow ? 'text-red-700' : 'text-blue-700'}`}>
        {balance} Credits
      </span>
    </div>
  );
};

export default CreditBalance;
