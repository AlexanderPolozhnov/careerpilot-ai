# Task: Secure Account Deletion Implementation

## Context
Currently, the "Danger Zone" in the settings page only has a mock confirmation toggle. To comply with security best practices and "Right to be Forgotten" (GDPR-like), we need a robust account deletion flow that prevents accidental or unauthorized deletion.

## Analysis
- **Security:** Account deletion is a sensitive operation. It must require re-authentication (password check).
- **Data Integrity:** We use `ON DELETE CASCADE` in the database, so deleting a `User` record automatically cleans up all associated data (vacancies, applications, profiles, etc.).
- **User Experience:** A multi-step confirmation modal with high friction (typing "DELETE" or re-entering email) is preferred over a simple button.

## Proposed Solution

### Backend
1. **Endpoint:** `DELETE /api/users/me`
2. **Request DTO:** `AccountDeletionRequest`
    - `password`: String (required if user has password)
    - `confirmation`: String (e.g., must match user's email or "DELETE")
3. **Service Logic (`AuthServiceImpl`):**
    - Resolve current user.
    - If `user.passwordHash != null`, verify the provided password.
    - If `user.passwordHash == null` (OAuth2 user), skip password check but strictly verify the confirmation string.
    - Delete the `UserEntity`.
    - Log the action in Audit Logs.
4. **Security:** Ensure the endpoint is protected by JWT.

### Frontend
1. **Modal:** Create a `DeleteAccountModal` component (or use `ConfirmModal` extension).
2. **Form Fields:**
    - Password input (if user has password).
    - Confirmation input ("Type your email to confirm").
3. **Integration:**
    - Update `SettingsPage.tsx` to trigger this modal.
    - Call `authService.deleteAccount()`.
    - On success: Clear tokens, show success toast, and redirect to Landing Page.

## Implementation Steps

### Phase 1: Backend
1. [ ] Create `AccountDeletionRequest` DTO in `com.alexanderpolozhnov.careerpilot.auth.request`.
2. [ ] Add `deleteAccount` method to `AuthService` interface and implement it in `AuthServiceImpl`.
3. [ ] Add `DELETE /api/users/me` to `AuthController` (protected and auditable).
4. [ ] Verify `CASCADE` behavior with a unit/integration test.

### Phase 2: Frontend
1. [ ] Add `deleteAccount` method to `auth.service.ts`.
2. [ ] Update `i18n` with deletion strings (ru/en).
3. [ ] Implement the `DeleteAccountModal` or enhance `ConfirmModal` in `SettingsPage.tsx`.
4. [ ] Connect the delete mutation and handle post-deletion cleanup (logout/redirect).

## Verification Plan
1. **Manual:**
    - Create a test user with some data (vacancies, etc.).
    - Attempt deletion with WRONG password -> should fail.
    - Attempt deletion with CORRECT password -> user and all data should be gone.
    - Test OAuth2 user deletion (no password).
2. **Automated:**
    - Add unit test in `AuthServiceImplTest` for deletion logic.
