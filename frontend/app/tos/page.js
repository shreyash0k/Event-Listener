import Link from "next/link";

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for Scout Pup
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: December 1, 2024

1. Service Description
Scout Pup provides a website monitoring service that allows users to track changes on public websites. Our service uses AI-powered analysis to detect and notify users of relevant changes.

2. Subscription and Payments
- We offer both free and paid subscription tiers
- Payments are processed through Stripe
- All sales are final and no refunds will be provided
- Subscription features and limitations may change with notice

3. Service Limitations
- Our service only works with publicly accessible websites
- We cannot monitor websites behind paywalls or requiring authentication
- We reserve the right to adjust monitoring frequency and limitations
- Service availability and accuracy are provided on an "as-is" basis

4. Acceptable Use
Users agree to:
- Only monitor publicly accessible websites
- Not use our service for any illegal purposes
- Not attempt to circumvent service limitations
- Not use our service to monitor sensitive or private information

5. User Accounts
- Users must authenticate using our auth options
- Users are responsible for maintaining their account security
- We reserve the right to terminate accounts that violate our terms

6. Content Ownership
All data are the property of Scout Pup or its respective owners. 

7. Third-Party Services
We use third-party services, including Google Cloud, Amazon Web Services, and other service providers, to enhance our app's functionality. These services have their own terms, which can be found on their respective websites.

8. Termination
We reserve the right to terminate or suspend access to our app without prior notice if we believe there's been a violation of our terms or for other reasons at our discretion.

9. Limitation of Liability
To the maximum extent permitted by law, Scout Pup and its affiliates shall not be liable for any direct, indirect, punitive, incidental, or consequential damages arising out of or in connection with the app or these terms.

10. Dispute Resolution
Any disputes arising from the use of our app shall be governed by the laws of the United States, and the State of California, without regard to conflict of law principles.

11. Updates to Terms
We reserve the right to update our Terms of Service periodically. It's your responsibility to review these terms frequently. Your continued use of our app signifies your acceptance of the updated terms.

12. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of the United States, and the State of California.

Thank you for using Scout Pup!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;