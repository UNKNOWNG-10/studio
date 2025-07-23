
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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

          <h1 className="text-4xl font-bold mb-6 font-headline text-primary">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8 prose prose-lg dark:prose-invert">
            <section>
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Pika Token application ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Service Description</h2>
              <p>
                Pika Token provides a platform for users to earn tokens through various activities such as staking, completing tasks, and referring new users. The tokens are for in-app utility and do not represent any monetary value outside of the application.
              </p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold">3. User Conduct</h2>
                <p>
                    You are responsible for your own conduct and for any consequences thereof. You agree to use the Service only for purposes that are legal, proper and in accordance with these Terms of Service.
                </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Disclaimer of Warranties</h2>
              <p>
                The Service is provided "as is" and "as available" without any warranties of any kind, including that the service will be uninterrupted or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
              <p>
                In no event shall Pika Token be liable for any direct, indirect, incidental, special, consequential or exemplary damages resulting from the use or inability to use the service.
              </p>
            </section>

             <section>
              <h2 className="text-2xl font-semibold">6. Changes to the Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page. You are advised to review this page periodically for any changes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
