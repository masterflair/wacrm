"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Contact, Deal, ContactNote, Tag, Pipeline, PipelineStage } from "@/types";
import {
  Check,
  Tag as TagIcon,
  DollarSign,
  StickyNote,
  Plus,
  X,
  Phone,
  Mail,
  User,
  Briefcase,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { addContactTag, deleteContactTag } from "@/lib/contacts/tag-api";
import { DealForm } from "@/components/pipelines/deal-form";

interface ContactSidebarProps {
  contact: Contact | null;
  onContactUpdated?: (contact: Contact) => void;
}

export function ContactSidebar({ contact, onContactUpdated }: ContactSidebarProps) {
  const tSidebar = useTranslations("Inbox.sidebar");
  const tThread = useTranslations("Inbox.messageThread");
  const tContacts = useTranslations("Contacts");

  const { accountId } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [savingTag, setSavingTag] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [editName, setEditName] = useState(contact?.name ?? "");
  const [editPhone, setEditPhone] = useState(contact?.phone ?? "");
  const [editEmail, setEditEmail] = useState(contact?.email ?? "");
  const [editCompany, setEditCompany] = useState(contact?.company ?? "");
  const [savingContact, setSavingContact] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    const supabase = createClient();

    // Fetch deals, notes, and tags in parallel
    const [dealsRes, notesRes, contactTagsRes, tagsRes, pipelinesRes, stagesRes] =
      await Promise.all([
        supabase
          .from("deals")
          .select("*, stage:pipeline_stages(*)")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_notes")
          .select("*")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_tags")
          .select("tag_id")
          .eq("contact_id", contact.id),
        supabase.from("tags").select("*").order("name"),
        supabase.from("pipelines").select("*").order("name"),
        supabase.from("pipeline_stages").select("*").order("position"),
      ]);

    if (dealsRes.data) setDeals(dealsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (contactTagsRes.data) {
      setSelectedTagIds(contactTagsRes.data.map((ct) => ct.tag_id));
    }
    if (tagsRes.data) setAllTags(tagsRes.data);
    if (pipelinesRes.data) setPipelines(pipelinesRes.data);
    if (stagesRes.data) setPipelineStages(stagesRes.data);
  }, [contact]);

  // Load on contact change. setContactData/setTags run inside async
  // Supabase callbacks, not synchronously in the effect body.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContactData();
  }, [fetchContactData]);

  useEffect(() => {
    if (!contact) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditName(contact.name ?? "");
    setEditPhone(contact.phone ?? "");
    setEditEmail(contact.email ?? "");
    setEditCompany(contact.company ?? "");
  }, [contact]);

  const handleCancelEditContact = useCallback(() => {
    if (!contact) return;
    setEditName(contact.name ?? "");
    setEditPhone(contact.phone ?? "");
    setEditEmail(contact.email ?? "");
    setEditCompany(contact.company ?? "");
    setEditingField(null);
  }, [contact]);

  const handleAddNote = useCallback(async () => {
    if (!contact || !newNote.trim()) return;
    if (!accountId) return;
    setAddingNote(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    const { data, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contact.id,
        account_id: accountId,
        user_id: user?.id,
        note_text: newNote.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
      setNewNote("");
    }
    setAddingNote(false);
  }, [contact, newNote, accountId]);

  const handleToggleTag = useCallback(
    async (tagId: string) => {
      if (!contact) return;
      
      const isSelected = selectedTagIds.includes(tagId);
      
      // Optimistic update
      setSelectedTagIds((prev) =>
        isSelected ? prev.filter((id) => id !== tagId) : [...prev, tagId]
      );

      try {
        if (isSelected) {
          await deleteContactTag(contact.id, tagId);
        } else {
          await addContactTag(contact.id, tagId);
        }
      } catch (err) {
        // Revert on error
        setSelectedTagIds((prev) =>
          isSelected ? [...prev, tagId] : prev.filter((id) => id !== tagId)
        );
        const message =
          err instanceof Error ? err.message : "Failed to update tags.";
        toast.error(message);
      }
    },
    [contact, selectedTagIds],
  );

  const handleSaveSingleField = useCallback(async (fieldId: string) => {
    if (!contact) return;
    setSavingContact(true);

    const updates: Record<string, string | null> = {};
    if (fieldId === "name") updates.name = editName.trim() || null;
    if (fieldId === "phone") updates.phone = editPhone.trim() || null;
    if (fieldId === "email") updates.email = editEmail.trim() || null;
    if (fieldId === "company") updates.company = editCompany.trim() || null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("contacts")
      .update(updates)
      .eq("id", contact.id)
      .select()
      .single();

    if (error || !data) {
      toast.error(tContacts("detailView.toastUpdateFailed"));
      setSavingContact(false);
      return;
    }

    toast.success(tContacts("detailView.toastUpdated"));
    onContactUpdated?.(data);
    setEditingField(null);
    setSavingContact(false);
  }, [contact, editName, editPhone, editEmail, editCompany, onContactUpdated, tContacts]);

  const openDealForm = useCallback(
    (deal?: Deal | null) => {
      setEditDeal(deal ?? null);
      setDealFormOpen(true);
    },
    [],
  );

  const handleDealSaved = useCallback(() => {
    fetchContactData();
  }, [fetchContactData]);

  if (!contact) {
    return (
      <div className="flex h-full w-70 items-center justify-center border-l border-border bg-card">
        <p className="text-sm text-muted-foreground">{tThread("selectConversation")}</p>
      </div>
    );
  }

  const displayName = editName || contact.name || contact.phone;
  const initials = displayName.charAt(0).toUpperCase();
  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
  const defaultPipeline = pipelines[0];
  const defaultPipelineStages = pipelineStages.filter(
    (stage) => stage.pipeline_id === defaultPipeline?.id,
  );
  const canCreateDeal = defaultPipeline !== undefined && defaultPipelineStages.length > 0;

  return (
    <div className="flex h-full min-h-0 w-full max-w-[24rem] sm:w-70 flex-col overflow-hidden border-l border-border bg-card">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-5 min-h-0 space-y-6">
          {/* Contact Info */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {tSidebar("basicInfo")}
              </span>
            </div>
            
            <div className="flex flex-col items-center text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-medium text-muted-foreground mb-3 border border-border/50 shadow-sm">
                {contact.avatar_url ? (
                  <img
                    src={contact.avatar_url}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="group flex items-center justify-center gap-1.5 w-full">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-1.5 w-full max-w-[200px]">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={tSidebar("nameLabel")}
                      className="h-8 text-xs bg-muted/30 border-border/60 flex-1 text-center font-semibold"
                    />
                    <Button 
                      size="icon" 
                      variant="default"
                      className="h-8 w-8 shrink-0 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleSaveSingleField('name')}
                      disabled={savingContact}
                    >
                      <Check className="h-4 w-4"/>
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline"
                      className="h-8 w-8 shrink-0 border-border/60"
                      onClick={handleCancelEditContact}
                      disabled={savingContact}
                    >
                      <X className="h-4 w-4"/>
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-semibold text-foreground tracking-tight truncate max-w-full">
                      {contact.name || contact.phone || "Unnamed"}
                    </h3>
                    <button 
                      onClick={() => setEditingField('name')}
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="px-1 space-y-3">
              {[
                {
                  id: "phone",
                  label: tSidebar("phoneLabel"),
                  icon: <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />,
                  value: contact.phone,
                  inputValue: editPhone,
                  onChange: (value: string) => setEditPhone(value),
                },
                {
                  id: "email",
                  label: tSidebar("emailLabel"),
                  icon: <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />,
                  value: contact.email,
                  inputValue: editEmail,
                  onChange: (value: string) => setEditEmail(value),
                },
                {
                  id: "company",
                  label: tSidebar("companyLabel"),
                  icon: <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />,
                  value: contact.company,
                  inputValue: editCompany,
                  onChange: (value: string) => setEditCompany(value),
                },
              ]
                .map((field) => (
                  <div key={field.id} className="group flex flex-col gap-1.5">
                    {editingField === field.id ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          {field.icon}
                          <span>{field.label}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Input
                            value={field.inputValue}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder={field.label}
                            className="h-8 text-xs bg-muted/30 border-border/60 flex-1"
                          />
                          <Button 
                            size="icon" 
                            variant="default"
                            className="h-8 w-8 shrink-0 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleSaveSingleField(field.id)}
                            disabled={savingContact}
                          >
                            <Check className="h-4 w-4"/>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline"
                            className="h-8 w-8 shrink-0 border-border/60"
                            onClick={handleCancelEditContact}
                            disabled={savingContact}
                          >
                            <X className="h-4 w-4"/>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between py-1 hover:bg-muted/30 rounded-md -mx-1 px-1 transition-colors">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 w-4 shrink-0 flex justify-center">{field.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/90 font-medium truncate">
                              {field.value || <span className="text-muted-foreground/50 italic">--</span>}
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mt-0.5">
                              {field.label}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setEditingField(field.id)}
                          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 shrink-0 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Tags */}
          <div className="space-y-3.5">
            <Popover open={tagEditorOpen} onOpenChange={setTagEditorOpen}>
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                  <TagIcon className="h-3 w-3 text-primary/80" />
                  {tSidebar("tags")}
                </div>
                <PopoverTrigger
                  className="inline-flex h-6 items-center justify-center rounded-full border border-border/80 bg-background/50 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 cursor-pointer"
                >
                  Add tag
                </PopoverTrigger>
              </div>

              <PopoverContent side="bottom" align="end" className="w-72 p-3.5 rounded-xl border border-border shadow-md bg-popover">
                <div className="flex items-center justify-between gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 border-b border-border/40">
                  <span>{tSidebar("tags")}</span>
                  <button
                    type="button"
                    onClick={() => setTagEditorOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {allTags.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    No tags available. Create tags in Settings.
                  </p>
                ) : (
                  <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {allTags.map((tag) => {
                      const selected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          disabled={savingTag}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all duration-200 border border-transparent hover:scale-[1.01] cursor-pointer"
                          style={selected ? { borderColor: `${tag.color}40`, backgroundColor: `${tag.color}15`, color: tag.color } : { backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </div>
                            {selected ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <div className="flex flex-wrap gap-1.5 px-0.5">
              {selectedTags.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 italic">{tSidebar("noTags")}</p>
              ) : (
                selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      borderColor: `${tag.color}35`,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Active Deals */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                <DollarSign className="h-3 w-3 text-primary/80" />
                {tSidebar("deals")}
              </div>
              <Button
                size="xs"
                variant="outline"
                className="h-6 rounded-full px-2.5 text-[10px] font-semibold border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all cursor-pointer"
                onClick={() => openDealForm(null)}
                disabled={!canCreateDeal}
              >
                Add deal
              </Button>
            </div>
            <div className="space-y-2">
              {deals.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground/60 italic">{tSidebar("noDeals")}</p>
              ) : (
                deals.map((deal) => (
                  <button
                    type="button"
                    key={deal.id}
                    onClick={() => openDealForm(deal)}
                    className="group/deal w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-left transition-all duration-300 hover:bg-muted/40 hover:border-border hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden cursor-pointer"
                  >
                    {deal.stage && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover/deal:w-1.5"
                        style={{ backgroundColor: deal.stage.color }}
                      />
                    )}
                    <div className="pl-1.5">
                      <p className="text-xs font-bold text-foreground/90 group-hover/deal:text-foreground transition-colors duration-200">
                        {deal.title}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-foreground/80 font-mono">
                          {deal.currency ?? "₹"}
                          {deal.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        {deal.stage && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-semibold border transition-all duration-200"
                            style={{
                              backgroundColor: `${deal.stage.color}15`,
                              color: deal.stage.color,
                              borderColor: `${deal.stage.color}35`,
                            }}
                          >
                            {deal.stage.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {!canCreateDeal && (
              <p className="px-1 text-[10px] text-muted-foreground/60 italic leading-relaxed">
                Create a pipeline with stages in Settings to add deals.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Notes */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
              <StickyNote className="h-3 w-3 text-primary/80" />
              {tSidebar("notes")}
            </div>
            <div className="space-y-3.5">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={tSidebar("addNotePlaceholder")}
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-muted/40 focus:ring-1 focus:ring-primary/20"
                />
                <Button
                  size="sm"
                  className="h-auto bg-primary px-3 rounded-xl hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {notes.length > 0 && (
                <div className="relative pl-3 border-l border-border/80 space-y-3.5 mt-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="relative group/note"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[17.5px] top-1.5 h-2 w-2 rounded-full border border-border bg-background transition-all duration-300 group-hover/note:bg-primary group-hover/note:scale-125 animate-pulse" />
                      
                      <div className="rounded-xl border border-border/40 bg-muted/15 px-3 py-2.5 transition-all duration-300 hover:bg-muted/30 hover:border-border/80">
                        <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80">
                          {note.note_text}
                        </p>
                        <p className="mt-1.5 text-[9px] font-semibold text-muted-foreground/60 tracking-wider">
                          {format(new Date(note.created_at), "MMM d, yyyy • HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <DealForm
        open={dealFormOpen}
        onOpenChange={(open) => {
          setDealFormOpen(open);
          if (!open) setEditDeal(null);
        }}
        deal={editDeal}
        pipelineId={defaultPipeline?.id || ""}
        stages={defaultPipelineStages}
        defaultStageId={defaultPipelineStages[0]?.id}
        defaultContactId={contact.id}
        onSaved={handleDealSaved}
      />
    </div>
  );
}
