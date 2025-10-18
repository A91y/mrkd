export default function HomeStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'mrkd',
    alternateName: 'mrkd - Simple Markdown Sharing',
    url: baseUrl,
    description: 'Create beautiful markdown, share instantly. Built for writers, developers, and everyone in between.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/view/{id}`,
      },
      'query-input': 'required name=id',
    },
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'mrkd',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: ['https://github.com/A91y/mrkd'],
  };

  const webApplicationData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'mrkd',
    url: baseUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Free markdown sharing platform with live preview, syntax highlighting, and secure encrypted sharing. No signup required.',
    featureList: [
      'Live Markdown Preview',
      'Syntax Highlighting',
      'End-to-End Encryption',
      'No Signup Required',
      'Shareable Links',
      'QR Code Generation',
      'Auto-save Drafts',
      'Dark Mode',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationData) }}
      />
    </>
  );
}
