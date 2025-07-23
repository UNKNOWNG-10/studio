
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-6 font-headline text-primary">Privacy Policy for Pika Token</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8 prose prose-lg dark:prose-invert">
            <section>
              <h2 className="text-2xl font-semibold">1. Introduction</h2>
              <p>
                Welcome to Pika Token. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
              <p>
                We collect a very limited amount of information from you when you use our application:
              </p>
              <ul>
                <li><strong>Binance User ID (UID):</strong> We collect your Binance UID to uniquely identify your account within the Pika Token application.</li>
                <li><strong>Transaction Data:</strong> We store information about your activities within the app, such as staking requests, task completions, and token earnings. This includes the type of transaction, amount, date, status, and any associated order IDs you provide.</li>
              </ul>
              <p>
                We do not collect any other personal information, such as your name, email address, or financial details beyond what is necessary for the app's functionality.
              </p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
                <p>
                    We use the information we collect solely for the purpose of operating and maintaining the Pika Token application. This includes:
                </p>
                <ul>
                    <li>Creating and managing your account.</li>
                    <li>Processing your staking and withdrawal requests.</li>
                    <li>Tracking your progress on tasks and rewarding you accordingly.</li>
                    <li>Calculating and distributing staking rewards.</li>
                    <li>Managing your referrals and milestone rewards.</li>
                    <li>Displaying your ranking on the leaderboard.</li>
                </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Data Storage</h2>
              <p>
                All of your user data, including your UID and transaction history, is stored in your web browser's local storage. This means the data is stored on your own device. We do not have a central server that stores your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Third-Party Services</h2>
              <p>
                Our service relies on your interaction with Binance for staking. When you make a deposit to our specified Binance ID and provide an order ID, we use that information to verify your stake. However, we do not have a direct API integration with Binance. The verification process is handled manually by our administrators. We are not responsible for the privacy practices of Binance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Data Security</h2>
              <p>
                We use administrative and technical security measures to help protect your information stored in local storage. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>

             <section>
              <h2 className="text-2xl font-semibold">7. Children's Privacy</h2>
              <p>
                Our services are not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">8. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through the channels provided in the "Contact" section of our application.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
