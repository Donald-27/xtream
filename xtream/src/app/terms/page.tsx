
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/signup" passHref>
            <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Terms of Service</h1>
      </header>
      <main className="flex-1 p-4 sm-p-6 md:p-8">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>Welcome to Xtream!</h2>
          <p>These Terms of Service ("Terms") govern your access to and use of the Xtream application and services (collectively, the "Service"), operated by Xtream ("we," "us," or "our").</p>
          <p className="font-bold border border-border p-4 rounded-lg">This is a template and not legal advice. You must consult with a legal professional to draft official Terms of Service that are legally binding and tailored to your business needs.</p>

          <h3>1. Acceptance of Terms</h3>
          <p>By creating an account, accessing, or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our Service. You must be at least 13 years old to use the Service.</p>

          <h3>2. Your Account</h3>
          <p>You are responsible for safeguarding your account and for all activities that occur under it. You must notify us immediately of any unauthorized use of your account. You agree to provide accurate and complete information when creating your account and to keep this information up to date.</p>

          <h3>3. User Content</h3>
          <h4>a. Your Content is Yours</h4>
          <p>You retain ownership of all the content you create, post, stream, or share on the Service, including videos, images, comments, and messages ("User Content").</p>
          <h4>b. License You Grant to Us</h4>
          <p>By creating User Content on the Service, you grant Xtream a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, host, store, reproduce, modify, create derivative works of, distribute, and display your User Content for the purposes of operating, promoting, and improving the Service.</p>

          <h3>4. Community Guidelines and Prohibited Conduct</h3>
          <p>You agree to use the Service in compliance with our Community Guidelines. You are solely responsible for your conduct and your User Content. You agree not to engage in any of the following prohibited activities:</p>
          <ul>
            <li><strong>Illegal Activities:</strong> Do not use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
            <li><strong>Harmful or Hateful Content:</strong> Do not stream or post content that is hateful, threatening, defamatory, obscene, harassing, or promotes violence or discrimination against individuals or groups based on race, ethnic origin, religion, disability, gender, age, or sexual orientation.</li>
            <li><strong>Impersonation:</strong> Do not impersonate others or misrepresent your affiliation with any person or entity.</li>
            <li><strong>Infringement of Rights:</strong> Do not post content that infringes on any third party's intellectual property rights (e.g., copyright, trademark) or privacy rights.</li>
            <li><strong>Spam and Malicious Conduct:</strong> Do not transmit any worms, viruses, or any code of a destructive nature. Do not send spam or unsolicited messages.</li>
            <li><strong>Harm to Minors:</strong> Do not exploit, harm, or attempt to exploit or harm minors in any way.</li>
          </ul>

          <h3>5. Termination</h3>
          <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for any conduct that we believe violates these Terms, is harmful to other users or our community, or for any other reason.</p>

          <h3>6. Disclaimers and Limitation of Liability</h3>
          <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE BY LAW, Xtream DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          <p>IN NO EVENT SHALL Xtream BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.</p>

          <h3>7. Governing Law</h3>
          <p>These Terms shall be governed by the laws of [Your State/Country], without regard to its conflict of law provisions.</p>
          
          <h3>8. Changes to These Terms</h3>
          <p>We reserve the right to modify these Terms at any time. If we make changes, we will provide notice by updating the date at the top of the policy and, in some cases, we may provide additional notice (such as a statement on our homepage or sending you a notification).</p>
        </div>
      </main>
    </div>
  );
}
