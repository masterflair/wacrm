import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#010410] pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                <WhatsAppIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">RenderAura CRM</span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              The ultimate shared inbox, CRM, and automation platform for modern teams running sales and support on WhatsApp.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </Link>
            </div>
          </div>

          {/* Links Column 1: Product */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API Documentation</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Legal */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Links Column 4: Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
            <div className="space-y-4 text-muted-foreground text-sm">
              <div className="space-y-1">
                <p className="font-medium text-white/80">MasterFlair Pvt Ltd</p>
                <p>Ashram Para, Siliguri</p>
                <p>West Bengal 734001, India</p>
              </div>
              <div className="space-y-1 pt-2">
                <p>+917074137043</p>
                <p>hello@renderaura.com</p>
              </div>
              <div className="pt-2">
                <Link href="#" className="text-white font-medium hover:text-primary transition-colors inline-flex items-center group">
                  WhatsApp Us 
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright & Uptime */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} A product of MasterFlair Pvt Ltd. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground font-medium">All Systems Operational &bull; 99.99% Uptime</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
