import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import {
  fetchWorkspaces,
  fetchCurrentWorkspace,
  fetchWorkspaceSettings,
  fetchWorkspaceMembers,
} from './slices/workspaceSlice';
import { fetchUserProfile } from './slices/userSlice';
import { fetchCampaigns, setFilters as setCampaignFilters, patchCampaign, removeCampaign } from './slices/campaignsSlice';
import { fetchContacts, setFilters as setContactFilters, patchContact, removeContact } from './slices/contactsSlice';
import { fetchDomains, setFilters as setDomainFilters, addDomain, patchDomain, removeDomain } from './slices/domainsSlice';
import { fetchSegments, fetchSegmentPreview, setFilterType, setSelectedSegment, patchSegment, addSegment, removeSegment, updatePreviewContacts } from './slices/segmentsSlice';
import { fetchWorkflows, patchWorkflow, addWorkflow, removeWorkflow, apiToWorkflow } from './slices/workflowsSlice';
import { fetchSends, fetchTemplates, setSendsFilters, setTemplatesFilters, patchTemplate, removeTemplate } from './slices/transactionalSlice';
import type { TransactionalSend, EmailTemplate as LocalEmailTemplate } from '@/lib/transactional-data';
import { transactionalService } from '@/lib/transactional-service';
import type { Campaign } from '@/lib/campaigns-data';
import type { Contact } from '@/lib/contacts-service';
import type { ApiDomain } from '@/lib/domains-service';
import type { Segment } from '@/lib/segments-data';
import type { Workflow } from '@/lib/workflows-data';
import { workflowsService } from '@/lib/workflows-service';

// TTL constants (ms)
const TTL_DEFAULT = 120_000;  // 2min — campaigns, contacts, domains, segments, workflows
const TTL_SENDS   = 30_000;   // 30s — transactional sends (active polling)
const TTL_USER    = 600_000;  // 10min — user profile + workspace

function isStale(fetchedAt: number | null, ttl: number): boolean {
  if (fetchedAt === null) return true;
  return Date.now() - fetchedAt > ttl;
}

// Fires callback on window focus, cleaned up on unmount
function useFocusRefetch(callback: () => void) {
  useEffect(() => {
    window.addEventListener('focus', callback);
    return () => window.removeEventListener('focus', callback);
  }, [callback]);
}

// ─── User ────────────────────────────────────────────────────────────────────

export function useUserProfile() {
  const dispatch = useAppDispatch();
  const { profile, loading, error, fetchedAt } = useAppSelector((state) => state.user);

  const refetch = useCallback(() => { dispatch(fetchUserProfile()); }, [dispatch]);

  useEffect(() => {
    if (!loading && isStale(fetchedAt, TTL_USER)) dispatch(fetchUserProfile());
  }, [dispatch, loading, fetchedAt]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_USER)) refetch(); });

  return { profile, loading, error, refetch };
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export function useWorkspaces() {
  const dispatch = useAppDispatch();
  const { workspaces, loading, error, fetchedAt } = useAppSelector((state) => state.workspace);

  const refetch = useCallback(() => { dispatch(fetchWorkspaces()); }, [dispatch]);

  useEffect(() => {
    if (!loading && isStale(fetchedAt, TTL_USER)) dispatch(fetchWorkspaces());
  }, [dispatch, loading, fetchedAt]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_USER)) refetch(); });

  return { workspaces, loading, error, refetch };
}

export function useCurrentWorkspace(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { currentWorkspace, loading } = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if (workspaceId && !currentWorkspace) {
      dispatch(fetchCurrentWorkspace(workspaceId));
    }
  }, [dispatch, workspaceId, currentWorkspace]);

  return { workspace: currentWorkspace, loading, refetch: () => workspaceId && dispatch(fetchCurrentWorkspace(workspaceId)) };
}

