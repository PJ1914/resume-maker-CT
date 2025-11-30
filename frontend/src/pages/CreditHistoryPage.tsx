import { Coins, TrendingUp, TrendingDown, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreditBalance, useCreditHistory } from '../hooks/useCredits';

const CreditHistoryPage = () => {
  const navigate = useNavigate();
  const { data: balanceData } = useCreditBalance();
  const { data: transactions = [], isLoading: loading } = useCreditHistory(50);

  const currentBalance = balanceData?.balance || 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEDUCTION':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'PURCHASE':
      case 'ADMIN_GRANT':
      case 'MONTHLY_RESET':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Coins className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEDUCTION':
        return 'text-red-600';
      case 'PURCHASE':
      case 'ADMIN_GRANT':
      case 'MONTHLY_RESET':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Credit History
            </h1>
            <p className="text-gray-600 mb-4">
              View all your credit transactions
            </p>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <div className="bg-blue-100 rounded-full p-3">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Balance</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentBalance} Credits
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600">
              Your credit transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.transaction_id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-gray-100 rounded-full p-2">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'DEDUCTION' ? '-' : '+'}
                      {Math.abs(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Balance: {transaction.balance_after}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditHistoryPage;
