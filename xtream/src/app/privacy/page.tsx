
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/signup" passHref>
            <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Your Privacy at Xtream</h2>
          <p>Welcome to Xtream! Your privacy is critically important to us. This Privacy Policy outlines how Xtream ("we," "us," or "our") collects, uses, shares, and protects your information when you use our application and services (collectively, the "Service").</p>
          <p className="font-bold border border-border p-4 rounded-lg">This is a template and not legal advice. You must consult with a legal professional to draft an official Privacy Policy that complies with all relevant laws and regulations for your specific location and user base.</p>

          <h3>1. Information We Collect</h3>
          <p>We collect information in a few different ways to provide and improve our Service.</p>
          <h4>a. Information You Provide to Us</h4>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your email address, and you provide a username and password. If you sign up with a third-party service like Google, we receive information from them, such as your name and email address.</li>
            <li><strong>Profile Information:</strong> You may choose to provide additional information for your public profile, such as a bio, location, profile picture, and cover photo. This information is public.</li>
            <li><strong>User Content:</strong> We collect the content you create on the Service, including live streams, videos, photos, comments, chat messages, and challenge submissions.</li>
            <li><strong>Communications:</strong> If you contact us directly for support or other inquiries, we may receive additional information about you, such as your name and the contents of your message.</li>
          </ul>
          <h4>b. Information We Collect Automatically</h4>
          <ul>
            <li><strong>Usage Data:</strong> We automatically collect information about your interactions with the Service, such as which streams you watch, profiles you view, content you engage with (likes, follows), and features you use.</li>
            <li><strong>Device and Log Information:</strong> We collect log data from your device, including your IP address, device type, operating system, browser type, and unique device identifiers.</li>
            <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to operate and personalize our service. Cookies help us understand how you use the Service and improve your experience.</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li>To provide, operate, and maintain our Service.</li>
            <li>To improve, personalize, and expand our Service.</li>
            <li>To understand and analyze how you use our Service to develop new products and features.</li>
            <li>To communicate with you, including for customer support, to provide you with updates, and for marketing purposes.</li>
            <li>To process your transactions and manage your account.</li>
            <li>To enforce our Terms of Service and Community Guidelines, and to promote safety and security by detecting fraud, abuse, or illegal activity.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h3>3. How We Share Your Information</h3>
          <p>We may share your information in the following situations:</p>
          <ul>
            <li><strong>With Other Users:</strong> Your profile information (username, profile picture, bio, etc.) and any content you post publicly (streams, comments) are visible to other users.</li>
            <li><strong>With Service Providers:</strong> We share information with third-party vendors and service providers that perform services on our behalf, such as cloud hosting (Firebase), data analytics, and customer support. These providers only have access to the information necessary to perform these tasks.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your information may be transferred.</li>
          </ul>

          <h3>4. Your Rights and Choices</h3>
          <p>You have certain rights and choices regarding your information:</p>
          <ul>
            <li><strong>Account Information:</strong> You can review and update your account information at any time through your profile settings page.</li>
            <li><strong>Data Access:</strong> You may have the right to request access to the personal information we hold about you.</li>
            <li><strong>Deletion:</strong> You can delete your account through the settings. Please note that some information may be retained in our backups or for legal and security reasons.</li>
          </ul>

          <h3>5. Data Security</h3>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. We use services like Firebase that provide robust, industry-standard security features.</p>
          
          <h3>6. Children's Privacy</h3>
          <p>Our Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.</p>
          
          <h3>7. Changes to This Privacy Policy</h3>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We encourage you to review this Privacy Policy periodically for any changes.</p>

          <h3>8. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at [Your Contact Email/Support Link].</p>
        </div>
      </main>
    </div>
  );
}
