import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Github,
  CheckCircle2,
  Loader2,
  Layout,
  FileText,
  Server,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  Coins,
  CreditCard,
  X
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import {
  usePortfolioTemplates,
  useUnlockedTemplates,
  useUnlockTemplate,
  usePortfolioGeneration,
  usePortfolioSessions,
  useDeletePortfolioSession
} from '../hooks/usePortfolio';
import { useResumes } from '../hooks/useResumes';
import { useAuth } from '../context/AuthContext';
import { useCreditBalance } from '../hooks/useCredits';
import { linkGitHubAccount, isGitHubLinked } from '../services/github-auth.service';
import { linkPlatformToken, checkPlatformLinked } from '../services/portfolio.service';
import { paymentService } from '../services/payment.service';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: templates, isLoading: templatesLoading } = usePortfolioTemplates();
  const { data: unlockedTemplates, isLoading: unlockedLoading, refetch: refetchUnlocked } = useUnlockedTemplates();
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { data: sessions } = usePortfolioSessions();
  const unlockMutation = useUnlockTemplate();
  const { mutate: deleteSession } = useDeletePortfolioSession();

  const {
    generate,
    deploy,
    isGenerating,
    isDeploying,
    generateError,
    deployError,
    previewHtml,
    zipUrl,
    sessionId,
    deployResult
  } = usePortfolioGeneration();

  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [repoName, setRepoName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLinkingGitHub, setIsLinkingGitHub] = useState(false);
  const [deploymentPlatform, setDeploymentPlatform] = useState<'github' | 'vercel' | 'netlify'>('github');
  const [isCheckingGitHub, setIsCheckingGitHub] = useState(true);
  const [hasGitHubLinked, setHasGitHubLinked] = useState(false);
  const [hasVercelLinked, setHasVercelLinked] = useState(false);
  const [hasNetlifyLinked, setHasNetlifyLinked] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenPlatform, setTokenPlatform] = useState<'vercel' | 'netlify'>('vercel');
  const [tokenInput, setTokenInput] = useState('');
  const [isLinkingToken, setIsLinkingToken] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get user credits
  const { data: creditsData, refetch: refetchCredits } = useCreditBalance();

  // Check if user signed in with GitHub OR has GitHub linked
  const isGitHubSignIn = user?.providerData?.some((provider: any) => provider.providerId === 'github.com');
  const isGitHubAuthenticated = isGitHubSignIn || hasGitHubLinked;

  // Check linked status
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.uid) {
        setIsCheckingGitHub(false);
        return;
      }

      try {
        const [githubLinked, vercelStatus, netlifyStatus] = await Promise.all([
          isGitHubLinked(user.uid),
          checkPlatformLinked('vercel'),
          checkPlatformLinked('netlify')
        ]);

        setHasGitHubLinked(githubLinked);
        setHasVercelLinked(vercelStatus.linked);
        setHasNetlifyLinked(netlifyStatus.linked);
      } catch (error) {
        console.error('Error checking platform status:', error);
      } finally {
        setIsCheckingGitHub(false);
      }
    };

    checkStatus();
  }, [user?.uid]);

  const handleLinkGitHub = async () => {
    setIsLinkingGitHub(true);
    toast.loading('Linking GitHub account...', { id: 'link-github' });

    try {
      await linkGitHubAccount();
      setHasGitHubLinked(true);
      toast.dismiss('link-github');
      toast.success('GitHub account linked successfully!');
    } catch (error: any) {
      toast.dismiss('link-github');
      toast.error(error.message || 'Failed to link GitHub account');
    } finally {
      setIsLinkingGitHub(false);
    }
  };

  const handleOpenTokenModal = (platform: 'vercel' | 'netlify') => {
    setTokenPlatform(platform);
    setTokenInput('');
    setShowTokenModal(true);
  };

  const handleLinkPlatformToken = async () => {
    if (!tokenInput.trim()) {
      toast.error('Please enter a valid token');
      return;
    }

    setIsLinkingToken(true);
    const toastId = toast.loading(`Linking ${tokenPlatform}...`);

    try {
      await linkPlatformToken(tokenPlatform, tokenInput.trim());

      if (tokenPlatform === 'vercel') setHasVercelLinked(true);
      else setHasNetlifyLinked(true);

      toast.success(`${tokenPlatform} account linked successfully!`, { id: toastId });
      setShowTokenModal(false);
      setTokenInput('');
    } catch (error: any) {
      toast.error(error.message || `Failed to link ${tokenPlatform}`, { id: toastId });
    } finally {
      setIsLinkingToken(false);
    }
  };

  const handleGenerate = () => {
    if (!selectedResume || !selectedTemplate) {
      toast.error('Please select both a resume and a template');
      return;
    }
    const template = templates?.find((t: any) => t.id === selectedTemplate);
    const templateName = template?.name || 'Portfolio';

    toast.loading(`Generating ${templateName}...`);
    generate({
      resume_id: selectedResume,
      template_id: selectedTemplate,
      theme: 'light'
    });
    setShowPreview(true);
  };

  const handleDeploy = () => {
    if (!sessionId || !zipUrl) {
      toast.error('Please generate a portfolio first');
      return;
    }

    if (deploymentPlatform === 'github' && !isGitHubAuthenticated) {
      toast.error('Please link your GitHub account first');
      return;
    }

    const platformName = deploymentPlatform.charAt(0).toUpperCase() + deploymentPlatform.slice(1);
    toast.loading(`Deploying to ${platformName}...`, { id: 'deploy' });

    deploy({
      session_id: sessionId,
      repo_name: repoName || `${selectedResume}-portfolio`,
      zip_url: zipUrl,
      platform: deploymentPlatform
    });
  };

  const [unlockModal, setUnlockModal] = useState<{ isOpen: boolean; template: any | null }>({
    isOpen: false,
    template: null
  });

  const handleUnlockTemplate = (templateId: string) => {
    if (unlockedTemplates?.includes(templateId)) {
      setSelectedTemplate(templateId);
      return;
    }

    const template = templates?.find((t: any) => t.id === templateId);
    if (!template) return;

    setUnlockModal({ isOpen: true, template });
  };

  const confirmUnlockWithCredits = () => {
    const template = unlockModal.template;
    if (!template) return;

    const userBalance = creditsData?.balance || 0;

    if (userBalance < template.price_credits) {
      toast.error(`Insufficient credits. You need ${template.price_credits - userBalance} more credits.`);
      return;
    }

    setUnlockModal({ isOpen: false, template: null });
    toast.loading('Unlocking template...', { id: 'unlock' });

    unlockMutation.mutate(
      { templateId: template.id, paymentMethod: 'credits' },
      {
        onSuccess: async (data) => {
          console.log('[Unlock Success] Response:', data);
          console.log('[Unlock Success] Refetching unlocked templates and credits...');

          // Force refetch both queries
          const results = await Promise.all([
            refetchUnlocked(),
            refetchCredits()
          ]);

          console.log('[Unlock Success] Refetch results:', results);
          console.log('[Unlock Success] New unlocked templates:', results[0].data);
          console.log('[Unlock Success] New credits:', results[1].data);

          setSelectedTemplate(template.id);
          toast.success('Template unlocked successfully!', { id: 'unlock' });
        },
        onError: (error: any) => {
          console.error('[Unlock Error]', error);
          toast.error(error.message || 'Failed to unlock template', { id: 'unlock' });
        }
      }
    );
  };

  const handleRazorpayPayment = async (template: any) => {
    if (isProcessingPayment) return;

    setIsProcessingPayment(true);
    toast.loading('Initializing payment...', { id: 'payment' });

    try {
      // Step 1: Create order via Lambda
      const order = await paymentService.createOrder(
        `TEMPLATE#${template.id}`,
        template.price_inr
      );

      toast.dismiss('payment');

      // Step 2: Open Razorpay checkout
      await paymentService.openRazorpayCheckout(
        order,
        user?.email || '',
        user?.displayName || 'User',
        async (response: any) => {
          // Payment success - verify with backend
          toast.loading('Verifying payment...', { id: 'verify' });
          try {
            await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            // Now unlock the template
            unlockMutation.mutate(
              { templateId: template.id, paymentMethod: 'inr' },
              {
                onSuccess: async () => {
                  await refetchUnlocked();
                  setSelectedTemplate(template.id);
                  toast.success('Payment successful! Template unlocked.', { id: 'verify' });
                  setIsProcessingPayment(false);
                },
                onError: (error: any) => {
                  toast.error('Payment verified but unlock failed. Contact support.', { id: 'verify' });
                  setIsProcessingPayment(false);
                }
              }
            );
          } catch (error: any) {
            toast.error('Payment verification failed', { id: 'verify' });
            setIsProcessingPayment(false);
          }
        },
        (error: any) => {
          // Payment failed or cancelled
          toast.error(error.message || 'Payment cancelled');
          setIsProcessingPayment(false);
        }
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize payment', { id: 'payment' });
      setIsProcessingPayment(false);
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; sessionId: string | null }>({
    isOpen: false,
    sessionId: null
  });

  const confirmDeleteSession = async () => {
    if (!deleteConfirmation.sessionId) return;

    const sessionId = deleteConfirmation.sessionId;
    setDeleteConfirmation({ isOpen: false, sessionId: null });

    toast.loading('Deleting session...', { id: 'delete-session' });
    deleteSession(sessionId, {
      onSuccess: (data: any) => {
        toast.dismiss('delete-session');
        if (data.message && data.message.includes('failed to delete remote')) {
          toast(data.message, { icon: '⚠️', duration: 5000 });
        } else {
          toast.success(data.message || 'Session deleted successfully');
        }
      },
      onError: (error: Error) => {
        toast.dismiss('delete-session');
        toast.error(error.message || 'Failed to delete session');
      }
    });
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeleteConfirmation({ isOpen: true, sessionId });
  };

  // Effects for success/error handling
  useEffect(() => {
    if (previewHtml && zipUrl) {
      toast.dismiss();
      toast.success('Portfolio generated successfully!');
      // Auto-trigger download
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `portfolio-${sessionId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [previewHtml, zipUrl, sessionId]);

  useEffect(() => {
    if (deployResult?.success) {
      toast.dismiss('deploy');
      toast.success('Deployment successful!');
    }
  }, [deployResult]);

  useEffect(() => {
    if (generateError) toast.error((generateError as Error).message);
    if (deployError) toast.error((deployError as Error).message);
  }, [generateError, deployError]);

  if (templatesLoading || unlockedLoading || resumesLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="w-48 sm:w-64 h-8 sm:h-10 rounded-lg" />
                <Skeleton className="w-64 sm:w-96 h-4 sm:h-5 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Connect Skeleton */}
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
                <Skeleton className="w-48 h-8 mb-6 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>

              {/* Resumes Skeleton */}
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
                <Skeleton className="w-56 h-8 mb-6 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              </div>

              {/* Templates Skeleton */}
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
                <div className="flex justify-between mb-6">
                  <Skeleton className="w-48 h-8 rounded-lg" />
                  <Skeleton className="w-32 h-8 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <div className="p-4 bg-white dark:bg-secondary-900 box-border">
                        <Skeleton className="w-3/4 h-6 mb-2 rounded" />
                        <Skeleton className="w-1/2 h-4 rounded" />
                        <div className="flex gap-2 mt-3">
                          <Skeleton className="w-12 h-5 rounded" />
                          <Skeleton className="w-12 h-5 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-xl border border-secondary-200 dark:border-secondary-700">
                <Skeleton className="w-40 h-8 mb-6 rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
                <Skeleton className="w-32 h-6 mb-4 rounded" />
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 sm:p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Portfolio Builder</h1>
          </div>
          <p className="text-sm sm:text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl">
            Transform your resume into a stunning personal website. Deploy to your favorite platform in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Connect Accounts */}
            <section className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 text-xs font-bold">1</span>
                <h2 className="text-xl font-semibold">Connect & Deploy</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GitHub Card */}
                <div className={`p-4 rounded-xl border transition-all ${isGitHubAuthenticated ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-secondary-50 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Github className={`w-5 h-5 ${isGitHubAuthenticated ? 'text-green-600' : 'text-secondary-600'}`} />
                      <span className="font-medium">GitHub</span>
                    </div>
                    {isGitHubAuthenticated ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <button
                        onClick={handleLinkGitHub}
                        disabled={isLinkingGitHub}
                        className="text-xs font-medium px-3 py-1.5 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {isLinkingGitHub ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-secondary-500">
                    {isGitHubAuthenticated ? 'Connected for automatic deployment.' : 'Connect to deploy to GitHub Pages.'}
                  </p>
                </div>

                {/* Vercel Card */}
                <div className={`p-4 rounded-xl border transition-all ${hasVercelLinked ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-secondary-50 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center bg-black text-white rounded-full text-[10px] font-bold">▲</div>
                      <span className="font-medium">Vercel</span>
                    </div>
                    {hasVercelLinked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <button
                        onClick={() => handleOpenTokenModal('vercel')}
                        className="text-xs font-medium px-3 py-1.5 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-secondary-500">
                    {hasVercelLinked ? 'Connected via Access Token.' : 'Enter token to deploy to Vercel.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2: Select Resume */}
            <section className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 text-xs font-bold">2</span>
                <h2 className="text-xl font-semibold">Select Source Resume</h2>
              </div>

              {(!resumes || resumes.length === 0) ? (
                <div className="text-center py-8 border-2 border-dashed border-secondary-200 dark:border-secondary-700 rounded-xl">
                  <FileText className="w-10 h-10 mx-auto text-secondary-400 mb-2" />
                  <p className="text-secondary-500 mb-4">No resumes found.</p>
                  <button onClick={() => navigate('/upload')} className="text-purple-600 font-medium hover:underline">
                    Upload a resume to get started
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resumes.map((resume: any) => (
                    <div
                      key={resume.resume_id || resume.id}
                      onClick={() => setSelectedResume(resume.resume_id || resume.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedResume === (resume.resume_id || resume.id)
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500'
                        : 'border-secondary-100 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{resume.filename || resume.title || 'Untitled Resume'}</p>
                          <p className="text-xs text-secondary-500">Last updated: {new Date(resume.updated_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                        {selectedResume === (resume.resume_id || resume.id) && (
                          <div className="absolute top-4 right-4 text-purple-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Step 3: Choose Template */}
            <section className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 text-xs font-bold">3</span>
                  <h2 className="text-xl font-semibold">Choose Template</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <Unlock className="w-4 h-4" />
                  <span>{unlockedTemplates?.length || 0} Unlocked</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {templates?.map((template: any) => {
                  const isUnlocked = unlockedTemplates?.includes(template.id);
                  const isSelected = selectedTemplate === template.id;

                  // Logic to check if template is actually available/implemented
                  // Assuming 'is_coming_soon' might come from backend, or we fallback to specific known IDs
                  const isAvailable = template.is_available !== false && !template.is_coming_soon;

                  // If template is NOT unlocked and NOT available, it's "Coming Soon"
                  // If template IS unlocked, we don't care about availability (user already has it or it's legacy)

                  return (
                    <motion.div
                      whileHover={{ y: -4 }}
                      key={template.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedTemplate(template.id);
                        } else if (isAvailable) {
                          // Only open unlock modal if available
                          // handled by button but card click could also trigger?
                          // Better to keep card click only for selection if unlocked
                        }
                      }}
                      className={`group relative rounded-xl border-2 overflow-hidden transition-all ${isSelected
                        ? 'border-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30'
                        : 'border-secondary-200 dark:border-secondary-700'
                        } ${isUnlocked ? 'cursor-pointer' : ''}`}
                    >
                      <div className="aspect-video bg-secondary-100 dark:bg-secondary-800 relative overflow-hidden">
                        <img
                          src={template.thumbnail_url || '/placeholder-template.png'}
                          alt={template.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isAvailable && !isUnlocked ? 'grayscale opacity-60' : ''}`}
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center p-4">
                          {!isUnlocked ? (
                            isAvailable ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnlockTemplate(template.id);
                                }}
                                className="px-4 py-2 bg-white dark:bg-secondary-900 text-black dark:text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-1 min-w-[140px]"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <Lock className="w-4 h-4" />
                                  <span>Unlock</span>
                                </div>
                                <div className="text-[10px] sm:text-xs font-normal text-secondary-500">
                                  {template.price_credits} credits or ₹{template.price_inr}
                                </div>
                              </button>
                            ) : (
                              <span className="px-4 py-2 bg-black/60 text-white backdrop-blur-md rounded-lg text-sm font-semibold">
                                Coming Soon
                              </span>
                            )
                          ) : (
                            isSelected ? (
                              <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTemplate(template.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition-all transform translate-y-2 group-hover:translate-y-0"
                              >
                                Select Template
                              </button>
                            )
                          )}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-white dark:bg-secondary-900">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <p className="text-xs text-secondary-500 uppercase tracking-wider font-medium">{template.tier}</p>
                          </div>
                          {isUnlocked && (
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1">
                              <Unlock className="w-3 h-3" />
                              Owned
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {template.tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-[10px] rounded-md uppercase font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar - Actions & History */}
          <div className="space-y-6">

            {/* Action Panel */}
            <div className={`bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-xl border border-secondary-200 dark:border-secondary-700`}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-purple-600" />
                Preview & Deploy
              </h3>

              <div className="space-y-4">
                {/* Deployment Config */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'github', icon: <Github className="w-4 h-4" />, label: 'Pages' },
                      { id: 'vercel', icon: <div className="text-[10px] font-bold">▲</div>, label: 'Vercel' },
                      { id: 'netlify', icon: <div className="text-xs font-bold text-teal-500">N</div>, label: 'Netlify' }
                    ].map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => setDeploymentPlatform(p.id as any)}
                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border text-xs font-medium transition-all ${deploymentPlatform === p.id
                          ? 'bg-purple-50 border-purple-600 text-purple-700 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-300'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                          }`}
                      >
                        {p.icon}
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-portfolio"
                    className="w-full px-3 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Primary Actions */}
                <div className="pt-2 space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedResume || !selectedTemplate}
                    className="w-full py-3 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Generate Preview
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || !zipUrl}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Server className="w-4 h-4" />
                        Deploy to {deploymentPlatform.charAt(0).toUpperCase() + deploymentPlatform.slice(1)}
                      </>
                    )}
                  </button>

                  {zipUrl && (
                    <a
                      href={zipUrl}
                      download
                      className="block w-full py-2 text-center text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Download ZIP Package
                    </a>
                  )}
                </div>

                {/* Deployment Result */}
                <AnimatePresence>
                  {deployResult && deployResult.success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-3">
                        <CheckCircle2 className="w-4 h-4" />
                        Deployed Successfully
                      </div>
                      <div className="space-y-2">
                        <a
                          href={deployResult.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 bg-white dark:bg-secondary-800 rounded-lg text-sm text-secondary-600 dark:text-secondary-300 hover:text-purple-600 transition-colors"
                        >
                          <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Live Site</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={deployResult.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 bg-white dark:bg-secondary-800 rounded-lg text-sm text-secondary-600 dark:text-secondary-300 hover:text-purple-600 transition-colors"
                        >
                          <span className="flex items-center gap-2"><Github className="w-3 h-3" /> Repository</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary-500 mb-4">Recent Deployments</h3>
              <div className="space-y-3">
                {sessions?.map((session: any) => {
                  const createdDate = new Date(session.created_at);
                  const deployedDate = session.deployed_at ? new Date(session.deployed_at) : null;

                  // Helper to get platform icon and color
                  const getPlatformDetails = (p: string) => {
                    switch (p?.toLowerCase()) {
                      case 'vercel': return { icon: <div className="text-[10px] font-bold">▲</div>, color: 'text-black dark:text-white', bg: 'bg-black/5 dark:bg-white/10' };
                      case 'netlify': return { icon: <div className="text-[10px] font-bold">N</div>, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' };
                      default: return { icon: <Github className="w-4 h-4" />, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' };
                    }
                  };

                  const platformDetails = getPlatformDetails(session.deployment_platform || 'github');

                  return (
                    <div key={session.id} className="group relative p-4 rounded-xl border border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/30 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg flex items-center justify-center ${platformDetails.bg} ${platformDetails.color}`}>
                            {platformDetails.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-secondary-900 dark:text-secondary-100">
                                {session.repo_name || session.repo_url?.split('/').pop() || 'Untitled Portfolio'}
                              </h4>
                              {session.deployed && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                  Live
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-1 text-xs text-secondary-500">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-400"></span>
                                {deployedDate ? deployedDate.toLocaleString() : createdDate.toLocaleString()}
                              </span>

                              <div className="flex items-center gap-3 mt-2">
                                {session.repo_url && (
                                  <a
                                    href={session.repo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                                    title="View Repository"
                                  >
                                    <Github className="w-3 h-3" />
                                    <span>Repo</span>
                                  </a>
                                )}
                                {session.pages_url && (
                                  <a
                                    href={session.pages_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                                    title="View Live Site"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Live</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteClick(session.id)}
                          className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!sessions?.length && (
                  <div className="text-center py-8 text-secondary-500">
                    <p className="text-sm">No deployment history yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmation.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setDeleteConfirmation({ isOpen: false, sessionId: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-secondary-900 w-full max-w-sm rounded-2xl p-6 shadow-xl border border-secondary-200 dark:border-secondary-700"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-4">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">
                    Delete Deployment?
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Are you sure you want to delete this deployment? This action cannot be undone and will remove it from your history.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmation({ isOpen: false, sessionId: null })}
                    className="flex-1 px-4 py-2.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 font-semibold rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteSession}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && previewHtml && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-secondary-900 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Layout className="w-5 h-5 text-purple-600" />
                    Live Preview
                  </h3>
                  <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full transition-colors">
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full flex-1 bg-white"
                  title="Portfolio Preview"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token Modal */}
        {showTokenModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-secondary-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-secondary-200 dark:border-secondary-700">
              <h3 className="text-xl font-bold mb-4">Connect {tokenPlatform === 'vercel' ? 'Vercel' : 'Netlify'}</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6">
                Enter your Personal Access Token (PAT) to enable automatic deployments.
                <a href={tokenPlatform === 'vercel' ? 'https://vercel.com/account/tokens' : 'https://app.netlify.com/user/applications/personal'} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline ml-1">
                  Get Token <ExternalLink className="w-3 h-3 inline" />
                </a>
              </p>

              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={`Paste your ${tokenPlatform} token here`}
                className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="px-4 py-2 text-secondary-600 font-medium hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkPlatformToken}
                  disabled={isLinkingToken}
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isLinkingToken ? 'Linking...' : 'Connect Account'}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Unlock Template Modal */}
        <AnimatePresence>
          {unlockModal.isOpen && unlockModal.template && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
              onClick={() => setUnlockModal({ isOpen: false, template: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#111111] dark:bg-[#111111] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              >
                {/* Modal Header */}
                <div className="relative p-5 sm:p-6 bg-gradient-to-r from-yellow-600/90 to-yellow-800/90 dark:from-yellow-900/50 dark:to-yellow-800/50 text-white border-b border-white/10">
                  <button
                    onClick={() => setUnlockModal({ isOpen: false, template: null })}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 max-w-[90%]">Unlock Template</h3>
                  <p className="text-yellow-100/80 text-xs sm:text-sm truncate max-w-[90%]">
                    Unlock "{unlockModal.template.name}"
                  </p>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 bg-[#111111] dark:bg-[#111111]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Credits */}
                    <button
                      onClick={confirmUnlockWithCredits}
                      className="group relative flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-yellow-500/50 bg-[#0a0a0a] transition-all text-center"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                        <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-white mb-1">Use Credits</h4>
                      <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-bold text-yellow-400">
                        {unlockModal.template.price_credits}
                        <span className="text-xs sm:text-sm font-medium text-gray-400">pts</span>
                      </div>
                      <p className="mt-2 text-[10px] sm:text-xs font-medium text-gray-400 bg-white/5 px-2 sm:px-3 py-1 rounded-full">
                        Balance: {creditsData?.balance || 0}
                      </p>

                      {(creditsData?.balance || 0) < unlockModal.template.price_credits && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] rounded-2xl flex items-center justify-center border border-red-500/30">
                          <span className="text-xs font-bold bg-red-500/20 text-red-500 px-3 py-1 rounded-full shadow-sm border border-red-500/20">
                            Insufficient Balance
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Option 2: Razorpay */}
                    <button
                      onClick={() => {
                        setUnlockModal({ isOpen: false, template: null });
                        handleRazorpayPayment(unlockModal.template);
                      }}
                      className="group flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 bg-[#0a0a0a] transition-all text-center"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-white mb-1">Pay Online</h4>
                      <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-bold text-blue-400">
                        ₹{unlockModal.template.price_inr}
                      </div>
                      <p className="mt-2 text-[10px] sm:text-xs font-medium text-gray-400 bg-white/5 px-2 sm:px-3 py-1 rounded-full">
                        One-time purchase
                      </p>
                    </button>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Unlocking gives you permanent access to this template.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
