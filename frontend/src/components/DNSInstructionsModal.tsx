import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, Globe } from 'lucide-react';

interface DNSRecord {
  type: string;
  host: string;
  value: string;
}

interface DNSInstructions {
  type: string;
  records: DNSRecord[];
  instructions: string;
}

interface DNSInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  dnsInstructions: DNSInstructions;
}

export const DNSInstructionsModal: React.FC<DNSInstructionsModalProps> = ({
  isOpen,
  onClose,
  domain,
  dnsInstructions
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">DNS Configuration Required</h2>
              <p className="text-sm text-purple-100 mt-1">{domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Manual DNS Configuration Required</p>
              <p>
                GitHub Pages requires you to configure DNS records with your domain provider.
                Your CNAME file has been created in the repository. Now, add these DNS records:
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {dnsInstructions.instructions}
            </h3>
          </div>

          {/* DNS Records Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Host</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dnsInstructions.records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                        {record.host}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 break-all">
                        {record.value}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyToClipboard(record.value, index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Steps */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Setup Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Log in to your domain registrar or DNS provider</li>
              <li>Navigate to DNS settings for <strong>{domain}</strong></li>
              <li>Add the DNS records shown above</li>
              <li>Wait for DNS propagation (can take up to 48 hours, typically 5-10 minutes)</li>
              <li>Visit your custom domain to verify it's working</li>
            </ol>
          </div>

          {/* TTL Note */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <strong>Note:</strong> Some DNS providers may require a TTL (Time To Live) value.
            Use <strong>3600</strong> (1 hour) as a safe default.
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
