# ChatApp — Progress Notes

## Status as of now
Phases 1, 2, and 3 (full PRD roadmap) are functionally complete. Currently in polish/cleanup territory.

## Phase 1 — Complete
- Project scaffolded: src/types, src/services, src/screens, __tests__
- Jest + jest-expo test harness working; TDD used throughout for all service functions
- Firebase project (LilSonguChatApp): Phone Auth (test number +1 907-837-4571 / code 123456), Firestore (test mode, eur3), SMS region policy set to Allow US
- src/services/firebase.ts — initializes app, exports `auth` and `db`, sets browserLocalPersistence
- src/services/auth.ts — sendVerificationCode, confirmVerificationCode
- src/services/conversations.ts — sortConversationsByRecent, formatTimestamp, subscribeToConversations, findOrCreateConversation, createGroupConversation
- src/services/messages.ts — sendMessage (also updates parent conversation's lastMessageText/lastMessageAt), subscribeToMessages
- src/services/users.ts — createUserIfNotExists, getUser, getUserByPhoneNumber, setUserOnlineStatus
- src/screens/LoginScreen.tsx — full phone auth flow w/ reCAPTCHA; calls createUserIfNotExists on success
- src/screens/ChatListScreen.tsx — real-time conversation list, resolves display names, shows online status (🟢) and group indicator (👥), "New Chat" button
- src/screens/ChatRoomScreen.tsx — real-time messaging, sender names shown for non-mine messages, header shows contact/group name
- src/screens/NewChatScreen.tsx — supports both direct (find-or-create) and group chat creation
- App.tsx — onAuthStateChanged drives initial route (Login vs ChatList) for persistent login; also sets user online on login
- All screens consolidated under src/screens/ (no more root-level screens/ folder)

## Phase 2 — Complete
- Group conversations (3+ participants) via createGroupConversation
- NewChatScreen has Direct/Group mode toggle; group mode uses comma-separated phone number input (rough UX, functional)
- Sender names shown in group message bubbles
- ChatListScreen visually distinguishes group (👥) vs direct chats

## Phase 3 — Complete, with known caveat
- setUserOnlineStatus(userId, isOnline) writes isOnline/lastSeen to Firestore
- App.tsx marks user online on login; attempts offline via window `beforeunload` event
- KNOWN LIMITATION: beforeunload is unreliable (browser-dependent, doesn't always fire, web-only anyway). A more robust fix would use Firebase Realtime Database's onDisconnect() — NOT yet implemented. Estimated 3-5 hours if tackled.
- ChatListScreen shows 🟢 next to online direct-chat contacts (one-time fetch on load, not live-updating while list is open)

## Known cleanup / tech debt
- Firestore has some duplicate test "group" conversations (named "respect") created during debugging — not fully cleaned up
- The original manually-seeded direct conversation was accidentally deleted during cleanup — not a problem, was just test data
- Comma-separated phone number input for groups is a rough first-pass UX, not a polished "add participant" flow
- No avatars / profile pictures anywhere (out of scope so far)

## Not started / explicit stretch goals
- onDisconnect()-based presence (Realtime Database) for reliable offline detection
- Live-updating online status while ChatListScreen is open (currently one-time fetch)
- Anything from PRD's "Explicitly Out of Scope": voice notes, read receipts, e2e encryption, message editing/deletion

## Approach reminders
- TDD: full red-green-refactor for pure logic; mocked Firestore/Auth for service functions; manual verification for UI/screens
- One step at a time, explain the "why", type code rather than paste when learning something new
- When edits seem to "not take effect," suspect a stale Fast Refresh state — full server restart (Ctrl+C, npx expo start --web) + hard browser refresh (Ctrl+Shift+R) often resolves it
- Prefer testing in a normal (non-Incognito) browser window if persistent login/session behavior matters; Incognito is useful for isolating browser-extension interference but always logs out on tab close
