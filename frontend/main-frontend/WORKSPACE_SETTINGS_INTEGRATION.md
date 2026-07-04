# Workspace Settings Integration

## Overview
Integrated workspace settings API endpoints into the `/settings` page with real backend API calls.

## Files Created/Modified

### New Files
- `main-frontend /lib/workspace-service.ts` - Service layer for workspace API calls

### Modified Files
- `main-frontend /components/settings/settings-view.tsx` - Load real data from API
- `main-frontend /components/settings/general-tab.tsx` - Integrate settings update API
- `main-frontend /components/settings/members-tab.tsx` - Integrate members management API
- `main-frontend /components/settings/danger-zone-tab.tsx` - Integrate workspace activation API

## API Endpoints Integrated

### Workspace Settings
- `GET /workspaces/:workspaceId/settings` - Fetch workspace settings
- `PATCH /workspaces/:workspaceId/settings` - Update settings (timezone, locale, branding, email defaults, webhooks)

### Members Management
- `GET /workspaces/:workspaceId/members` - List workspace members with pagination/search/filter
- `PATCH /workspaces/:workspaceId/members/:memberId` - Update member role
- `DELETE /workspaces/:workspaceId/members/:memberId` - Remove member

### Workspace Management
- `POST /workspaces/:workspaceId/deactivate` - Deactivate workspace
- `POST /workspaces/:workspaceId/reactivate` - Reactivate workspace

## Features

### General Tab
- Update timezone and locale
- Configure branding (logo URL, primary color)
- Set email defaults (from name, from email, reply-to)
- Configure webhook settings (URL, secret, events)
- Real-time save with loading states

### Members Tab
- List all workspace members
- Search by email/name
- Filter by role (owner, admin, member, viewer)
- Update member roles
- Remove members
- Loading states for all operations

### Danger Zone Tab
- Deactivate workspace (blocks mutating operations)
- Reactivate workspace (restores functionality)
- Confirmation dialogs for destructive actions

## Implementation Details

### Authentication
- Uses `x-workspace-id` header for all workspace API calls
- Workspace ID retrieved from `user.workspaces[0].id` in auth context
- Bearer token automatically added by API client interceptor

### Error Handling
- Console logging for failed API calls
- User-friendly error states (to be enhanced with toast notifications)

### State Management
- Local state for form inputs
- Reload data after successful mutations via `onUpdate()` callback
- Loading states prevent duplicate requests

## Usage

The settings page automatically:
1. Loads workspace ID from authenticated user
2. Fetches settings and members on mount
3. Updates UI with real data
4. Saves changes to backend on user action
5. Reloads data after successful mutations

## Next Steps
- Add toast notifications for success/error feedback
- Implement invite member functionality
- Add workspace transfer ownership
- Handle workspace status banner based on actual status
- Add optimistic updates for better UX
