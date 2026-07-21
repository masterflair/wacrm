import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: July 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the RenderAura CRM platform (the "Services"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Use of Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our Services provide a software interface layer to manage WhatsApp business communications. You are solely responsible for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Maintaining a valid Meta/WhatsApp Business Account.</li>
            <li>Paying any underlying messaging fees charged directly by Meta.</li>
            <li>Ensuring your messaging behavior complies with WhatsApp's Commerce and Business Policies.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We are not responsible for any bans, blocks, or account restrictions imposed by Meta on your connected WhatsApp numbers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Account Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for safeguarding the password and API tokens that you use to access the Service. You agree not to disclose your password or authentication keys to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Prohibited Uses</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may not use the Services to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Send unauthorized promotional messages or "spam" via WhatsApp.</li>
            <li>Violate any local, state, national, or international law.</li>
            <li>Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, pornographic, or otherwise offensive.</li>
            <li>Interfere with or disrupt the integrity or performance of the Services.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms, please contact us at legal@renderaura.com.
          </p>
        </section>
      </div>
    </div>
  );
}