export function useWorkspaceSettings(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { settings, loading } = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if (workspaceId && !settings) {
      dispatch(fetchWorkspaceSettings(workspaceId));
    }
  }, [dispatch, workspaceId, settings]);

  return { settings, loading, refetch: () => workspaceId && dispatch(fetchWorkspaceSettings(workspaceId)) };
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { members, loading } = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if (workspaceId && !members) {
      dispatch(fetchWorkspaceMembers(workspaceId));
    }
  }, [dispatch, workspaceId, members]);

  return { members, loading, refetch: () => workspaceId && dispatch(fetchWorkspaceMembers(workspaceId)) };
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export function useCampaigns(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { items, total, filters, loading, error, fetchedAt, workspaceId: cachedWsId } = useAppSelector((state) => state.campaigns);

  const doFetch = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchCampaigns({ workspaceId, filters }));
  }, [dispatch, workspaceId, filters]);

  // fetch when workspace/filters change, or data is stale
  useEffect(() => {
    if (!workspaceId || loading) return;
    if (workspaceId !== cachedWsId || isStale(fetchedAt, TTL_DEFAULT)) doFetch();
  }, [dispatch, workspaceId, filters, cachedWsId, fetchedAt, loading, doFetch]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_DEFAULT)) doFetch(); });

  const updateFilters = (f: Parameters<typeof setCampaignFilters>[0]) => dispatch(setCampaignFilters(f));
  const patch = (update: Partial<Campaign> & { id: string }) => dispatch(patchCampaign(update));
  const remove = (id: string) => dispatch(removeCampaign(id));

  return { campaigns: items, total, filters, loading, error, updateFilters, patch, remove, refetch: doFetch };
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export function useContacts(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { items, total, filters, loading, error, fetchedAt, workspaceId: cachedWsId } = useAppSelector((state) => state.contacts);

  const doFetch = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchContacts({ workspaceId, filters }));
  }, [dispatch, workspaceId, filters]);

  useEffect(() => {
    if (!workspaceId || loading) return;
    if (workspaceId !== cachedWsId || isStale(fetchedAt, TTL_DEFAULT)) doFetch();
  }, [dispatch, workspaceId, filters, cachedWsId, fetchedAt, loading, doFetch]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_DEFAULT)) doFetch(); });

  const updateFilters = (f: Parameters<typeof setContactFilters>[0]) => dispatch(setContactFilters(f));
  const patch = (update: Partial<Contact> & { id: string }) => dispatch(patchContact(update));
  const remove = (id: string) => dispatch(removeContact(id));

  return { contacts: items, total, filters, loading, error, updateFilters, patch, remove, refetch: doFetch };
}

// ─── Domains ─────────────────────────────────────────────────────────────────

export function useDomains(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { items, total, filters, loading, error, fetchedAt, workspaceId: cachedWsId } = useAppSelector((state) => state.domains);

  const doFetch = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchDomains({ workspaceId, filters }));
  }, [dispatch, workspaceId, filters]);

  useEffect(() => {
    if (!workspaceId || loading) return;
    if (workspaceId !== cachedWsId || isStale(fetchedAt, TTL_DEFAULT)) doFetch();
  }, [dispatch, workspaceId, filters, cachedWsId, fetchedAt, loading, doFetch]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_DEFAULT)) doFetch(); });

  const updateFilters = (f: Partial<typeof filters>) => dispatch(setDomainFilters(f));
  const add = (domain: ApiDomain) => dispatch(addDomain(domain));
  const patch = (update: Partial<ApiDomain> & { id: string }) => dispatch(patchDomain(update));
  const remove = (id: string) => dispatch(removeDomain(id));

  return { domains: items, total, filters, loading, error, updateFilters, add, patch, remove, refetch: doFetch };
}

// ─── Segments ────────────────────────────────────────────────────────────────

export function useSegments(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { items, total, filterType, selectedSegment, previewContacts, loading, error, fetchedAt, workspaceId: cachedWsId } = useAppSelector((state) => state.segments);

  const doFetch = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchSegments(workspaceId));
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (!workspaceId || loading) return;
    if (workspaceId !== cachedWsId || isStale(fetchedAt, TTL_DEFAULT)) doFetch();
  }, [dispatch, workspaceId, cachedWsId, fetchedAt, loading, doFetch]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_DEFAULT)) doFetch(); });

  const filtered = filterType === 'all' ? items : items.filter((s) => s.type === filterType);

  const selectSegment = async (segment: Segment) => {
    dispatch(setSelectedSegment(segment));
    if (segment.status === 'ready' && workspaceId) {
      dispatch(fetchSegmentPreview({ workspaceId, segmentId: segment.id }));
    }
  };

  const patch = (update: Partial<Segment> & { id: string }) => dispatch(patchSegment(update));
  const add = (segment: Segment) => dispatch(addSegment(segment));
  const remove = (id: string) => dispatch(removeSegment(id));
  const clearSelected = () => dispatch(setSelectedSegment(null));
  const changeFilterType = (t: 'all' | 'static' | 'dynamic') => dispatch(setFilterType(t));
  const changePreviewContacts = (contacts: { id: string; email: string; firstName: string; lastName: string; lifecycleStage: string }[], delta: number) =>
    dispatch(updatePreviewContacts({ contacts, delta }));

  return {
    segments: items, filtered, total, filterType,
    selectedSegment, previewContacts, loading, error,
    selectSegment, patch, add, remove, clearSelected,
    changeFilterType, changePreviewContacts, refetch: doFetch,
  };
}

// ─── Workflows ───────────────────────────────────────────────────────────────

