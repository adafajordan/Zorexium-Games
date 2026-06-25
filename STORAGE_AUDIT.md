# Storage Architecture Audit — Zorexium / Neter

> **This document is an audit of the current client-side persistence architecture, not a completed migration.**
> Its purpose is to identify every piece of data stored only in the browser and determine what must be moved to a Postgres-backed server before the app is production-ready.

---

## 1. Summary of Current Storage Architecture

The entire app is a **static HTML + JS frontend** (no backend server). There are no API calls to a server in any file. All data created by users — accounts, posts, media, comments, notifications, articles, marketplace listings, and event attendance — is saved **only in the user's browser** using two browser APIs:

| API | Purpose in this app |
|-----|---------------------|
| **IndexedDB** (`zorexium-app-db`, v4) | Primary data store for all core product entities |
| **`localStorage`** | Marketplace listings and event attendance |
| **`window.name`** | Tab-level session token (userId) |

The app uses **no third-party storage wrapper** (no `idb`, `Dexie`, etc.). All IndexedDB access is through a hand-rolled promise helper defined in `app.js` (`openAppDb`, `getRecord`, `putRecord`, `getAllRecords`, `deleteRecord`). The same helper is copy-pasted inline in `marketplace.html` and `articles.html`.

---

## 2. IndexedDB — `zorexium-app-db` (Version 4)

**Defined in:** `app.js` lines 2–10, 305–340; duplicated in `marketplace.html` lines 2430–2480 and `articles.html` lines 1130–1192; also `index.html` lines 2641–2651.

### Object Store: `accounts`

**Files that read/write:** `app.js` (primary), `marketplace.html`, `articles.html`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Generated client-side with `generateId('user')` |
| `name` | string | Display name |
| `username` | string | Handle |
| `usernameKey` | string | Lowercase normalized handle for lookups |
| `email` | string | Stored as plain text |
| `profileBio` | string | Optional bio |
| `profileEmail` | string | Optional contact email |
| `profileBirthday` | string | Optional birthday |
| `profileFollowers` | number | Static counter only, not a relational list |
| `profileFollowing` | number | Static counter only, not a relational list |
| `passwordSalt` | string (hex) | PBKDF2 salt generated client-side |
| `passwordVerifier` | string (hex) | PBKDF2 derived key (256-bit, SHA-256, 100k iterations) |
| `savedPostIds` | string[] | Post IDs the user saved/bookmarked |
| `repostedPostIds` | string[] | Post IDs the user reposted |
| `createdAt` | number | Unix ms timestamp |

**Classification: MUST MIGRATE TO POSTGRES**  
This is the core user/auth entity. Storing accounts only in the browser means a user who clears browser data loses their account permanently. Multi-device access is impossible.

---

### Object Store: `session`

**Files that read/write:** `app.js`, `marketplace.html`, `articles.html`, `index.html`

| Field | Type | Notes |
|-------|------|-------|
| `key` | string | Always `'current'` |
| `userId` | string | References an `accounts` record |

Additionally, `window.name` is set to `zorexium-session:<json>` on login (`app.js` lines 383–401). This provides tab-level session continuity but is cleared when the tab is closed.

**Classification: MUST MIGRATE TO POSTGRES (server-issued auth tokens)**  
The session should become a server-issued JWT or httpOnly cookie. The `window.name` trick is a workaround for cross-page auth in a single-page-less multi-HTML app.

---

### Object Store: `posts`

**Files that read/write:** `app.js`, `marketplace.html`, `articles.html`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `generateId('post')` |
| `userId` | string | Foreign key → `accounts` |
| `text` | string | Post body |
| `imageMediaIds` | string[] | References `media` store |
| `videoMediaId` | string \| null | References `media` store |
| `gifUrl` | string | External GIF URL |
| `poll` | object \| null | Poll options if applicable |
| `scheduledAt` | number \| null | Future publish timestamp |
| `createdAt` | number | Unix ms |
| `type` | string | `'job'` or `'event'` for marketplace posts |
| `listingId` | string | References `zorexium-marketplace-listings` localStorage |
| `listingTitle` | string | Denormalized listing data |
| `listingSummary`, `listingDetails`, `listingMeta` | string | Denormalized |
| `listingPay`, `listingLocation`, `listingDateTime` | string | Denormalized |
| `isRepost` | boolean | Repost flag |
| `repostOfPostId` | string | Original post ID |
| `isStaticMirror` | boolean | Mirror of a hardcoded/static post |

