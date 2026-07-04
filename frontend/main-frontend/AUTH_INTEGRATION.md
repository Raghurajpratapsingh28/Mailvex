# Mailvex Frontend Authentication Integration

Enterprise-grade authentication system integrated with Mailvex API backend.

## 🎯 Features Implemented

### Core Authentication
- ✅ **Signup** - User registration with workspace creation
- ✅ **Login** - Email/password authentication with account lockout protection
- ✅ **Logout** - Single session logout with immediate token revocation
- ✅ **Logout All** - Revoke all active sessions across devices
- ✅ **Automatic Token Refresh** - Background refresh 5 minutes before expiry
- ✅ **Token Rotation** - Secure refresh token rotation with grace window

### Password Management
- ✅ **Forgot Password** - Request password reset email
- ✅ **Reset Password** - Reset password with token from email
- ✅ **Password Validation** - Enforces 12+ chars, uppercase, lowercase, digit, special character

### Email Verification
- ✅ **Email Verification** - Verify email with token from email
- ✅ **Resend Verification** - Request new verification email

### Session Management
- ✅ **Active Sessions List** - View all active sessions with device info
- ✅ **Revoke Session** - Logout specific device/session
- ✅ **Session Details** - IP address, user agent, creation time, expiry

### Workspace Invites
- ✅ **Accept Invite** - Join workspace via invite link
- ✅ **New User Flow** - Create account when accepting invite
- ✅ **Existing User Flow** - Add to workspace if already signed in

### Security Features
- ✅ **Protected Routes** - Automatic redirect to signin for unauthenticated users
- ✅ **Token Storage** - Access token in memory, refresh token in localStorage
- ✅ **Error Handling** - Comprehensive error messages for all auth failures
- ✅ **Loading States** - User feedback during async operations

## 📁 File Structure

```
main-frontend/
├── .env.local                          # Environment configuration
├── app/
│   ├── layout.tsx                      # Root layout with AuthProvider
│   ├── signin/page.tsx                 # Sign in page
│   ├── signup/page.tsx                 # Sign up page
│   ├── forgot-password/page.tsx        # Password reset request
│   ├── reset-password/page.tsx         # Password reset with token
│   ├── verify-email/page.tsx           # Email verification
│   └── accept-invite/page.tsx          # Workspace invite acceptance
├── components/
│   ├── signin-view.tsx                 # Sign in form component
│   ├── signup-view.tsx                 # Sign up form component
│   ├── protected-route.tsx             # Route protection wrapper
│   └── account/
│       └── security-tab.tsx            # Session management UI
└── lib/
    ├── api-client.ts                   # HTTP client with interceptors
    ├── auth-service.ts                 # Auth API endpoints
    ├── auth-context.tsx                # Global auth state & auto-refresh
    └── token-manager.ts                # Token storage utilities
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

For production, update to your API URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.Mailvex.com/api/v1
```

## 🚀 Usage

### Authentication Context

The `AuthProvider` wraps the entire app and provides:

```typescript
const {
  user,              // Current user object or null
  isLoading,         // Loading state during auth check
  isAuthenticated,   // Boolean auth status
  login,             // Login function
  signup,            // Signup function
  logout,            // Logout function
  refreshUser,       // Refresh user data
} = useAuth()
```

### Example: Using Auth in Components

```typescript
"use client"

import { useAuth } from "@/lib/auth-context"

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Protected Routes

Routes are automatically protected. Unauthenticated users are redirected to `/signin`.

Public routes (no auth required):
- `/signin`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/accept-invite`

## 🔐 Security Features

### Token Management

**Access Token:**
- Stored in memory only (never localStorage)
- 15-minute lifetime
- Automatically refreshed 5 minutes before expiry
- Immediately revoked on logout

**Refresh Token:**
- Stored in localStorage (simulating httpOnly cookie)
- 30-day lifetime
- Rotated on each use
- 30-second grace window for concurrent requests

### Password Requirements

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

### Account Lockout

After 10 failed login attempts within 15 minutes:
- Account locked for 15 minutes
- Counter resets after quiet period

## 📡 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Create account |
| `/auth/login` | POST | Sign in |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Logout current session |
| `/auth/logout-all` | POST | Logout all sessions |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password` | POST | Reset password with token |
| `/auth/verify-email` | POST | Verify email with token |
| `/auth/resend-verification` | POST | Resend verification email |
| `/auth/me` | GET | Get current user |
| `/auth/sessions` | GET | List active sessions |
| `/auth/sessions/:id` | DELETE | Revoke specific session |
| `/auth/invites` | POST | Create workspace invite |
| `/auth/accept-invite` | POST | Accept workspace invite |

## 🎨 UI Components

### Sign In Form
- Email and password fields
- Show/hide password toggle
- Forgot password link
- Loading state during submission
- Error handling with user-friendly messages

### Sign Up Form
- First name, last name, email, workspace name, password
- Real-time password validation
- Visual password strength indicators
- Error messages for validation failures

### Session Management
- List of active sessions with device icons
- Current session highlighted
- Revoke individual sessions
- Logout all devices with confirmation

## 🔄 Auto-Refresh Flow

```
1. User logs in → Access token (15min) + Refresh token (30d)
2. Token stored → Access in memory, Refresh in localStorage
3. Schedule refresh → 10 minutes after login (5min before expiry)
4. Auto-refresh → Background refresh with new token pair
5. Update schedule → Repeat for new token
6. On failure → Logout user, redirect to signin
```

## 🐛 Error Handling

All API errors are caught and displayed to users:

- `EMAIL_TAKEN` → "Email already registered"
- `INVALID_CREDENTIALS` → "Invalid email or password"
- `ACCOUNT_LOCKED` → "Account locked due to too many failed attempts"
- `ACCOUNT_DISABLED` → "Account has been disabled"
- `TOKEN_INVALID` → "Invalid or expired token"
- `TOKEN_REUSE` → "Security violation detected, all sessions revoked"

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign in with wrong password (test lockout after 10 attempts)
- [ ] Forgot password flow
- [ ] Reset password with email token
- [ ] Email verification with token
- [ ] View active sessions
- [ ] Revoke individual session
- [ ] Logout all devices
- [ ] Accept workspace invite (new user)
- [ ] Accept workspace invite (existing user)
- [ ] Auto-refresh (wait 10+ minutes while logged in)
- [ ] Protected route redirect when not authenticated

## 📝 Notes

### Token Storage Strategy

For production, consider:
1. **HttpOnly Cookies** - Most secure, requires backend cookie handling
2. **Secure + SameSite Cookies** - Good balance of security and convenience
3. **Current (localStorage)** - Acceptable for demo, vulnerable to XSS

### Future Enhancements

- [ ] 2FA/MFA support
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Remember me functionality
- [ ] Biometric authentication
- [ ] Device fingerprinting
- [ ] Suspicious activity alerts
- [ ] Password change API integration
- [ ] Email change with verification

## 🤝 Integration with Backend

Ensure your backend API (`Mailvex-api`) is running and accessible at the URL specified in `.env.local`.

The frontend expects responses matching the schemas defined in `lib/auth-service.ts`.

## 📚 Related Documentation

- [Backend Auth Docs](../Mailvex-api/docs/auth/README.md)
- [Auth Flows](../Mailvex-api/docs/auth/flows.md)
- [API Reference](../Mailvex-api/docs/api/auth.md)
- [RBAC](../Mailvex-api/docs/auth/rbac.md)
- [Sessions](../Mailvex-api/docs/auth/sessions.md)

---

**Built with:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
