'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addContactTag, deleteContactTag } from '@/lib/contacts/tag-api';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';
import type { Contact, Tag, ContactTag, ContactNote, CustomField, ContactCustomValue, Deal, MessageTemplate } from '@/types';
import {
  TemplatePicker,
  type TemplateSendValues,
} from '@/components/inbox/template-picker';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Phone,
  Mail,
  Building2,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2,
  Save,
  X,
  DollarSign,
  LayoutTemplate,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ContactDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string | null;
  onUpdated: () => void;
}

export function ContactDetailView({
  open,
  onOpenChange,
  contactId,
  onUpdated,
}: ContactDetailViewProps) {
  const t = useTranslations('Contacts.detailView');
  const supabase = createClient();
  const { accountId, defaultCurrency } = useAuth();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Send template — lets the business initiate (or re-open) a conversation
  // with this contact by sending an approved template. The send route
  // find-or-creates the conversation, so no inbound message is required.
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState(false);

  // Details tab
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [hasGst, setHasGst] = useState(false);
  const [editTaxId, setEditTaxId] = useState('');
  const [editState, setEditState] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  // Tags tab
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [contactTagIds, setContactTagIds] = useState<string[]>([]);
  const targetTagIdsRef = useRef<string[]>([]);
  const savedTagIdsRef = useRef<string[]>([]);
  const isSyncingRef = useRef(false);

  // Notes tab
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Custom fields tab
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [savingCustom, setSavingCustom] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Deals tab
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  const fetchContact = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);

    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (data) {
      setContact(data);
      setEditName(data.name ?? '');
      setEditPhone(data.phone);
      setEditEmail(data.email ?? '');
      setEditCompany(data.company ?? '');
      
      const initialTaxIdStr = data.tax_id ?? '';
      const parts = initialTaxIdStr.split('::');
      const initialGst = parts[0] || '';
      const initialStateStr = parts[1] || '';
      const initialAddress = parts.slice(2).join('::') || '';
      
      setHasGst(!!initialGst || !!initialStateStr);
      setEditTaxId(initialGst);
      setEditState(initialStateStr);
      setEditAddress(initialAddress);
    }
    setLoading(false);
  }, [contactId, supabase]);

  const fetchTags = useCallback(async () => {
    if (!contactId) return;

    const [tagsRes, contactTagsRes] = await Promise.all([
      supabase.from('tags').select('*').order('name'),
      supabase.from('contact_tags').select('tag_id').eq('contact_id', contactId),
    ]);

    if (tagsRes.data) setAllTags(tagsRes.data);
    if (contactTagsRes.data) {
      const ids = contactTagsRes.data.map((ct) => ct.tag_id);
      setContactTagIds(ids);
      targetTagIdsRef.current = ids;
      savedTagIdsRef.current = ids;
    }
  }, [contactId, supabase]);

  const fetchNotes = useCallback(async () => {
    if (!contactId) return;
    setLoadingNotes(true);

    const { data } = await supabase
      .from('contact_notes')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (data) setNotes(data);
    setLoadingNotes(false);
  }, [contactId, supabase]);

  const fetchCustomFields = useCallback(async () => {
    if (!contactId) return;
    setLoadingCustom(true);

    const [fieldsRes, valuesRes] = await Promise.all([
      supabase.from('custom_fields').select('*').order('field_name'),
      supabase
        .from('contact_custom_values')
        .select('*')
        .eq('contact_id', contactId),
    ]);

    if (fieldsRes.data) setCustomFields(fieldsRes.data);
    if (valuesRes.data) {
      const map: Record<string, string> = {};
      valuesRes.data.forEach((v) => {
        map[v.custom_field_id] = v.value ?? '';
      });
      setCustomValues(map);
    }
    setLoadingCustom(false);
  }, [contactId, supabase]);

  const fetchDeals = useCallback(async () => {
    if (!contactId) return;
    setLoadingDeals(true);
    const { data } = await supabase
      .from('deals')
      .select('*, stage:pipeline_stages(*)')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    setDeals((data ?? []) as Deal[]);
    setLoadingDeals(false);
  }, [contactId, supabase]);

  useEffect(() => {
    if (open && contactId) {
      fetchContact();
      fetchTags();
      fetchNotes();
      fetchCustomFields();
      fetchDeals();
    }
  }, [open, contactId, fetchContact, fetchTags, fetchNotes, fetchCustomFields, fetchDeals]);

  async function copyPhone() {
    if (!contact) return;
    await navigator.clipboard.writeText(contact.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  }

  async function saveDetails() {
    if (!contactId || !editPhone.trim()) {
      toast.error(t('toastPhoneRequired'));
      return;
    }

    setSavingDetails(true);
    const { error } = await supabase
      .from('contacts')
      .update({
        name: editName.trim() || null,
        phone: editPhone.trim(),
        email: editEmail.trim() || null,
        company: editCompany.trim() || null,
        tax_id: (editTaxId.trim() || editState.trim() || editAddress.trim()) ? `${editTaxId.trim()}::${editState.trim()}::${editAddress.trim()}` : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId);

    if (error) {
      toast.error(t('toastUpdateFailed'));
    } else {
      toast.success(t('toastUpdated'));
      fetchContact();
      onUpdated();
    }
    setSavingDetails(false);
  }

  const triggerSync = useCallback(async () => {
    if (!contactId || isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      while (true) {
        const target = targetTagIdsRef.current;
        const saved = savedTagIdsRef.current;

        // Find a tag that needs to be added
        const toAdd = target.find((id) => !saved.includes(id));
        if (toAdd) {
          await addContactTag(contactId, toAdd);
          savedTagIdsRef.current = [...saved, toAdd];
          onUpdated();
          continue;
        }

        // Find a tag that needs to be removed
        const toRemove = saved.find((id) => !target.includes(id));
        if (toRemove) {
          await deleteContactTag(contactId, toRemove);
          savedTagIdsRef.current = saved.filter((id) => id !== toRemove);
          onUpdated();
          continue;
        }

        break;
      }
    } catch (error) {
      console.error('Failed to sync tags:', error);
      toast.error(t('toastUpdateFailed'));
      // Revert UI to last saved database state
      setContactTagIds(savedTagIdsRef.current);
      targetTagIdsRef.current = savedTagIdsRef.current;
    } finally {
      isSyncingRef.current = false;
    }
  }, [contactId, onUpdated, t]);

  function toggleTag(tagId: string) {
    if (!contactId) return;

    const isSelected = contactTagIds.includes(tagId);
    let newIds: string[];

    if (isSelected) {
      newIds = contactTagIds.filter((id) => id !== tagId);
    } else {
      newIds = [...contactTagIds, tagId];
    }

    setContactTagIds(newIds);
    targetTagIdsRef.current = newIds;

    triggerSync();
  }

  async function addNote() {
    if (!contactId || !newNote.trim()) return;
    setSavingNote(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !accountId) {
      toast.error(t('toastNotAuthenticated'));
      setSavingNote(false);
      return;
    }

    const { error } = await supabase.from('contact_notes').insert({
      contact_id: contactId,
      account_id: accountId,
      user_id: user.id,
      note_text: newNote.trim(),
    });

    if (error) {
      toast.error(t('toastNoteAddFailed'));
    } else {
      setNewNote('');
      fetchNotes();
      toast.success(t('toastNoteAdded'));
    }
    setSavingNote(false);
  }

  async function deleteNote(noteId: string) {
    const { error } = await supabase
      .from('contact_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      toast.error(t('toastNoteDeleteFailed'));
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success(t('toastNoteDeleted'));
    }
  }

  async function saveCustomFields() {
    if (!contactId) return;
    setSavingCustom(true);

    try {
      // Delete existing values and re-insert
      await supabase
        .from('contact_custom_values')
        .delete()
        .eq('contact_id', contactId);

      const rows = Object.entries(customValues)
        .filter(([, val]) => val.trim())
        .map(([fieldId, val]) => ({
          contact_id: contactId,
          custom_field_id: fieldId,
          value: val.trim(),
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from('contact_custom_values')
          .insert(rows);
        if (error) throw error;
      }

      toast.success(t('toastCustomFieldsSaved'));
    } catch {
      toast.error(t('toastCustomFieldsFailed'));
    }
    setSavingCustom(false);
  }

  async function handleSendTemplate(
    template: MessageTemplate,
    values: TemplateSendValues,
  ) {
    if (!contactId) return;
    setSendingTemplate(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // No conversation_id — the route find-or-creates one for this
          // contact, mirroring the inbox template-send payload otherwise.
          contact_id: contactId,
          message_type: 'template',
          template_name: template.name,
          template_language: template.language,
          template_message_params: {
            body: values.body,
            headerText: values.headerText,
            buttonParams: values.buttonParams,
          },
          template_params: values.body,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const reason = payload?.error || `HTTP ${res.status}`;
        toast.error(t('toastTemplateFailed', { reason }));
        return;
      }

      toast.success(t('toastTemplateSent', { name: template.name }));
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'network error';
      toast.error(`Failed to send template: ${reason}`);
    } finally {
      setSendingTemplate(false);
    }
  }

  function getInitials(name?: string | null) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-card/95 border-l border-border/80 text-popover-foreground sm:max-w-lg w-full p-0 shadow-2xl backdrop-blur-md"
      >
        {loading || !contact ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col h-full bg-background/50">
            {/* Header */}
            <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 relative overflow-hidden shrink-0">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <Avatar className="size-14 relative bg-card border border-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/10 text-primary text-base font-semibold">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0 space-y-1.5">
                  <SheetTitle className="text-xl font-bold text-foreground tracking-tight truncate">
                    {contact.name || t('unnamed')}
                  </SheetTitle>
                  
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <button
                      onClick={copyPhone}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer w-fit font-mono bg-muted/60 hover:bg-muted px-2 py-0.5 rounded border border-border/30"
                    >
                      <Phone className="size-3" />
                      {contact.phone}
                      {copiedPhone ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3 opacity-60" />
                      )}
                    </button>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {contact.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5 opacity-70" />
                          {contact.email}
                        </span>
                      )}
                      {contact.company && (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="size-3.5 opacity-70" />
                          {contact.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setTemplatePickerOpen(true)}
                  disabled={sendingTemplate}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg px-4"
                >
                  {sendingTemplate ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <LayoutTemplate className="size-3.5 mr-1.5" />
                  )}
                  {t('sendTemplateBtn')}
                </Button>
              </div>
            </SheetHeader>

            {/* Tabs */}
            <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
              <TabsList className="bg-muted/40 border border-border/40 p-1 mx-6 mt-4 rounded-xl gap-1 shrink-0">
                <TabsTrigger
                  value="details"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-active:bg-background data-active:text-foreground data-active:shadow-sm text-muted-foreground hover:text-foreground"
                >
                  {t('tabs.details')}
                </TabsTrigger>
                <TabsTrigger
                  value="tags"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-active:bg-background data-active:text-foreground data-active:shadow-sm text-muted-foreground hover:text-foreground"
                >
                  {t('tabs.tags', { fallback: 'Tags' })}
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-active:bg-background data-active:text-foreground data-active:shadow-sm text-muted-foreground hover:text-foreground"
                >
                  {t('tabs.notes')}
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-active:bg-background data-active:text-foreground data-active:shadow-sm text-muted-foreground hover:text-foreground"
                >
                  {t('tabs.custom')}
                </TabsTrigger>
                <TabsTrigger
                  value="deals"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-active:bg-background data-active:text-foreground data-active:shadow-sm text-muted-foreground hover:text-foreground"
                >
                  {t('tabs.deals')}
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-card border border-border/50 rounded-xl p-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t('nameLabel', { fallback: 'Name' })}</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      {t('phone')} <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t('email')}</Label>
                    <Input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t('company')}</Label>
                    <Input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Address</Label>
                    <Input
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                      placeholder="e.g. 123 Main St, City"
                    />
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cd-has-gst" 
                        checked={hasGst}
                        onCheckedChange={(checked) => setHasGst(!!checked)}
                      />
                      <Label htmlFor="cd-has-gst" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Has GST?
                      </Label>
                    </div>

                    {hasGst && (
                      <div className="space-y-4 pt-2 border-t border-border/50">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Tax ID / GSTIN</Label>
                          <Input
                            value={editTaxId}
                            onChange={(e) => setEditTaxId(e.target.value)}
                            placeholder="e.g. 27AAAAA0000A1Z5"
                            className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">State</Label>
                          <Input
                            list="indian-states-cd"
                            value={editState}
                            onChange={(e) => setEditState(e.target.value)}
                            placeholder="Search and select state..."
                            className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg"
                            autoComplete="off"
                          />
                          <datalist id="indian-states-cd">
                            {INDIAN_STATES.map((s) => (
                              <option key={s} value={s} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={saveDetails}
                    disabled={savingDetails}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full rounded-lg mt-2"
                    size="sm"
                  >
                    {savingDetails ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <Save className="size-4 mr-2" />
                    )}
                    {t('saveChangesBtn')}
                  </Button>
                </div>
              </TabsContent>

              {/* Tags Tab */}
              <TabsContent value="tags" className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      Contact Tags
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t('tagsTab.clickTagDesc')}
                    </span>
                  </div>
                  
                  {allTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      {t('tagsTab.noTagsAvailable')}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {allTags.map((tag) => {
                        const selected = contactTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer border ${
                              selected
                                ? 'scale-105 shadow-sm'
                                : 'bg-transparent border-transparent hover:bg-muted/30 hover:border-border/50'
                            }`}
                            style={{
                              backgroundColor: selected ? `${tag.color}22` : `${tag.color}08`,
                              borderColor: selected ? tag.color : `${tag.color}25`,
                              color: selected ? '#ffffff' : `${tag.color}cc`,
                              boxShadow: selected ? `0 0 12px ${tag.color}25` : 'none',
                            }}
                          >
                            <span 
                              className={`size-1.5 rounded-full transition-transform duration-250 ${selected ? 'scale-125' : 'opacity-70'}`}
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="flex-1 flex flex-col min-h-0 p-6 space-y-4">
                <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3 shrink-0">
                  <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t('notesTab.title')}</Label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t('notesTab.placeholder')}
                    className="bg-background border-border/80 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/60 min-h-[70px] text-sm resize-none rounded-lg p-3"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={addNote}
                      disabled={!newNote.trim() || savingNote}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg"
                      size="sm"
                    >
                      {savingNote ? (
                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Plus className="size-3.5 mr-1.5" />
                      )}
                      {t('notesTab.save')}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {loadingNotes ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground space-y-1">
                      <p className="text-sm font-medium">{t('notesTab.noNotes')}</p>
                      <p className="text-xs opacity-60">Notes are internal and only visible to your team.</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl bg-card border border-border/40 p-4 group hover:border-border/80 transition-all duration-200 shadow-sm relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap flex-1 leading-relaxed">
                            {note.note_text}
                          </p>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all duration-200 cursor-pointer shrink-0 p-1 hover:bg-muted rounded"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground border-t border-border/30 pt-2">
                          <span className="bg-muted px-1.5 py-0.5 rounded font-medium">Internal Note</span>
                          <span>•</span>
                          <span>
                            {new Date(note.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Custom Fields Tab */}
              <TabsContent value="custom" className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingCustom ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : customFields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm font-medium">{t('noCustomFields')}</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border/50 rounded-xl p-4 space-y-4">
                    {customFields.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase capitalize">
                          {field.field_name}
                        </Label>
                        <Input
                          value={customValues[field.id] ?? ''}
                          onChange={(e) =>
                            setCustomValues((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                          placeholder={t('enterCustomField', { name: field.field_name })}
                          className="bg-background border-border/80 focus:border-primary/50 text-foreground h-9 text-sm rounded-lg placeholder:text-muted-foreground/60"
                        />
                      </div>
                    ))}
                    <Button
                      onClick={saveCustomFields}
                      disabled={savingCustom}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full rounded-lg mt-2"
                      size="sm"
                    >
                      {savingCustom ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <Save className="size-4 mr-2" />
                      )}
                      {t('saveCustomFieldsBtn')}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Deals Tab */}
              <TabsContent value="deals" className="flex-1 overflow-y-auto p-6 space-y-3">
                {loadingDeals ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm font-medium">{t('dealsTab.noDeals')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="rounded-xl border border-border/40 bg-card p-4 hover:border-border/80 transition-all duration-200 shadow-sm relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/70" />
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors">
                            {deal.title}
                          </p>
                          {deal.stage && (
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                              style={{
                                backgroundColor: `${deal.stage.color}15`,
                                color: deal.stage.color,
                                border: `1px solid ${deal.stage.color}30`
                              }}
                            >
                              {deal.stage.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3">
                          <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                            <DollarSign className="size-3.5 text-muted-foreground" />
                            {formatCurrency(
                              deal.value ?? 0,
                              deal.currency || defaultCurrency,
                            )}
                          </span>
                          {deal.status && deal.status !== 'open' && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                deal.status === 'won'
                                  ? 'bg-primary/10 text-primary border border-primary/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {deal.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
    <TemplatePicker
      open={templatePickerOpen}
      onOpenChange={setTemplatePickerOpen}
      onSelect={handleSendTemplate}
    />
    </>
  );
}
