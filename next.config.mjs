/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
// next.config.js
module.exports = {
    async redirects() {
      return [
        {
          source: '/[category_slug]/[slug]', // Replace with your SSG route
          destination: '/ssr/[category_slug]/[slug]', // Redirect to the SSR route
          permanent: false, // Set to true if this is a permanent redirect (301)
        },
      ];
    },
  };
  