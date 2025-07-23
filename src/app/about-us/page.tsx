
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Zap, Users, Gift } from 'lucide-react';

export default function AboutUsPage() {
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

          <h1 className="text-4xl font-bold mb-6 font-headline text-primary">About Pika Token</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Welcome to the electrifying world of Pika Token! We're a community-driven project dedicated to creating a fun and rewarding experience for everyone.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold flex items-center mb-4"><Zap className="mr-3 h-6 w-6 text-yellow-400"/>Our Mission</h2>
              <p className="text-lg">
                Our mission is to build a vibrant ecosystem where users can engage, earn, and grow together. We believe in the power of community and aim to provide a platform that is both entertaining and beneficial for our users. Through staking, tasks, and referrals, we offer multiple avenues for earning Pika Tokens.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold flex items-center mb-4"><Users className="mr-3 h-6 w-6 text-blue-400"/>Our Community</h2>
              <p className="text-lg">
                The Pika Token community is at the heart of everything we do. We are a diverse group of enthusiasts who are passionate about the future of decentralized applications. Join our Telegram channel and follow us on X (Twitter) to connect with fellow Pika fans!
              </p>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold flex items-center mb-4"><Gift className="mr-3 h-6 w-6 text-red-400"/>Our Vision</h2>
                <p className="text-lg">
                    We envision a future where Pika Token is a widely recognized and utilized token within a larger gaming and interactive ecosystem. We are continuously working on new features and partnerships to bring more utility and fun to the Pika Token experience.
                </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
