import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-gray-600">Last updated: October 21, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-8 prose prose-indigo max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Analytics Dashboard ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web analytics service.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Name and email address</li>
            <li>Password (encrypted and hashed)</li>
            <li>Account preferences and settings</li>
            <li>Profile information you choose to provide</li>
          </ul>

          <h3>2.2 Website Analytics Data</h3>
          <p>For websites where our tracking code is installed, we collect:</p>
          <ul>
            <li>Page views and unique visitors</li>
            <li>Referrer information (where visitors came from)</li>
            <li>Device type and browser information</li>
            <li>Geographic location (country/region level)</li>
            <li>Session duration and user interactions</li>
            <li>IP addresses (which may be anonymized based on your settings)</li>
          </ul>

          <h3>2.3 Technical Information</h3>
          <p>We automatically collect certain technical information:</p>
          <ul>
            <li>Log files and usage data</li>
            <li>Cookies and similar tracking technologies</li>
            <li>API usage and performance metrics</li>
            <li>Error reports and diagnostic information</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain our analytics service</li>
            <li>Generate analytics reports and insights</li>
            <li>Improve and optimize our service</li>
            <li>Communicate with you about your account</li>
            <li>Provide customer support</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Sharing and Disclosure</h2>
          
          <h3>4.1 We Do Not Sell Your Data</h3>
          <p>
            We do not sell, trade, or rent your personal information or analytics data to third parties for commercial purposes.
          </p>

          <h3>4.2 Limited Sharing</h3>
          <p>We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (hosting, database management, email services)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We implement appropriate security measures to protect your information:</p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure database configurations</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>We retain your information as follows:</p>
          <ul>
            <li><strong>Account Data:</strong> Until you delete your account</li>
            <li><strong>Analytics Data:</strong> According to your configured retention settings (default: 1 year)</li>
            <li><strong>Log Files:</strong> Typically 30-90 days for security and debugging purposes</li>
            <li><strong>Legal Holds:</strong> Longer periods may apply if required by law</li>
          </ul>

          <h2>7. Your Rights and Choices</h2>
          
          <h3>7.1 Access and Control</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information and analytics data</li>
            <li>Update or correct your account information</li>
            <li>Delete your account and associated data</li>
            <li>Export your analytics data</li>
            <li>Configure data retention settings</li>
          </ul>

          <h3>7.2 Cookie Preferences</h3>
          <p>You can control cookies through:</p>
          <ul>
            <li>Browser settings to block or delete cookies</li>
            <li>Our cookie preference center (when available)</li>
            <li>Opting out of non-essential tracking</li>
          </ul>

          <h3>7.3 Marketing Communications</h3>
          <p>You can opt out of marketing emails by:</p>
          <ul>
            <li>Clicking the unsubscribe link in emails</li>
            <li>Updating your notification preferences in your account</li>
            <li>Contacting us directly</li>
          </ul>

          <h2>8. International Data Transfers</h2>
          <p>
            If you are located outside our primary jurisdiction, your information may be transferred to and processed in countries where we operate. We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
          </p>

          <h2>10. Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites or integrate with third-party services. This Privacy Policy does not apply to those external services. We encourage you to review their privacy policies.
          </p>

          <h2>11. GDPR Compliance (EU Users)</h2>
          <p>If you are in the European Union, you have additional rights under GDPR:</p>
          <ul>
            <li><strong>Legal Basis:</strong> We process data based on legitimate interests, consent, or contract performance</li>
            <li><strong>Data Portability:</strong> Right to receive your data in a structured format</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to Restrict:</strong> Limit how we process your data</li>
            <li><strong>Data Protection Officer:</strong> Contact dpo@analyticsdashboard.com</li>
          </ul>

          <h2>12. CCPA Compliance (California Users)</h2>
          <p>California residents have additional rights under CCPA:</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt out of sale (we don't sell data)</li>
            <li>Right to non-discrimination for exercising CCPA rights</li>
          </ul>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by:
          </p>
          <ul>
            <li>Posting the updated policy on our website</li>
            <li>Sending you an email notification</li>
            <li>Displaying a notice in your account dashboard</li>
          </ul>

          <h2>14. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@analyticsdashboard.com</li>
            <li><strong>Data Protection Officer:</strong> dpo@analyticsdashboard.com</li>
            <li><strong>Address:</strong> Analytics Dashboard, 123 Tech Street, Digital City, DC 12345</li>
          </ul>

          <h2>15. Effective Date</h2>
          <p>
            This Privacy Policy is effective as of October 21, 2025, and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Back to Registration
          </Link>
          <span className="mx-2 text-gray-400">•</span>
          <Link
            href="/terms"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}