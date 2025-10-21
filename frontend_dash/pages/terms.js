import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Terms() {
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
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-gray-600">Last updated: October 21, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-8 prose prose-indigo max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using Analytics Dashboard ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Analytics Dashboard is a web analytics service that provides website traffic analysis, visitor tracking, and performance metrics. The Service allows you to:
          </p>
          <ul>
            <li>Track website visitors and page views</li>
            <li>Analyze user behavior and engagement</li>
            <li>Monitor website performance metrics</li>
            <li>Generate analytics reports and insights</li>
            <li>Access real-time visitor data</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit any harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
          </ul>

          <h2>5. Data Collection and Privacy</h2>
          <p>
            The Service collects and processes data from websites where our tracking code is installed. By using the Service, you acknowledge that:
          </p>
          <ul>
            <li>You have the right to collect data from your website visitors</li>
            <li>You will comply with applicable privacy laws and regulations</li>
            <li>You will provide appropriate privacy notices to your website visitors</li>
            <li>You will obtain necessary consents for data collection where required</li>
          </ul>

          <h2>6. Data Retention and Deletion</h2>
          <p>
            We retain your analytics data according to your account settings and applicable laws. You may:
          </p>
          <ul>
            <li>Configure data retention periods in your account settings</li>
            <li>Request deletion of specific data or your entire account</li>
            <li>Export your data before account termination</li>
          </ul>

          <h2>7. Service Availability</h2>
          <p>
            While we strive to provide reliable service, we cannot guarantee 100% uptime. The Service may be temporarily unavailable due to:
          </p>
          <ul>
            <li>Scheduled maintenance</li>
            <li>Technical issues or emergencies</li>
            <li>Third-party service dependencies</li>
            <li>Force majeure events</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Analytics Dashboard and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Analytics Dashboard shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason including but not limited to:
          </p>
          <ul>
            <li>Breach of these Terms of Service</li>
            <li>Violation of applicable laws</li>
            <li>Fraud or security concerns</li>
            <li>Non-payment of fees (if applicable)</li>
          </ul>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Analytics Dashboard operates, without regard to conflict of law provisions.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <ul>
            <li>Email: legal@analyticsdashboard.com</li>
            <li>Address: Analytics Dashboard, 123 Tech Street, Digital City, DC 12345</li>
          </ul>

          <h2>14. Severability</h2>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
          </p>

          <h2>15. Entire Agreement</h2>
          <p>
            These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Analytics Dashboard regarding the use of the Service.
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
            href="/privacy"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}