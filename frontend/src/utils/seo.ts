/**
 * SEO Configuration and utilities for meta tags
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  twitterHandle?: string;
}

const BASE_URL = 'https://prativeda.com';
const TWITTER_HANDLE = '@prativeda';

export const seoConfig: Record<string, SEOConfig> = {
  home: {
    title: 'Prativeda - AI Resume Builder | ATS-Optimized Resumes',
    description: 'Create ATS-optimized resumes with AI-powered analysis. Get higher ATS scores, pass screening, and land more interviews. Free templates + intelligent parsing.',
    keywords: ['resume builder', 'ATS scoring', 'AI resume', 'job application', 'resume optimization'],
    image: `${BASE_URL}/og-resume.jpg`,
    url: BASE_URL,
    type: 'website',
  },
  pricing: {
    title: 'Pricing - Prativeda | Affordable Resume & Portfolio Tools',
    description: 'Transparent pricing for resume building and ATS optimization. Pay per use with credits. No hidden fees.',
    keywords: ['resume pricing', 'ATS scoring cost', 'portfolio pricing', 'affordable resume tools'],
    image: `${BASE_URL}/og-pricing.jpg`,
    url: `${BASE_URL}/pricing`,
    type: 'website',
  },
  portfolio: {
    title: 'Portfolio Templates - Prativeda | Professional Portfolio Designs',
    description: 'Create stunning professional portfolios with customizable templates. Showcase your projects and skills with modern designs.',
    keywords: ['portfolio template', 'portfolio builder', 'professional portfolio', 'showcase portfolio'],
    image: `${BASE_URL}/og-portfolio.jpg`,
    url: `${BASE_URL}/portfolio-templates`,
    type: 'website',
  },
  templates: {
    title: 'Resume Templates - Prativeda | Free & Premium Designs',
    description: 'Browse beautiful resume templates optimized for ATS. Download free templates or choose premium designs for maximum impact.',
    keywords: ['resume template', 'free resume', 'resume design', 'professional resume'],
    image: `${BASE_URL}/og-templates.jpg`,
    url: `${BASE_URL}/portfolio-templates`,
    type: 'website',
  },
  about: {
    title: 'About Prativeda - AI-Powered Career Tools',
    description: 'Learn about Prativeda\'s mission to help job seekers succeed with AI-powered resume optimization and career tools.',
    keywords: ['about prativeda', 'resume optimization', 'career tools', 'about us'],
    url: `${BASE_URL}/about`,
    type: 'website',
  },
  privacy: {
    title: 'Privacy Policy - Prativeda',
    description: 'Read our privacy policy to understand how we handle your personal data and protect your privacy.',
    url: `${BASE_URL}/privacy-policy`,
    type: 'website',
  },
  terms: {
    title: 'Terms of Service - Prativeda',
    description: 'Review our terms of service for using Prativeda resume builder and portfolio tools.',
    url: `${BASE_URL}/terms`,
    type: 'website',
  },
  refund: {
    title: 'Refund Policy - Prativeda',
    description: 'Understand our refund policy for resume and portfolio services.',
    url: `${BASE_URL}/refund-policy`,
    type: 'website',
  },
  shipping: {
    title: 'Shipping Policy - Prativeda',
    description: 'Learn about our digital delivery and shipping policies.',
    url: `${BASE_URL}/shipping-policy`,
    type: 'website',
  },
};

/**
 * Generate structured data for rich snippets
 */
export const getStructuredData = (type: string, config: SEOConfig) => {
  const baseData = {
    '@context': 'https://schema.org',
    name: 'Prativeda',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/prativeda',
      'https://linkedin.com/company/prativeda',
    ],
  };

  if (type === 'Organization') {
    return {
      ...baseData,
      '@type': 'Organization',
      description: 'AI-powered resume builder and portfolio creator',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX',
        contactType: 'Customer Support',
        email: 'support-prativeda@codetapasya.com',
      },
    };
  }

  if (type === 'WebApplication') {
    return {
      '@type': 'WebApplication',
      name: config.title,
      description: config.description,
      url: config.url,
      applicationCategory: 'ProductivityApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };
  }

  return baseData;
};