**Classification: MUST MIGRATE TO POSTGRES**  
Posts are the primary feed content. They only exist on the device that created them.

---

### Object Store: `media`

**Files that read/write:** `app.js`, `marketplace.html`, `articles.html`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `generateId('media')` |
| `data` | ArrayBuffer / Blob / base64 | **Raw binary file data** |
| `type` | string | MIME type |
| `name` | string | Original file name |
| `size` | number | File size in bytes |
| `createdAt` | number | Unix ms |

**Classification: MUST MIGRATE — use object storage (S3-compatible), not Postgres columns**  
Images and video data are stored as raw binaries inside IndexedDB. This will hit browser storage quotas (the app already handles `QuotaExceededError`, `app.js` line 2022). In production, files should be uploaded to cloud object storage (S3, Cloudflare R2, etc.) and the URL stored in the Postgres `media` table.

---

### Object Store: `comments`

**Files that read/write:** `app.js`, `articles.html`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `generateId('comment')` |
| `postId` | string | Foreign key → `posts` |
| `userId` | string | Foreign key → `accounts` |
| `text` | string | Comment body |
| `createdAt` | number | Unix ms |

**Classification: MUST MIGRATE TO POSTGRES**

---

### Object Store: `notifications`

**Files that read/write:** `app.js`, `articles.html`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `generateId('notification')` |
| `userId` | string | Recipient |
| `type` | string | `'like'`, `'save'`, `'repost'`, `'comment'`, `'mention'`, `'follow'` |
| `postId` | string | Related post |
| `message` | string | Human-readable text |
| `createdAt` | number | Unix ms |

**Classification: MUST MIGRATE TO POSTGRES**  
Notifications generated by other users' actions (likes, comments, reposts, mentions) currently only exist in the recipient's local browser — meaning notifications are never actually delivered to the real user.

---

### Object Store: `articles`

**Files that read/write:** `articles.html`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `userId` | string | Author |
| `title` | string | |
| `body` | string (HTML/rich text) | Full article body |
| `coverMediaId` | string \| null | References `media` store |
| `status` | string | `'published'` or `'draft'` |
| `replyAudience` | string | `'everyone'` or other |
| `createdAt` | number | |
| `publishedAt` | number \| null | |

**Classification: MUST MIGRATE TO POSTGRES**  
Articles are long-form content authored by users. A published article stored only in the author's browser is invisible to all other users.

---

## 3. localStorage

**All files:** `app.js`, `marketplace.html`

### Key: `zorexium-marketplace-listings`

**Files:** `app.js` (lines 1310–1320), `marketplace.html` (lines 2439, 2552–2765)

Stores a JSON array of listing objects. Each listing represents a published job posting or event:

| Field | Notes |
|-------|-------|
| `id` | Listing ID |
| `type` | `'job'` or `'event'` |
| `title`, `summary`, `details` | Content |
| `pay`, `location` | Job-specific |
| `dateTime`, `eventStart` | Event-specific |
| `meta` | Extra metadata |
| `userId` | Creator |
| `coverImage` | Optional image (inline or URL) |
| `createdAt` | Unix ms |

Expired event listings are automatically purged 2 hours after `eventStart` (`marketplace.html` lines 2635–2649).

**Classification: MUST MIGRATE TO POSTGRES**  
Job postings and events are publicly visible listings. They should be visible to all users across devices, not just on the publisher's browser.

---

### Key: `zorexium-event-attendance`

**Files:** `app.js` (line 1320), `marketplace.html` (lines 2587–2686)

Stores a nested JSON object: `{ [userId]: { [eventId]: { status, updatedAt, listingId } } }`

Status is either `'interested'` or `'going'`.

**Classification: MUST MIGRATE TO POSTGRES**  
RSVPs/attendance should be server-stored so event organizers can see attendee counts and users can access their RSVPs on any device.

