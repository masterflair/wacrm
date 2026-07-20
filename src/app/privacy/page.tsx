import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: July 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to RenderAura CRM ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our SaaS platform and WhatsApp CRM services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect personal information that you voluntarily provide to us when you register on the Services. This includes:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Name and Contact Data (Email address, phone number)</li>
            <li>Credentials (Passwords and security authentication information)</li>
            <li>WhatsApp Business Account Information (Phone Number IDs, WABA IDs, API Tokens)</li>
            <li>Customer Communications (Messages routed through our platform via your connected WhatsApp API)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. We use the information we collect or receive to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Facilitate account creation and logon process.</li>
            <li>Send you administrative information and billing alerts.</li>
            <li>Fulfill and manage your CRM messaging capabilities via the Meta WhatsApp Cloud API.</li>
            <li>Respond to legal requests and prevent harm.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Sharing and Processors</h2>
          <p className="text-muted-foreground leading-relaxed">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. 
            We use third-party service providers (such as cloud hosting providers and database providers) to process your data on our behalf. These include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Supabase (Database and Authentication Services)</li>
            <li>Vercel / Hosting Providers (Infrastructure)</li>
            <li>Meta Platforms, Inc. (WhatsApp Cloud API routing)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Retention & Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law. 
            We have implemented appropriate technical and organizational security measures (including Row Level Security and encrypted token storage) designed to protect the security of any personal information we process.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions or comments about this notice, you may email us at legal@renderaura.com.
          </p>
        </section>
      </div>
    </div>
  );
}
