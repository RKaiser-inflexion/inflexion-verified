/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Zabrání Clickjackingu (nelze vložit do iframe)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prohlížeč nebude hádat MIME types
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // Vynucení HTTPS na 1 rok
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