---

### Key: `zorexium-article-draft`

**Files:** `articles.html` (lines 1912, 1928, 1956)

Stores the in-progress draft `{ title, body, ... }` while the user is typing in the article editor. It is cleared when the article is published or explicitly discarded.

**Classification: CAN REMAIN LOCAL (with a server draft as backup)**  
This is a temporary UI autosave. In production, the canonical draft should be in the `articles` table with `status: 'draft'`. The localStorage copy is an acceptable local autosave fallback.

---

## 4. Likes — Not Persisted At All

`app.js` lines 2114–2135: Like behavior is **purely UI state**. Clicking Like increments a DOM counter (`data-count`) and stores `data-liked="true"` on the button element. **Nothing is written to IndexedDB or localStorage.** Like counts and liked state are lost on every page refresh.

**Classification: MUST ADD TO POSTGRES** — likes need a `post_likes` join table: `(user_id, post_id, created_at)`.

---

## 5. Follows — Only Counters, No Relationship

`profileFollowers` and `profileFollowing` are plain integers on the `accounts` record. There is no follow relationship table or list. Following another user is not implemented.

**Classification: MUST ADD TO POSTGRES** — needs a `user_follows` join table: `(follower_id, following_id, created_at)`.

---

## 6. Missing Features (No Backend = Not Functional in Multi-User Context)

The following features appear in the UI but cannot work correctly without server persistence:

| Feature | Why it Fails Without a Backend |
|---------|-------------------------------|
| **Notifications** | Generated locally — other users never see actions taken on their posts |
| **Post feed** | Users only see their own posts; posts from other users only exist as hardcoded static seed data |
| **Comments** | Stored locally — other users can't see comments |
| **Reposts** | Cross-user reposts are impossible; only self-reposts work |
| **Job/Event listings** | Only visible on the publisher's device |
| **Event RSVP counts** | Each user only counts their own RSVPs |
| **Follows/Followers** | No mechanism to follow other users |
| **Likes** | Not persisted at all; count resets on reload |
| **Articles** | Published only locally; invisible to all other readers |
| **Messages** | No messaging system exists in the codebase |
| **Search** | No server-side search |

---

## 7. Recommended Postgres Schema (Migration Targets)

```sql
-- Auth / Users
users (id, name, username, email_hash, password_salt, password_verifier, profile_bio, profile_email, profile_birthday, created_at)
sessions (id, user_id, token_hash, created_at, expires_at)

-- Social graph
user_follows (follower_id, following_id, created_at)

-- Content
posts (id, user_id, text, gif_url, scheduled_at, created_at, type, listing_id, is_repost, repost_of_post_id)
post_media (id, post_id, storage_url, mime_type, file_name, file_size, created_at)
comments (id, post_id, user_id, text, created_at)
post_likes (id, post_id, user_id, created_at)
post_reposts (id, post_id, user_id, created_at)
post_saves (id, post_id, user_id, created_at)

-- Articles
articles (id, user_id, title, body, cover_media_id, status, reply_audience, created_at, published_at)

-- Marketplace
listings (id, user_id, type, title, summary, details, pay, location, date_time, event_start, cover_url, created_at, deleted_at)
event_attendance (id, listing_id, user_id, status, updated_at)

-- Notifications
notifications (id, user_id, type, source_user_id, post_id, message, read_at, created_at)

-- Media (metadata only; binary files go to object storage)
media (id, user_id, storage_url, mime_type, file_name, file_size, created_at)
```

---

## 8. Recommended Migration Order

| Priority | Entity | Reason |
|----------|--------|--------|
| 1 | **Users / Auth** | Everything else depends on real user IDs; swap PBKDF2 in-browser password check for server-side bcrypt/argon2 |
| 2 | **Sessions** | Issue JWTs or httpOnly session cookies from the server; remove `window.name` trick |
| 3 | **Media / File uploads** | Move file binaries out of IndexedDB to S3/R2; store URLs in Postgres |
| 4 | **Posts** | Core feed content; connect to real user IDs |
| 5 | **Likes** | Simple join table; high user-visible impact |
| 6 | **Comments** | Feed engagement |
| 7 | **Notifications** | Needed for cross-user interactions to work |
| 8 | **Articles** | Long-form content; depends on media migration |
| 9 | **Marketplace listings** | Move from localStorage to Postgres; connect to user accounts |
| 10 | **Event attendance (RSVPs)** | Depends on listings migration |
| 11 | **Follows / Followers** | Social graph; enables feed personalization |
| 12 | **Reposts / Saves** | Refactor from arrays on user record to join tables |

