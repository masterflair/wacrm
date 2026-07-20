'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Upload, Tag as TagIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Contact, Tag } from '@/types';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSearch: string;
  currentSelectedTagIds: string[];
  availableTags: Tag[];
  totalCount: number;
}

export function ExportModal({
  open,
  onOpenChange,
  currentSearch,
  currentSelectedTagIds,
  availableTags,
  totalCount,
}: ExportModalProps) {
  const t = useTranslations('Contacts.exportModal');
  const supabase = createClient();
  const { accountId } = useAuth();

  const [scope, setScope] = useState<'all' | 'filtered' | 'tags'>('all');
  const [selectedExportTagIds, setSelectedExportTagIds] = useState<string[]>([]);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeCustomFields, setIncludeCustomFields] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Sync scope to 'filtered' if there are active filters on open
  useEffect(() => {
    if (open) {
      if (currentSearch.trim() || currentSelectedTagIds.length > 0) {
        setScope('filtered');
      } else {
        setScope('all');
      }
      setSelectedExportTagIds([]);
    }
  }, [open, currentSearch, currentSelectedTagIds]);

  function toggleTagSelection(tagId: string) {
    setSelectedExportTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleExport() {
    if (!accountId) return;
    setExporting(true);

    try {
      let contactsToExport: Contact[] = [];
      let targetTagIds = selectedExportTagIds;

      if (scope === 'all') {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('account_id', accountId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        contactsToExport = data ?? [];
      } else if (scope === 'filtered') {
        // Query matching filters
        if (currentSelectedTagIds.length > 0) {
          const { data, error } = await supabase.rpc('filter_contacts_by_tags', {
            p_tag_ids: currentSelectedTagIds,
            p_search: currentSearch.trim() || null,
            p_limit: 100000,
            p_offset: 0,
          });
          if (error) throw error;
          contactsToExport = (data ?? []).map((r: { contact: Contact }) => r.contact);
        } else {
          let query = supabase
            .from('contacts')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });
          const term = currentSearch.trim();
          if (term) {
            query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
          }
          const { data, error } = await query;
          if (error) throw error;
          contactsToExport = data ?? [];
        }
      } else if (scope === 'tags') {
        if (targetTagIds.length === 0) {
          toast.error(t('selectAtLeastOneTag'));
          setExporting(false);
          return;
        }

        const { data, error } = await supabase.rpc('filter_contacts_by_tags', {
          p_tag_ids: targetTagIds,
          p_search: null,
          p_limit: 100000,
          p_offset: 0,
        });
        if (error) throw error;
        contactsToExport = (data ?? []).map((r: { contact: Contact }) => r.contact);
      }

      if (contactsToExport.length === 0) {
        toast.info(t('noContactsMatch'));
        setExporting(false);
        return;
      }

      // Fetch additional data (tags / custom fields) if needed
      const contactIds = contactsToExport.map((c) => c.id);
      
      let tagsByContact: Record<string, string[]> = {};
      if (includeTags) {
        const { data: contactTags } = await supabase
          .from('contact_tags')
          .select('contact_id, tags(name)')
          .in('contact_id', contactIds);
        
        contactTags?.forEach((ct: any) => {
          if (!tagsByContact[ct.contact_id]) tagsByContact[ct.contact_id] = [];
          if (ct.tags?.name) tagsByContact[ct.contact_id].push(ct.tags.name);
        });
      }

      let customFields: any[] = [];
      let customValuesMap: Record<string, Record<string, string>> = {}; // contactId -> fieldName -> value
      if (includeCustomFields) {
        const [fieldsRes, valuesRes] = await Promise.all([
          supabase.from('custom_fields').select('id, field_name').eq('account_id', accountId),
          supabase
            .from('contact_custom_values')
            .select('contact_id, custom_field_id, value')
            .in('contact_id', contactIds)
        ]);

        if (fieldsRes.data) customFields = fieldsRes.data;
        
        const fieldNameById = new Map<string, string>();
        customFields.forEach(f => fieldNameById.set(f.id, f.field_name));

        valuesRes.data?.forEach((v) => {
          const fieldName = fieldNameById.get(v.custom_field_id);
          if (fieldName) {
            if (!customValuesMap[v.contact_id]) customValuesMap[v.contact_id] = {};
            customValuesMap[v.contact_id][fieldName] = v.value ?? '';
          }
        });
      }

      // Build CSV Headers
      const headers = ['Name', 'Phone', 'Email', 'Company', 'Created At'];
      if (includeTags) headers.push('Tags');
      customFields.forEach((field) => headers.push(field.field_name));

      const csvRows = [headers.join(',')];

      // Build CSV rows
      for (const contact of contactsToExport) {
        const row = [
          `"${(contact.name || '').replace(/"/g, '""')}"`,
          `"${(contact.phone || '').replace(/"/g, '""')}"`,
          `"${(contact.email || '').replace(/"/g, '""')}"`,
          `"${(contact.company || '').replace(/"/g, '""')}"`,
          `"${new Date(contact.created_at).toISOString()}"`,
        ];

        if (includeTags) {
          const tagsList = tagsByContact[contact.id] ?? [];
          row.push(`"${tagsList.join(', ').replace(/"/g, '""')}"`);
        }

        customFields.forEach((field) => {
          const val = customValuesMap[contact.id]?.[field.field_name] ?? '';
          row.push(`"${val.replace(/"/g, '""')}"`);
        });

        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('exportSuccess'));
      onOpenChange(false);
    } catch (err) {
      console.error('Export error:', err);
      toast.error(t('exportFailed'));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden border-border/80 bg-popover p-0 text-popover-foreground sm:max-w-md">
        <div className="shrink-0 space-y-4 border-b border-border/80 px-6 pt-6 pb-5">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg text-popover-foreground">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('desc')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Export Range */}
          <div className="space-y-3">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t('exportRange')}
            </label>
            <RadioGroup
              value={scope}
              onValueChange={(val: any) => setScope(val)}
              className="space-y-2.5"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="r-all" />
                <Label htmlFor="r-all" className="text-sm font-normal text-foreground cursor-pointer">
                  {t('allContacts', { count: totalCount })}
                </Label>
              </div>

              {(currentSearch.trim() || currentSelectedTagIds.length > 0) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="r-filtered" />
                  <Label htmlFor="r-filtered" className="text-sm font-normal text-foreground cursor-pointer">
                    {t('filteredContacts')}
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tags" id="r-tags" />
                <Label htmlFor="r-tags" className="text-sm font-normal text-foreground cursor-pointer">
                  {t('byTags')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Tag Selector */}
          {scope === 'tags' && (
            <div className="rounded-xl border border-border/80 bg-background/30 p-3 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <TagIcon className="size-3" />
                {t('selectTags')}
              </span>
              {availableTags.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-2">
                  {t('noTagsAvailable')}
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {availableTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2.5 px-2 py-1 rounded hover:bg-muted/40 cursor-pointer text-xs"
                    >
                      <Checkbox
                        checked={selectedExportTagIds.includes(tag.id)}
                        onCheckedChange={() => toggleTagSelection(tag.id)}
                      />
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-foreground truncate">{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t('additionalData')}
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="include-tags"
                  checked={includeTags}
                  onCheckedChange={(checked) => setIncludeTags(!!checked)}
                />
                <Label htmlFor="include-tags" className="text-sm font-normal text-foreground cursor-pointer">
                  {t('optionIncludeTags')}
                </Label>
              </div>

              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="include-custom"
                  checked={includeCustomFields}
                  onCheckedChange={(checked) => setIncludeCustomFields(!!checked)}
                />
                <Label htmlFor="include-custom" className="text-sm font-normal text-foreground cursor-pointer">
                  {t('optionIncludeCustom')}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-0 shrink-0 gap-2 border-t border-border/80 bg-background/50 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {t('exportBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
