
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
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

          <h1 className="text-4xl font-bold mb-6 font-headline text-primary">Contact Us</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Have questions or need support? We'd love to hear from you. The best way to reach us is through our community channels.
          </p>

          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Send className="mr-3 h-6 w-6 text-blue-500" /> Join us on Telegram</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>For general questions, announcements, and community discussions, our Telegram channel is the place to be.</p>
                    <a href="https://t.me/pikatoken_io" target="_blank" rel="noopener noreferrer">
                        <Button className="mt-4">Join Telegram</Button>
                    </a>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Twitter className="mr-3 h-6 w-6 text-sky-500" /> Follow us on X (Twitter)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Stay up-to-date with the latest news and updates by following our official X account.</p>
                    <a href="https://x.com/Pika_Token_io" target="_blank" rel="noopener noreferrer">
                        <Button className="mt-4">Follow on X</Button>
                    </a>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Mail className="mr-3 h-6 w-6" /> Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>For specific inquiries or partnership proposals, you can reach out to us via email.</p>
                     <p className="font-semibold mt-2">support@pikatoken.io</p>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
