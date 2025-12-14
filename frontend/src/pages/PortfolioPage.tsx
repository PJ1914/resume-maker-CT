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
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  Eye,
  Filter
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { DNSInstructionsModal } from '../components/DNSInstructionsModal';
import {
  usePortfolioTemplates,
  useUnlockedTemplates,
  useUnlockTemplate,
  usePortfolioGeneration,
  usePortfolioSessions,
  useDeletePortfolioSession,
  useRedeployPortfolio
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
  const { data: sessions, refetch: refetchSessions } = usePortfolioSessions();
  const unlockMutation = useUnlockTemplate();
  const { mutate: deleteSession } = useDeletePortfolioSession();
  const { mutate: redeploySession, isPending: isRedeploying } = useRedeployPortfolio();

  const {
    generate,
    deploy,
    isGenerating,
    isDeploying,
    generateError,
    deployError,
    generateResult,
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
  const [redeployModal, setRedeployModal] = useState<{ isOpen: boolean; session: any }>({ isOpen: false, session: null });
  const [redeployPlatform, setRedeployPlatform] = useState<'github' | 'vercel' | 'netlify'>('github');
  const [redeployRepoName, setRedeployRepoName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [redeployCustomDomain, setRedeployCustomDomain] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<{ [key: string]: boolean }>({});
  const [dnsModal, setDnsModal] = useState<{ isOpen: boolean; domain: string; instructions: any }>({ 
    isOpen: false, 
    domain: '', 
    instructions: null 
  });
  
  // Add state for deployment confirmation modal after ZIP download
  const [showDeployConfirmModal, setShowDeployConfirmModal] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);
  
  // Add state for reuse existing portfolio confirmation modal
  const [showReuseConfirmModal, setShowReuseConfirmModal] = useState(false);
  const [pendingGenerateParams, setPendingGenerateParams] = useState<any>(null);

  // Favorites state
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; template: any | null }>({
    isOpen: false,
    template: null
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteTemplates');
    if (savedFavorites) {
      try {
        setFavoriteTemplates(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  // Toggle favorite template
  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => {
      const newFavorites = prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId];
      localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

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
    
    // CRITICAL: Reset zipDownloaded to false for new generation
    setZipDownloaded(false);
    setShowReuseConfirmModal(false);
    setShowDeployConfirmModal(false);
    
    const params = {
      resume_id: selectedResume,
      template_id: selectedTemplate,
      theme: 'light' as const,
      force_new: false
    };
    
    // Store params for potential regeneration
    setPendingGenerateParams(params);
    
    generate(params);
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
      platform: deploymentPlatform,
      custom_domain: customDomain || undefined
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
      const shortfall = template.price_credits - userBalance;
      toast.error(
        (t) => (
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Insufficient Credits</p>
            <p className="text-sm">You need {shortfall} more credits to unlock this template.</p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/pricing');
              }}
              className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
            >
              Buy Credits
            </button>
          </div>
        ),
        { duration: 5000 }
      );
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
              response.razorpay_signature,
              1 // quantity - template unlock is always 1
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
        if (data && data.message && data.message.includes('failed')) {
          toast(data.message, { icon: '⚠️', duration: 5000 });
        } else {
          toast.success(data?.message || 'Session deleted successfully');
        }
        refetchSessions();
      },
      onError: (error: Error) => {
        toast.dismiss('delete-session');
        toast.error(error.message || 'Failed to delete session');
        refetchSessions();
      }
    });
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeleteConfirmation({ isOpen: true, sessionId });
  };

  const handleRedeployClick = (session: any) => {
    setRedeployModal({ isOpen: true, session });
    setRedeployPlatform('github');
    setRedeployRepoName(session.repo_name || `portfolio-${session.id.slice(0, 8)}`);
  };
  
  const handleReuseExisting = () => {
    setShowReuseConfirmModal(false);
    toast.success('Using your existing portfolio!');
    
    // Continue with download
    if (zipUrl && sessionId) {
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `portfolio-${sessionId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mark as downloaded and show deploy confirmation modal
      setZipDownloaded(true);
      
      setTimeout(() => {
        setShowDeployConfirmModal(true);
      }, 500);
    }
  };
  
  const handleCreateNew = () => {
    setShowReuseConfirmModal(false);
    setZipDownloaded(false);
    
    // Clear current preview
    setShowPreview(false);
    
    toast.loading('Creating new portfolio...');
    
    // Regenerate with force_new flag
    if (pendingGenerateParams) {
      generate({
        ...pendingGenerateParams,
        force_new: true
      });
      setShowPreview(true);
    }
  };
  
  const handleSkipDeployment = () => {
    setShowDeployConfirmModal(false);
    
    // Mark as downloaded immediately to prevent re-trigger
    setZipDownloaded(true);
    
    toast.success('Portfolio downloaded successfully! Refreshing page...');
    
    // Reload the page to end the session
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  const handleProceedToDeploy = () => {
    setShowDeployConfirmModal(false);
    // User can now deploy using the deploy button
    toast.success('You can now deploy your portfolio using the deploy button below.');
  };

  const handleConfirmRedeploy = () => {
    if (!redeployModal.session || !redeployRepoName.trim()) {
      toast.error('Please enter a repository name');
      return;
    }

    const platformName = redeployPlatform.charAt(0).toUpperCase() + redeployPlatform.slice(1);
    toast.loading(`Redeploying to ${platformName}...`, { id: 'redeploy' });

    redeploySession(
      {
        sessionId: redeployModal.session.id,
        platform: redeployPlatform,
        repoName: redeployRepoName,
        customDomain: redeployCustomDomain || undefined
      },
      {
        onSuccess: (data) => {
          toast.dismiss('redeploy');
          toast.success(data.message || `Successfully redeployed to ${platformName}!`);
          setRedeployModal({ isOpen: false, session: null });

          // Refetch sessions to update the UI with new deployment links
          refetchSessions();

          // Show live URL
          if (data.live_url) {
            setTimeout(() => {
              toast.success(
                (t) => (
                  <div className="flex items-center gap-2">
                    <span>Live at:</span>
                    <a
                      href={data.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-medium"
                    >
                      {data.live_url}
                    </a>
                  </div>
                ),
                { duration: 8000 }
              );
            }, 1000);
          }
        },
        onError: (error: any) => {
          toast.dismiss('redeploy');
          const errorMessage = error.message || `Failed to redeploy to ${platformName}`;
          toast.error(errorMessage);
        }
      }
    );
  };

  // Effects for success/error handling
  useEffect(() => {
    console.log('📊 Portfolio Generation Check:', {
      previewHtml: !!previewHtml,
      zipUrl: !!zipUrl,
      zipDownloaded,
      generateResult,
      reused_existing: generateResult?.reused_existing,
      session_id: generateResult?.session_id
    });
    
    // Check if we have a new generation result
    if (generateResult && !zipDownloaded) {
      toast.dismiss();
      
      // Check if existing session was reused
      if (generateResult.reused_existing === true) {
        console.log('♻️ SHOWING REUSE MODAL - Existing session detected!');
        // Show reuse confirmation modal instead of auto-downloading
        setShowReuseConfirmModal(true);
      } else if (previewHtml && zipUrl) {
        console.log('🆕 NEW GENERATION - Auto-downloading ZIP');
        // New portfolio generated - proceed with download
        toast.success('Portfolio generated successfully!');
        
        // Auto-trigger download
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `portfolio-${sessionId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mark as downloaded and show deploy confirmation modal
        setZipDownloaded(true);
        
        // Show deploy confirmation modal after a brief delay
        setTimeout(() => {
          setShowDeployConfirmModal(true);
        }, 500);
      }
    }
  }, [generateResult, zipDownloaded, previewHtml, zipUrl, sessionId]);

  useEffect(() => {
    if (deployResult?.success) {
      toast.dismiss('deploy');
      toast.success('Deployment successful!');
      
      // Show DNS instructions modal if GitHub deployment with custom domain
      if (deployResult.dns_instructions && deployResult.custom_domain) {
        setDnsModal({
          isOpen: true,
          domain: deployResult.custom_domain,
          instructions: deployResult.dns_instructions
        });
      }
      
      // Refetch sessions to update the UI with new deployment links
      refetchSessions();
    }
  }, [deployResult, refetchSessions]);

  useEffect(() => {
    if (generateError) {
      const errorMessage = (generateError as Error).message;
      
      // Check if it's a "template not unlocked" error
      if (errorMessage.includes('not unlocked') || errorMessage.includes('Purchase it first')) {
        const template = templates?.find((t: any) => t.id === selectedTemplate);
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Template Not Unlocked</p>
              <p className="text-sm">{template?.name || 'This template'} requires purchase to use.</p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleUnlockTemplate(selectedTemplate);
                }}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors flex items-center gap-1.5 justify-center"
              >
                <Lock className="w-3.5 h-3.5" />
                Unlock Template
              </button>
            </div>
          ),
          { duration: 5000 }
        );
      } else if (errorMessage.includes('Insufficient credits')) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Insufficient Credits</p>
              <p className="text-sm">{errorMessage}</p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/pricing');
                }}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
              >
                Buy Credits
              </button>
            </div>
          ),
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
    
    if (deployError) {
      const errorMessage = (deployError as Error).message;
      
      if (errorMessage.includes('Insufficient credits')) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Insufficient Credits</p>
              <p className="text-sm">You don't have enough credits to deploy.</p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/pricing');
                }}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
              >
                Buy Credits
              </button>
            </div>
          ),
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  }, [generateError, deployError, templates, selectedTemplate, navigate]);

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
            <section className="bg-white dark:bg-secondary-900 rounded-2xl p-5 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 text-xs font-bold">1</span>
                <h2 className="text-lg font-semibold">Connect & Deploy</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* GitHub Card */}
                <div className={`p-4 rounded-xl border transition-all ${isGitHubAuthenticated ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-secondary-50 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Github className={`w-4 h-4 ${isGitHubAuthenticated ? 'text-green-600' : 'text-secondary-600'}`} />
                      <span className="font-medium text-sm">GitHub</span>
                    </div>
                    {isGitHubAuthenticated ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <button
                        onClick={handleLinkGitHub}
                        disabled={isLinkingGitHub}
                        className="text-[10px] font-medium px-2 py-1 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 rounded hover:opacity-90 transition-opacity"
                      >
                        {isLinkingGitHub ? '...' : 'Connect'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary-500 leading-tight">
                    {isGitHubAuthenticated ? 'Connected.' : 'Deploy to GitHub Pages.'}
                  </p>
                </div>

                {/* Vercel Card */}
                <div className={`p-4 rounded-xl border transition-all ${hasVercelLinked ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-secondary-50 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center bg-black text-white rounded-full text-[8px] font-bold">▲</div>
                      <span className="font-medium text-sm">Vercel</span>
                    </div>
                    {hasVercelLinked ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <button
                        onClick={() => handleOpenTokenModal('vercel')}
                        className="text-[10px] font-medium px-2 py-1 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 rounded hover:opacity-90 transition-opacity"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary-500 leading-tight">
                    {hasVercelLinked ? 'Connected.' : 'Deploy to Vercel.'}
                  </p>
                </div>

                {/* Netlify Card */}
                <div className={`p-4 rounded-xl border transition-all ${hasNetlifyLinked ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-secondary-50 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center bg-teal-500 text-white rounded text-[8px] font-bold">N</div>
                      <span className="font-medium text-sm">Netlify</span>
                    </div>
                    {hasNetlifyLinked ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <button
                        onClick={() => handleOpenTokenModal('netlify')}
                        className="text-[10px] font-medium px-2 py-1 bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 rounded hover:opacity-90 transition-opacity"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary-500 leading-tight">
                    {hasNetlifyLinked ? 'Connected.' : 'Deploy to Netlify.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2: Select Resume */}
            <section className="bg-white dark:bg-secondary-900 rounded-2xl p-5 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 text-xs font-bold">2</span>
                <h2 className="text-lg font-semibold">Select Source Resume</h2>
              </div>

              {(!resumes || resumes.length === 0) ? (
                // ... keep existing empty state ...
                <div className="text-center py-6 border-2 border-dashed border-secondary-200 dark:border-secondary-700 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto text-secondary-400 mb-2" />
                  <p className="text-sm text-secondary-500 mb-3">No resumes found.</p>
                  <button onClick={() => navigate('/upload')} className="text-purple-600 font-medium hover:underline text-sm">
                    Upload a resume
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {resumes.slice(0, 6).map((resume: any) => (
                    <div
                      key={resume.resume_id || resume.id}
                      onClick={() => setSelectedResume(selectedResume === (resume.resume_id || resume.id) ? '' : (resume.resume_id || resume.id))}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all ${selectedResume === (resume.resume_id || resume.id)
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500'
                        : 'border-secondary-100 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                          <p className="font-medium truncate text-sm">{resume.filename || resume.title || 'Untitled Resume'}</p>
                          <p className="text-[10px] text-secondary-500 truncate">{new Date(resume.updated_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                        {selectedResume === (resume.resume_id || resume.id) && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            <div className="text-purple-600 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedResume('');
                              }}
                              className="p-0.5 bg-secondary-200 dark:bg-secondary-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 transition-colors"
                              title="Unselect"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Step 3: Choose Template */}
            <section className="bg-white dark:bg-secondary-900 rounded-2xl p-5 shadow-sm border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 text-xs font-bold">3</span>
                  <h2 className="text-lg font-semibold">Choose Template</h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Favorites Filter */}
                  <button
                    onClick={() => {
                      setShowOnlyFavorites(!showOnlyFavorites);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      showOnlyFavorites
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                    {showOnlyFavorites ? `Favorites (${favoriteTemplates.length})` : 'Favorites'}
                  </button>
                  <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                    <Unlock className="w-3 h-3" />
                    <span>{unlockedTemplates?.length || 0} Unlocked</span>
                  </div>
                </div>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                key={`${currentPage}-${showOnlyFavorites}`}
              >
                {templates
                  ?.filter((template: any) => !showOnlyFavorites || favoriteTemplates.includes(template.id))
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((template: any) => {
                  const isUnlocked = unlockedTemplates?.includes(template.id);
                  const isSelected = selectedTemplate === template.id;
                  const isFavorite = favoriteTemplates.includes(template.id);

                  // Logic to check if template is actually available/implemented
                  // Assuming 'is_coming_soon' might come from backend, or we fallback to specific known IDs
                  const isAvailable = template.is_available !== false && !template.is_coming_soon;

                  return (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      key={template.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedTemplate(selectedTemplate === template.id ? '' : template.id);
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

                        {/* Top-right action buttons (always visible) */}
                        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                          {/* Favorite button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(template.id);
                            }}
                            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                              isFavorite
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-white/80 dark:bg-black/60 text-secondary-600 dark:text-secondary-300 hover:bg-white dark:hover:bg-black/80'
                            }`}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* Preview button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModal({ isOpen: true, template });
                            }}
                            className="p-1.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md text-secondary-600 dark:text-secondary-300 hover:bg-white dark:hover:bg-black/80 transition-all"
                            title="Preview template"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center p-4">
                          {!isUnlocked ? (
                            isAvailable ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnlockTemplate(template.id);
                                }}
                                className="px-3 py-1.5 bg-white dark:bg-secondary-900 text-black dark:text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-1 min-w-[120px]"
                              >
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Unlock</span>
                                </div>
                                <div className="text-[10px] font-normal text-secondary-500">
                                  {template.price_credits} credits or ₹{template.price_inr}
                                </div>
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 bg-black/60 text-white backdrop-blur-md rounded-lg text-xs font-semibold">
                                Coming Soon
                              </span>
                            )
                          ) : (
                            isSelected ? (
                              <div className="absolute top-2 right-2 flex gap-1">
                                <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTemplate('');
                                  }}
                                  className="bg-white dark:bg-secondary-800 text-secondary-500 p-1.5 rounded-full shadow-lg hover:text-red-500 transition-colors"
                                  title="Unselect"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTemplate(template.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition-all transform translate-y-2 group-hover:translate-y-0 text-sm"
                              >
                                Select
                              </button>
                            )
                          )}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            <div className="bg-purple-600 text-white p-1 rounded-full shadow-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate('');
                              }}
                              className="bg-white dark:bg-secondary-800 text-secondary-500 p-1 rounded-full shadow-lg hover:text-red-500 transition-colors"
                              title="Unselect"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white dark:bg-secondary-900">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <h3 className="font-semibold text-base leading-tight">{template.name}</h3>
                            <p className="text-[10px] text-secondary-500 uppercase tracking-wider font-medium">{template.tier}</p>
                          </div>
                          {isUnlocked && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5" />
                              Owned
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {template.tags?.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-[10px] rounded uppercase font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Pagination Controls */}
              {(() => {
                const filteredTemplates = templates?.filter((template: any) => !showOnlyFavorites || favoriteTemplates.includes(template.id)) || [];
                const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
                return filteredTemplates.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" />
                    </button>
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-5 h-5 -rotate-90" />
                    </button>
                  </div>
                );
              })()}
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

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Custom Domain <span className="text-xs text-secondary-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="portfolio.yourdomain.com"
                    className="w-full px-3 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    You'll need to configure DNS settings after deployment
                  </p>
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
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeploying ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deploying...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          Deploy to {deploymentPlatform.charAt(0).toUpperCase() + deploymentPlatform.slice(1)}
                        </div>
                        <div className="text-xs font-normal opacity-90">
                          Cost: {deploymentPlatform === 'github' ? '3' : deploymentPlatform === 'netlify' ? '5' : '7'} credits
                        </div>
                      </div>
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
                      case 'vercel': return { icon: <div className="text-[10px] font-bold">▲</div>, color: 'text-black dark:text-white', bg: 'bg-black/5 dark:bg-white/10', name: 'Vercel' };
                      case 'netlify': return { icon: <div className="text-[10px] font-bold">N</div>, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', name: 'Netlify' };
                      default: return { icon: <Github className="w-4 h-4" />, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800', name: 'GitHub' };
                    }
                  };

                  // Get all deployments for this session
                  const deployments = session.deployments || [];
                  const hasDeployments = deployments.length > 0 || session.deployed || session.repo_url || session.pages_url;

                  return (
                    <div key={session.id} className="group relative p-4 rounded-xl border border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/30 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-sm text-secondary-900 dark:text-secondary-100">
                                {session.repo_name || session.repo_url?.split('/').pop() || 'Untitled Portfolio'}
                              </h4>
                              {hasDeployments && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                  {deployments.length > 0 ? `${deployments.length} Live` : 'Live'}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 text-xs text-secondary-500">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-400"></span>
                                {deployedDate ? deployedDate.toLocaleString() : createdDate.toLocaleString()}
                              </span>

                              {/* Show all deployment links */}
                              {deployments.length > 0 ? (
                                <div className="flex flex-col gap-2 mt-1">
                                  {/* Active deployments only (summary view) */}
                                  {deployments.filter((d: any) => d.status === 'active' || !d.status).slice(0, 3).map((deployment: any, idx: number) => {
                                    const platformInfo = getPlatformDetails(deployment.platform);
                                    return (
                                      <div key={idx} className="flex items-center gap-2 flex-wrap">
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${platformInfo.bg} ${platformInfo.color}`}>
                                          {platformInfo.icon}
                                          <span className="font-medium text-[11px]">{platformInfo.name}</span>
                                        </div>
                                        {deployment.credits_spent && (
                                          <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">
                                            {deployment.credits_spent} credits
                                          </span>
                                        )}
                                        {deployment.custom_domain && (
                                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {deployment.custom_domain}
                                          </span>
                                        )}
                                        {deployment.repo_url && (
                                          <a
                                            href={deployment.repo_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                                            title="View Repository"
                                          >
                                            <Github className="w-3 h-3" />
                                            <span>Repo</span>
                                          </a>
                                        )}
                                        {deployment.live_url && (
                                          <a
                                            href={deployment.live_url}
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
                                    );
                                  })}

                                  {/* Show "View All" if more than 3 deployments OR has replaced ones */}
                                  {(deployments.length > 3 || deployments.some((d: any) => d.status === 'replaced')) && (
                                    <div className="mt-2">
                                      <button
                                        onClick={() => setExpandedHistory(prev => ({ ...prev, [session.id]: !prev[session.id] }))}
                                        className="flex items-center gap-1 text-[11px] text-secondary-500 hover:text-purple-600 transition-colors"
                                      >
                                        <Clock className="w-3 h-3" />
                                        <span>
                                          {deployments.some((d: any) => d.status === 'replaced')
                                            ? `View Full History (${deployments.filter((d: any) => d.status === 'replaced').length} replaced)`
                                            : `View All (${deployments.length} total)`
                                          }
                                        </span>
                                        {expandedHistory[session.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>

                                      {expandedHistory[session.id] && (
                                        <div className="mt-2 pl-4 border-l-2 border-secondary-200 dark:border-secondary-700 space-y-2">
                                          {/* Show replaced deployments if any */}
                                          {deployments.filter((d: any) => d.status === 'replaced').map((deployment: any, idx: number) => {
                                            const platformInfo = getPlatformDetails(deployment.platform);
                                            const deployDate = deployment.deployed_at?.toDate ? deployment.deployed_at.toDate() : deployment.deployed_at ? new Date(deployment.deployed_at) : null;
                                            const replacedDate = deployment.replaced_at?.toDate ? deployment.replaced_at.toDate() : deployment.replaced_at ? new Date(deployment.replaced_at) : null;

                                            return (
                                              <div key={idx} className="flex flex-col gap-1 opacity-60">
                                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${platformInfo.bg} ${platformInfo.color}`}>
                                                    {platformInfo.icon}
                                                    <span className="font-medium">{platformInfo.name}</span>
                                                  </div>
                                                  {deployment.credits_spent && (
                                                    <span className="text-yellow-600 dark:text-yellow-400">
                                                      {deployment.credits_spent} credits
                                                    </span>
                                                  )}
                                                  <span className="text-gray-500">
                                                    Replaced {replacedDate ? replacedDate.toLocaleDateString() : ''}
                                                  </span>
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                  Deployed: {deployDate.toLocaleString()}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Total credits spent */}
                                  {deployments.some((d: any) => d.credits_spent) && (
                                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                      Total spent: {deployments.reduce((sum: number, d: any) => sum + (d.credits_spent || 0), 0)} credits
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* Fallback to old single deployment links for backwards compatibility */
                                hasDeployments && (
                                  <div className="flex items-center gap-3 mt-1">
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
                                )
                              )}

                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {/* Show "Deploy" for never-deployed sessions, "Re-Deploy" for already deployed ones */}
                                {hasDeployments ? (
                                  <button
                                    onClick={() => handleRedeployClick(session)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors font-medium"
                                    title="Deploy to another platform"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Re-Deploy</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRedeployClick(session)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors font-medium"
                                    title="Deploy this portfolio"
                                  >
                                    <Server className="w-3 h-3" />
                                    <span>Deploy</span>
                                  </button>
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

        {/* Redeploy Modal */}
        <AnimatePresence>
          {redeployModal.isOpen && redeployModal.session && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setRedeployModal({ isOpen: false, session: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative p-5 sm:p-6 bg-gradient-to-br from-purple-600/90 to-blue-600/90">
                  <button
                    onClick={() => setRedeployModal({ isOpen: false, session: null })}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 max-w-[90%] text-white">Re-Deploy Portfolio</h3>
                  <p className="text-purple-100/80 text-xs sm:text-sm truncate max-w-[90%]">
                    Deploy to any platform (credits charged per deployment)
                  </p>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 bg-[#111111] dark:bg-[#111111] space-y-4">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Platform
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setRedeployPlatform('github')}
                        className={`p-3 rounded-lg border transition-all ${redeployPlatform === 'github'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-purple-500/50'
                          }`}
                      >
                        <Github className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">GitHub</div>
                        <div className="text-[10px] text-gray-500">3 credits</div>
                      </button>
                      <button
                        onClick={() => setRedeployPlatform('vercel')}
                        className={`p-3 rounded-lg border transition-all ${redeployPlatform === 'vercel'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-purple-500/50'
                          }`}
                      >
                        <div className="text-lg font-bold mx-auto mb-1">▲</div>
                        <div className="text-xs font-medium">Vercel</div>
                        <div className="text-[10px] text-gray-500">7 credits</div>
                      </button>
                      <button
                        onClick={() => setRedeployPlatform('netlify')}
                        className={`p-3 rounded-lg border transition-all ${redeployPlatform === 'netlify'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-purple-500/50'
                          }`}
                      >
                        <div className="text-lg font-bold mx-auto mb-1 text-teal-400">N</div>
                        <div className="text-xs font-medium">Netlify</div>
                        <div className="text-[10px] text-gray-500">5 credits</div>
                      </button>
                    </div>
                  </div>

                  {/* Repository Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Repository/Project Name
                    </label>
                    <input
                      type="text"
                      value={redeployRepoName}
                      onChange={(e) => setRedeployRepoName(e.target.value)}
                      placeholder="my-portfolio"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>

                  {/* Custom Domain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custom Domain <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={redeployCustomDomain}
                      onChange={(e) => setRedeployCustomDomain(e.target.value)}
                      placeholder="portfolio.yourdomain.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Configure DNS after deployment
                    </p>
                  </div>

                  {/* Credit Balance Display */}
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Your Balance:</span>
                      <span className="font-bold text-yellow-400">{creditsData?.balance || 0} credits</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setRedeployModal({ isOpen: false, session: null })}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRedeploy}
                      disabled={isRedeploying || !redeployRepoName.trim()}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isRedeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Deploy
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-gray-500">
                    Credits will be deducted only after successful deployment
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DNS Instructions Modal */}
        {dnsModal.isOpen && dnsModal.instructions && (
          <DNSInstructionsModal
            isOpen={dnsModal.isOpen}
            onClose={() => setDnsModal({ isOpen: false, domain: '', instructions: null })}
            domain={dnsModal.domain}
            dnsInstructions={dnsModal.instructions}
          />
        )}

        {/* Deploy Confirmation Modal after ZIP Download */}
        <AnimatePresence>
          {showDeployConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-700 max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Portfolio Downloaded!</h3>
                    <p className="text-sm text-secondary-500">Would you like to deploy it now?</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Deploy Now</p>
                        <p className="text-xs text-secondary-500 mt-1">
                          Deploy your portfolio to GitHub, Vercel, or Netlify (costs 3-7 credits)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Skip for Now</p>
                        <p className="text-xs text-secondary-500 mt-1">
                          End this session and deploy later from your history
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSkipDeployment}
                    className="flex-1 px-4 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleProceedToDeploy}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Server className="w-4 h-4" />
                    Deploy Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reuse Existing Portfolio Confirmation Modal */}
        <AnimatePresence>
          {showReuseConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowReuseConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-secondary-900 rounded-lg shadow-2xl max-w-md w-full border-4 border-secondary-900 dark:border-white"
              >
                {/* Header */}
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary-100 dark:bg-secondary-800 rounded-full p-3">
                      <Clock className="w-6 h-6 text-secondary-900 dark:text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                        Existing Portfolio Found
                      </h2>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                        Choose how to proceed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Use Existing Option */}
                  <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-secondary-900 dark:text-white flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-secondary-900 dark:text-white">Use Existing</span>
                          <span className="text-xs font-bold text-secondary-900 dark:text-white bg-secondary-200 dark:bg-secondary-700 px-2 py-0.5 rounded">FREE</span>
                        </div>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          Download your previously generated portfolio
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Create New Option */}
                  <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-start gap-3">
                      <Loader2 className="w-5 h-5 text-secondary-900 dark:text-white flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-secondary-900 dark:text-white">Create New</span>
                          <span className="text-xs font-bold text-secondary-900 dark:text-white bg-secondary-200 dark:bg-secondary-700 px-2 py-0.5 rounded">1 CREDIT</span>
                        </div>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          Generate fresh portfolio with latest data
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-start gap-3">
                      <Coins className="w-5 h-5 text-secondary-900 dark:text-white flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        Creating a new portfolio will deduct <span className="font-semibold text-secondary-900 dark:text-white">1 credit</span> from your balance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-secondary-200 dark:border-secondary-800 flex gap-3">
                  <button
                    onClick={handleReuseExisting}
                    className="flex-1 px-4 py-3 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 rounded-lg font-semibold hover:bg-secondary-800 dark:hover:bg-secondary-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Use Existing
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="flex-1 px-4 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-4 h-4" />
                    Create New
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {previewModal.isOpen && previewModal.template && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewModal({ isOpen: false, template: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-700 max-w-3xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{previewModal.template.name}</h2>
                      <p className="text-sm text-secondary-500 mt-1">{previewModal.template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded uppercase">
                          {previewModal.template.tier}
                        </span>
                        {unlockedTemplates?.includes(previewModal.template.id) && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            Owned
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewModal({ isOpen: false, template: null })}
                      className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Preview Image */}
                  <div className="relative aspect-video bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden mb-4">
                    <img
                      src={previewModal.template.thumbnail_url || '/placeholder-template.png'}
                      alt={previewModal.template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Features:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {previewModal.template.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {previewModal.template.tags?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {previewModal.template.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg mb-4">
                    <div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Price</p>
                      <p className="font-bold text-lg">{previewModal.template.price_credits} credits or ₹{previewModal.template.price_inr}</p>
                    </div>
                    {unlockedTemplates?.includes(previewModal.template.id) ? (
                      <button
                        onClick={() => {
                          setSelectedTemplate(previewModal.template.id);
                          setPreviewModal({ isOpen: false, template: null });
                        }}
                        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Select Template
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPreviewModal({ isOpen: false, template: null });
                          handleUnlockTemplate(previewModal.template.id);
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Unlock Now
                      </button>
                    )}
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
