interface StructuredDataProps {
  id: string;
  title: string;
  description: string;
  author: string;
  datePublished?: string;
  isEncrypted?: boolean;
}

export default function StructuredData({
  id,
  title,
  description,
  author,
  datePublished,
  isEncrypted = false,
}: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'mrkd',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: datePublished || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/view/${id}`,
    },
    url: `${baseUrl}/view/${id}`,
    image: `${baseUrl}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&id=${id}&preview=${encodeURIComponent(description)}`,
    inLanguage: 'en',
    ...(isEncrypted && {
      isAccessibleForFree: false,
      hasPart: {
        '@type': 'WebPageElement',
        isAccessibleForFree: false,
        cssSelector: '.encrypted-content',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