export function useWorkflows(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const { items, total, loading, error, fetchedAt, workspaceId: cachedWsId } = useAppSelector((state) => state.workflows);

  const doFetch = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchWorkflows(workspaceId));
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (!workspaceId || loading) return;
    if (workspaceId !== cachedWsId || isStale(fetchedAt, TTL_DEFAULT)) doFetch();
  }, [dispatch, workspaceId, cachedWsId, fetchedAt, loading, doFetch]);

  useFocusRefetch(() => { if (isStale(fetchedAt, TTL_DEFAULT)) doFetch(); });

  const patch = (update: Partial<Workflow> & { id: string }) => dispatch(patchWorkflow(update));
  const add = (workflow: Workflow) => dispatch(addWorkflow(workflow));
  const remove = (id: string) => dispatch(removeWorkflow(id));

  const handlePublish = async (w: Workflow) => {
    try {
      const res = await workflowsService.publish(workspaceId!, w.id);
      patch({ ...apiToWorkflow(res.workflow), id: w.id });
    } catch (err) { console.error('Failed to publish:', err); }
  };

  const handlePause = async (w: Workflow) => {
    patch({ id: w.id, status: 'paused' });
    try {
      const res = await workflowsService.pause(workspaceId!, w.id);
      patch({ ...apiToWorkflow(res.workflow), id: w.id });
    } catch (err) {
      patch({ id: w.id, status: w.status });
      console.error('Failed to pause:', err);
    }
  };

  const handleResume = async (w: Workflow) => {
    try {
      const res = await workflowsService.resume(workspaceId!, w.id);
      patch({ ...apiToWorkflow(res.workflow), id: w.id });
    } catch (err) { console.error('Failed to resume:', err); }
  };

  const handleDelete = async (w: Workflow) => {
    if (!window.confirm(`Archive "${w.name}"?`)) return;
    try {
      await workflowsService.delete(workspaceId!, w.id);
      remove(w.id);
    } catch (err) { console.error('Failed to delete:', err); }
  };

  return { workflows: items, total, loading, error, patch, add, remove, refetch: doFetch, handlePublish, handlePause, handleResume, handleDelete };
}

// ─── Transactional ───────────────────────────────────────────────────────────

export function useTransactional(workspaceId: string | null) {
  const dispatch = useAppDispatch();
  const {
    sends, sendsTotal, sendsFilters, sendsLoading, sendsFetchedAt,
    templates, templatesTotal, templatesFilters, templatesLoading, templatesFetchedAt,
  } = useAppSelector((state) => state.transactional);

  const doFetchSends = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchSends({ workspaceId, filters: sendsFilters }));
  }, [dispatch, workspaceId, sendsFilters]);

  const doFetchTemplates = useCallback(() => {
    if (!workspaceId) return;
    dispatch(fetchTemplates({ workspaceId, filters: templatesFilters }));
  }, [dispatch, workspaceId, templatesFilters]);

  // sends: TTL 15s
  useEffect(() => {
    if (!workspaceId || sendsLoading) return;
    if (isStale(sendsFetchedAt, TTL_SENDS)) doFetchSends();
  }, [workspaceId, sendsFilters, sendsFetchedAt, sendsLoading, doFetchSends]);

  // templates: TTL 60s
  useEffect(() => {
    if (!workspaceId || templatesLoading) return;
    if (isStale(templatesFetchedAt, TTL_DEFAULT)) doFetchTemplates();
  }, [workspaceId, templatesFilters, templatesFetchedAt, templatesLoading, doFetchTemplates]);

  // auto-refresh sends every 15s while any are queued/sending
  useEffect(() => {
    if (!workspaceId) return;
    const hasPending = sends.some((s) => s.status === 'queued' || s.status === 'sending');
    if (!hasPending) return;
    const id = setInterval(doFetchSends, TTL_SENDS); // 30s
    return () => clearInterval(id);
  }, [workspaceId, sends, doFetchSends]);

  // refetch on focus
  useFocusRefetch(() => {
    if (isStale(sendsFetchedAt, TTL_SENDS)) doFetchSends();
    if (isStale(templatesFetchedAt, TTL_DEFAULT)) doFetchTemplates();
  });

  const updateSendsFilters = (f: Parameters<typeof setSendsFilters>[0]) => dispatch(setSendsFilters(f));
  const updateTemplatesFilters = (f: Parameters<typeof setTemplatesFilters>[0]) => dispatch(setTemplatesFilters(f));

  const handlePublishTemplate = async (t: LocalEmailTemplate) => {
    try {
      await transactionalService.updateTemplate(workspaceId!, t.id, { publish: true });
      dispatch(patchTemplate({ id: t.id, status: 'published' }));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTemplate = async (t: LocalEmailTemplate) => {
    if (!window.confirm(`Archive template "${t.name}"?`)) return;
    try {
      await transactionalService.deleteTemplate(workspaceId!, t.id);
      dispatch(removeTemplate(t.id));
    } catch (err) { console.error(err); }
  };

  return {
    sends, sendsTotal, sendsFilters, sendsLoading,
    templates, templatesTotal, templatesFilters, templatesLoading,
    updateSendsFilters, updateTemplatesFilters,
    refetchSends: doFetchSends, refetchTemplates: doFetchTemplates,
    handlePublishTemplate, handleDeleteTemplate,
  };
}
