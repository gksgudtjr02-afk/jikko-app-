/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/customer.html": ["./html-src/customer.html"],
    "/partner.html": ["./html-src/partner.html"],
  },
};

export default nextConfig;
