'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { CURRENCIES } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { SettingsPanelHead } from './settings-panel-head';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export function OrganizationSettings() {
  const { profile, user, refreshProfile } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [defaultTaxRate, setDefaultTaxRate] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTermsTitle, setDefaultTermsTitle] = useState('');
  const [defaultTerms, setDefaultTerms] = useState('');
  
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  // Original states to detect dirty form
  const [original, setOriginal] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    tax_id: '',
    default_tax_rate: '',
    default_currency: 'USD',
    default_terms_title: '',
    default_terms: '',
    logo_url: null as string | null
  });

  useEffect(() => {
    async function loadAccount() {
      if (!profile?.account_id) return;
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profile.account_id)
          .single();
          
        if (error) throw error;
        if (data) {
          const vals = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            address: data.address || '',
            tax_id: data.tax_id || '',
            default_tax_rate: data.default_tax_rate?.toString() || '',
            default_currency: data.default_currency || 'USD',
            default_terms_title: data.default_terms_title || '',
            default_terms: data.default_terms || '',
            logo_url: data.logo_url || null
          };
          setName(vals.name);
          setEmail(vals.email);
          setPhone(vals.phone);
          setWebsite(vals.website);
          setAddress(vals.address);
          setTaxId(vals.tax_id);
          setDefaultTaxRate(vals.default_tax_rate);
          setDefaultCurrency(vals.default_currency);
          setDefaultTermsTitle(vals.default_terms_title);
          setDefaultTerms(vals.default_terms);
          setOriginal(vals);
        }
      } catch (err) {
        console.error("Failed to load organization:", err);
        toast.error("Failed to load organization details");
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, [profile?.account_id, supabase]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const currentLogo =
    previewUrl ?? (!removeLogo ? original.logo_url : null);

  const initial = (name || 'O').charAt(0).toUpperCase();

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset
    if (!file) return;

    if (!ALLOWED_MIME.has(file.type)) {
      toast.error('Unsupported image format');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Image must be under 2MB');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingLogo(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const onRemoveLogo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingLogo(null);
    setPreviewUrl(null);
    setRemoveLogo(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.account_id) return;
    if (!name.trim()) {
      toast.error('Company Name is required');
      return;
    }

    setSaving(true);
    try {
      let nextLogoUrl = original.logo_url;

      if (pendingLogo) {
        const ext = pendingLogo.name.split('.').pop()?.toLowerCase() || 'png';
        const path = `${user?.id}/org-logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, pendingLogo, {
            cacheControl: '3600',
            upsert: true,
            contentType: pendingLogo.type,
          });
        if (uploadError) {
          throw new Error('Failed to upload logo: ' + uploadError.message);
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(path);
        nextLogoUrl = publicUrl;
      } else if (removeLogo) {
        nextLogoUrl = null;
      }

      const parsedTaxRate = defaultTaxRate ? parseFloat(defaultTaxRate) : 0;
      
      const updates = {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        address: address.trim() || null,
        tax_id: taxId.trim() || null,
        default_tax_rate: parsedTaxRate,
        default_currency: defaultCurrency,
        default_terms_title: defaultTermsTitle.trim() || null,
        default_terms: defaultTerms.trim() || null,
        logo_url: nextLogoUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', profile.account_id);

      if (error) throw error;
      
      setOriginal({
        name: updates.name,
        email: updates.email || '',
        phone: updates.phone || '',
        website: updates.website || '',
        address: updates.address || '',
        tax_id: updates.tax_id || '',
        default_tax_rate: updates.default_tax_rate.toString(),
        default_currency: updates.default_currency,
        default_terms_title: updates.default_terms_title || '',
        default_terms: updates.default_terms || '',
        logo_url: updates.logo_url
      });
      setPendingLogo(null);
      setPreviewUrl(null);
      setRemoveLogo(false);
      await refreshProfile();
      toast.success('Organization details saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save organization details');
    } finally {
      setSaving(false);
    }
  };

  const dirty = 
    name !== original.name || 
    email !== original.email || 
    phone !== original.phone || 
    website !== original.website || 
    address !== original.address ||
    taxId !== original.tax_id ||
    defaultTaxRate !== original.default_tax_rate ||
    defaultCurrency !== original.default_currency ||
    defaultTermsTitle !== original.default_terms_title ||
    defaultTerms !== original.default_terms ||
    pendingLogo !== null ||
    removeLogo;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-8">
        <Loader2 className="size-4 animate-spin" /> Loading organization...
      </div>
    );
  }

  return (
    <section className="max-w-2xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Organization Details"
        description="Manage your company's contact information. These details will appear on documents like Quotations."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <Card>
          <CardContent className="space-y-6 pt-6">
            
            {/* Logo row */}
            <div className="flex flex-wrap items-center gap-5">
              <Avatar size="lg" className="size-16 rounded-lg">
                {currentLogo ? (
                  <AvatarImage src={currentLogo} alt={name || 'Logo'} className="object-contain bg-white" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-base text-primary rounded-lg font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <Upload className="size-4 mr-2" />
                  {currentLogo ? 'Change logo' : 'Upload logo'}
                </Button>
                {currentLogo && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onRemoveLogo}
                    disabled={saving}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Remove
                  </Button>
                )}
                <p className="w-full text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP, or GIF. Up to 2 MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-name">Company Name <span className="text-destructive">*</span></Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-email">Support Email</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@acme.com"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-phone">Business Phone</Label>
                <Input
                  id="org-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-website">Website</Label>
              <Input
                id="org-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://acme.com"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-address">Business Address</Label>
              <Textarea
                id="org-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, Country"
                className="min-h-[100px] resize-y"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground pt-1">
                This address will be printed on your official invoices and quotations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-tax-id">Tax ID / GSTIN</Label>
                <Input
                  id="org-tax-id"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-tax-rate">Default GST Rate (%)</Label>
                <Input
                  id="org-tax-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(e.target.value)}
                  placeholder="18"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-currency">Default Currency</Label>
                <select
                  id="org-currency"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  disabled={saving}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold">Default Quotation Terms & Notes</h4>
              <div className="space-y-2">
                <Label htmlFor="org-terms-title">Heading / Title (Optional)</Label>
                <Input
                  id="org-terms-title"
                  value={defaultTermsTitle}
                  onChange={(e) => setDefaultTermsTitle(e.target.value)}
                  placeholder="e.g. Terms & Conditions"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-terms">Default Notes Content</Label>
                <Textarea
                  id="org-terms"
                  value={defaultTerms}
                  onChange={(e) => setDefaultTerms(e.target.value)}
                  placeholder="Enter standard terms, payment details, or notes to pre-fill on new quotations..."
                  className="min-h-[100px] resize-y"
                  disabled={saving}
                />
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !dirty}>
            {saving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
