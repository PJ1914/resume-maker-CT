import { Coins, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreditBalance, useCreditPackages, usePurchaseCredits } from '../hooks/useCredits';

const CreditPurchasePage = () => {
  const navigate = useNavigate();
  const { data: balanceData } = useCreditBalance();
  const { data: packages = [], isLoading: loading } = useCreditPackages();
  const { mutate: purchaseCredits, isPending: purchasing } = usePurchaseCredits();

  const currentBalance = balanceData?.balance || 0;

  const handlePurchase = (packageId: string) => {
    purchaseCredits(packageId, {
      onSuccess: (data) => {
        alert(`Payment initiated! Payment ID: ${data.payment_id}\n\nIn production, this would redirect to payment gateway.\n\nFor now, contact admin to complete payment and receive credits.`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Credits
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Choose a package that suits your needs
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <Coins className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-semibold">
              Current Balance: {currentBalance} Credits
            </span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                pkg.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{pkg.price}
                  </span>
                  {pkg.discount_percentage && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {pkg.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-6 text-blue-600">
                  <Coins className="w-5 h-5" />
                  <span className="text-xl font-semibold">
                    {pkg.credits} Credits
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      {Math.floor(pkg.credits / 5)} ATS Score analyses
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      {Math.floor(pkg.credits / 3)} AI content rewrites
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      {Math.floor(pkg.credits / 2)} PDF exports
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      Credits never expire
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    'Purchase Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Free Monthly Credits Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 rounded-full p-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Free Monthly Credits
              </h3>
              <p className="text-gray-600 mb-4">
                All users automatically receive <strong>10 free credits every month</strong> that reset at the beginning of each month. 
                These credits can be used for any feature!
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-gray-900">ATS Scoring</div>
                  <div className="text-gray-600">5 credits per analysis</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-gray-900">AI Rewrite</div>
                  <div className="text-gray-600">3 credits per use</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-gray-900">PDF Export</div>
                  <div className="text-gray-600">2 credits per export</div>
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