---

## 9. Major Risks and Blockers

### 9.1 No backend server exists
There is no `server.js`, no Express/Fastify/etc., no database ORM, and no API routes. The entire app is a static file server (`serve` package). **Building a backend is the prerequisite for all migration work.**

### 9.2 Client-side password hashing
Passwords are hashed using PBKDF2 in the browser. The `passwordVerifier` stored in IndexedDB is the actual credential check. When migrating to a real auth system, existing "passwords" are un-migratable — all users must reset their passwords. Consider using Argon2id/bcrypt on the server side.

### 9.3 Client-generated IDs
All IDs (`generateId('user')`, `generateId('post')`, etc.) are generated client-side. These are likely random strings. When migrating, you can map old IDs to new Postgres `uuid` primary keys, but all cross-references (e.g., `savedPostIds` on the user record) need updating.

### 9.4 Media binaries in IndexedDB
Binary file data stored in IndexedDB will hit browser storage quotas. In production this must move to object storage (AWS S3, Cloudflare R2, etc.). The `QuotaExceededError` handler in `app.js` confirms this is already a known risk.

### 9.5 Denormalized listing data on posts
Job/event listing fields (`listingTitle`, `listingPay`, etc.) are duplicated on each `posts` record. In Postgres this should be a foreign key (`listing_id`) with a join.

### 9.6 Likes are not persisted at all
Like counts and liked-by state are purely DOM state. There is no migration path for existing likes — they have never been stored anywhere. Starting fresh is the only option.

### 9.7 Followers/following counters without relationships
`profileFollowers` and `profileFollowing` are just numbers with no backing relationship records. The follow feature needs to be built from scratch.

### 9.8 Multi-HTML architecture (not SPA)
Each page (`index.html`, `marketplace.html`, `articles.html`, `account-dashboard.html`, etc.) embeds its own copy of the IndexedDB helper and constants. When migrating to API calls, all pages must be updated. Centralizing this into a shared API client module (e.g., `api.js`) will prevent drift.

### 9.9 No existing data to migrate for live users
Since data is browser-local, there is no server-side dataset to migrate. Each user's data lives only on their device. The migration path is: build the backend first, then the app writes to the server going forward. Existing browser data cannot be bulk-migrated without a client-side migration script.

---

## 10. What Can Remain Local-Only

| Data | Reason |
|------|--------|
| **Article draft autosave** (`zorexium-article-draft` in localStorage) | Temporary typing buffer; server draft is the canonical source |
| **Video player state** (play position, mute, fullscreen) | Pure UI preference |
| **Theme / dark mode preference** (not currently stored but natural extension) | UI only |
| **Onboarding/dismissed banner state** | UI only |

---

## 11. Files Requiring Changes for Backend Migration

| File | Scope of Change |
|------|----------------|
| `app.js` | Replace all IndexedDB read/write with `fetch()` API calls; replace session with JWT handling |
| `index.html` | Remove inline IndexedDB setup; use shared API client |
| `marketplace.html` | Replace localStorage listings/attendance with API calls |
| `articles.html` | Replace IndexedDB article/media stores with API calls; keep draft localStorage as autosave only |
| `account-dashboard.html` | All dashboard data loading moves to API calls |
| `notifications.html` | Load notifications from server |
| `newsroom.html` | Wire to API |
| `package.json` | Add a backend entry point and dependencies (Express/Fastify, pg/Prisma, bcrypt, jsonwebtoken, multer/S3 SDK) |
| *(new)* `server.js` / `api/` | Build REST or GraphQL API |
| *(new)* `db/migrations/` | Postgres schema migrations |

---

*Audit completed: 2026-06-25. This document should be updated as migration work progresses.*
