import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for Scout Pup
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: December 1, 2024

1. Introduction
At Scout Pup, we prioritize the privacy of our users. This Privacy Policy outlines how we collect, use, and protect your information when you use our website monitoring service.

2. Information We Collect
We collect and process the following information:
- Account Information: Email address through our auth providers
- Service Usage Data: URLs submitted for monitoring, monitoring preferences, and notification settings
- Payment Information: Processed securely through Stripe
- Website Analysis Data: Results from our monitoring service using Anthropic's API

3. How We Use Your Information
Your information helps us:
- Provide and maintain our website monitoring service
- Process payments and manage subscriptions
- Send notifications about changes detected on monitored websites
- Improve and optimize our service
- Communicate important updates about our service

4. Data Storage and Security
- We use Supabase and AWS for secure data storage
- Monitoring history is retained for all active accounts
- Users can request deletion of their data
- We implement industry-standard security measures to protect your information

5. Third-Party Services
We use several third-party services:
- Supabase for authentication
- Stripe for payment processing
- Anthropic for website analysis
- AWS and Supabase for infrastructure
Each service has its own privacy policy which we encourage you to review.

6. User Rights
You have the right to:

  - Request a copy of the personal data we hold about you.
  - Ask us to correct any inaccurate or outdated data.
  - Request the deletion of your data, where applicable.

7. Updates to Privacy Policy
We may update our Privacy Policy from time to time. Any changes will be posted on this page, so we encourage you to review it periodically.

Thank you for using Scout Pup!`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;