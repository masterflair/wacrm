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
  const [isEditingContact, setIsEditingContact] = useState(false);

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
    fetchContactData();
  }, [fetchContactData]);

  useEffect(() => {
    if (!contact) return;
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
    setIsEditingContact(false);
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
      setSavingTag(true);
      const isSelected = selectedTagIds.includes(tagId);

      try {
        if (isSelected) {
          await deleteContactTag(contact.id, tagId);
          setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
        } else {
          await addContactTag(contact.id, tagId);
          setSelectedTagIds((prev) => [...prev, tagId]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update tags.";
        toast.error(message);
      } finally {
        setSavingTag(false);
      }
    },
    [contact, selectedTagIds],
  );

  const handleSaveContact = useCallback(async () => {
    if (!contact) return;
    setSavingContact(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("contacts")
      .update({
        name: editName.trim() || null,
        phone: editPhone.trim() || null,
        email: editEmail.trim() || null,
        company: editCompany.trim() || null,
      })
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
    setIsEditingContact(false);
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
        <div className="p-4 min-h-0">
          {/* Contact Info */}
          <div>
            <div className="flex items-center justify-between gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>{tSidebar("basicInfo")}</span>
              <Button
                size="xs"
                variant="secondary"
                className="rounded-full px-2 py-1"
                onClick={() => setIsEditingContact((prev) => !prev)}
              >
                {isEditingContact ? tSidebar("cancel") : tSidebar("editContact")}
              </Button>
            </div>
            <div className="mt-3 rounded-3xl border border-border bg-muted p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-lg font-semibold text-foreground">
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={displayName}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {contact.name || contact.phone || "Unnamed"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {contact.company ?? "--"}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-muted/80">
                {[
                  {
                    label: tSidebar("nameLabel"),
                    icon: <User className="h-4 w-4 text-muted-foreground" />,
                    value: contact.name || "--",
                    inputValue: editName,
                    onChange: (value: string) => setEditName(value),
                  },
                  {
                    label: tSidebar("phoneLabel"),
                    icon: <Phone className="h-4 w-4 text-muted-foreground" />,
                    value: contact.phone || "--",
                    inputValue: editPhone,
                    onChange: (value: string) => setEditPhone(value),
                  },
                  {
                    label: tSidebar("emailLabel"),
                    icon: <Mail className="h-4 w-4 text-muted-foreground" />,
                    value: contact.email || "--",
                    inputValue: editEmail,
                    onChange: (value: string) => setEditEmail(value),
                  },
                  {
                    label: tSidebar("companyLabel"),
                    icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
                    value: contact.company || "--",
                    inputValue: editCompany,
                    onChange: (value: string) => setEditCompany(value),
                  },
                ].map((field, index) => (
                  <div
                    key={field.label}
                    className={`flex items-center gap-3 border-l-2 border-primary/40 px-3 py-3 ${
                      index < 3 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground">
                      {field.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {field.label}
                      </p>
                      {isEditingContact ? (
                        <Input
                          value={field.inputValue}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder={field.value === "--" ? "" : field.value}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-foreground">{field.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isEditingContact && (
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSaveContact}
                    disabled={savingContact}
                  >
                    {tSidebar("saveChanges")}
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleCancelEditContact}
                  >
                    {tSidebar("cancel")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Tags */}
          <div>
            <Popover open={tagEditorOpen} onOpenChange={setTagEditorOpen}>
              <div className="flex items-center justify-between gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-3 w-3" />
                  {tSidebar("tags")}
                </div>
                <PopoverTrigger
                  className="inline-flex h-7 items-center justify-center rounded-full border border-border bg-background px-2 text-[10px] uppercase tracking-wider text-foreground transition hover:bg-muted"
                >
                  Add tag
                </PopoverTrigger>
              </div>

              <PopoverContent side="bottom" align="end" className="w-72 p-3">
                <div className="flex items-center justify-between gap-2 px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                  <span>{tSidebar("tags")}</span>
                  <button
                    type="button"
                    onClick={() => setTagEditorOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {allTags.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No tags available. Create tags in Settings.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {allTags.map((tag) => {
                      const selected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          disabled={savingTag}
                          className={`w-full rounded-lg px-3 py-2 text-left transition ${
                            selected
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-foreground hover:bg-muted/90'
                          }`}
                          style={selected ? { borderColor: tag.color, borderWidth: 1 } : undefined}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <span
                                className="inline-flex h-3.5 w-3.5 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </div>
                            {selected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedTags.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">{tSidebar("noTags")}</p>
              ) : (
                selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Active Deals */}
          <div>
            <div className="flex items-center justify-between gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                {tSidebar("deals")}
              </div>
              <Button
                size="sm"
                className="h-7 rounded-full bg-primary px-2 text-[10px] uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
                onClick={() => openDealForm(null)}
                disabled={!canCreateDeal}
              >
                Add deal
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {deals.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">{tSidebar("noDeals")}</p>
              ) : (
                deals.map((deal) => (
                  <button
                    type="button"
                    key={deal.id}
                    onClick={() => openDealForm(deal)}
                    className="w-full rounded-lg bg-muted px-3 py-2 text-left transition hover:bg-muted/80"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {deal.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {deal.currency ?? "₹"}
                        {deal.value.toLocaleString()}
                      </span>
                      {deal.stage && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px]"
                          style={{
                            backgroundColor: `${deal.stage.color}20`,
                            color: deal.stage.color,
                          }}
                        >
                          {deal.stage.name}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            {!canCreateDeal && (
              <p className="mt-2 px-1 text-xs text-muted-foreground">
                Create a pipeline with stages in Settings to add deals.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <StickyNote className="h-3 w-3" />
              {tSidebar("notes")}
            </div>
            <div className="mt-2">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={tSidebar("addNotePlaceholder")}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
                <Button
                  size="sm"
                  className="h-auto bg-primary px-2 hover:bg-primary/90"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-muted px-3 py-2"
                  >
                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                      {note.note_text}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
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
        onSaved={handleDealSaved}
      />
    </div>
  );
}
