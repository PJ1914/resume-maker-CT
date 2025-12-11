/**
 * GitHub Token Setup Guide Component
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface GitHubTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSaved: () => void;
}

export default function GitHubTokenModal({ isOpen, onClose, onTokenSaved }: GitHubTokenModalProps) {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [isSaving, setSaving] = useState(false);

  const handleSaveToken = async () => {
    if (!token.trim()) {
      toast.error('Please enter a GitHub token');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('http://localhost:8000/api/portfolio/github-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({ token: token.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save token');
      }

      const data = await response.json();
      toast.success(`✓ Connected to GitHub as @${data.github_username}!`);
      setToken('');
      onTokenSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save GitHub token');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔑 GitHub Personal Access Token</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-secondary-400 dark:hover:text-secondary-200"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300 mb-2">
              <strong>Why do I need this?</strong>
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              A GitHub Personal Access Token allows Prativeda CT to automatically create a repository and deploy your portfolio to GitHub Pages. You only need to set this up once!
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">📝 How to create a GitHub token:</h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-secondary-300">
              <li className="pl-2">1. Go to <a href="https://github.com/settings/tokens/new" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline">github.com/settings/tokens/new</a></li>
              <li className="pl-2">2. Give it a name: <code className="bg-gray-100 dark:bg-secondary-700 px-2 py-1 rounded">Prativeda CT Portfolio</code></li>
              <li className="pl-2">3. Set expiration: <strong>No expiration</strong> (or your preferred duration)</li>
              <li className="pl-2">4. Select these scopes:
                <ul className="ml-4 mt-1 space-y-1">
                  <li>✓ <code className="bg-gray-100 dark:bg-secondary-700 px-2 py-1 rounded">repo</code> (Full control of private repositories)</li>
                  <li>✓ <code className="bg-gray-100 dark:bg-secondary-700 px-2 py-1 rounded">admin:repo_hook</code> (Full control of repository hooks)</li>
                </ul>
              </li>
              <li className="pl-2">5. Click <strong>"Generate token"</strong></li>
              <li className="pl-2">6. Copy the token (it starts with <code>ghp_</code>)</li>
              <li className="pl-2">7. Paste it below</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-secondary-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-secondary-500 font-mono text-sm"
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-300">
              <strong>⚠️ Keep your token secure!</strong><br />
              Never share your token with anyone. We securely store it encrypted in Firebase.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveToken}
              disabled={isSaving || !token.trim()}
              className="flex-1 px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : '💾 Save Token'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
