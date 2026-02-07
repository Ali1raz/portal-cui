export const getBaseURL = () => {
  // Vercel prod → uses your fixed production domain
  if (process.env.VERCEL_ENV === "production") {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // Vercel preview → uses the dynamic preview URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local fallback
  return "http://localhost:3000";
};
