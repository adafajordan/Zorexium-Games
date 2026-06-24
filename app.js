(function () {
  const DB_NAME = 'zorexium-app-db';
  const DB_VERSION = 4; // v4: added ARTICLES_STORE
  const ACCOUNTS_STORE = 'accounts';
  const POSTS_STORE = 'posts';
  const SESSION_STORE = 'session';
  const MEDIA_STORE = 'media';
  const COMMENTS_STORE = 'comments';
  const NOTIFICATIONS_STORE = 'notifications';
  const ARTICLES_STORE = 'articles';
  const WINDOW_SESSION_PREFIX = 'zorexium-session:';
  const ACCOUNT_DASHBOARD_PATH = 'account-dashboard.html';
  const NOTIFICATIONS_PAGE_PATH = 'notifications.html';
  const MAX_IMAGE_COUNT = 10;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_VIDEO_DURATION_SECONDS = 10 * 60;
  const MIN_MEDIA_SCALE = 1;
  const MAX_MEDIA_SCALE = 4;
  const MEDIA_ZOOM_INCREMENT = 0.25;
  const MEDIA_WHEEL_THROTTLE_MS = 80;
  const FEED_TALL_IMAGE_RATIO = 1.9;
  const MEDIA_VIEWER_GESTURE_DEADZONE = 14;
  const MEDIA_VIEWER_SWIPE_THRESHOLD = 70;
  const MEDIA_VIEWER_DISMISS_THRESHOLD = 110;
  const DEFAULT_POST_VIDEO_VOLUME = 0.5;
  const VIDEO_ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  const VIDEO_ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  const VIDEO_ICON_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  const VIDEO_ICON_UNMUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  const VIDEO_ICON_EXIT_FULLSCREEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>';
  const VIDEO_FS_ICON_COMMENT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const VIDEO_FS_ICON_REPOST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  const VIDEO_FS_ICON_LIKE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const VIDEO_FS_ICON_SAVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  const VIDEO_ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
  const VIDEO_ICON_SETTINGS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  const VIDEO_ICON_CAPTIONS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><rect x="1" y="5" width="22" height="14" rx="2"/><path d="M7 10h2M11 10h2M7 14h4M13 14h2"/></svg>';
  const VIDEO_ICON_PLAY_CENTER = '<svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  const VIDEO_SEEK_MAX_VALUE = 1000;
  const PASSWORD_ITERATIONS = 600000;
  const PROFILE_NAME_MIN_LENGTH = 2;
  const EMAIL_ADDRESS_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
  const MENTION_PATTERN = /@([a-zA-Z0-9_]+)/g;
  const LEGACY_PROFILE_BIO_MESSAGE = 'Welcome back, user. Your posts, replies, articles, and media all update here automatically';
  const NPC_CHAR_LIMIT = 280;
  const NPC_MAX_IMAGES = 4;

  const authModal = document.getElementById('auth-modal');
  const authStatus = document.getElementById('auth-status');
  const authTitle = document.getElementById('auth-title');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authTabs = Array.from(document.querySelectorAll('.auth-tab'));
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  const postFeed = document.querySelector('.post-feed');
  const newPostForm = document.getElementById('new-post-form');
  const newPostStatus = document.getElementById('new-post-status');
  const headerProfileButton = document.getElementById('header-profile-btn');
  const headerNotificationsButton = document.getElementById('header-notifications-btn');
  const stickyFooterProfileButton = document.getElementById('sticky-footer-profile');
  const stickyFooterNotificationsButton = document.getElementById('sticky-footer-notifications');
  const stickyFooterMarketplaceButton = document.getElementById('sticky-footer-marketplace');
  const dashboardRoot = document.getElementById('account-dashboard-root');
  const profileBanner = document.getElementById('profile-banner');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileEditButton = document.getElementById('profile-edit-btn');
  const profileName = document.getElementById('profile-name');
  const profileHandle = document.getElementById('profile-handle');
  const profileBio = document.getElementById('profile-bio');
  const profileContactItem = document.getElementById('profile-contact-item');
  const profileContactLink = document.getElementById('profile-contact-link');
  const profileBirthdayItem = document.getElementById('profile-birthday-item');
  const profileBirthday = document.getElementById('profile-birthday');
  const profilePostTotal = document.getElementById('profile-post-total');
  const profileFollowersTotal = document.getElementById('profile-followers-total');
  const profileFollowingTotal = document.getElementById('profile-following-total');
  const profileEditModal = document.getElementById('profile-edit-modal');
  const profileEditCloseButton = document.getElementById('profile-edit-close');
  const profileEditCancelButton = document.getElementById('profile-edit-cancel');
  const profileEditForm = document.getElementById('profile-edit-form');
  const profileEditNameInput = document.getElementById('profile-edit-name');
  const profileEditBioInput = document.getElementById('profile-edit-bio');
  const profileEditStatus = document.getElementById('profile-edit-status');
  const profileTabSummary = document.getElementById('profile-tab-summary');
  const profileTabButtons = Array.from(document.querySelectorAll('.profile-tab'));
  const profileTabPanels = Array.from(document.querySelectorAll('.profile-tab-panel'));
  const mediaViewerModal = document.getElementById('media-viewer-modal');
  const mediaViewerContent = document.getElementById('media-viewer-content');
  const mediaViewerTitle = document.getElementById('media-viewer-title');
  const mediaViewerZoomInButton = document.getElementById('media-viewer-zoom-in');
  const mediaViewerZoomOutButton = document.getElementById('media-viewer-zoom-out');
  const mediaViewerFitButton = document.getElementById('media-viewer-fit');
  const mediaViewerFullscreenButton = document.getElementById('media-viewer-fullscreen');
  const mediaViewerCloseButton = document.getElementById('media-viewer-close');
  const mediaViewerPrevButton = document.getElementById('media-viewer-prev');
  const mediaViewerNextButton = document.getElementById('media-viewer-next');
  const mediaViewerPagination = document.getElementById('media-viewer-pagination');
  const notificationsList = document.getElementById('notifications-list');

  let currentUser = null;
  let appDbPromise = null;
  let generatedMediaUrls = [];
  let lastMediaWheelZoomAt = 0;
  let profileEditEscapeHandlerAttached = false;
  let activeDashboardTab = 'posts';
  let npcState = {
    images: [],
    videoFile: null,
    gifUrl: '',
    poll: null,
    scheduledAt: null,
    isUploading: false
  };
  let dashboardTabCollections = {
    posts: [],
    replies: [],
    articles: [],
    media: [],
    likes: [],
    saved: [],
    marketplace: []
  };
  let mediaViewerState = {
    scale: 1,
    items: [],
    index: 0,
    type: null,
    src: '',
    label: ''
  };
  let mediaViewerGestureState = {
    active: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    axis: ''
  };

  function requestToPromise(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error || new Error('IndexedDB request failed.'));
      };
    });
  }

  function normalizeProfileMetric(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.floor(numeric));
  }

  function normalizeProfileBio(value) {
    const bio = String(value || '').trim();
    return bio === LEGACY_PROFILE_BIO_MESSAGE ? '' : bio;
  }

  function transactionDone(transaction) {
    return new Promise(function (resolve, reject) {
      transaction.oncomplete = function () {
        resolve();
      };
      transaction.onerror = function () {
        reject(transaction.error || new Error('IndexedDB transaction failed.'));
      };
      transaction.onabort = function () {
        reject(transaction.error || new Error('IndexedDB transaction aborted.'));
      };
    });
  }

  function setProfileEditStatus(message, type) {
    if (!profileEditStatus) return;
    profileEditStatus.textContent = message || '';
    profileEditStatus.className = 'auth-status';
    if (type) {
      profileEditStatus.classList.add(type);
    }
  }

  function openProfileEditModal() {
    if (!profileEditModal || !profileEditForm || !profileEditNameInput || !profileEditBioInput || !currentUser) {
      return;
    }
    const savedBio = normalizeProfileBio(currentUser.profileBio);
    profileEditNameInput.value = String(currentUser.name || '').trim();
    profileEditNameInput.minLength = PROFILE_NAME_MIN_LENGTH;
    profileEditBioInput.value = savedBio;
    setProfileEditStatus('');
    profileEditModal.classList.add('open');
    profileEditModal.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(function () {
      profileEditNameInput.focus();
      profileEditNameInput.select();
    });
  }

  function closeProfileEditModal() {
    if (!profileEditModal) return;
    profileEditModal.classList.remove('open');
    profileEditModal.setAttribute('aria-hidden', 'true');
    setProfileEditStatus('');
  }

  function ensureCryptoSupport() {
    if (!window.crypto || typeof window.crypto.getRandomValues !== 'function' || !window.crypto.subtle || !window.TextEncoder) {
      throw new Error('Your browser does not support secure account storage.');
    }
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map(function (value) {
      return value.toString(16).padStart(2, '0');
    }).join('');
  }

  function hexToBytes(value) {
    const pairs = String(value || '').match(/.{1,2}/g) || [];
    return new Uint8Array(pairs.map(function (pair) {
      return parseInt(pair, 16);
    }));
  }

  function secureRandomHex(byteLength) {
    ensureCryptoSupport();
    const bytes = new Uint8Array(byteLength);
    window.crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }

  function generateId(prefix) {
    ensureCryptoSupport();
    if (typeof window.crypto.randomUUID === 'function') {
      return prefix + '-' + window.crypto.randomUUID();
    }
    return prefix + '-' + secureRandomHex(16);
  }

  async function derivePasswordVerifier(secret, salt) {
    ensureCryptoSupport();
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: hexToBytes(salt),
        iterations: PASSWORD_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      256
    );
    return bytesToHex(new Uint8Array(derivedBits));
  }

  function openAppDb() {
    if (appDbPromise) return appDbPromise;
    appDbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not available in this browser.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        const database = request.result;
        if (!database.objectStoreNames.contains(ACCOUNTS_STORE)) {
          database.createObjectStore(ACCOUNTS_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(POSTS_STORE)) {
          database.createObjectStore(POSTS_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(SESSION_STORE)) {
          database.createObjectStore(SESSION_STORE, { keyPath: 'key' });
        }
        if (!database.objectStoreNames.contains(MEDIA_STORE)) {
          database.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(COMMENTS_STORE)) {
          database.createObjectStore(COMMENTS_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
          database.createObjectStore(NOTIFICATIONS_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(ARTICLES_STORE)) {
          database.createObjectStore(ARTICLES_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error || new Error('Failed to open app database.'));
      };
    });
    return appDbPromise;
  }

  async function getAllRecords(storeName) {
    const database = await openAppDb();
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const records = await requestToPromise(store.getAll());
    await transactionDone(transaction);
    return records;
  }

  async function getRecord(storeName, key) {
    const database = await openAppDb();
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const record = await requestToPromise(store.get(key));
    await transactionDone(transaction);
    return record || null;
  }

  async function putRecord(storeName, record) {
    const database = await openAppDb();
    const transaction = database.transaction(storeName, 'readwrite');
    const request = transaction.objectStore(storeName).put(record);
    await requestToPromise(request);
    await transactionDone(transaction);
  }

  async function deleteRecord(storeName, key) {
    const database = await openAppDb();
    const transaction = database.transaction(storeName, 'readwrite');
    const request = transaction.objectStore(storeName).delete(key);
    await requestToPromise(request);
    await transactionDone(transaction);
  }

  function getWindowSession() {
    if (!window.name || window.name.indexOf(WINDOW_SESSION_PREFIX) !== 0) {
      return null;
    }
    try {
      const payload = JSON.parse(window.name.slice(WINDOW_SESSION_PREFIX.length));
      return payload && payload.userId ? payload : null;
    } catch (error) {
      return null;
    }
  }

  function setWindowSession(userId) {
    window.name = WINDOW_SESSION_PREFIX + JSON.stringify({ userId: userId });
  }

  function clearWindowSession() {
    if (window.name && window.name.indexOf(WINDOW_SESSION_PREFIX) === 0) {
      window.name = '';
    }
  }

  async function readAccounts() {
    return getAllRecords(ACCOUNTS_STORE);
  }

  async function readPosts() {
    return getAllRecords(POSTS_STORE);
  }

  async function readComments(postId) {
    const all = await getAllRecords(COMMENTS_STORE);
    return all.filter(function (c) { return c.postId === postId; }).sort(function (a, b) { return a.createdAt - b.createdAt; });
  }

  async function readAllComments() {
    return getAllRecords(COMMENTS_STORE);
  }

  async function readNotifications(userId) {
    const all = await getAllRecords(NOTIFICATIONS_STORE);
    return all.filter(function (notification) {
      return notification.userId === userId;
    }).sort(function (left, right) {
      return right.createdAt - left.createdAt;
    });
  }

  async function addNotification(record) {
    if (!record || !record.userId) return;
    await putRecord(NOTIFICATIONS_STORE, {
      id: generateId('notification'),
      userId: record.userId,
      actorId: record.actorId || null,
      type: record.type || 'activity',
      message: record.message || '',
      postId: record.postId || null,
      createdAt: Date.now()
    });
  }

  async function addPostOwnerNotification(postId, notificationType, message) {
    if (!postId || !currentUser || !message) return;
    const post = await getRecord(POSTS_STORE, postId);
    if (!post || !post.userId || post.userId === currentUser.id || post.userId === '_static') return;
    await addNotification({
      userId: post.userId,
      actorId: currentUser.id,
      type: notificationType,
      message: message,
      postId: postId
    });
  }

  async function addMentionNotifications(post, text) {
    if (!post || !currentUser || !text) return;
    const handles = Array.from(new Set((String(text).match(MENTION_PATTERN) || []).map(function (entry) {
      return entry.slice(1).toLowerCase();
    }))).slice(0, 25);
    if (!handles.length) return;
    const accounts = await readAccounts();
    const accountMap = new Map(accounts.map(function (account) {
      return [String(account.usernameKey || '').toLowerCase(), account];
    }));
    for (let index = 0; index < handles.length; index += 1) {
      const mention = accountMap.get(handles[index]);
      if (!mention || mention.id === currentUser.id) continue;
      await addNotification({
        userId: mention.id,
        actorId: currentUser.id,
        type: 'mention',
        message: (currentUser.name || currentUser.username) + ' mentioned you in a post.',
        postId: post.id
      });
    }
  }

  async function addComment(postId, text) {
    if (!currentUser) return;
    const commentText = String(text).trim();
    await putRecord(COMMENTS_STORE, {
      id: generateId('comment'),
      postId: postId,
      userId: currentUser.id,
      text: commentText,
      createdAt: Date.now()
    });
    await addPostOwnerNotification(postId, 'comment', (currentUser.name || currentUser.username) + ' commented on your post.');
  }

  async function toggleSavePost(postId, staticInfo) {
    if (!currentUser) { openAuthModal('login'); return false; }
    const saved = currentUser.savedPostIds ? currentUser.savedPostIds.slice() : [];
    const isSaved = saved.indexOf(postId) !== -1;
    if (isSaved) {
      saved.splice(saved.indexOf(postId), 1);
    } else {
      if (staticInfo && !(await getRecord(POSTS_STORE, postId))) {
        await putRecord(POSTS_STORE, {
          id: postId,
          userId: '_static',
          text: staticInfo.text || '',
          imageMediaIds: [],
          videoMediaId: null,
          isStaticMirror: true,
          staticAuthorName: staticInfo.authorName || '',
          staticAuthorHandle: staticInfo.authorHandle || '',
          staticAvatarBg: staticInfo.avatarBg || '#888',
          createdAt: Date.now()
        });
      }
      saved.push(postId);
    }
    const updated = Object.assign({}, currentUser, { savedPostIds: saved });
    await putRecord(ACCOUNTS_STORE, updated);
    currentUser = updated;
    if (!isSaved) {
      await addPostOwnerNotification(postId, 'save', (currentUser.name || currentUser.username) + ' saved your post.');
    }
    if (isDashboardPage()) {
      await renderAccountDashboard();
    }
    return !isSaved;
  }

  async function toggleRepostPost(postId, originalPost) {
    if (!currentUser) { openAuthModal('login'); return false; }
    const reposted = currentUser.repostedPostIds ? currentUser.repostedPostIds.slice() : [];
    const isReposted = reposted.indexOf(postId) !== -1;
    if (isReposted) {
      const allPosts = await readPosts();
      const repostRecord = allPosts.filter(function (p) {
        return p.isRepost && p.repostOfPostId === postId && p.userId === currentUser.id;
      })[0];
      if (repostRecord) {
        await deleteRecord(POSTS_STORE, repostRecord.id);
      }
      reposted.splice(reposted.indexOf(postId), 1);
    } else {
      await putRecord(POSTS_STORE, {
        id: generateId('post'),
        userId: currentUser.id,
        text: originalPost.text || '',
        imageMediaIds: originalPost.imageMediaIds || [],
        videoMediaId: originalPost.videoMediaId || null,
        isRepost: true,
        repostOfPostId: postId,
        repostAuthorName: originalPost.authorName || originalPost.staticAuthorName || '',
        repostAuthorHandle: originalPost.authorHandle || originalPost.staticAuthorHandle || '',
        repostAvatarBg: originalPost.avatarBg || originalPost.staticAvatarBg || '#888',
        createdAt: Date.now()
      });
      reposted.push(postId);
    }
    const updated = Object.assign({}, currentUser, { repostedPostIds: reposted });
    await putRecord(ACCOUNTS_STORE, updated);
    currentUser = updated;
    if (!isReposted) {
      await addPostOwnerNotification(postId, 'repost', (currentUser.name || currentUser.username) + ' reposted your post.');
    }
    await refreshUserFacingViews();
    return !isReposted;
  }

  function extractPostInfoFromArticle(article) {
    const usernameEl = article.querySelector('.post-username');
    const handleEl = article.querySelector('.post-handle');
    const bodyEl = article.querySelector('.post-body');
    const avatarEl = article.querySelector('.post-avatar');
    var handle = handleEl ? handleEl.textContent.trim() : '';
    handle = handle.split('\xB7')[0].trim().replace(/^@/, '');
    return {
      authorName: usernameEl ? usernameEl.textContent.trim() : '',
      authorHandle: handle,
      avatarBg: avatarEl ? (avatarEl.style.background || '#888') : '#888',
      text: bodyEl ? bodyEl.textContent.trim() : '',
      imageMediaIds: [],
      videoMediaId: null
    };
  }

  function syncPostActionStates() {
    if (!currentUser) return;
    const savedIds = currentUser.savedPostIds || [];
    const repostedIds = currentUser.repostedPostIds || [];
    document.querySelectorAll('[data-post-id]').forEach(function (article) {
      const postId = article.dataset.postId;
      if (!postId) return;
      const saveBtn = article.querySelector('.post-action[data-action="save"]');
      if (saveBtn) {
        const isSaved = savedIds.indexOf(postId) !== -1;
        saveBtn.style.color = isSaved ? 'var(--accent)' : '';
        saveBtn.setAttribute('data-saved', String(isSaved));
      }
      const repostBtn = article.querySelector('.post-action[data-action="repost"]');
      if (repostBtn) {
        const isReposted = repostedIds.indexOf(postId) !== -1;
        repostBtn.style.color = isReposted ? 'var(--accent)' : '';
        repostBtn.setAttribute('data-reposted', String(isReposted));
      }
    });
  }

  function createCommentBox(postId) {
    const box = document.createElement('div');
    box.className = 'post-comment-box';
    box.setAttribute('data-comment-box', postId);

    const form = document.createElement('div');
    form.className = 'post-comment-form';

    const input = document.createElement('textarea');
    input.className = 'post-comment-input';
    input.placeholder = 'Write a comment…';
    input.rows = 2;

    const submit = document.createElement('button');
    submit.className = 'post-comment-submit';
    submit.type = 'button';
    submit.textContent = 'Reply';

    form.appendChild(input);
    form.appendChild(submit);
    box.appendChild(form);

    const list = document.createElement('div');
    list.className = 'post-comment-list';
    box.appendChild(list);

    function buildCommentActions(comment, item) {
      var commentActions = document.createElement('div');
      commentActions.className = 'post-comment-actions';

      /* Like */
      var likeBtn = document.createElement('button');
      likeBtn.className = 'post-comment-action';
      likeBtn.type = 'button';
      likeBtn.setAttribute('data-liked', 'false');
      likeBtn.setAttribute('data-count', '0');
      var likeSvg = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
      var likeCountSpan = document.createElement('span');
      likeCountSpan.textContent = '0';
      likeBtn.innerHTML = likeSvg;
      likeBtn.appendChild(likeCountSpan);
      likeBtn.addEventListener('click', function () {
        var liked = likeBtn.getAttribute('data-liked') === 'true';
        var cur = parseInt(likeBtn.getAttribute('data-count') || '0', 10);
        var next = liked ? Math.max(0, cur - 1) : cur + 1;
        likeBtn.setAttribute('data-liked', String(!liked));
        likeBtn.setAttribute('data-count', String(next));
        likeBtn.style.color = liked ? '' : 'var(--accent)';
        likeCountSpan.textContent = String(next);
      });
      commentActions.appendChild(likeBtn);

      /* Reply */
      var replyBtn = document.createElement('button');
      replyBtn.className = 'post-comment-action';
      replyBtn.type = 'button';
      replyBtn.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Reply';
      replyBtn.addEventListener('click', function () {
        if (!currentUser) { openAuthModal('login'); return; }
        var existing = item.querySelector('.post-comment-reply-box');
        if (existing) { existing.remove(); return; }
        var replyBox = document.createElement('div');
        replyBox.className = 'post-comment-reply-box';
        var replyInput = document.createElement('textarea');
        replyInput.className = 'post-comment-reply-input';
        replyInput.placeholder = 'Write a reply…';
        replyInput.rows = 2;
        var replySubmit = document.createElement('button');
        replySubmit.className = 'post-comment-reply-submit';
        replySubmit.type = 'button';
        replySubmit.textContent = 'Reply';
        replySubmit.addEventListener('click', async function () {
          var text = replyInput.value.trim();
          if (!text) return;
          replyInput.value = '';
          await addComment(postId, text);
          replyBox.remove();
          loadComments();
          var parentArticle = box.closest('[data-post-id]');
          if (parentArticle) {
            var commentBtns = parentArticle.querySelectorAll('.post-action[data-action="comment"]');
            commentBtns.forEach(function (btn) {
              var current = parseCountValue(btn.getAttribute('data-count') || (btn.querySelector('.post-action-count') ? btn.querySelector('.post-action-count').textContent : '0'));
              setActionCount(btn, current + 1);
            });
            if (commentBtns.length) {
              syncActionCountAcrossPost(postId, 'comment', parseCountValue(commentBtns[0].getAttribute('data-count')));
            }
          }
        });
        replyBox.appendChild(replyInput);
        replyBox.appendChild(replySubmit);
        item.querySelector('.post-comment-content').appendChild(replyBox);
        replyInput.focus();
      });
      commentActions.appendChild(replyBtn);

      /* Repost */
      var repostBtn = document.createElement('button');
      repostBtn.className = 'post-comment-action';
      repostBtn.type = 'button';
      repostBtn.setAttribute('data-reposted', 'false');
      repostBtn.setAttribute('data-count', '0');
      var repostSvg = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
      var repostCountSpan = document.createElement('span');
      repostCountSpan.textContent = '0';
      repostBtn.innerHTML = repostSvg;
      repostBtn.appendChild(repostCountSpan);
      repostBtn.addEventListener('click', function () {
        if (!currentUser) { openAuthModal('login'); return; }
        var rep = repostBtn.getAttribute('data-reposted') === 'true';
        var cur = parseInt(repostBtn.getAttribute('data-count') || '0', 10);
        var next = rep ? Math.max(0, cur - 1) : cur + 1;
        repostBtn.setAttribute('data-reposted', String(!rep));
        repostBtn.setAttribute('data-count', String(next));
        repostBtn.style.color = rep ? '' : 'var(--accent)';
        repostCountSpan.textContent = String(next);
      });
      commentActions.appendChild(repostBtn);

      /* Save */
      var saveBtn = document.createElement('button');
      saveBtn.className = 'post-comment-action';
      saveBtn.type = 'button';
      saveBtn.setAttribute('data-saved', 'false');
      saveBtn.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
      saveBtn.addEventListener('click', function () {
        if (!currentUser) { openAuthModal('login'); return; }
        var saved = saveBtn.getAttribute('data-saved') === 'true';
        saveBtn.setAttribute('data-saved', String(!saved));
        saveBtn.style.color = saved ? '' : 'var(--accent)';
      });
      commentActions.appendChild(saveBtn);

      return commentActions;
    }

    function loadComments() {
      readComments(postId).then(function (comments) {
        return readAccounts().then(function (accounts) {
          return { comments: comments, accounts: accounts };
        });
      }).then(function (data) {
        list.innerHTML = '';
        const accountMap = new Map(data.accounts.map(function (a) { return [a.id, a]; }));
        data.comments.forEach(function (comment) {
          var user = accountMap.get(comment.userId);
          var item = document.createElement('div');
          item.className = 'post-comment-item';
          var avatar = document.createElement('div');
          avatar.className = 'post-comment-avatar';
          avatar.style.background = user ? getAvatarColor(user.username) : '#888';
          avatar.textContent = user ? getInitials(user.name, user.username) : '?';
          var content = document.createElement('div');
          content.className = 'post-comment-content';
          var author = document.createElement('span');
          author.className = 'post-comment-author';
          author.textContent = user ? user.name : 'Unknown';
          var text = document.createElement('p');
          text.className = 'post-comment-text';
          text.textContent = comment.text;
          content.appendChild(author);
          content.appendChild(text);
          content.appendChild(buildCommentActions(comment, item));
          item.appendChild(avatar);
          item.appendChild(content);
          list.appendChild(item);
        });
      }).catch(function () {});
    }

    loadComments();

    submit.addEventListener('click', async function () {
      if (!currentUser) { openAuthModal('login'); return; }
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      await addComment(postId, text);
      loadComments();
      var parentArticle = box.closest('[data-post-id]');
      if (parentArticle) {
        var commentBtns = parentArticle.querySelectorAll('.post-action[data-action="comment"]');
        commentBtns.forEach(function (btn) {
          var current = parseCountValue(btn.getAttribute('data-count') || (btn.querySelector('.post-action-count') ? btn.querySelector('.post-action-count').textContent : '0'));
          setActionCount(btn, current + 1);
        });
        if (commentBtns.length) {
          syncActionCountAcrossPost(postId, 'comment', parseCountValue(commentBtns[0].getAttribute('data-count')));
        }
      }
    });

    return box;
  }

  function openPostDetailModal(postId, article) {
    const modal = document.getElementById('post-detail-modal');
    if (!modal) return;
    const postContainer = modal.querySelector('.post-detail-post');
    const commentsSection = modal.querySelector('.post-detail-comments-section');
    if (postContainer) {
      postContainer.innerHTML = '';
      postContainer.setAttribute('data-post-id', postId);
      const repostBanner = article.querySelector('.post-repost-banner');
      const header = article.querySelector('.post-header');
      const body = article.querySelector('.post-body');
      const imagePlaceholder = article.querySelector('.post-image-placeholder');
      const mediaGrids = Array.from(article.querySelectorAll('.post-media-grid'));
      const mediaWrapper = article.querySelector('.post-media-wrapper');
      const videoShell = article.querySelector('.post-video-shell');
      const poll = article.querySelector('.post-poll');
      if (repostBanner) postContainer.appendChild(repostBanner.cloneNode(true));
      if (header) postContainer.appendChild(header.cloneNode(true));
      if (body) postContainer.appendChild(body.cloneNode(true));
      if (imagePlaceholder) postContainer.appendChild(imagePlaceholder.cloneNode(true));
      mediaGrids.forEach(function (grid) {
        postContainer.appendChild(grid.cloneNode(true));
      });
      if (mediaWrapper) postContainer.appendChild(mediaWrapper.cloneNode(true));
      if (poll) postContainer.appendChild(poll.cloneNode(true));
      if (videoShell) {
        const videoShellClone = videoShell.cloneNode(true);
        videoShellClone.removeAttribute('data-video-enhanced');
        videoShellClone.querySelectorAll('.post-video-center-play, .post-video-controls, .post-video-inline-indicator').forEach(function (node) {
          node.remove();
        });
        postContainer.appendChild(videoShellClone);
      }
      const actionsClone = article.querySelector('.post-actions');
      if (actionsClone) {
        const clonedActions = actionsClone.cloneNode(true);
        postContainer.appendChild(clonedActions);
      }
      initializeActionButtonCounts(postContainer);
      postContainer.querySelectorAll('.post-action[data-action="like"]').forEach(function (likeButton) {
        addLikeBehavior(likeButton);
      });
      enhancePostVideoPresentation(postContainer);
    }
    if (commentsSection) {
      commentsSection.innerHTML = '';
      const heading = document.createElement('p');
      heading.className = 'post-detail-comments-header';
      heading.textContent = 'Comments';
      commentsSection.appendChild(heading);
      commentsSection.appendChild(createCommentBox(postId));
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.scrollTop = 0;
  }

  function closePostDetailModal() {
    const modal = document.getElementById('post-detail-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function attachPostInteractionHandlers() {
    document.addEventListener('click', async function (event) {
      const pollButton = event.target.closest && event.target.closest('.post-poll-option');
      if (pollButton) {
        const article = pollButton.closest('[data-post-id]');
        const postId = article ? article.dataset.postId : '';
        const optionId = pollButton.getAttribute('data-option-id') || '';
        event.preventDefault();
        event.stopPropagation();
        if (!currentUser) {
          openAuthModal('login');
          return;
        }
        if (!postId || !optionId) {
          return;
        }
        pollButton.disabled = true;
        try {
          const post = await getRecord(POSTS_STORE, postId);
          if (!post || !hasConfiguredPoll(post)) {
            throw new Error('This poll is no longer available.');
          }
          const votesByUser = Object.assign({}, post.poll.votesByUser || {});
          const previousOptionId = votesByUser[currentUser.id] || '';
          if (previousOptionId === optionId) {
            return;
          }
          const nextOptions = post.poll.options.map(function (option, index) {
            const normalizedId = option.id || ('option-' + (index + 1));
            let votes = Math.max(0, Math.round(Number(option.votes) || 0));
            if (normalizedId === previousOptionId) {
              votes = Math.max(0, votes - 1);
            }
            if (normalizedId === optionId) {
              votes += 1;
            }
            return Object.assign({}, option, {
              id: normalizedId,
              votes: votes
            });
          });
          votesByUser[currentUser.id] = optionId;
          post.poll = {
            question: post.poll.question,
            options: nextOptions,
            votesByUser: votesByUser
          };
          await putRecord(POSTS_STORE, post);
          await refreshUserFacingViews();
        } catch (error) {
          setInterfaceStatus(error && error.message ? error.message : 'Unable to update that poll right now.', 'error');
        } finally {
          pollButton.disabled = false;
        }
        return;
      }

      const button = event.target.closest && event.target.closest('.post-action[data-action="comment"], .post-action[data-action="repost"], .post-action[data-action="save"]');
      if (!button) return;
      const article = button.closest('[data-post-id]');
      if (!article) return;
      const postId = article.dataset.postId;
      const action = button.dataset.action;
      event.stopPropagation();

      if (action === 'comment') {
        if (!currentUser) { openAuthModal('login'); return; }
        const existing = article.querySelector('.post-comment-box[data-comment-box="' + postId + '"]');
        if (existing) {
          existing.remove();
        } else {
          const box = createCommentBox(postId);
          article.appendChild(box);
          const inp = box.querySelector('.post-comment-input');
          if (inp) inp.focus();
        }
        return;
      }

      if (action === 'repost') {
        if (!currentUser) { openAuthModal('login'); return; }
        button.disabled = true;
        const originalPost = extractPostInfoFromArticle(article);
        originalPost.imageMediaIds = [];
        originalPost.videoMediaId = null;
        try {
          const isNowReposted = await toggleRepostPost(postId, originalPost);
          button.style.color = isNowReposted ? 'var(--accent)' : '';
          button.setAttribute('data-reposted', String(isNowReposted));
          const countNode = button.querySelector('.post-action-count');
          const cur = parseCountValue(button.getAttribute('data-count') || (countNode ? countNode.textContent : '0'));
          const nextCount = isNowReposted ? cur + 1 : Math.max(0, cur - 1);
          setActionCount(button, nextCount);
          syncActionCountAcrossPost(postId, 'repost', nextCount);
        } catch (err) {}
        button.disabled = false;
        return;
      }

      if (action === 'save') {
        if (!currentUser) { openAuthModal('login'); return; }
        button.disabled = true;
        const staticInfo = extractPostInfoFromArticle(article);
        try {
          const isNowSaved = await toggleSavePost(postId, staticInfo);
          button.style.color = isNowSaved ? 'var(--accent)' : '';
          button.setAttribute('data-saved', String(isNowSaved));
        } catch (err) {}
        button.disabled = false;
        return;
      }
    }, true);

    document.addEventListener('click', function (event) {
      if (event.target.closest('.post-actions, .post-comment-box, .post-media-toolbar, .post-poll, [data-action], .post-detail-modal, .post-video-shell')) {
        return;
      }
      const article = event.target.closest && event.target.closest('[data-post-id]');
      if (!article) return;
      openPostDetailModal(article.dataset.postId, article);
    });

    const detailModal = document.getElementById('post-detail-modal');
    if (detailModal) {
      const closeBtn = detailModal.querySelector('.post-detail-back');
      if (closeBtn) {
        closeBtn.addEventListener('click', closePostDetailModal);
      }
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && detailModal.classList.contains('open')) {
          closePostDetailModal();
        }
      });
    }
  }

  async function getPersistentSession() {
    const sessionRecord = await getRecord(SESSION_STORE, 'current');
    return sessionRecord && sessionRecord.userId ? sessionRecord : null;
  }

  async function getCurrentSession() {
    return getWindowSession() || await getPersistentSession();
  }

  async function setCurrentSession(userId, remember) {
    clearWindowSession();
    await deleteRecord(SESSION_STORE, 'current');
    if (remember) {
      await putRecord(SESSION_STORE, { key: 'current', userId: userId });
      return;
    }
    setWindowSession(userId);
  }

  async function clearCurrentSession() {
    clearWindowSession();
    await deleteRecord(SESSION_STORE, 'current');
  }

  async function getUserById(userId) {
    return userId ? (await getRecord(ACCOUNTS_STORE, userId)) : null;
  }

  function setAuthStatus(message, type) {
    if (!authStatus) return;
    authStatus.textContent = message || '';
    authStatus.className = 'auth-status';
    if (type) {
      authStatus.classList.add(type);
    }
  }

  function setNewPostStatus(message, type) {
    if (!newPostStatus) return;
    newPostStatus.textContent = message || '';
    newPostStatus.className = 'auth-status';
    if (type) {
      newPostStatus.classList.add(type);
    }
  }

  function setInterfaceStatus(message, type) {
    if (newPostStatus) {
      setNewPostStatus(message, type);
      return;
    }
    if (authStatus && authModal && authModal.classList.contains('open')) {
      setAuthStatus(message, type);
      return;
    }
    if (message) {
      window.alert(message);
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[character];
    });
  }

  function formatLongDate(timestamp) {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getPostPublishTimestamp(post) {
    const timestamp = Number(post && (post.scheduledAt || post.createdAt));
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function isPostScheduled(post) {
    return Boolean(post && Number.isFinite(Number(post.scheduledAt)) && Number(post.scheduledAt) > Date.now());
  }

  function isPostPublished(post) {
    return getPostPublishTimestamp(post) <= Date.now();
  }

  function formatPostMetaText(post, authorHandle) {
    const handle = formatHandle(authorHandle);
    const publishedAt = getPostPublishTimestamp(post);
    if (isPostScheduled(post)) {
      return handle + ' · Scheduled for ' + formatLongDate(publishedAt);
    }
    return handle + ' · ' + formatRelativeTime(publishedAt);
  }

  function formatJoinedDate(timestamp) {
    if (!timestamp) return 'Create an account to get started';
    return 'Joined ' + new Date(timestamp).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });
  }

  function isValidBirthdayValue(value) {
    const birthday = String(value || '').trim();
    if (!birthday) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return false;
    const parsedDate = new Date(birthday + 'T00:00:00Z');
    if (Number.isNaN(parsedDate.getTime())) return false;
    if (parsedDate.toISOString().slice(0, 10) !== birthday) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsedDate.getTime() <= today.getTime();
  }

  function formatCompactSize(bytes) {
    const value = Number(bytes || 0);
    if (value <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)));
    const scaled = value / Math.pow(1024, unitIndex);
    return scaled.toFixed(scaled >= 10 || unitIndex === 0 ? 0 : 1) + ' ' + units[unitIndex];
  }

  function getCurrentPageName() {
    const pathname = String(window.location.pathname || '');
    const segments = pathname.split('/').filter(Boolean);
    return segments.length ? segments[segments.length - 1] : 'index.html';
  }

  function isDashboardPage() {
    return getCurrentPageName() === ACCOUNT_DASHBOARD_PATH;
  }

  function summarizePost(post) {
    if (post.text) {
      const normalized = post.text.trim().replace(/\s+/g, ' ');
      return normalized.length > 140 ? normalized.slice(0, 137) + '…' : normalized;
    }
    const imageCount = Array.isArray(post.imageMediaIds) ? post.imageMediaIds.length : 0;
    if (imageCount && post.videoMediaId) {
      return imageCount + ' image' + (imageCount === 1 ? '' : 's') + ' and 1 video';
    }
    if (imageCount) {
      return imageCount + ' image' + (imageCount === 1 ? '' : 's');
    }
    if (post.videoMediaId) {
      return '1 video upload';
    }
    return 'Untitled post';
  }

  function isSafeMediaUrl(url) {
    const value = String(url || '').trim();
    if (!value) return false;
    if (/^blob:/i.test(value)) return true;
    if (/^data:image\//i.test(value)) return true;
    if (/^data:video\//i.test(value)) return true;
    try {
      const parsed = new URL(value, window.location.href);
      return parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  function hasGifUrl(post) {
    return Boolean(String((post && post.gifUrl) || '').trim());
  }

  function switchAuthView(view) {
    if (!loginForm || !registerForm) return;
    const isLogin = view === 'login';
    loginForm.classList.toggle('active', isLogin);
    registerForm.classList.toggle('active', !isLogin);
    if (authTitle) {
      authTitle.textContent = isLogin ? 'Welcome back' : 'Create your account';
    }
    authTabs.forEach(function (tab) {
      const selected = tab.getAttribute('data-auth-view') === view;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    setAuthStatus('');
  }

  function openAuthModal(view) {
    if (typeof window.openAuthModal === 'function' && window.openAuthModal !== openAuthModal) {
      window.openAuthModal(view);
      return;
    }
    if (!authModal) return;
    switchAuthView(view || 'login');
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
  }

  function closeAuthModal() {
    if (typeof window.closeAuthModal === 'function' && window.closeAuthModal !== closeAuthModal) {
      window.closeAuthModal();
      return;
    }
    if (!authModal) return;
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
    setAuthStatus('');
  }

  function closeNewPostModal() {
    if (typeof window.closeNewPostModal === 'function' && window.closeNewPostModal !== closeNewPostModal) {
      window.closeNewPostModal();
      return;
    }
    const modal = document.getElementById('new-post-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (newPostForm) {
      newPostForm.reset();
    }
    setNewPostStatus('');
    npcResetState();
  }

  function firstName(name) {
    return String(name || '').trim().split(/\s+/)[0] || '';
  }

  function getSafeMailtoHref(email) {
    const value = String(email || '').trim();
    if (!EMAIL_ADDRESS_PATTERN.test(value)) {
      return '#';
    }
    return 'mailto:' + value;
  }

  function formatHandle(username) {
    return '@' + String(username || '').trim().replace(/\s+/g, '').toLowerCase();
  }

  function getInitials(name, username) {
    const source = String(name || username || '').trim();
    if (!source) return 'ZU';
    const words = source.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function getAvatarColor(seed) {
    const palette = ['#b91c1c', '#1d4ed8', '#15803d', '#6d28d9', '#92400e', '#0f766e', '#be185d', '#065f46'];
    const source = String(seed || 'zorexium');
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = ((hash << 5) - hash) + source.charCodeAt(index);
      hash |= 0;
    }
    return palette[Math.abs(hash) % palette.length];
  }

  function formatRelativeTime(timestamp) {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + ' min ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + ' hr ago';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
    return new Date(timestamp).toLocaleDateString();
  }

  function parseCountValue(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/,/g, '');
    if (!normalized) return 0;
    const matched = normalized.match(/^(\d+(?:\.\d+)?)([km])?$/);
    if (!matched) {
      const fallback = parseInt(normalized.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(fallback) ? fallback : 0;
    }
    const base = parseFloat(matched[1]);
    const suffix = matched[2];
    if (!Number.isFinite(base)) return 0;
    if (suffix === 'k') return Math.round(base * 1000);
    if (suffix === 'm') return Math.round(base * 1000000);
    return Math.round(base);
  }

  function formatCountValue(count) {
    const value = Math.max(0, Math.round(Number(count) || 0));
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(value);
  }

  function formatVideoDuration(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;
    if (hours > 0) {
      return hours + ':' + String(minutes % 60).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
    }
    return minutes + ':' + String(remainingSeconds).padStart(2, '0');
  }

  function injectNameField() {
    if (!registerForm || document.getElementById('register-name')) return;
    const usernameField = registerForm.querySelector('#register-username') ? registerForm.querySelector('#register-username').closest('.auth-field') : null;
    const wrapper = document.createElement('div');
    wrapper.className = 'auth-field';

    const label = document.createElement('label');
    label.setAttribute('for', 'register-name');
    label.textContent = 'Name';

    const input = document.createElement('input');
    input.id = 'register-name';
    input.name = 'name';
    input.type = 'text';
    input.autocomplete = 'name';
    input.minLength = 2;
    input.required = true;

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    registerForm.insertBefore(wrapper, usernameField || registerForm.firstChild);
  }

  function updateAuthControls() {
    const isAuthenticated = Boolean(currentUser);
    if (loginButton) {
      loginButton.textContent = isAuthenticated ? firstName(currentUser.name) || currentUser.username : 'login';
      loginButton.setAttribute('title', isAuthenticated ? ('Signed in as ' + currentUser.username) : 'Log in');
    }
    if (registerButton) {
      registerButton.textContent = isAuthenticated ? 'logout' : 'register';
      registerButton.setAttribute('title', isAuthenticated ? 'Log out' : 'Create an account');
    }
    if (headerProfileButton) {
      headerProfileButton.setAttribute('title', isAuthenticated ? ('Signed in as ' + currentUser.username) : 'Profile');
      headerProfileButton.setAttribute('aria-label', isAuthenticated ? ('Signed in as ' + currentUser.username) : 'Profile');
    }
    if (stickyFooterProfileButton) {
      stickyFooterProfileButton.setAttribute('title', isAuthenticated ? ('Signed in as ' + currentUser.username) : 'Profile');
    }
    if (headerNotificationsButton) {
      headerNotificationsButton.setAttribute('title', isAuthenticated ? 'Your notifications' : 'Notifications');
    }
    document.body.setAttribute('data-authenticated', isAuthenticated ? 'true' : 'false');
  }

  function syncDashboardTriggers() {
    document.querySelectorAll('.post-avatar, .post-username').forEach(function (node) {
      if (currentUser) {
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.setAttribute('aria-label', 'Open your account dashboard');
        node.style.cursor = 'pointer';
      } else {
        node.removeAttribute('role');
        node.removeAttribute('tabindex');
        node.removeAttribute('aria-label');
        node.style.cursor = '';
      }
    });
  }

  function hasPostMedia(post) {
    return (Array.isArray(post.imageMediaIds) && post.imageMediaIds.length > 0) || Boolean(post.videoMediaId) || hasGifUrl(post);
  }

  function getPostAuthorHandle(post) {
    if (!post) return 'post';
    return post.repostAuthorHandle || post.staticAuthorHandle || 'post';
  }

  function getDashboardTabSummaryLabel(tabName, count) {
    switch (tabName) {
      case 'replies':
        return count === 1 ? 'reply' : 'replies';
      case 'articles':
        return count === 1 ? 'article' : 'articles';
      case 'media':
        return count === 1 ? 'media post' : 'media posts';
      case 'likes':
        return count === 1 ? 'liked post' : 'liked posts';
      case 'saved':
        return count === 1 ? 'saved post' : 'saved posts';
      case 'marketplace':
        return count === 1 ? 'marketplace listing' : 'marketplace listings';
      default:
        return count === 1 ? 'post' : 'posts';
    }
  }

  function updateDashboardTabSummary() {
    if (!profileTabSummary) return;
    const items = dashboardTabCollections[activeDashboardTab] || [];
    profileTabSummary.textContent = '';
    const count = document.createElement('strong');
    count.textContent = String(items.length);
    profileTabSummary.appendChild(count);
    profileTabSummary.appendChild(document.createTextNode(' ' + getDashboardTabSummaryLabel(activeDashboardTab, items.length)));
  }

  function setDashboardTab(tabName) {
    const nextTab = dashboardTabCollections[tabName] ? tabName : 'posts';
    activeDashboardTab = nextTab;
    profileTabButtons.forEach(function (button) {
      const selected = button.getAttribute('data-tab') === nextTab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    profileTabPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== nextTab;
    });
    updateDashboardTabSummary();
  }

  function createDashboardEmptyCard(title, description, actionLabel) {
    const article = document.createElement('article');
    article.className = 'post-card post-card-empty';

    const copy = document.createElement('div');
    copy.className = 'post-empty-copy';

    const heading = document.createElement('p');
    heading.className = 'post-empty-title';
    heading.textContent = title;
    copy.appendChild(heading);

    const body = document.createElement('p');
    body.className = 'post-empty-description';
    body.textContent = description;
    copy.appendChild(body);

    article.appendChild(copy);

    if (actionLabel) {
      const action = document.createElement('button');
      action.className = 'post-empty-action';
      action.type = 'button';
      action.textContent = actionLabel;
      action.addEventListener('click', function () {
        openAuthModal('login');
      });
      article.appendChild(action);
    }

    return article;
  }

  function getDashboardEmptyState(tabName, isAuthenticated) {
    if (!isAuthenticated) {
      return {
        title: 'Log in to load your dashboard',
        description: 'Sign in or create an account to populate this tab with your profile activity and account content.',
        actionLabel: 'Log in'
      };
    }
    switch (tabName) {
      case 'replies':
        return {
          title: 'No replies yet',
          description: 'Replies and comments you leave on posts will appear here.'
        };
      case 'articles':
        return {
          title: 'No articles yet',
          description: 'Longer updates you publish will be grouped here automatically.'
        };
      case 'media':
        return {
          title: 'No media yet',
          description: 'Photos and videos from your posts will show up here.'
        };
      case 'likes':
        return {
          title: 'No liked posts yet',
          description: 'Posts you like will appear here once you start building out this part of your dashboard.'
        };
      case 'saved':
        return {
          title: 'No saved posts yet',
          description: 'Tap the bookmark icon on any post to save it here for later.'
        };
      case 'marketplace':
        return {
          title: 'No marketplace listings yet',
          description: 'Marketplace listings tied to your account will appear here once they are available.'
        };
      default:
        return {
          title: 'No posts yet',
          description: 'Your posts will appear here as soon as you share your first update.'
        };
    }
  }

  function buildDashboardTabCollections(userPosts, allPosts, user, userComments) {
    const savedIds = user && user.savedPostIds ? user.savedPostIds : [];
    const allPostsList = Array.isArray(allPosts) ? allPosts : [];
    const commentList = Array.isArray(userComments) ? userComments : [];
    const postById = new Map(allPostsList.map(function (post) { return [post.id, post]; }));
    const savedPosts = allPostsList.filter(function (post) {
      return savedIds.indexOf(post.id) !== -1;
    });
    const commentReplies = commentList.map(function (comment) {
      const parentPost = postById.get(comment.postId);
      return {
        id: comment.id,
        isCommentReply: true,
        text: comment.text,
        createdAt: comment.createdAt,
        replyToHandle: getPostAuthorHandle(parentPost),
        replyToText: parentPost ? summarizePost(parentPost) : ''
      };
    });
    return {
      posts: userPosts.slice(),
      replies: userPosts.filter(function (post) {
        return /^\s*@[\w]+/i.test(String(post.text || ''));
      }).concat(commentReplies).sort(function (left, right) {
        return (right.createdAt || 0) - (left.createdAt || 0);
      }),
      articles: userPosts.filter(function (post) {
        return post.type === 'article' || String(post.text || '').trim().length >= 180;
      }),
      media: userPosts.filter(function (post) {
        return hasPostMedia(post);
      }),
      likes: [],
      saved: savedPosts,
      marketplace: []
    };
  }

  function hasConfiguredPoll(post) {
    return Boolean(post && post.poll && String(post.poll.question || '').trim() && Array.isArray(post.poll.options) && post.poll.options.length >= 2);
  }

  function buildPollElement(post) {
    if (!hasConfiguredPoll(post)) {
      return null;
    }

    const section = document.createElement('section');
    section.className = 'post-poll';
    section.setAttribute('aria-label', 'Poll');

    const question = document.createElement('p');
    question.className = 'post-poll-question';
    question.textContent = String(post.poll.question || '').trim();
    section.appendChild(question);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'post-poll-options';

    const votesByUser = post.poll && post.poll.votesByUser ? post.poll.votesByUser : {};
    const selectedOptionId = currentUser ? votesByUser[currentUser.id] : '';
    const totalVotes = post.poll.options.reduce(function (sum, option) {
      return sum + Math.max(0, Math.round(Number(option && option.votes) || 0));
    }, 0);

    post.poll.options.forEach(function (option, index) {
      if (!option || !String(option.text || '').trim()) return;
      const optionId = option.id || ('option-' + (index + 1));
      const votes = Math.max(0, Math.round(Number(option.votes) || 0));
      const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

      const button = document.createElement('button');
      button.className = 'post-poll-option';
      button.type = 'button';
      button.setAttribute('data-option-id', optionId);
      button.setAttribute('aria-pressed', selectedOptionId === optionId ? 'true' : 'false');
      if (selectedOptionId === optionId) {
        button.classList.add('active');
      }

      const label = document.createElement('span');
      label.className = 'post-poll-option-label';
      label.textContent = String(option.text || '').trim();
      button.appendChild(label);

      const meta = document.createElement('span');
      meta.className = 'post-poll-option-meta';
      meta.textContent = percent + '% · ' + formatCountValue(votes);
      button.appendChild(meta);

      optionsWrap.appendChild(button);
    });

    section.appendChild(optionsWrap);

    const footer = document.createElement('p');
    footer.className = 'post-poll-total';
    footer.textContent = totalVotes === 1 ? '1 vote' : formatCountValue(totalVotes) + ' votes';
    section.appendChild(footer);

    return section;
  }

  function createScheduledStatusNode(post) {
    if (!isPostScheduled(post)) {
      return null;
    }
    const badge = document.createElement('p');
    badge.className = 'post-schedule-badge';
    badge.textContent = 'Scheduled for ' + formatLongDate(getPostPublishTimestamp(post));
    return badge;
  }

  async function buildDashboardPostCard(post, user) {
    const article = document.createElement('article');
    article.className = 'post-card';
    if (post.isCommentReply) {
      article.classList.add('post-card-reply');
      const replyHeader = document.createElement('div');
      replyHeader.className = 'post-header';
      replyHeader.innerHTML = '<div class="post-meta"><span class="post-username">Your reply</span><span class="post-handle">' + formatRelativeTime(post.createdAt) + '</span></div>';
      const replyBody = document.createElement('div');
      replyBody.className = 'post-body';
      replyBody.textContent = post.text || '';
      const replyContext = document.createElement('p');
      replyContext.className = 'post-handle';
      replyContext.textContent = 'Replied to ' + formatHandle(post.replyToHandle || 'post') + (post.replyToText ? (': "' + post.replyToText + '"') : '');
      article.appendChild(replyHeader);
      article.appendChild(replyBody);
      article.appendChild(replyContext);
      return article;
    }
    if (post.id) {
      article.setAttribute('data-post-id', post.id);
    }

    if (post.isRepost) {
      const banner = document.createElement('div');
      banner.className = 'post-repost-banner';
      banner.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span>' + escapeHtml((user ? user.name : '') || '') + ' reposted</span>';
      article.appendChild(banner);
    }

    const header = document.createElement('div');
    header.className = 'post-header';

    const authorName = post.isRepost ? (post.repostAuthorName || 'Unknown') : (user ? user.name : (post.staticAuthorName || 'Unknown'));
    const authorHandle = post.isRepost ? (post.repostAuthorHandle || 'user') : (user ? user.username : (post.staticAuthorHandle || 'user'));
    const avatarBg = post.isRepost ? (post.repostAvatarBg || getAvatarColor(authorHandle)) : (post.staticAvatarBg || (user ? getAvatarColor(user.username) : '#888'));

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.style.background = avatarBg;
    avatar.textContent = getInitials(authorName, authorHandle);
    header.appendChild(avatar);

    const meta = document.createElement('div');
    meta.className = 'post-meta';

    const username = document.createElement('span');
    username.className = 'post-username';
    username.textContent = authorName;
    meta.appendChild(username);

    const handle = document.createElement('span');
    handle.className = 'post-handle';
    handle.textContent = formatPostMetaText(post, authorHandle);
    meta.appendChild(handle);

    header.appendChild(meta);
    article.appendChild(header);

    if (post.text) {
      const body = document.createElement('div');
      body.className = 'post-body';
      body.textContent = post.text;
      article.appendChild(body);
    }

    if (post.type === 'article') {
      const companionCard = await buildArticleCompanionCard(post);
      article.appendChild(companionCard);
    } else {
      const mediaFragment = await buildMediaFragment(post);
      if (mediaFragment.childNodes.length) {
        article.appendChild(mediaFragment);
      }

      const poll = buildPollElement(post);
      if (poll) {
        article.appendChild(poll);
      }
    }

    const scheduleStatus = createScheduledStatusNode(post);
    if (scheduleStatus) {
      article.appendChild(scheduleStatus);
    }

    const actions = document.createElement('div');
    actions.className = 'post-actions';
    actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', true, 'like'));
    actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', false, 'comment'));
    actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>', false, 'repost'));
    actions.appendChild(createActionButton(null, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>', false, 'save'));
    if (currentUser && user && currentUser.id === post.userId && !post.isRepost && !post.isStaticMirror) {
      actions.appendChild(createDeletePostButton(post.id, summarizePost(post)));
    }
    article.appendChild(actions);
    initializeActionButtonCounts(article);
    article.querySelectorAll('.post-action[data-action="like"]').forEach(function (likeButton) {
      addLikeBehavior(likeButton);
    });
    enhancePostVideoPresentation(article);

    return article;
  }

  async function renderDashboardTabs(userPosts, allPosts, user, userComments) {
    dashboardTabCollections = buildDashboardTabCollections(userPosts, allPosts, user, userComments);
    for (let index = 0; index < profileTabPanels.length; index += 1) {
      const panel = profileTabPanels[index];
      const tabName = panel.getAttribute('data-panel') || 'posts';
      panel.innerHTML = '';
      const items = dashboardTabCollections[tabName] || [];
      if (!items.length) {
        const emptyState = getDashboardEmptyState(tabName, Boolean(user));
        panel.appendChild(createDashboardEmptyCard(emptyState.title, emptyState.description, emptyState.actionLabel));
        continue;
      }
      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const post = items[itemIndex];
        let postUser = user;
        if (post.isStaticMirror) {
          postUser = { id: '_static', name: post.staticAuthorName || 'Unknown', username: post.staticAuthorHandle || 'user' };
        } else if (post.isRepost) {
          postUser = user;
        }
        panel.appendChild(await buildDashboardPostCard(post, postUser));
      }
    }
    setDashboardTab(activeDashboardTab);
    syncDashboardTriggers();
    syncPostActionStates();
  }

  async function refreshUserFacingViews() {
    updateAuthControls();
    initializeActionButtonCounts(document);
    document.querySelectorAll('.post-action[data-action="like"]').forEach(function (likeButton) {
      addLikeBehavior(likeButton);
    });
    document.querySelectorAll('[data-post-id]').forEach(function (article) {
      enhancePostVideoPresentation(article);
    });
    syncDashboardTriggers();
    syncPostActionStates();
    if (postFeed && !isDashboardPage()) {
      await renderSavedPosts();
    }
    if (dashboardRoot) {
      await renderAccountDashboard();
      if (window.location.hash === '#marketplace') {
        setDashboardTab('marketplace');
      }
    }
    if (notificationsList) {
      await renderNotificationsPage();
    }
    if (typeof window.onArticlesAuthChange === 'function') {
      window.onArticlesAuthChange(currentUser);
    }
  }

  async function syncCurrentUserFromSession() {
    const session = await getCurrentSession();
    currentUser = session ? await getUserById(session.userId) : null;
    if (!currentUser && session) {
      await clearCurrentSession();
    }
    await refreshUserFacingViews();
  }

  async function logout() {
    currentUser = null;
    await clearCurrentSession();
    await refreshUserFacingViews();
    closeAuthModal();
  }

  function getBlobFromMediaRecord(record) {
    if (!record || typeof record !== 'object') return null;
    // New format: raw ArrayBuffer with explicit MIME type (cross-platform safe for IDB).
    if (record.data instanceof ArrayBuffer) {
      const type = String(record.type || '').trim() || 'application/octet-stream';
      return new Blob([record.data], { type: type });
    }
    // Legacy format: Blob/File stored directly in IDB.
    if (record.blob instanceof Blob) return record.blob;
    if (record.file instanceof Blob) return record.file;
    return null;
  }

  async function getRenderableMediaSource(record, options) {
    const preferDataUrl = Boolean(options && options.preferDataUrl);
    const blob = getBlobFromMediaRecord(record);
    if (preferDataUrl && blob) {
      const dataUrl = await blobToDataUrl(blob);
      if (isSafeMediaUrl(dataUrl)) return { url: dataUrl, isObjectUrl: false };
    }
    if (blob) {
      try {
        const objectUrl = URL.createObjectURL(blob);
        if (isSafeMediaUrl(objectUrl)) return { url: objectUrl, isObjectUrl: true };
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        // Fall through to a data URL fallback for environments that reject blob: URLs.
      }
      const fallbackDataUrl = await blobToDataUrl(blob);
      if (isSafeMediaUrl(fallbackDataUrl)) return { url: fallbackDataUrl, isObjectUrl: false };
    }
    const legacyDataUrl = String((record && record.dataUrl) || '').trim();
    if (isSafeMediaUrl(legacyDataUrl)) return { url: legacyDataUrl, isObjectUrl: false };
    const legacyUrl = String((record && record.url) || '').trim();
    if (isSafeMediaUrl(legacyUrl)) return { url: legacyUrl, isObjectUrl: false };
    return null;
  }

  // Retry with a fresh IDB connection when writes fail due to stale/closing
  // transaction state errors that are commonly recoverable on the next attempt.
  function isRetryableMediaWriteError(error) {
    const name = error && error.name ? error.name : '';
    return name === 'InvalidStateError' || name === 'TransactionInactiveError' || name === 'AbortError';
  }

  async function resetAppDbConnection() {
    if (!appDbPromise) return;
    try {
      const database = await appDbPromise;
      if (database && typeof database.close === 'function') {
        database.close();
      }
    } catch (error) {
      // Ignore close failures (already-closed connections or active transactions can
      // throw here) and force a fresh connection on the next DB operation anyway.
    }
    appDbPromise = null;
  }

  async function putMediaFile(file) {
    if (!(file instanceof Blob)) {
      throw new Error('The selected media file is invalid.');
    }
    // Read into an ArrayBuffer so the record is always structured-cloneable.
    // Storing a raw Blob/File object in IndexedDB fails on iOS/WKWebView (Capacitor)
    // with "Error preparing Blob/File data to be stored in object store".
    let data;
    try {
      data = await file.arrayBuffer();
    } catch (err) {
      throw new Error('Unable to read the selected media file. Please try selecting it again.' + (err && err.message ? ' (' + err.message + ')' : ''));
    }
    const type = String(file.type || '').trim() || 'application/octet-stream';
    const name = (file instanceof File) ? (file.name || '') : '';
    const record = {
      id: generateId('media'),
      data: data,
      type: type,
      name: name,
      size: file.size,
      createdAt: Date.now()
    };
    try {
      await putRecord(MEDIA_STORE, record);
    } catch (error) {
      if (error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded for this application. Please free up space and try again.');
      }
      if (!isRetryableMediaWriteError(error)) {
        throw error;
      }
      await resetAppDbConnection();
      await putRecord(MEDIA_STORE, record);
    }
    return record.id;
  }

  async function getMediaRecord(id) {
    return getRecord(MEDIA_STORE, id);
  }

  // Converts a Blob to a base64 data URL using FileReader.
  // Used for cover images instead of URL.createObjectURL() so that the result
  // works in iOS WKWebView (Capacitor), where blob: URLs cannot be used as
  // <img> src. Data URLs are plain strings — unlike blob: URLs they hold no
  // system resource and do not require revocation.
  // NOTE: articles.html contains equivalent inline logic in its own IIFE scope;
  // the two files share no module system so the logic is intentionally local to each.
  function blobToDataUrl(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () {
        try { resolve(URL.createObjectURL(blob)); } catch (e) { resolve(null); }
      };
      reader.readAsDataURL(blob);
    });
  }

  function clearGeneratedMediaUrls() {
    generatedMediaUrls.forEach(function (url) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
      }
    });
    generatedMediaUrls = [];
  }

  function ensureActionCountNode(button) {
    let countNode = button.querySelector('.post-action-count');
    if (!countNode) {
      Array.from(button.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim()) {
          node.remove();
        }
      });
      countNode = document.createElement('span');
      countNode.className = 'post-action-count';
      const icon = button.querySelector('.post-action-icon');
      if (icon && icon.nextSibling) {
        button.insertBefore(countNode, icon.nextSibling);
      } else {
        button.appendChild(countNode);
      }
    }
    return countNode;
  }

  function setActionCount(button, count) {
    if (!button) return;
    const nextCount = Math.max(0, Math.round(Number(count) || 0));
    button.setAttribute('data-count', String(nextCount));
    const countNode = ensureActionCountNode(button);
    if (countNode) {
      countNode.textContent = formatCountValue(nextCount);
    }
  }

  function syncActionCountAcrossPost(postId, action, count) {
    if (!postId || !action) return;
    if (['like', 'comment', 'repost'].indexOf(action) === -1) return;
    document.querySelectorAll('[data-post-id="' + postId + '"] .post-action[data-action="' + action + '"]').forEach(function (node) {
      setActionCount(node, count);
    });
  }

  function initializeActionButtonCounts(root) {
    const scope = root || document;
    scope.querySelectorAll('.post-action[data-action="like"], .post-action[data-action="comment"], .post-action[data-action="repost"]').forEach(function (button) {
      const countNode = button.querySelector('.post-action-count');
      const existing = button.getAttribute('data-count');
      const source = existing || (countNode ? countNode.textContent : button.textContent);
      setActionCount(button, parseCountValue(source));
    });
  }

  function addLikeBehavior(button) {
    if (!button || button.getAttribute('data-like-handler') === 'true') return;
    button.setAttribute('data-like-handler', 'true');
    button.addEventListener('click', function () {
      const isLiked = button.getAttribute('data-liked') === 'true';
      const currentCount = parseCountValue(button.getAttribute('data-count'));
      const nextCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
      const article = button.closest('[data-post-id]');
      const postId = article ? article.getAttribute('data-post-id') : '';
      button.setAttribute('data-liked', String(!isLiked));
      button.style.color = isLiked ? '' : 'var(--accent)';
      setActionCount(button, nextCount);
      if (postId) {
        syncActionCountAcrossPost(postId, 'like', nextCount);
      }
      if (!isLiked) {
        addPostOwnerNotification(postId, 'like', (currentUser ? (currentUser.name || currentUser.username) : 'Someone') + ' liked your post.').catch(function (error) {
          console.warn('Unable to add like notification.', error);
        });
      }
    });
  }

  function createActionButton(count, svgMarkup, isLike, actionType) {
    const button = document.createElement('button');
    button.className = 'post-action';
    button.type = 'button';
    if (isLike) {
      button.setAttribute('data-action', 'like');
      addLikeBehavior(button);
    } else if (actionType) {
      button.setAttribute('data-action', actionType);
    }

    const icon = document.createElement('span');
    icon.className = 'post-action-icon';
    icon.innerHTML = svgMarkup;
    button.appendChild(icon);

    if (count !== null) {
      setActionCount(button, count || 0);
    }

    return button;
  }

  function createDeletePostButton(postId, summary) {
    const button = document.createElement('button');
    button.className = 'post-action post-action-danger';
    button.type = 'button';
    button.setAttribute('aria-label', 'Delete post: ' + String(summary || 'your post'));
    button.innerHTML = '<span class="post-action-icon"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></span><span class="post-action-count">Delete</span>';
    button.addEventListener('click', async function () {
      if (!currentUser) {
        openAuthModal('login');
        return;
      }
      if (!window.confirm('Delete this post? This cannot be undone.')) {
        return;
      }
      button.disabled = true;
      try {
        await deletePost(postId);
        setNewPostStatus('Post deleted successfully.', 'success');
      } catch (error) {
        setNewPostStatus(error && error.message ? error.message : 'Unable to delete this post.', 'error');
        button.disabled = false;
      }
    });
    return button;
  }

  function getMediaViewerCurrentItem() {
    const items = Array.isArray(mediaViewerState.items) ? mediaViewerState.items : [];
    if (!items.length) return null;
    const index = Math.max(0, Math.min(items.length - 1, Number(mediaViewerState.index) || 0));
    return items[index];
  }

  function resetMediaViewerDragState() {
    mediaViewerGestureState.active = false;
    mediaViewerGestureState.startX = 0;
    mediaViewerGestureState.startY = 0;
    mediaViewerGestureState.deltaX = 0;
    mediaViewerGestureState.deltaY = 0;
    mediaViewerGestureState.axis = '';
    const shell = mediaViewerContent ? mediaViewerContent.querySelector('.media-viewer-media-shell') : null;
    if (shell) {
      shell.style.transform = '';
      shell.style.opacity = '';
    }
  }

  function setMediaViewerDragOffset(deltaX, deltaY) {
    const shell = mediaViewerContent ? mediaViewerContent.querySelector('.media-viewer-media-shell') : null;
    if (!shell) return;
    shell.style.transform = 'translate3d(' + Math.round(deltaX) + 'px, ' + Math.round(deltaY) + 'px, 0)';
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      shell.style.opacity = String(Math.max(0.45, 1 - Math.min(0.55, Math.abs(deltaY) / 260)));
    } else {
      shell.style.opacity = '';
    }
  }

  function updateMediaViewerChrome() {
    const item = getMediaViewerCurrentItem();
    const total = Array.isArray(mediaViewerState.items) ? mediaViewerState.items.length : 0;
    const isImage = item && item.type === 'image';
    if (mediaViewerTitle) {
      if (total > 1) {
        mediaViewerTitle.textContent = 'Image ' + (mediaViewerState.index + 1) + ' of ' + total;
      } else {
        mediaViewerTitle.textContent = item && item.label ? item.label : 'Media viewer';
      }
    }
    if (mediaViewerZoomInButton) {
      mediaViewerZoomInButton.disabled = !isImage;
    }
    if (mediaViewerZoomOutButton) {
      mediaViewerZoomOutButton.disabled = !isImage;
    }
    if (mediaViewerFitButton) {
      mediaViewerFitButton.disabled = !isImage;
    }
    if (mediaViewerPrevButton) {
      const hasPrevious = total > 1 && mediaViewerState.index > 0;
      mediaViewerPrevButton.hidden = total <= 1;
      mediaViewerPrevButton.disabled = !hasPrevious;
    }
    if (mediaViewerNextButton) {
      const hasNext = total > 1 && mediaViewerState.index < total - 1;
      mediaViewerNextButton.hidden = total <= 1;
      mediaViewerNextButton.disabled = !hasNext;
    }
    if (mediaViewerPagination) {
      mediaViewerPagination.innerHTML = '';
      if (total > 1) {
        mediaViewerState.items.forEach(function (_, index) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'media-viewer-dot' + (index === mediaViewerState.index ? ' active' : '');
          dot.setAttribute('aria-label', 'Show image ' + (index + 1) + ' of ' + total);
          dot.addEventListener('click', function () {
            goToMediaViewerIndex(index);
          });
          mediaViewerPagination.appendChild(dot);
        });
      }
    }
  }

  function setMediaViewerScale(scale) {
    if (!mediaViewerContent) return;
    const nextScale = Math.min(MAX_MEDIA_SCALE, Math.max(MIN_MEDIA_SCALE, scale));
    mediaViewerState.scale = nextScale;
    const mediaElement = mediaViewerContent.querySelector('.media-viewer-media');
    if (!mediaElement || mediaViewerState.type !== 'image') {
      return;
    }
    // Width-based scaling replaces the old transform-only zoom because expanding the
    // image's layout dimensions grows the native scroll area; CSS transforms do not,
    // which blocked touch/trackpad panning on zoomed images in the prior viewer.
    mediaElement.style.width = nextScale > 1 ? (nextScale * 100) + '%' : '';
    mediaElement.style.maxWidth = nextScale > 1 ? 'none' : '100%';
    mediaElement.style.maxHeight = nextScale > 1 ? 'none' : '';
    if (nextScale === 1) {
      mediaViewerContent.scrollLeft = 0;
      mediaViewerContent.scrollTop = 0;
    }
  }

  function renderCurrentMediaViewerItem() {
    if (!mediaViewerModal || !mediaViewerContent) return;
    const item = getMediaViewerCurrentItem();
    mediaViewerContent.innerHTML = '';
    if (!item) {
      updateMediaViewerChrome();
      return;
    }
    mediaViewerState.type = item.type;
    mediaViewerState.src = item.src;
    mediaViewerState.label = item.label || 'Media viewer';

    const shell = document.createElement('div');
    shell.className = 'media-viewer-media-shell';

    const mediaElement = document.createElement(item.type === 'video' ? 'video' : 'img');
    mediaElement.className = 'media-viewer-media';
    mediaElement.src = item.src;
    if (item.type === 'video') {
      mediaElement.controls = true;
      mediaElement.preload = 'metadata';
      mediaElement.setAttribute('playsinline', 'true');
      mediaElement.setAttribute('aria-label', mediaViewerState.label);
    } else {
      mediaElement.alt = mediaViewerState.label;
      mediaElement.addEventListener('dblclick', function () {
        setMediaViewerScale(mediaViewerState.scale > 1 ? 1 : 2);
      });
    }
    shell.appendChild(mediaElement);
    mediaViewerContent.appendChild(shell);
    mediaViewerContent.scrollLeft = 0;
    mediaViewerContent.scrollTop = 0;
    resetMediaViewerDragState();
    updateMediaViewerChrome();
    setMediaViewerScale(1);
  }

  function goToMediaViewerIndex(index) {
    const items = Array.isArray(mediaViewerState.items) ? mediaViewerState.items : [];
    if (!items.length) return;
    const nextIndex = Math.max(0, Math.min(items.length - 1, Number(index) || 0));
    if (nextIndex === mediaViewerState.index) {
      resetMediaViewerDragState();
      return;
    }
    const currentVideo = mediaViewerContent ? mediaViewerContent.querySelector('video') : null;
    if (currentVideo) {
      currentVideo.pause();
    }
    mediaViewerState.index = nextIndex;
    mediaViewerState.scale = 1;
    renderCurrentMediaViewerItem();
  }

  function normalizeMediaViewerInput(entryOrType, src, label) {
    if (Array.isArray(entryOrType)) {
      return {
        items: entryOrType.filter(function (item) {
          return item && (item.type === 'image' || item.type === 'video') && isSafeMediaUrl(item.src);
        }),
        index: typeof src === 'number' ? src : 0
      };
    }
    return {
      items: isSafeMediaUrl(src) ? [{ type: entryOrType, src: src, label: label || 'Media viewer' }] : [],
      index: 0
    };
  }

  function closeMediaViewer() {
    if (!mediaViewerModal || !mediaViewerContent) return;
    const video = mediaViewerContent.querySelector('video');
    if (video) {
      video.pause();
    }
    mediaViewerContent.innerHTML = '';
    mediaViewerModal.classList.remove('open');
    mediaViewerModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('media-viewer-open');
    resetMediaViewerDragState();
    if (mediaViewerPagination) {
      mediaViewerPagination.innerHTML = '';
    }
    mediaViewerState = {
      scale: 1,
      items: [],
      index: 0,
      type: null,
      src: '',
      label: ''
    };
  }

  async function requestElementFullscreen(element) {
    if (!element) return;
    const requestFullscreen = element.requestFullscreen || element.webkitRequestFullscreen;
    if (typeof requestFullscreen === 'function') {
      try {
        const result = requestFullscreen.call(element);
        if (result && typeof result.catch === 'function') {
          await result;
        }
      } catch (error) {
        // Native API failed (e.g. iOS 16+ exposes requestFullscreen but rejects it for
        // container elements such as the video shell div inside WKWebView) — fall back to
        // CSS-simulated fullscreen so the video still fills the screen on mobile instead
        // of silently doing nothing.
        element.classList.add('is-simfullscreen');
        document.dispatchEvent(new CustomEvent('simfullscreenchange', { detail: { element: element } }));
        return;
      }
      return;
    }
    // No native Fullscreen API (e.g. iOS Safari) — use a CSS-simulated fullscreen
    // so mobile looks and behaves identically to the desktop fullscreen view.
    element.classList.add('is-simfullscreen');
    document.dispatchEvent(new CustomEvent('simfullscreenchange', { detail: { element: element } }));
  }

  function openMediaViewer(entryOrType, src, label) {
    if (!mediaViewerModal || !mediaViewerContent) return;
    const payload = normalizeMediaViewerInput(entryOrType, src, label);
    if (!payload.items.length) {
      setInterfaceStatus('This media could not be opened safely.', 'error');
      return;
    }
    mediaViewerState = {
      scale: 1,
      items: payload.items,
      index: Math.max(0, Math.min(payload.items.length - 1, payload.index || 0)),
      type: null,
      src: '',
      label: ''
    };
    mediaViewerModal.classList.add('open');
    mediaViewerModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('media-viewer-open');
    renderCurrentMediaViewerItem();
  }

  function configurePostVideoElement(video) {
    if (!video) return;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.controls = false;
    video.setAttribute('playsinline', 'true');
    video.preload = 'metadata';
    video.setAttribute('data-autoplay-muted', 'true');
    const originalLabel = video.getAttribute('data-original-aria-label') || video.getAttribute('aria-label') || 'Video';
    video.setAttribute('data-original-aria-label', originalLabel);
    if (!/autoplay muted/i.test(originalLabel)) {
      video.setAttribute('aria-label', originalLabel + ' (autoplay muted)');
    } else {
      video.setAttribute('aria-label', originalLabel);
    }
    video.setAttribute('data-previous-volume', String(Number(video.volume) || DEFAULT_POST_VIDEO_VOLUME));
  }

  function pauseOtherPostVideos(activeVideo) {
    if (!activeVideo) return;
    document.querySelectorAll('.post-video').forEach(function (video) {
      if (video !== activeVideo) {
        video.pause();
      }
    });
  }

  // ── Immersive player state ────────────────────────────────────────────────
  let pvPlayer = null;
  let pvActiveInlineVideo = null;
  let pvFeedShells = [];
  let pvFeedIndex = -1;
  let pvControlsHideTimer = null;
  let pvPlaybackRate = 1.0;
  let pvSettingsOpen = false;
  let pvIsSeeking = false;
  let postVideoIntersectionObserver = null;

  const PV_SPEEDS = [0.5, 1, 1.5, 2];
  const PV_CONTROLS_HIDE_DELAY = 3000;
  const PV_SWIPE_THRESHOLD = 80;

  // WeakMap to store per-player helper callbacks without polluting the DOM element.
  const pvPlayerHelpers = new WeakMap();

  function getPostVideoObserver() {
    if (postVideoIntersectionObserver) return postVideoIntersectionObserver;
    postVideoIntersectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const shell = entry.target;
        const video = shell.querySelector('.post-video');
        if (!video) return;
        if (entry.intersectionRatio >= 0.5) {
          if (video.paused) {
            pauseOtherPostVideos(video);
            video.play().catch(function () {});
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: [0, 0.5] });
    return postVideoIntersectionObserver;
  }

  function enhancePostVideoPresentation(article) {
    if (!article) return;
    article.querySelectorAll('.post-video-shell').forEach(function (shell) {
      if (shell.getAttribute('data-video-enhanced') === 'true') return;
      shell.setAttribute('data-video-enhanced', 'true');
      const video = shell.querySelector('.post-video');
      if (!video) return;
      shell.style.position = 'relative';

      // ── Center play overlay ─────────────────────────────────────
      const centerPlay = document.createElement('div');
      centerPlay.className = 'post-video-center-play';
      centerPlay.setAttribute('aria-hidden', 'true');
      centerPlay.innerHTML = VIDEO_ICON_PLAY_CENTER;
      shell.appendChild(centerPlay);

      // ── Inline bottom-right indicator (mute icon + total duration)
      const inlineBar = document.createElement('div');
      inlineBar.className = 'post-video-inline-indicator';

      const muteBtn = document.createElement('button');
      muteBtn.className = 'post-video-inline-mute';
      muteBtn.type = 'button';
      muteBtn.setAttribute('aria-label', 'Unmute video');
      muteBtn.innerHTML = VIDEO_ICON_MUTED;
      inlineBar.appendChild(muteBtn);

      const durationLabel = document.createElement('span');
      durationLabel.className = 'post-video-inline-duration';
      inlineBar.appendChild(durationLabel);

      shell.appendChild(inlineBar);

      configurePostVideoElement(video);

      function updateInlineIndicator() {
        const isPlaying = !video.paused && !video.ended;
        shell.classList.toggle('is-playing', isPlaying);
        const isMuted = video.muted || video.volume === 0;
        muteBtn.innerHTML = isMuted ? VIDEO_ICON_MUTED : VIDEO_ICON_UNMUTED;
        muteBtn.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
      }

      function applyDynamicAspectRatio() {
        if (video.videoWidth && video.videoHeight) {
          video.style.aspectRatio = video.videoWidth + ' / ' + video.videoHeight;
        }
        if (Number.isFinite(video.duration) && video.duration > 0) {
          durationLabel.textContent = formatVideoDuration(video.duration);
        }
        updateInlineIndicator();
      }

      video.addEventListener('loadedmetadata', applyDynamicAspectRatio);
      video.addEventListener('play', updateInlineIndicator);
      video.addEventListener('pause', updateInlineIndicator);
      video.addEventListener('ended', updateInlineIndicator);
      video.addEventListener('volumechange', updateInlineIndicator);

      // Mute toggle: inline only, no fullscreen launch
      muteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const previousVolume = Number(video.getAttribute('data-previous-volume') || String(DEFAULT_POST_VIDEO_VOLUME));
        if (video.muted || video.volume === 0) {
          video.muted = false;
          if (video.volume === 0) {
            video.volume = previousVolume > 0 ? previousVolume : DEFAULT_POST_VIDEO_VOLUME;
          }
        } else {
          video.setAttribute('data-previous-volume', String(video.volume));
          video.muted = true;
        }
        updateInlineIndicator();
      });

      // Clicking the video shell (but not the indicator) opens the immersive player
      shell.addEventListener('click', function (e) {
        if (inlineBar.contains(e.target)) return;
        openImmersivePlayer(video, article);
      });

      // Intersection-driven autoplay
      getPostVideoObserver().observe(shell);

      updateInlineIndicator();
      applyDynamicAspectRatio();
    });
  }

  // ── Immersive fullscreen player ───────────────────────────────────────────

  function buildImmersivePlayerDOM() {
    const player = document.createElement('div');
    player.id = 'pv-immersive-player';
    player.setAttribute('role', 'dialog');
    player.setAttribute('aria-modal', 'true');
    player.setAttribute('aria-label', 'Video player');

    const video = document.createElement('video');
    video.className = 'pv-video';
    video.setAttribute('playsinline', 'true');
    video.preload = 'auto';
    player.appendChild(video);

    // Top bar
    const topBar = document.createElement('div');
    topBar.className = 'pv-top-bar';

    const backBtn = document.createElement('button');
    backBtn.className = 'pv-btn pv-back-btn';
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', 'Close video player');
    backBtn.innerHTML = VIDEO_ICON_BACK;

    const topSpacer = document.createElement('div');
    topSpacer.className = 'pv-flex-spacer';

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'pv-btn pv-settings-btn';
    settingsBtn.type = 'button';
    settingsBtn.setAttribute('aria-label', 'Playback settings');
    settingsBtn.innerHTML = VIDEO_ICON_SETTINGS;

    topBar.appendChild(backBtn);
    topBar.appendChild(topSpacer);
    topBar.appendChild(settingsBtn);
    player.appendChild(topBar);

    // Settings panel
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'pv-settings-panel';
    settingsPanel.hidden = true;

    const speedLabel = document.createElement('div');
    speedLabel.className = 'pv-settings-label';
    speedLabel.textContent = 'Playback speed';

    const speedGroup = document.createElement('div');
    speedGroup.className = 'pv-speed-group';

    PV_SPEEDS.forEach(function (speed) {
      const btn = document.createElement('button');
      btn.className = 'pv-speed-btn' + (speed === 1 ? ' pv-active' : '');
      btn.type = 'button';
      btn.setAttribute('data-speed', String(speed));
      btn.textContent = speed + '\u00d7';
      speedGroup.appendChild(btn);
    });

    const qualityLabel = document.createElement('div');
    qualityLabel.className = 'pv-settings-label';
    qualityLabel.textContent = 'Quality';

    const qualityNote = document.createElement('div');
    qualityNote.className = 'pv-settings-note';
    qualityNote.textContent = 'Quality selection is not available for locally stored videos. Content is served from IndexedDB at its original resolution.';

    settingsPanel.appendChild(speedLabel);
    settingsPanel.appendChild(speedGroup);
    settingsPanel.appendChild(qualityLabel);
    settingsPanel.appendChild(qualityNote);
    player.appendChild(settingsPanel);

    // Transparent canvas overlay (receives taps and swipe gestures)
    const canvasOverlay = document.createElement('div');
    canvasOverlay.className = 'pv-canvas-overlay';
    player.appendChild(canvasOverlay);

    // Bottom controls
    const bottomControls = document.createElement('div');
    bottomControls.className = 'pv-bottom-controls';

    // Custom progress bar with buffer + played tracks
    const progressBar = document.createElement('div');
    progressBar.className = 'pv-progress-bar';
    progressBar.setAttribute('role', 'slider');
    progressBar.setAttribute('aria-label', 'Video progress');
    progressBar.setAttribute('tabindex', '0');

    const progressTrack = document.createElement('div');
    progressTrack.className = 'pv-progress-track';

    const progressBuffer = document.createElement('div');
    progressBuffer.className = 'pv-progress-buffer';

    const progressPlayed = document.createElement('div');
    progressPlayed.className = 'pv-progress-played';

    const progressKnob = document.createElement('div');
    progressKnob.className = 'pv-progress-knob';

    progressTrack.appendChild(progressBuffer);
    progressTrack.appendChild(progressPlayed);
    progressTrack.appendChild(progressKnob);
    progressBar.appendChild(progressTrack);
    bottomControls.appendChild(progressBar);

    // Controls row
    const controlsRow = document.createElement('div');
    controlsRow.className = 'pv-controls-row';

    const playBtn = document.createElement('button');
    playBtn.className = 'pv-btn pv-play-btn';
    playBtn.type = 'button';
    playBtn.setAttribute('aria-label', 'Pause');
    playBtn.innerHTML = VIDEO_ICON_PAUSE;

    const timeLabel = document.createElement('span');
    timeLabel.className = 'pv-time';
    timeLabel.textContent = '0:00 / 0:00';

    const ctrlSpacer = document.createElement('div');
    ctrlSpacer.className = 'pv-flex-spacer';

    // Closed captions toggle — disabled state (locally stored videos do not carry
    // embedded subtitle tracks; implement as a clean disabled/unavailable button).
    const ccBtn = document.createElement('button');
    ccBtn.className = 'pv-btn pv-cc-btn';
    ccBtn.type = 'button';
    ccBtn.setAttribute('aria-label', 'Closed captions (unavailable for locally stored videos)');
    ccBtn.setAttribute('aria-pressed', 'false');
    ccBtn.setAttribute('aria-disabled', 'true');
    ccBtn.innerHTML = VIDEO_ICON_CAPTIONS;

    controlsRow.appendChild(playBtn);
    controlsRow.appendChild(timeLabel);
    controlsRow.appendChild(ctrlSpacer);
    controlsRow.appendChild(ccBtn);
    bottomControls.appendChild(controlsRow);
    player.appendChild(bottomControls);

    return player;
  }

  function getOrCreateImmersivePlayer() {
    if (pvPlayer) return pvPlayer;
    pvPlayer = buildImmersivePlayerDOM();
    document.body.appendChild(pvPlayer);
    wireImmersivePlayerEvents();
    return pvPlayer;
  }

  function wireImmersivePlayerEvents() {
    const player = pvPlayer;
    const video = player.querySelector('.pv-video');
    const backBtn = player.querySelector('.pv-back-btn');
    const settingsBtn = player.querySelector('.pv-settings-btn');
    const settingsPanel = player.querySelector('.pv-settings-panel');
    const canvasOverlay = player.querySelector('.pv-canvas-overlay');
    const bottomControls = player.querySelector('.pv-bottom-controls');
    const topBar = player.querySelector('.pv-top-bar');
    const progressBar = player.querySelector('.pv-progress-bar');
    const progressBuffer = player.querySelector('.pv-progress-buffer');
    const progressPlayed = player.querySelector('.pv-progress-played');
    const progressKnob = player.querySelector('.pv-progress-knob');
    const playBtn = player.querySelector('.pv-play-btn');
    const timeLabel = player.querySelector('.pv-time');
    const speedBtns = player.querySelectorAll('.pv-speed-btn');

    function showControls() {
      player.classList.remove('pv-controls-hidden');
      resetControlsHideTimer();
    }

    function resetControlsHideTimer() {
      if (pvControlsHideTimer) clearTimeout(pvControlsHideTimer);
      pvControlsHideTimer = setTimeout(function () {
        if (!pvSettingsOpen && !pvIsSeeking) {
          player.classList.add('pv-controls-hidden');
        }
      }, PV_CONTROLS_HIDE_DELAY);
    }

    function updateImmersiveControls() {
      if (!video.src) return;
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      const currentTime = Math.max(0, video.currentTime || 0);
      const isPlaying = !video.paused && !video.ended;

      playBtn.innerHTML = isPlaying ? VIDEO_ICON_PAUSE : VIDEO_ICON_PLAY;
      playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');

      timeLabel.textContent = formatVideoDuration(currentTime) + ' / ' + formatVideoDuration(duration);

      if (!pvIsSeeking) {
        const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
        progressPlayed.style.width = pct + '%';
        progressKnob.style.left = 'calc(' + pct + '% - 6px)';
      }

      // Update buffered progress; accessing buffered ranges may throw if the
      // video source is not yet available or the element is in an error state.
      try {
        if (video.buffered.length > 0 && duration > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          progressBuffer.style.width = ((bufferedEnd / duration) * 100) + '%';
        }
      } catch (e) {
        // Buffered data not accessible in the current playback state; ignore.
        console.debug('Video buffered ranges not accessible.', e);
      }
    }

    video.addEventListener('timeupdate', updateImmersiveControls);
    video.addEventListener('play', updateImmersiveControls);
    video.addEventListener('pause', updateImmersiveControls);
    video.addEventListener('ended', function () {
      updateImmersiveControls();
      navigateImmersivePlayer(1);
    });
    video.addEventListener('loadedmetadata', updateImmersiveControls);
    video.addEventListener('progress', updateImmersiveControls);

    backBtn.addEventListener('click', function () {
      closeImmersivePlayer();
    });

    playBtn.addEventListener('click', function () {
      if (video.paused || video.ended) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
      showControls();
    });

    settingsBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      pvSettingsOpen = !pvSettingsOpen;
      settingsPanel.hidden = !pvSettingsOpen;
      showControls();
    });

    speedBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pvPlaybackRate = Number(btn.getAttribute('data-speed'));
        video.playbackRate = pvPlaybackRate;
        speedBtns.forEach(function (b) { b.classList.remove('pv-active'); });
        btn.classList.add('pv-active');
        showControls();
      });
    });

    // Canvas tap: toggle controls or close settings
    canvasOverlay.addEventListener('click', function () {
      if (pvSettingsOpen) {
        pvSettingsOpen = false;
        settingsPanel.hidden = true;
        showControls();
        return;
      }
      if (player.classList.contains('pv-controls-hidden')) {
        showControls();
      } else {
        if (pvControlsHideTimer) clearTimeout(pvControlsHideTimer);
        player.classList.add('pv-controls-hidden');
      }
    });

    // Reset hide timer on interaction with overlays
    [topBar, bottomControls].forEach(function (el) {
      el.addEventListener('pointermove', showControls);
      el.addEventListener('click', showControls);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      if (!player.classList.contains('open')) return;
      if (e.key === 'Escape') {
        if (pvSettingsOpen) {
          pvSettingsOpen = false;
          settingsPanel.hidden = true;
          showControls();
        } else {
          closeImmersivePlayer();
        }
      } else if (e.key === ' ' || e.key === 'k') {
        // Only intercept Space/K when focus is not on an interactive element inside
        // the player (e.g. a button), so screen readers and button activation still work.
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        if (video.paused || video.ended) video.play().catch(function () {}); else video.pause();
        showControls();
      } else if (e.key === 'ArrowLeft') {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showControls();
      } else if (e.key === 'ArrowRight') {
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
        showControls();
      }
    });

    // Swipe gestures: swipe up = next video, swipe down = close
    let swipeStartY = null;
    let swipeStartX = null;

    canvasOverlay.addEventListener('touchstart', function (e) {
      swipeStartY = e.touches[0].clientY;
      swipeStartX = e.touches[0].clientX;
    }, { passive: true });

    canvasOverlay.addEventListener('touchend', function (e) {
      if (swipeStartY === null) return;
      const dy = e.changedTouches[0].clientY - swipeStartY;
      const dx = e.changedTouches[0].clientX - swipeStartX;
      swipeStartY = null;
      swipeStartX = null;
      const absDy = Math.abs(dy);
      if (absDy > PV_SWIPE_THRESHOLD && absDy > Math.abs(dx)) {
        // dy < 0 means finger moved upward (swipe up) → advance to next video.
        // dy > 0 means finger moved downward (swipe down) → return to feed.
        if (dy < 0) {
          navigateImmersivePlayer(1);
        } else {
          navigateImmersivePlayer(-1);
        }
      }
    }, { passive: true });

    // Progress bar: pointer-based seeking (pointer events unify mouse and touch input)
    function getSeekFraction(e) {
      const rect = progressBar.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    }

    function applySeekFraction(frac) {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      const pct = frac * 100;
      progressPlayed.style.width = pct + '%';
      progressKnob.style.left = 'calc(' + pct + '% - 6px)';
      if (duration > 0) {
        video.currentTime = frac * duration;
      }
    }

    progressBar.addEventListener('pointerdown', function (e) {
      pvIsSeeking = true;
      progressBar.setPointerCapture(e.pointerId);
      applySeekFraction(getSeekFraction(e));
      showControls();
    });

    progressBar.addEventListener('pointermove', function (e) {
      if (!pvIsSeeking) return;
      applySeekFraction(getSeekFraction(e));
    });

    progressBar.addEventListener('pointerup', function (e) {
      if (!pvIsSeeking) return;
      pvIsSeeking = false;
      applySeekFraction(getSeekFraction(e));
      updateImmersiveControls();
    });

    progressBar.addEventListener('pointercancel', function () {
      pvIsSeeking = false;
      updateImmersiveControls();
    });

    // Store helpers via WeakMap to avoid polluting the DOM element with custom properties.
    pvPlayerHelpers.set(player, { updateControls: updateImmersiveControls, showControls: showControls });
  }

  function openImmersivePlayer(inlineVideo, article) {
    const player = getOrCreateImmersivePlayer();
    const pvVideo = player.querySelector('.pv-video');

    // Collect feed shells for swipe navigation
    pvFeedShells = Array.from(document.querySelectorAll('.post-video-shell[data-video-enhanced="true"]'));
    const thisShell = inlineVideo.closest('.post-video-shell');
    pvFeedIndex = thisShell ? pvFeedShells.indexOf(thisShell) : -1;

    pvActiveInlineVideo = inlineVideo;
    inlineVideo.pause();

    pvVideo.src = inlineVideo.src;
    pvVideo.currentTime = inlineVideo.currentTime;
    pvVideo.muted = false;
    pvVideo.playbackRate = pvPlaybackRate;

    pvSettingsOpen = false;
    const settingsPanel = player.querySelector('.pv-settings-panel');
    if (settingsPanel) settingsPanel.hidden = true;

    player.classList.add('open');
    player.classList.remove('pv-controls-hidden');

    pvVideo.play().catch(function () {});

    const helpers = pvPlayerHelpers.get(player);
    if (helpers) {
      helpers.updateControls();
      helpers.showControls();
    }
  }

  function closeImmersivePlayer() {
    if (!pvPlayer) return;
    const player = pvPlayer;
    const pvVideo = player.querySelector('.pv-video');

    pvVideo.pause();

    if (pvActiveInlineVideo) {
      pvActiveInlineVideo.currentTime = pvVideo.currentTime;
      pvActiveInlineVideo.muted = true;
      pvActiveInlineVideo.play().catch(function () {});
      pvActiveInlineVideo = null;
    }

    pvVideo.src = '';
    player.classList.remove('open');
    pvSettingsOpen = false;
    const settingsPanel = player.querySelector('.pv-settings-panel');
    if (settingsPanel) settingsPanel.hidden = true;
    if (pvControlsHideTimer) {
      clearTimeout(pvControlsHideTimer);
      pvControlsHideTimer = null;
    }
  }

  function navigateImmersivePlayer(direction) {
    const nextIndex = pvFeedIndex + direction;

    // Swipe down (direction -1) at the first video, or when feed index is invalid → close
    if (direction < 0 && (pvFeedIndex < 0 || nextIndex < 0)) {
      closeImmersivePlayer();
      return;
    }

    if (nextIndex < 0 || nextIndex >= pvFeedShells.length) {
      return;
    }

    const player = pvPlayer;
    if (!player) return;
    const pvVideo = player.querySelector('.pv-video');

    // Save position on the previous inline video
    if (pvActiveInlineVideo) {
      pvActiveInlineVideo.currentTime = pvVideo.currentTime;
      pvActiveInlineVideo.muted = true;
      pvActiveInlineVideo = null;
    }

    pvFeedIndex = nextIndex;
    const nextShell = pvFeedShells[pvFeedIndex];
    const nextVideo = nextShell ? nextShell.querySelector('.post-video') : null;
    if (!nextVideo) return;

    pvActiveInlineVideo = nextVideo;
    pvVideo.pause();
    pvVideo.src = nextVideo.src;
    pvVideo.currentTime = 0;
    pvVideo.muted = false;
    pvVideo.playbackRate = pvPlaybackRate;
    pvVideo.play().catch(function () {});

    const helpers = pvPlayerHelpers.get(player);
    if (helpers) {
      helpers.updateControls();
      helpers.showControls();
    }
  }



  async function buildArticleCompanionCard(post) {
    const ARTICLE_DOC_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
    const card = document.createElement('a');
    card.className = 'article-companion-card';
    card.href = 'articles.html?read=' + encodeURIComponent(post.articleId || '');

    if (post.articleCoverMediaId) {
      const mediaRecord = await getMediaRecord(post.articleCoverMediaId);
      const mediaSource = await getRenderableMediaSource(mediaRecord, { preferDataUrl: true });
      if (mediaSource && mediaSource.url) {
        const img = document.createElement('img');
        img.className = 'article-companion-cover';
        if (isSafeMediaUrl(mediaSource.url)) img.src = mediaSource.url;
        img.alt = escapeHtml(post.articleTitle || 'Article') + ' cover';
        img.loading = 'lazy';
        card.appendChild(img);
      }
    }

    const body = document.createElement('div');
    body.className = 'article-companion-body';

    const title = document.createElement('p');
    title.className = 'article-companion-title';
    title.textContent = post.articleTitle || 'Untitled Article';
    body.appendChild(title);

    if (post.articleExcerpt) {
      const excerpt = document.createElement('p');
      excerpt.className = 'article-companion-excerpt';
      excerpt.textContent = post.articleExcerpt;
      body.appendChild(excerpt);
    }

    const footer = document.createElement('p');
    footer.className = 'article-companion-footer';
    footer.innerHTML = ARTICLE_DOC_ICON + ' <span>Article</span>' + (post.articleReadTime ? ' <span class="article-companion-readtime">&middot; ' + escapeHtml(post.articleReadTime) + '</span>' : '');
    body.appendChild(footer);

    card.appendChild(body);
    return card;
  }

  async function buildMediaFragment(post) {
    const fragment = document.createDocumentFragment();
    const imageIds = Array.isArray(post.imageMediaIds) ? post.imageMediaIds : [];
    const altBase = post.text ? post.text.trim().replace(/\s+/g, ' ').split(' ').slice(0, 12).join(' ') : 'User upload';

    if (hasGifUrl(post) && isSafeMediaUrl(post.gifUrl)) {
      const gifGrid = document.createElement('div');
      gifGrid.className = 'post-media-grid g1 single';

      const gifItem = document.createElement('div');
      gifItem.className = 'post-media-item';

      const gifImage = document.createElement('img');
      gifImage.src = post.gifUrl;
      gifImage.alt = altBase + ' (GIF)';
      gifImage.loading = 'lazy';

      const gifTrigger = document.createElement('button');
      gifTrigger.className = 'post-media-button';
      gifTrigger.type = 'button';
      gifTrigger.setAttribute('aria-label', 'Open ' + gifImage.alt + ' in fullscreen viewer');
      gifTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openMediaViewer([{ type: 'image', src: post.gifUrl, label: gifImage.alt }], 0);
      });

      gifTrigger.appendChild(gifImage);
      gifItem.appendChild(gifTrigger);
      gifGrid.appendChild(gifItem);
      fragment.appendChild(gifGrid);
    }

    if (imageIds.length) {
      const mediaItems = [];
      for (let index = 0; index < imageIds.length; index += 1) {
        const mediaRecord = await getMediaRecord(imageIds[index]);
        const mediaSource = await getRenderableMediaSource(mediaRecord);
        if (!mediaSource || !mediaSource.url) {
          continue;
        }
        const mediaUrl = mediaSource.url;
        if (mediaSource.isObjectUrl) generatedMediaUrls.push(mediaUrl);
        mediaItems.push({
          type: 'image',
          src: mediaUrl,
          label: altBase + ' (image ' + (mediaItems.length + 1) + ' of ' + imageIds.length + ')'
        });
      }

      if (mediaItems.length) {
        const visibleMediaItems = mediaItems.slice(0, 4);
        const layoutCount = visibleMediaItems.length;
        const grid = document.createElement('div');
        grid.className = 'post-media-grid g' + layoutCount + (layoutCount === 1 ? ' single' : '');

        visibleMediaItems.forEach(function (mediaItem, index) {
          const item = document.createElement('div');
          item.className = 'post-media-item';

          const image = document.createElement('img');
          image.className = 'post-media-image';
          image.src = mediaItem.src;
          image.alt = mediaItem.label;
          image.loading = 'lazy';

          const trigger = document.createElement('button');
          trigger.className = 'post-media-button';
          trigger.type = 'button';
          trigger.setAttribute('aria-label', 'Open ' + image.alt + ' in fullscreen viewer');
          trigger.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            openMediaViewer(mediaItems, index);
          });

          if (layoutCount === 1) {
            const tallIndicator = document.createElement('span');
            tallIndicator.className = 'post-media-tall-indicator';
            tallIndicator.textContent = 'Show full image';
            tallIndicator.hidden = true;
            const applySingleImageLayout = function () {
              if (!image.naturalWidth || !image.naturalHeight) return;
              const isTall = image.naturalHeight / image.naturalWidth >= FEED_TALL_IMAGE_RATIO;
              item.classList.toggle('is-tall', isTall);
              tallIndicator.hidden = !isTall;
            };
            if (image.complete) {
              applySingleImageLayout();
            } else {
              image.addEventListener('load', applySingleImageLayout, { once: true });
            }
            trigger.appendChild(tallIndicator);
          }

          trigger.appendChild(image);
          item.appendChild(trigger);
          grid.appendChild(item);
        });
        fragment.appendChild(grid);
      }
    }

    if (post.videoMediaId) {
      const mediaRecord = await getMediaRecord(post.videoMediaId);
      const mediaSource = await getRenderableMediaSource(mediaRecord);
      if (mediaSource && mediaSource.url) {
        const mediaUrl = mediaSource.url;
        if (mediaSource.isObjectUrl) generatedMediaUrls.push(mediaUrl);

        const wrapper = document.createElement('div');
        wrapper.className = 'post-video-shell';

        const video = document.createElement('video');
        video.className = 'post-video';
        video.src = mediaUrl;
        video.setAttribute('aria-label', altBase + ' (video)');
        configurePostVideoElement(video);
        wrapper.appendChild(video);

        fragment.appendChild(wrapper);
      }
    }

    return fragment;
  }

  async function deletePost(postId) {
    const post = await getRecord(POSTS_STORE, postId);
    if (!post) {
      return;
    }
    if (!currentUser || post.userId !== currentUser.id) {
      throw new Error('You can only delete posts from your own account. Please verify you are logged in as the post owner.');
    }
    const mediaIds = [];
    if (Array.isArray(post.imageMediaIds)) {
      mediaIds.push(...post.imageMediaIds);
    }
    if (post.videoMediaId) {
      mediaIds.push(post.videoMediaId);
    }
    await Promise.all(mediaIds.map(function (id) {
      return deleteRecord(MEDIA_STORE, id);
    }));
    await deleteRecord(POSTS_STORE, postId);
    await refreshUserFacingViews();
  }

  async function renderSavedPosts() {
    if (!postFeed) return;
    clearGeneratedMediaUrls();
    postFeed.querySelectorAll('[data-user-generated="true"]').forEach(function (node) {
      node.remove();
    });

    const [accounts, posts] = await Promise.all([readAccounts(), readPosts()]);
    const accountMap = new Map(accounts.map(function (account) {
      return [account.id, account];
    }));
    const orderedPosts = posts.filter(function (post) {
      return isPostPublished(post);
    }).slice().sort(function (left, right) {
      return getPostPublishTimestamp(right) - getPostPublishTimestamp(left);
    });
    const anchor = postFeed.firstElementChild;

    for (let index = orderedPosts.length - 1; index >= 0; index -= 1) {
      const post = orderedPosts[index];
      const user = accountMap.get(post.userId);
      if (!user && !post.isRepost && !post.isStaticMirror) {
        continue;
      }

      const article = document.createElement('article');
      article.className = 'post-card';
      article.setAttribute('data-user-generated', 'true');
      article.setAttribute('data-post-id', post.id);

      if (post.isRepost && user) {
        const banner = document.createElement('div');
        banner.className = 'post-repost-banner';
        banner.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span>' + escapeHtml(user.name) + ' reposted</span>';
        article.appendChild(banner);
      }

      const header = document.createElement('div');
      header.className = 'post-header';

      const authorName = post.isRepost ? (post.repostAuthorName || 'Unknown') : (user ? user.name : (post.staticAuthorName || 'Unknown'));
      const authorHandle = post.isRepost ? (post.repostAuthorHandle || 'user') : (user ? user.username : (post.staticAuthorHandle || 'user'));
      const avatarBg = post.isRepost ? (post.repostAvatarBg || getAvatarColor(authorHandle)) : (post.staticAvatarBg || (user ? getAvatarColor(user.username) : '#888'));

      const avatar = document.createElement('div');
      avatar.className = 'post-avatar';
      avatar.style.background = avatarBg;
      avatar.textContent = getInitials(authorName, authorHandle);
      header.appendChild(avatar);

      const meta = document.createElement('div');
      meta.className = 'post-meta';

      const username = document.createElement('span');
      username.className = 'post-username';
      username.textContent = authorName;

      const handle = document.createElement('span');
      handle.className = 'post-handle';
      handle.textContent = formatPostMetaText(post, authorHandle);

      meta.appendChild(username);
      meta.appendChild(handle);
      header.appendChild(meta);
      article.appendChild(header);

      if (post.text) {
        const body = document.createElement('div');
        body.className = 'post-body';
        body.textContent = post.text;
        article.appendChild(body);
      }

      if (post.type === 'article') {
        const companionCard = await buildArticleCompanionCard(post);
        article.appendChild(companionCard);
      } else {
        const mediaFragment = await buildMediaFragment(post);
        if (mediaFragment.childNodes.length) {
          article.appendChild(mediaFragment);
        }

        const poll = buildPollElement(post);
        if (poll) {
          article.appendChild(poll);
        }
      }

      const actions = document.createElement('div');
      actions.className = 'post-actions';
      actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', true, 'like'));
      actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', false, 'comment'));
      actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>', false, 'repost'));
      actions.appendChild(createActionButton(null, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>', false, 'save'));
      if (currentUser && user && currentUser.id === post.userId && !post.isRepost && !post.isStaticMirror) {
        actions.appendChild(createDeletePostButton(post.id, summarizePost(post)));
      }
      article.appendChild(actions);
      initializeActionButtonCounts(article);
      article.querySelectorAll('.post-action[data-action="like"]').forEach(function (likeButton) {
        addLikeBehavior(likeButton);
      });
      enhancePostVideoPresentation(article);

      postFeed.insertBefore(article, anchor);
    }
    syncDashboardTriggers();
    syncPostActionStates();
  }

  function getSelectedImages() {
    return npcState.images.slice();
  }

  function getSelectedVideo() {
    return npcState.videoFile || null;
  }

  function getSelectedGifUrl() {
    return npcState.gifUrl || '';
  }

  function getSelectedPoll() {
    if (!npcState.poll) {
      return null;
    }

    const validOptions = npcState.poll.options.filter(function (opt) {
      return String(opt.text || '').trim().length > 0;
    });

    if (validOptions.length === 0) {
      return null;
    }

    if (validOptions.length < 2) {
      throw new Error('Please provide at least two poll answer options.');
    }

    return {
      question: 'Poll',
      options: validOptions.map(function (opt, index) {
        return {
          id: 'option-' + (index + 1),
          text: String(opt.text || '').trim(),
          votes: 0
        };
      }),
      durationMinutes: npcState.poll.durationMinutes || 1440,
      votesByUser: {}
    };
  }

  function getSelectedScheduleTimestamp() {
    if (!npcState.scheduledAt) {
      return null;
    }
    if (npcState.scheduledAt < Date.now()) {
      throw new Error('Scheduled posts must be set in the future.');
    }
    return npcState.scheduledAt;
  }

  function loadVideoDuration(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        const duration = video.duration;
        URL.revokeObjectURL(url);
        resolve(duration);
      };
      video.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read the selected video.'));
      };
      video.src = url;
    });
  }

  async function validatePostMedia(images, video) {
    if (images.length && video) {
      throw new Error('Posts can include images or one video, but not both at the same time.');
    }
    if (images.length > MAX_IMAGE_COUNT) {
      throw new Error('You can upload up to 10 images per post.');
    }

    for (let index = 0; index < images.length; index += 1) {
      if (images[index].size > MAX_IMAGE_SIZE) {
        throw new Error('Each image must be 10MB or smaller.');
      }
    }

    if (video) {
      const duration = await loadVideoDuration(video);
      if (!Number.isFinite(duration) || duration > MAX_VIDEO_DURATION_SECONDS) {
        throw new Error('Your video must be 10 minutes or shorter.');
      }
    }
  }

  async function savePost(text, images, video, extras) {
    const imageMediaIds = [];
    for (let index = 0; index < images.length; index += 1) {
      imageMediaIds.push(await putMediaFile(images[index]));
    }

    let videoMediaId = null;
    if (video) {
      videoMediaId = await putMediaFile(video);
    }

    const scheduledAt = extras && extras.scheduledAt ? extras.scheduledAt : null;
    const createdAt = Date.now();
    const postRecord = {
      id: generateId('post'),
      userId: currentUser.id,
      text: text,
      imageMediaIds: imageMediaIds,
      videoMediaId: videoMediaId,
      gifUrl: extras && extras.gifUrl ? extras.gifUrl : '',
      poll: extras && extras.poll ? extras.poll : null,
      scheduledAt: scheduledAt,
      createdAt: createdAt
    };
    await putRecord(POSTS_STORE, postRecord);
    // Scheduled posts stay hidden until publish time, so mention notifications are also
    // deferred for now instead of firing early before the post is visible.
    if (isPostPublished(postRecord)) {
      await addMentionNotifications(postRecord, text);
    }
  }

  async function renderAccountDashboard() {
    if (!dashboardRoot) return;
    dashboardRoot.innerHTML = '';
    if (!profileAvatar || !profileName || !profileHandle || !profileBio || !profileContactLink || !profileBirthday || !profileBirthdayItem || !profilePostTotal || !profileFollowersTotal || !profileFollowingTotal) {
      return;
    }

    clearGeneratedMediaUrls();
    const [posts, comments] = await Promise.all([readPosts(), readAllComments()]);
    const userPosts = currentUser ? posts.filter(function (post) {
      return post.userId === currentUser.id;
    }).sort(function (left, right) {
      return getPostPublishTimestamp(right) - getPostPublishTimestamp(left);
    }) : [];
    const userComments = currentUser ? comments.filter(function (comment) {
      return comment.userId === currentUser.id;
    }).sort(function (left, right) {
      return right.createdAt - left.createdAt;
    }) : [];
    document.title = currentUser ? (currentUser.name + ' — Account dashboard') : 'Account dashboard';
    const profileThemeColor = getAvatarColor(currentUser ? currentUser.username : 'guest');
    const bioValue = currentUser ? normalizeProfileBio(currentUser.profileBio) : '';
    const birthdayValue = currentUser ? String(currentUser.profileBirthday || '').trim() : '';
    const profileEmailValue = currentUser ? String(currentUser.profileEmail || '').trim().toLowerCase() : '';
    const followerCount = normalizeProfileMetric(currentUser ? currentUser.profileFollowers : 0);
    const followingCount = normalizeProfileMetric(currentUser ? currentUser.profileFollowing : 0);
    const hasProfileEmail = EMAIL_ADDRESS_PATTERN.test(profileEmailValue);

    if (profileBanner) {
      profileBanner.style.background = profileThemeColor;
    }
    profileAvatar.style.background = profileThemeColor;
    profileAvatar.textContent = currentUser ? getInitials(currentUser.name, currentUser.username) : 'YA';
    profileAvatar.setAttribute('aria-label', currentUser ? (currentUser.name + ' avatar') : 'Your account avatar');
    profileName.textContent = currentUser ? currentUser.name : 'Your account';
    profileHandle.textContent = currentUser ? formatHandle(currentUser.username) : '@yourprofile';
    profileBio.textContent = bioValue;
    profileBio.hidden = !bioValue;
    profileContactLink.textContent = hasProfileEmail ? profileEmailValue : '';
    profileContactLink.href = hasProfileEmail ? getSafeMailtoHref(profileEmailValue) : '#';
    profileBirthday.textContent = birthdayValue;
    if (profileContactItem) {
      profileContactItem.hidden = !hasProfileEmail;
    }
    if (profileBirthdayItem) {
      profileBirthdayItem.hidden = !birthdayValue;
    }
    profilePostTotal.textContent = String(userPosts.length);
    profileFollowersTotal.textContent = String(followerCount);
    profileFollowingTotal.textContent = String(followingCount);

    if (profileEditButton) {
      profileEditButton.textContent = currentUser ? 'Edit profile' : 'Log in';
      profileEditButton.onclick = async function () {
        if (!currentUser) {
          openAuthModal('login');
          return;
        }
        openProfileEditModal();
      };
    }

    profileContactLink.onclick = currentUser ? null : function (event) {
      event.preventDefault();
      openAuthModal('login');
    };

    await renderDashboardTabs(userPosts, posts, currentUser, userComments);
  }

  async function renderNotificationsPage() {
    if (!notificationsList) return;
    notificationsList.innerHTML = '';
    if (!currentUser) {
      const card = document.createElement('article');
      card.className = 'post-card post-card-empty';
      card.innerHTML = '<div class="post-empty-copy"><p class="post-empty-title">Log in to view notifications</p><p class="post-empty-description">Sign in to see likes, comments, reposts, saves, follows, and mentions for your account.</p></div>';
      notificationsList.appendChild(card);
      return;
    }
    const notifications = await readNotifications(currentUser.id);
    if (!notifications.length) {
      const empty = document.createElement('article');
      empty.className = 'post-card post-card-empty';
      empty.innerHTML = '<div class="post-empty-copy"><p class="post-empty-title">No notifications yet</p><p class="post-empty-description">When people interact with your posts or mention you, updates will appear here.</p></div>';
      notificationsList.appendChild(empty);
      return;
    }
    notifications.forEach(function (notification) {
      const item = document.createElement('article');
      item.className = 'post-card';
      const heading = document.createElement('p');
      heading.className = 'post-empty-title';
      heading.textContent = notification.message || 'New activity';
      const time = document.createElement('p');
      time.className = 'post-handle';
      time.textContent = formatLongDate(notification.createdAt);
      item.appendChild(heading);
      item.appendChild(time);
      notificationsList.appendChild(item);
    });
  }

  function navigateToDashboard() {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (isDashboardPage()) {
      renderAccountDashboard().catch(function () {
      });
      return;
    }
    window.location.href = ACCOUNT_DASHBOARD_PATH;
  }

  function navigateToNotifications() {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (getCurrentPageName() !== NOTIFICATIONS_PAGE_PATH) {
      window.location.href = NOTIFICATIONS_PAGE_PATH;
      return;
    }
    renderNotificationsPage().catch(function () {
    });
  }

  function navigateToMarketplace() {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (isDashboardPage()) {
      setDashboardTab('marketplace');
      return;
    }
    window.location.href = ACCOUNT_DASHBOARD_PATH + '#marketplace';
  }

  function attachAuthenticatedClickGuard(button, onAuthenticatedClick) {
    if (!button) return;
    button.addEventListener('click', function (event) {
      if (!currentUser) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      Promise.resolve(onAuthenticatedClick()).catch(function () {
      });
    }, true);
  }

  function attachAuthSubmitHandlers() {
    if (loginForm) {
      loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!loginForm.checkValidity()) {
          loginForm.reportValidity();
          setAuthStatus('Please enter a valid email and password.', 'error');
          return;
        }

        try {
          const email = String(document.getElementById('login-email') ? document.getElementById('login-email').value : '').trim().toLowerCase();
          const secret = String(document.getElementById('login-password') ? document.getElementById('login-password').value : '');
          const remember = Boolean(document.getElementById('remember-login') && document.getElementById('remember-login').checked);
          const accounts = await readAccounts();
          const account = accounts.find(function (candidate) {
            return candidate.email === email;
          });

          if (!account) {
            setAuthStatus('No account found for that email address.', 'error');
            return;
          }

          const verifier = await derivePasswordVerifier(secret, account.passwordSalt);
          if (account.passwordVerifier !== verifier) {
            setAuthStatus('Incorrect password. Please try again.', 'error');
            return;
          }

          currentUser = account;
          await setCurrentSession(account.id, remember);
          await refreshUserFacingViews();
          setAuthStatus('Logged in successfully.', 'success');
          setTimeout(closeAuthModal, 800);
        } catch (error) {
          setAuthStatus(error && error.message ? error.message : 'Unable to log in right now.', 'error');
        }
      }, true);
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!registerForm.checkValidity()) {
          registerForm.reportValidity();
          setAuthStatus('Please complete all required fields.', 'error');
          return;
        }

        const nameInput = document.getElementById('register-name');
        const usernameInput = document.getElementById('register-username');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        const termsInput = document.getElementById('accept-terms');

        const name = String(nameInput ? nameInput.value : '').trim();
        const username = String(usernameInput ? usernameInput.value : '').trim();
        const email = String(emailInput ? emailInput.value : '').trim().toLowerCase();
        const secret = String(passwordInput ? passwordInput.value : '');
        const confirmSecret = String(confirmPasswordInput ? confirmPasswordInput.value : '');

        if (name.length < 2) {
          setAuthStatus('Please enter your full name.', 'error');
          return;
        }

        if (username.length < 3) {
          setAuthStatus('Your username must be at least 3 characters long.', 'error');
          return;
        }

        if (termsInput && !termsInput.checked) {
          setAuthStatus('You must agree to the terms and privacy policy.', 'error');
          return;
        }

        if (secret !== confirmSecret) {
          setAuthStatus('Passwords do not match.', 'error');
          return;
        }

        try {
          const accounts = await readAccounts();
          const usernameKey = username.toLowerCase();
          if (accounts.some(function (account) { return account.usernameKey === usernameKey; })) {
            setAuthStatus('That username is already taken.', 'error');
            return;
          }

          if (accounts.some(function (account) { return account.email === email; })) {
            setAuthStatus('That email is already in use.', 'error');
            return;
          }

          const passwordSalt = secureRandomHex(16);
          const passwordVerifier = await derivePasswordVerifier(secret, passwordSalt);
          const account = {
            id: generateId('user'),
            name: name,
            username: username,
            usernameKey: usernameKey,
            email: email,
            profileBio: '',
            profileEmail: '',
            profileBirthday: '',
            profileFollowers: 0,
            profileFollowing: 0,
            passwordSalt: passwordSalt,
            passwordVerifier: passwordVerifier,
            createdAt: Date.now()
          };

          await putRecord(ACCOUNTS_STORE, account);
          currentUser = account;
          await setCurrentSession(account.id, true);
          await refreshUserFacingViews();
          registerForm.reset();
          setAuthStatus('Account created and logged in successfully.', 'success');
          setTimeout(closeAuthModal, 800);
        } catch (error) {
          setAuthStatus(error && error.message ? error.message : 'Unable to create your account right now.', 'error');
        }
      }, true);
    }
  }

  function attachNewPostHandler() {
    if (!newPostForm) return;
    newPostForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!currentUser) {
        setNewPostStatus('Please log in before creating a post.', 'error');
        openAuthModal('login');
        return;
      }

      const textInput = document.getElementById('new-post-text');
      const text = String(textInput ? textInput.value : '').trim();
      const images = getSelectedImages();
      const video = getSelectedVideo();

      try {
        const gifUrl = getSelectedGifUrl();
        const poll = getSelectedPoll();
        const scheduledAt = getSelectedScheduleTimestamp();
        if (gifUrl && !isSafeMediaUrl(gifUrl)) {
          setNewPostStatus('Add a valid GIF URL that starts with https://.', 'error');
          return;
        }
        if (!text && !images.length && !video && !gifUrl && !poll) {
          setNewPostStatus('Add text, images, a GIF, a poll, or a video before posting.', 'error');
          return;
        }
        await validatePostMedia(images, video);
        setNewPostStatus('Publishing post…', 'success');
        await savePost(text, images, video, {
          gifUrl: gifUrl,
          poll: poll,
          scheduledAt: scheduledAt
        });
        await refreshUserFacingViews();
        setNewPostStatus(scheduledAt ? `Post scheduled for ${formatLongDate(scheduledAt)}.` : 'Post published successfully.', 'success');
        setTimeout(closeNewPostModal, 800);
      } catch (error) {
        setNewPostStatus(error && error.message ? error.message : 'Unable to publish this post.', 'error');
      }
    }, true);
  }

  function attachAuthGuards() {
    attachAuthenticatedClickGuard(loginButton, function () {
      if (!window.location.pathname.endsWith('/index.html') && !window.location.pathname.endsWith('/')) {
        window.location.href = 'index.html';
      }
    });

    attachAuthenticatedClickGuard(registerButton, function () {
      return logout();
    });

    [headerProfileButton, headerNotificationsButton, stickyFooterProfileButton, stickyFooterNotificationsButton].forEach(function (button) {
      attachAuthenticatedClickGuard(button, function () {
        if (button === headerProfileButton || button === stickyFooterProfileButton) {
          navigateToDashboard();
        } else if (button === headerNotificationsButton || button === stickyFooterNotificationsButton) {
          navigateToNotifications();
        }
      });
    });

    if (stickyFooterMarketplaceButton && stickyFooterMarketplaceButton.getAttribute('data-marketplace-bound') !== 'true') {
      stickyFooterMarketplaceButton.setAttribute('data-marketplace-bound', 'true');
      stickyFooterMarketplaceButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigateToMarketplace();
      }, true);
    }
  }

  function attachDashboardTriggerHandlers() {
    document.addEventListener('click', function (event) {
      const trigger = event.target.closest('.post-avatar, .post-username');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      navigateToDashboard();
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const trigger = event.target && event.target.closest ? event.target.closest('.post-avatar, .post-username') : null;
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      navigateToDashboard();
    }, true);
  }

  function attachMediaViewerHandlers() {
    if (!mediaViewerModal) return;
    if (mediaViewerCloseButton) {
      mediaViewerCloseButton.addEventListener('click', closeMediaViewer);
    }
    if (mediaViewerPrevButton) {
      mediaViewerPrevButton.addEventListener('click', function () {
        goToMediaViewerIndex(mediaViewerState.index - 1);
      });
    }
    if (mediaViewerNextButton) {
      mediaViewerNextButton.addEventListener('click', function () {
        goToMediaViewerIndex(mediaViewerState.index + 1);
      });
    }
    mediaViewerModal.addEventListener('click', function (event) {
      if (event.target === mediaViewerModal) {
        closeMediaViewer();
      }
    });
    if (mediaViewerZoomInButton) {
      mediaViewerZoomInButton.addEventListener('click', function () {
        setMediaViewerScale(mediaViewerState.scale + MEDIA_ZOOM_INCREMENT);
      });
    }
    if (mediaViewerZoomOutButton) {
      mediaViewerZoomOutButton.addEventListener('click', function () {
        setMediaViewerScale(mediaViewerState.scale - MEDIA_ZOOM_INCREMENT);
      });
    }
    if (mediaViewerFitButton) {
      mediaViewerFitButton.addEventListener('click', function () {
        setMediaViewerScale(1);
      });
    }
    if (mediaViewerFullscreenButton) {
      mediaViewerFullscreenButton.addEventListener('click', function () {
        const target = mediaViewerContent ? mediaViewerContent.querySelector('.media-viewer-media') || mediaViewerModal : mediaViewerModal;
        requestElementFullscreen(target).catch(function () {
        });
      });
    }
    document.addEventListener('keydown', function (event) {
      if (!mediaViewerModal.classList.contains('open')) return;
      if (event.key === 'Escape') {
        closeMediaViewer();
      } else if (event.key === 'ArrowLeft') {
        goToMediaViewerIndex(mediaViewerState.index - 1);
      } else if (event.key === 'ArrowRight') {
        goToMediaViewerIndex(mediaViewerState.index + 1);
      }
    });
    mediaViewerModal.addEventListener('wheel', function (event) {
      if (mediaViewerState.type !== 'image') return;
      const now = Date.now();
      if (now - lastMediaWheelZoomAt < MEDIA_WHEEL_THROTTLE_MS) {
        return;
      }
      lastMediaWheelZoomAt = now;
      event.preventDefault();
      setMediaViewerScale(mediaViewerState.scale + (event.deltaY < 0 ? MEDIA_ZOOM_INCREMENT : -MEDIA_ZOOM_INCREMENT));
    }, { passive: false });
    if (mediaViewerContent) {
      mediaViewerContent.addEventListener('touchstart', function (event) {
        if (mediaViewerState.type !== 'image' || mediaViewerState.scale !== 1 || event.touches.length !== 1) {
          return;
        }
        const touch = event.touches[0];
        mediaViewerGestureState.active = true;
        mediaViewerGestureState.startX = touch.clientX;
        mediaViewerGestureState.startY = touch.clientY;
        mediaViewerGestureState.deltaX = 0;
        mediaViewerGestureState.deltaY = 0;
        mediaViewerGestureState.axis = '';
      }, { passive: true });
      mediaViewerContent.addEventListener('touchmove', function (event) {
        if (!mediaViewerGestureState.active || event.touches.length !== 1) {
          return;
        }
        const touch = event.touches[0];
        mediaViewerGestureState.deltaX = touch.clientX - mediaViewerGestureState.startX;
        mediaViewerGestureState.deltaY = touch.clientY - mediaViewerGestureState.startY;
        if (!mediaViewerGestureState.axis) {
          if (Math.abs(mediaViewerGestureState.deltaX) > MEDIA_VIEWER_GESTURE_DEADZONE || Math.abs(mediaViewerGestureState.deltaY) > MEDIA_VIEWER_GESTURE_DEADZONE) {
            mediaViewerGestureState.axis = Math.abs(mediaViewerGestureState.deltaX) > Math.abs(mediaViewerGestureState.deltaY) ? 'x' : 'y';
          } else {
            return;
          }
        }
        if (mediaViewerGestureState.axis === 'x' && mediaViewerState.items.length > 1) {
          event.preventDefault();
          setMediaViewerDragOffset(mediaViewerGestureState.deltaX, 0);
        } else if (mediaViewerGestureState.axis === 'y') {
          event.preventDefault();
          setMediaViewerDragOffset(0, mediaViewerGestureState.deltaY);
        }
      }, { passive: false });
      mediaViewerContent.addEventListener('touchend', function () {
        if (!mediaViewerGestureState.active) return;
        const deltaX = mediaViewerGestureState.deltaX;
        const deltaY = mediaViewerGestureState.deltaY;
        const axis = mediaViewerGestureState.axis;
        resetMediaViewerDragState();
        if (axis === 'x' && Math.abs(deltaX) >= MEDIA_VIEWER_SWIPE_THRESHOLD && mediaViewerState.items.length > 1) {
          goToMediaViewerIndex(mediaViewerState.index + (deltaX < 0 ? 1 : -1));
          return;
        }
        // Only downward swipe should dismiss on mobile to match fullscreen image UX.
        if (axis === 'y' && deltaY >= MEDIA_VIEWER_DISMISS_THRESHOLD) {
          closeMediaViewer();
        }
      });
      mediaViewerContent.addEventListener('touchcancel', resetMediaViewerDragState);
    }
  }

  function initAuthTabs() {
    authTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchAuthView(tab.getAttribute('data-auth-view'));
      }, true);
    });
  }

  function attachDashboardProfileHandlers() {
    profileTabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setDashboardTab(button.getAttribute('data-tab') || 'posts');
      });
    });
    if (profileEditCloseButton) {
      profileEditCloseButton.addEventListener('click', closeProfileEditModal);
    }
    if (profileEditCancelButton) {
      profileEditCancelButton.addEventListener('click', closeProfileEditModal);
    }
    if (profileEditModal) {
      profileEditModal.addEventListener('click', function (event) {
        if (event.target === profileEditModal) {
          closeProfileEditModal();
        }
      });
    }
    if (!profileEditEscapeHandlerAttached) {
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && profileEditModal && profileEditModal.classList.contains('open')) {
          closeProfileEditModal();
        }
      });
      profileEditEscapeHandlerAttached = true;
    }
    if (profileEditForm) {
      profileEditForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!currentUser) {
          closeProfileEditModal();
          return;
        }
        const nextName = String(profileEditNameInput ? profileEditNameInput.value : '').trim();
        const nextBio = String(profileEditBioInput ? profileEditBioInput.value : '').trim();
        if (nextName.length < PROFILE_NAME_MIN_LENGTH) {
          setProfileEditStatus('Name must be at least ' + PROFILE_NAME_MIN_LENGTH + ' characters long.', 'error');
          if (profileEditNameInput) {
            profileEditNameInput.focus();
          }
          return;
        }
        const updatedUser = Object.assign({}, currentUser, {
          name: nextName,
          profileBio: nextBio
        });
        try {
          await putRecord(ACCOUNTS_STORE, updatedUser);
          currentUser = updatedUser;
          setProfileEditStatus('Profile updated.', 'success');
          await refreshUserFacingViews();
          closeProfileEditModal();
        } catch (error) {
          setProfileEditStatus(error && error.message ? error.message : 'Unable to save your profile right now. Please try again later.', 'error');
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // New Post Composer (NPC) – state management and interactive behaviors
  // ─────────────────────────────────────────────────────────────────────────

  // GIF placeholder categories with sample entries.
  // To wire a live API: replace npcFetchGifs() with a fetch to
  //   https://tenor.googleapis.com/v2/search?q={query}&key={YOUR_TENOR_KEY}&limit=18
  // or https://api.giphy.com/v1/gifs/search?api_key={KEY}&q={query}&limit=18
  // and map the response items to { url, preview } objects.
  const NPC_GIF_CATEGORIES = [
    { label: 'Trending', emoji: '🔥', items: [] },
    { label: 'Reactions', emoji: '😂', items: [] },
    { label: 'Celebrations', emoji: '🎉', items: [] },
    { label: 'Love', emoji: '❤️', items: [] }
  ];

  const NPC_EMOJI_SETS = {
    'Smileys': ['😀','😂','🥹','😅','😊','😇','🤣','😄','😆','😋','😎','🤩','😏','🙃','😌','😍','🥰','😘','😗','🤗','😤','😢','😭','😱','😳','🤔','🤫','🫡','😶','😐','😑'],
    'People': ['👋','🤚','✋','👌','🤌','✌','🤞','👍','👎','👏','🙌','🤝','🫶','💪','🫂','🧑','👶','🧒','👦','👧','🧑','👱','👩','🧔'],
    'Nature': ['🌟','⭐','✨','💫','🌙','☀️','🌈','🌊','🔥','❄️','🌸','🌺','🌻','🌹','🍀','🌿','🐶','🐱','🐻','🦊','🐼','🐸','🐧'],
    'Food': ['🍕','🍔','🌮','🍣','🍜','🍰','🎂','🍩','🍪','☕','🍺','🥂','🍾','🧃','🥤','🍫','🍬','🍭','🥐','🍞','🥑','🍓'],
    'Activities': ['⚽','🏀','🎮','🎲','🎯','🎪','🎨','🎭','🎬','🎵','🎶','🎤','🎸','🎹','🏆','🥇','🎳','⛷','🏄','🤸','🧗'],
    'Symbols': ['❤️','💚','💙','💜','💛','🖤','🤍','💯','🔥','💥','✅','❌','⚠️','🚀','💡','🔑','💰','📱','💻','🎧','📷','🔔','📚','🌐']
  };

  function npcResetState() {
    npcState.images = [];
    npcState.videoFile = null;
    npcState.gifUrl = '';
    npcState.poll = null;
    npcState.scheduledAt = null;
    npcState.isUploading = false;
    const textarea = document.getElementById('new-post-text');
    if (textarea) {
      textarea.value = '';
      textarea.style.height = '';
    }
    npcRenderMediaPreview();
    npcHidePollPanel();
    npcUpdateCharCounter();
    npcUpdateSubmitButton();
    npcUpdateMediaButtonState();
    npcHideScheduleBadge();
    const dropdown = document.getElementById('npc-mention-dropdown');
    if (dropdown) dropdown.hidden = true;
    const picker = document.getElementById('npc-emoji-picker-popover');
    if (picker) picker.hidden = true;
    const gifModal = document.getElementById('npc-gif-modal');
    if (gifModal) gifModal.classList.remove('open');
    const schedModal = document.getElementById('npc-schedule-modal');
    if (schedModal) schedModal.classList.remove('open');
  }

  function npcUpdateCharCounter() {
    const textarea = document.getElementById('new-post-text');
    const ringFill = document.getElementById('npc-ring-fill');
    const charLabel = document.getElementById('npc-char-label');
    if (!textarea || !ringFill || !charLabel) return;

    const len = textarea.value.length;
    const remaining = NPC_CHAR_LIMIT - len;
    const pct = Math.min(len / NPC_CHAR_LIMIT, 1);
    const circumference = 100;
    const dashOffset = circumference - pct * circumference;

    ringFill.style.strokeDashoffset = String(dashOffset);
    const isOver = remaining < 0;
    const isWarning = remaining <= 20 && !isOver;

    ringFill.classList.toggle('over', isOver);

    if (isWarning || isOver) {
      charLabel.textContent = String(remaining);
      charLabel.classList.toggle('over', isOver);
    } else {
      charLabel.textContent = '';
      charLabel.classList.remove('over');
    }

    npcUpdateSubmitButton();
  }

  function npcUpdateSubmitButton() {
    const btn = document.getElementById('npc-submit-btn');
    if (!btn) return;

    const textarea = document.getElementById('new-post-text');
    const text = textarea ? textarea.value.trim() : '';
    const len = textarea ? textarea.value.length : 0;

    const hasContent = text.length > 0 || npcState.images.length > 0 ||
      npcState.videoFile || npcState.gifUrl || npcState.poll;
    const overLimit = len > NPC_CHAR_LIMIT;
    const uploading = npcState.isUploading;

    btn.disabled = !hasContent || overLimit || uploading;
  }

  function npcAutoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
  }

  function npcRenderMediaPreview() {
    const container = document.getElementById('npc-media-preview');
    if (!container) return;

    const allItems = npcState.images.concat(npcState.videoFile ? [npcState.videoFile] : []);
    if (!allItems.length && !npcState.gifUrl) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }

    container.hidden = false;
    container.innerHTML = '';

    if (npcState.gifUrl) {
      const gifWrap = document.createElement('div');
      gifWrap.className = 'npc-img-grid g1';
      const gifItem = document.createElement('div');
      gifItem.className = 'npc-img-item';
      const gifImg = document.createElement('img');
      gifImg.src = npcState.gifUrl;
      gifImg.alt = 'Selected GIF';
      gifImg.style.maxHeight = '280px';
      gifImg.style.objectFit = 'cover';
      const gifRemove = document.createElement('button');
      gifRemove.type = 'button';
      gifRemove.className = 'npc-img-remove';
      gifRemove.innerHTML = '&#10005;';
      gifRemove.setAttribute('aria-label', 'Remove GIF');
      gifRemove.addEventListener('click', function () {
        npcState.gifUrl = '';
        npcRenderMediaPreview();
        npcUpdateSubmitButton();
      });
      gifItem.appendChild(gifImg);
      gifItem.appendChild(gifRemove);
      gifWrap.appendChild(gifItem);
      container.appendChild(gifWrap);
      return;
    }

    const count = allItems.length;
    const gridClass = 'npc-img-grid g' + Math.min(count, 4);
    const grid = document.createElement('div');
    grid.className = gridClass;

    allItems.slice(0, NPC_MAX_IMAGES).forEach(function (file, idx) {
      const item = document.createElement('div');
      item.className = 'npc-img-item';

      const isVideo = file.type && file.type.startsWith('video/');
      // url is a browser-generated blob: URL from a local File object (not user text), safe to assign to src.
      const url = URL.createObjectURL(file);
      generatedMediaUrls.push(url);

      let media;
      if (isVideo) {
        media = document.createElement('video');
        media.src = url;
        media.muted = true;
        media.playsInline = true;
        media.preload = 'metadata';
      } else {
        media = document.createElement('img');
        media.src = url;
        media.alt = 'Attachment ' + (idx + 1);
      }
      item.appendChild(media);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'npc-img-remove';
      removeBtn.innerHTML = '&#10005;';
      removeBtn.setAttribute('aria-label', 'Remove attachment');
      const capturedIdx = idx;
      const capturedFile = file;
      removeBtn.addEventListener('click', function () {
        if (capturedFile === npcState.videoFile) {
          npcState.videoFile = null;
        } else {
          npcState.images = npcState.images.filter(function (f) { return f !== capturedFile; });
        }
        npcRenderMediaPreview();
        npcUpdateSubmitButton();
        npcUpdateMediaButtonState();
      });
      item.appendChild(removeBtn);
      grid.appendChild(item);
    });

    container.appendChild(grid);
  }

  function npcUpdateMediaButtonState() {
    const btn = document.getElementById('npc-media-btn');
    const input = document.getElementById('new-post-images');
    if (!btn) return;
    const hasImages = npcState.images.length > 0;
    const hasVideo = Boolean(npcState.videoFile);
    if (input) {
      input.accept = hasVideo ? 'video/*' : (hasImages ? 'image/*' : 'image/*,video/*');
    }
    btn.disabled = hasVideo || npcState.images.length >= NPC_MAX_IMAGES;
    let mediaButtonLabel = 'Add image or video';
    if (hasVideo) {
      mediaButtonLabel = 'Remove the current video before adding images.';
    } else if (hasImages) {
      mediaButtonLabel = 'Add more images';
    }
    btn.title = mediaButtonLabel;
    btn.setAttribute('aria-label', mediaButtonLabel);
  }

  function npcHidePollPanel() {
    const panel = document.getElementById('npc-poll-panel');
    if (panel) panel.hidden = true;
    npcState.poll = null;
  }

  function npcShowPollPanel() {
    const panel = document.getElementById('npc-poll-panel');
    if (!panel) return;
    panel.hidden = false;
    npcState.poll = { options: [{ text: '' }, { text: '' }], durationMinutes: 1440 };
    npcRenderPollChoices();
    npcUpdateSubmitButton();
    panel.querySelector('.npc-poll-choices input') && panel.querySelector('.npc-poll-choices input').focus();
  }

  function npcRenderPollChoices() {
    const container = document.getElementById('npc-poll-choices');
    if (!container || !npcState.poll) return;
    container.innerHTML = '';
    npcState.poll.options.forEach(function (opt, idx) {
      const row = document.createElement('div');
      row.className = 'npc-poll-choice-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'npc-poll-choice-input';
      input.placeholder = 'Choice ' + (idx + 1);
      input.maxLength = 25;
      input.value = opt.text || '';
      input.setAttribute('aria-label', 'Poll choice ' + (idx + 1));
      input.addEventListener('input', function () {
        if (npcState.poll && npcState.poll.options[idx]) {
          npcState.poll.options[idx].text = input.value;
        }
        npcUpdateSubmitButton();
      });
      row.appendChild(input);

      if (idx >= 2) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'npc-poll-choice-del';
        del.innerHTML = '&#10005;';
        del.setAttribute('aria-label', 'Remove choice ' + (idx + 1));
        del.addEventListener('click', function () {
          npcState.poll.options.splice(idx, 1);
          npcRenderPollChoices();
          npcUpdateAddOptionButton();
          npcUpdateSubmitButton();
        });
        row.appendChild(del);
      }

      container.appendChild(row);
    });
  }

  function npcUpdateAddOptionButton() {
    const btn = document.getElementById('npc-poll-add-btn');
    if (!btn || !npcState.poll) return;
    btn.disabled = npcState.poll.options.length >= 4;
  }

  function npcHideScheduleBadge() {
    const badge = document.getElementById('npc-schedule-badge');
    if (badge) badge.hidden = true;
  }

  function npcSetScheduleBadge(ts) {
    const badge = document.getElementById('npc-schedule-badge');
    if (!badge) return;
    if (!ts) {
      badge.hidden = true;
      return;
    }
    badge.hidden = false;
    const d = new Date(ts);
    const clockIcon = document.createElement('span');
    clockIcon.textContent = '🕐 ';
    const dateText = document.createTextNode(
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' '
    );
    const closeIcon = document.createElement('span');
    closeIcon.className = 'npc-badge-close';
    closeIcon.textContent = '\u2715';
    badge.innerHTML = '';
    badge.appendChild(clockIcon);
    badge.appendChild(dateText);
    badge.appendChild(closeIcon);
    badge.title = 'Scheduled for ' + d.toLocaleString();
    badge.onclick = function () {
      npcState.scheduledAt = null;
      npcHideScheduleBadge();
      npcUpdateSubmitButton();
    };
  }

  // ── GIF modal ─────────────────────────────────────────────────────────────
  function npcEnsureGifModal() {
    if (document.getElementById('npc-gif-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'npc-gif-modal';
    modal.className = 'npc-sub-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="npc-sub-panel" role="dialog" aria-modal="true" aria-labelledby="npc-gif-title">',
      '  <button type="button" class="npc-sub-close" id="npc-gif-close" aria-label="Close GIF search">&#10005;</button>',
      '  <p class="npc-sub-title" id="npc-gif-title">Search GIFs</p>',
      '  <div class="npc-gif-search-row">',
      '    <input type="search" id="npc-gif-search-input" class="npc-gif-search-input" placeholder="Search GIFs…" autocomplete="off" />',
      '  </div>',
      '  <div class="npc-gif-tabs" id="npc-gif-tabs"></div>',
      '  <div id="npc-gif-grid" class="npc-gif-grid"></div>',
      '  <div class="npc-gif-url-section">',
      '    <p class="npc-gif-url-label">Or paste a direct GIF URL:</p>',
      '    <div class="npc-gif-url-inputs">',
      '      <input type="url" id="npc-gif-url-paste" class="npc-gif-url-input" placeholder="https://example.com/animation.gif" />',
      '      <button type="button" class="npc-gif-url-btn" id="npc-gif-url-confirm">Add</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#npc-gif-close');
    closeBtn.addEventListener('click', function () { npcCloseGifModal(); });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) npcCloseGifModal();
    });

    const tabsEl = modal.querySelector('#npc-gif-tabs');
    NPC_GIF_CATEGORIES.forEach(function (cat, i) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'npc-gif-tab' + (i === 0 ? ' active' : '');
      btn.textContent = cat.emoji + ' ' + cat.label;
      btn.addEventListener('click', function () {
        tabsEl.querySelectorAll('.npc-gif-tab').forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        npcRenderGifGrid(cat.items);
      });
      tabsEl.appendChild(btn);
    });
    npcRenderGifGrid(NPC_GIF_CATEGORIES[0].items);

    const searchInput = modal.querySelector('#npc-gif-search-input');
    let searchTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        // Placeholder: in production, call the GIF API here with searchInput.value
        // e.g. fetch('https://tenor.googleapis.com/v2/search?q=' + encodeURIComponent(searchInput.value) + '&key=YOUR_TENOR_API_KEY&limit=18')
        npcRenderGifGrid([]);
      }, 350);
    });

    const urlPaste = modal.querySelector('#npc-gif-url-paste');
    const urlConfirm = modal.querySelector('#npc-gif-url-confirm');
    urlConfirm.addEventListener('click', function () {
      const url = urlPaste.value.trim();
      if (!url || !isSafeMediaUrl(url)) {
        setNewPostStatus('Please enter a valid GIF URL starting with https://.', 'error');
        return;
      }
      npcState.gifUrl = url;
      npcCloseGifModal();
      npcRenderMediaPreview();
      npcUpdateSubmitButton();
    });
  }

  function npcRenderGifGrid(items) {
    const grid = document.getElementById('npc-gif-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!items || !items.length) {
      const note = document.createElement('p');
      note.style.cssText = 'grid-column:1/-1;font-size:12px;color:var(--text-soft);text-align:center;padding:18px 0;';
      // Note: connect a GIF API (Tenor/Giphy) to populate live results here.
      note.textContent = 'GIF search requires an API key (Tenor or Giphy). Paste a direct GIF URL below to add one now.';
      grid.appendChild(note);
      return;
    }

    items.forEach(function (item) {
      const cell = document.createElement('div');
      cell.className = 'npc-gif-cell';
      if (item.url) {
        const img = document.createElement('img');
        img.src = item.preview || item.url;
        img.alt = item.label || 'GIF';
        img.loading = 'lazy';
        cell.appendChild(img);
      } else {
        cell.textContent = item.emoji || '🎞';
      }
      cell.addEventListener('click', function () {
        if (item.url) {
          npcState.gifUrl = item.url;
          npcCloseGifModal();
          npcRenderMediaPreview();
          npcUpdateSubmitButton();
        }
      });
      grid.appendChild(cell);
    });
  }

  function npcOpenGifModal() {
    npcEnsureGifModal();
    const modal = document.getElementById('npc-gif-modal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const input = modal.querySelector('#npc-gif-search-input');
    if (input) { input.value = ''; input.focus(); }
    const urlInput = modal.querySelector('#npc-gif-url-paste');
    if (urlInput) urlInput.value = '';
  }

  function npcCloseGifModal() {
    const modal = document.getElementById('npc-gif-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // ── Emoji picker ──────────────────────────────────────────────────────────
  function npcEnsureEmojiPicker() {
    if (document.getElementById('npc-emoji-picker-popover')) return;
    const picker = document.createElement('div');
    picker.id = 'npc-emoji-picker-popover';
    picker.className = 'npc-emoji-picker';
    picker.hidden = true;
    picker.setAttribute('role', 'dialog');
    picker.setAttribute('aria-label', 'Emoji picker');

    const cats = Object.keys(NPC_EMOJI_SETS);
    const catsRow = document.createElement('div');
    catsRow.className = 'npc-emoji-cats';

    const gridEl = document.createElement('div');
    gridEl.className = 'npc-emoji-grid';

    function showCat(catName) {
      gridEl.innerHTML = '';
      (NPC_EMOJI_SETS[catName] || []).forEach(function (emoji) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'npc-emoji-btn';
        btn.textContent = emoji;
        btn.setAttribute('aria-label', emoji);
        btn.addEventListener('click', function () {
          npcInsertEmoji(emoji);
          picker.hidden = true;
        });
        gridEl.appendChild(btn);
      });
      catsRow.querySelectorAll('.npc-emoji-cat-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-cat') === catName);
      });
    }

    cats.forEach(function (catName, i) {
      const catBtn = document.createElement('button');
      catBtn.type = 'button';
      catBtn.className = 'npc-emoji-cat-btn' + (i === 0 ? ' active' : '');
      catBtn.setAttribute('data-cat', catName);
      catBtn.textContent = catName;
      catBtn.addEventListener('click', function () { showCat(catName); });
      catsRow.appendChild(catBtn);
    });

    picker.appendChild(catsRow);
    picker.appendChild(gridEl);
    showCat(cats[0]);
    document.body.appendChild(picker);

    document.addEventListener('click', function (e) {
      if (!picker.hidden && !picker.contains(e.target) && e.target.id !== 'npc-emoji-btn') {
        picker.hidden = true;
      }
    }, true);
  }

  function npcInsertEmoji(emoji) {
    const textarea = document.getElementById('new-post-text');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = before + emoji + after;
    const newPos = start + emoji.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  }

  function npcToggleEmojiPicker() {
    npcEnsureEmojiPicker();
    const picker = document.getElementById('npc-emoji-picker-popover');
    const btn = document.getElementById('npc-emoji-btn');
    if (!picker || !btn) return;
    picker.hidden = !picker.hidden;
    if (!picker.hidden) {
      const rect = btn.getBoundingClientRect();
      const pickerW = 300;
      let left = rect.left;
      if (left + pickerW > window.innerWidth - 10) {
        left = window.innerWidth - pickerW - 10;
      }
      picker.style.position = 'fixed';
      picker.style.left = Math.max(10, left) + 'px';
      picker.style.top = (rect.top - picker.offsetHeight - 8) + 'px';
      if (parseFloat(picker.style.top) < 10) {
        picker.style.top = (rect.bottom + 8) + 'px';
      }
    }
  }

  // ── Schedule modal ─────────────────────────────────────────────────────────
  function npcEnsureScheduleModal() {
    if (document.getElementById('npc-schedule-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'npc-schedule-modal';
    modal.className = 'npc-sub-modal';
    modal.setAttribute('aria-hidden', 'true');

    const now = new Date();
    now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 30));
    const pad = function (n) { return String(n).padStart(2, '0'); };
    const defaultVal = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
      'T' + pad(now.getHours()) + ':' + pad(now.getMinutes());

    modal.innerHTML = [
      '<div class="npc-sub-panel" role="dialog" aria-modal="true" aria-labelledby="npc-sched-title">',
      '  <button type="button" class="npc-sub-close" id="npc-sched-close" aria-label="Close schedule picker">&#10005;</button>',
      '  <p class="npc-sub-title" id="npc-sched-title">Schedule Post</p>',
      '  <p class="npc-schedule-modal-note">Your post will be saved and published at the chosen time. Scheduled posts appear in your feed when published.</p>',
      '  <label class="npc-sched-label" for="npc-sched-dt">Date &amp; time</label>',
      '  <input type="datetime-local" id="npc-sched-dt" class="npc-sched-input" value="' + defaultVal + '" />',
      '  <br/>',
      '  <button type="button" class="npc-sched-btn" id="npc-sched-confirm">Confirm schedule</button>',
      '  <button type="button" class="npc-sched-clear" id="npc-sched-clear">Remove schedule</button>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);

    modal.querySelector('#npc-sched-close').addEventListener('click', function () { npcCloseScheduleModal(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) npcCloseScheduleModal(); });

    modal.querySelector('#npc-sched-confirm').addEventListener('click', function () {
      const dt = modal.querySelector('#npc-sched-dt').value;
      if (!dt) { return; }
      const ts = new Date(dt).getTime();
      if (!Number.isFinite(ts) || ts <= Date.now()) {
        setNewPostStatus('Please choose a future date and time.', 'error');
        return;
      }
      npcState.scheduledAt = ts;
      npcSetScheduleBadge(ts);
      npcUpdateSubmitButton();
      npcCloseScheduleModal();
    });

    modal.querySelector('#npc-sched-clear').addEventListener('click', function () {
      npcState.scheduledAt = null;
      npcHideScheduleBadge();
      npcUpdateSubmitButton();
      npcCloseScheduleModal();
    });
  }

  function npcOpenScheduleModal() {
    npcEnsureScheduleModal();
    const modal = document.getElementById('npc-schedule-modal');
    if (!modal) return;
    if (npcState.scheduledAt) {
      const dt = modal.querySelector('#npc-sched-dt');
      if (dt) {
        const d = new Date(npcState.scheduledAt);
        const pad = function (n) { return String(n).padStart(2, '0'); };
        dt.value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
          'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      }
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function npcCloseScheduleModal() {
    const modal = document.getElementById('npc-schedule-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // ── @ mention dropdown ────────────────────────────────────────────────────
  let npcMentionState = { active: false, query: '', start: 0, kbdIndex: -1 };

  function npcHandleMentionInput(textarea) {
    const val = textarea.value;
    const cursor = textarea.selectionStart;
    const textBefore = val.slice(0, cursor);
    const atMatch = textBefore.match(/@([a-zA-Z0-9_]*)$/);

    if (!atMatch) {
      npcMentionState.active = false;
      npcHideMentionDropdown();
      return;
    }

    npcMentionState.active = true;
    npcMentionState.query = atMatch[1];
    npcMentionState.start = cursor - atMatch[0].length;
    npcMentionState.kbdIndex = -1;

    readAccounts().then(function (accounts) {
      const q = npcMentionState.query.toLowerCase();
      const matches = accounts.filter(function (a) {
        return (
          String(a.username || '').toLowerCase().startsWith(q) ||
          String(a.name || '').toLowerCase().startsWith(q)
        );
      }).slice(0, 6);
      npcShowMentionDropdown(matches, textarea);
    }).catch(function () {
      npcHideMentionDropdown();
    });
  }

  function npcShowMentionDropdown(accounts, textarea) {
    const dropdown = document.getElementById('npc-mention-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';

    if (!accounts.length) {
      dropdown.hidden = true;
      return;
    }

    accounts.forEach(function (account, idx) {
      const item = document.createElement('div');
      item.className = 'npc-mention-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-idx', idx);

      const avatar = document.createElement('div');
      avatar.className = 'npc-mention-avatar';
      avatar.style.background = getAvatarColor(account.username || account.id);
      avatar.textContent = getInitials(account.name, account.username);

      const meta = document.createElement('div');
      meta.className = 'npc-mention-meta';
      const name = document.createElement('span');
      name.className = 'npc-mention-name';
      name.textContent = account.name || account.username;
      const handle = document.createElement('span');
      handle.className = 'npc-mention-handle';
      handle.textContent = formatHandle(account.username);
      meta.appendChild(name);
      meta.appendChild(handle);

      item.appendChild(avatar);
      item.appendChild(meta);

      item.addEventListener('mousedown', function (e) {
        e.preventDefault();
        npcInsertMention(account.username, textarea);
      });

      dropdown.appendChild(item);
    });

    dropdown.hidden = false;
  }

  function npcHideMentionDropdown() {
    const dropdown = document.getElementById('npc-mention-dropdown');
    if (dropdown) dropdown.hidden = true;
    npcMentionState.active = false;
  }

  function npcInsertMention(username, textarea) {
    if (!textarea) return;
    const val = textarea.value;
    const before = val.slice(0, npcMentionState.start);
    const after = val.slice(textarea.selectionStart);
    const mention = '@' + username + ' ';
    textarea.value = before + mention + after;
    const newPos = before.length + mention.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    npcHideMentionDropdown();
    textarea.focus();
  }

  // ── Main init ─────────────────────────────────────────────────────────────
  function initNewPostComposer() {
    const textarea = document.getElementById('new-post-text');
    if (!textarea) return;

    // Auto-resize
    textarea.addEventListener('input', function () {
      npcAutoResizeTextarea(textarea);
      npcUpdateCharCounter();
      npcHandleMentionInput(textarea);
    });

    // Keyboard navigation for mention dropdown
    textarea.addEventListener('keydown', function (e) {
      const dropdown = document.getElementById('npc-mention-dropdown');
      if (!dropdown || dropdown.hidden || !npcMentionState.active) return;
      const items = Array.from(dropdown.querySelectorAll('.npc-mention-item'));
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        npcMentionState.kbdIndex = (npcMentionState.kbdIndex + 1) % items.length;
        items.forEach(function (item, i) { item.classList.toggle('kbd-active', i === npcMentionState.kbdIndex); });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        npcMentionState.kbdIndex = (npcMentionState.kbdIndex - 1 + items.length) % items.length;
        items.forEach(function (item, i) { item.classList.toggle('kbd-active', i === npcMentionState.kbdIndex); });
      } else if ((e.key === 'Enter' || e.key === 'Tab') && npcMentionState.kbdIndex >= 0) {
        e.preventDefault();
        const selected = items[npcMentionState.kbdIndex];
        if (selected) selected.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      } else if (e.key === 'Escape') {
        npcHideMentionDropdown();
      }
    });

    // Media button
    const mediaBtn = document.getElementById('npc-media-btn');
    const mediaInput = document.getElementById('new-post-images');
    if (mediaBtn && mediaInput) {
      mediaBtn.addEventListener('click', function () {
        if (mediaBtn.disabled) {
          return;
        }
        mediaInput.value = '';
        mediaInput.click();
      });
      mediaInput.addEventListener('change', function () {
        const files = Array.from(mediaInput.files || []);
        const selectedImages = files.filter(function (file) {
          return file.type.startsWith('image/');
        });
        const selectedVideos = files.filter(function (file) {
          return file.type.startsWith('video/');
        });
        if (selectedImages.length && selectedVideos.length) {
          setNewPostStatus('Choose images or one video for a post, not both together.', 'error');
          npcUpdateMediaButtonState();
          return;
        }
        if (selectedVideos.length) {
          if (npcState.images.length) {
            setNewPostStatus('Remove the selected images before adding a video.', 'error');
            npcUpdateMediaButtonState();
            return;
          }
          npcState.videoFile = selectedVideos[0];
          setNewPostStatus(selectedVideos.length > 1 ? 'Only the first selected video was added.' : '', selectedVideos.length > 1 ? 'error' : '');
        } else if (selectedImages.length) {
          if (npcState.videoFile) {
            setNewPostStatus('Remove the selected video before adding images.', 'error');
            npcUpdateMediaButtonState();
            return;
          }
          const openSlots = Math.max(0, NPC_MAX_IMAGES - npcState.images.length);
          selectedImages.slice(0, openSlots).forEach(function (file) {
            npcState.images.push(file);
          });
          if (selectedImages.length > openSlots) {
            setNewPostStatus('You can attach up to ' + NPC_MAX_IMAGES + ' images per post.', 'error');
          } else {
            setNewPostStatus('');
          }
        }
        npcRenderMediaPreview();
        npcUpdateSubmitButton();
        npcUpdateMediaButtonState();
      });
    }

    // GIF button
    const gifBtn = document.getElementById('npc-gif-btn');
    if (gifBtn) {
      gifBtn.addEventListener('click', function () {
        npcOpenGifModal();
      });
    }

    // Poll button
    const pollBtn = document.getElementById('npc-poll-btn');
    if (pollBtn) {
      pollBtn.addEventListener('click', function () {
        const panel = document.getElementById('npc-poll-panel');
        if (panel && !panel.hidden) {
          npcHidePollPanel();
          npcUpdateSubmitButton();
        } else {
          npcShowPollPanel();
        }
      });
    }

    // Poll remove
    const pollRemoveBtn = document.getElementById('npc-poll-remove-btn');
    if (pollRemoveBtn) {
      pollRemoveBtn.addEventListener('click', function () {
        npcHidePollPanel();
        npcUpdateSubmitButton();
      });
    }

    // Poll add option
    const pollAddBtn = document.getElementById('npc-poll-add-btn');
    if (pollAddBtn) {
      pollAddBtn.addEventListener('click', function () {
        if (!npcState.poll || npcState.poll.options.length >= 4) return;
        npcState.poll.options.push({ text: '' });
        npcRenderPollChoices();
        npcUpdateAddOptionButton();
        const choices = document.getElementById('npc-poll-choices');
        if (choices) {
          const inputs = choices.querySelectorAll('input');
          if (inputs.length) inputs[inputs.length - 1].focus();
        }
      });
    }

    // Poll duration
    const pollDuration = document.getElementById('new-post-poll-duration');
    if (pollDuration) {
      pollDuration.addEventListener('change', function () {
        if (npcState.poll) {
          npcState.poll.durationMinutes = parseInt(pollDuration.value, 10) || 1440;
        }
      });
    }

    // Emoji button
    const emojiBtn = document.getElementById('npc-emoji-btn');
    if (emojiBtn) {
      emojiBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        npcToggleEmojiPicker();
      });
    }

    // Schedule button
    const scheduleBtn = document.getElementById('npc-schedule-btn');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', function () {
        npcOpenScheduleModal();
      });
    }

    // Audience select
    const audienceSelect = document.getElementById('npc-audience-select');
    if (audienceSelect) {
      audienceSelect.addEventListener('change', function () {
        // audience is metadata on the post; stored here for future API use
      });
    }

    // Initial state
    npcUpdateCharCounter();
    npcUpdateSubmitButton();
  }

  async function initSharedHandlers() {
    injectNameField();
    initAuthTabs();
    attachDashboardProfileHandlers();
    attachAuthSubmitHandlers();
    attachNewPostHandler();
    attachAuthGuards();
    attachDashboardTriggerHandlers();
    attachMediaViewerHandlers();
    attachPostInteractionHandlers();
    initNewPostComposer();
    await syncCurrentUserFromSession();
  }

  window.handlePlusClick = function () {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (typeof window.openNewPost === 'function') {
      window.openNewPost();
      return;
    }
    const modal = document.getElementById('new-post-modal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  window.npcResetState = npcResetState;

  initSharedHandlers().catch(function (error) {
    if (authStatus) {
      setAuthStatus(error && error.message ? error.message : 'Unable to initialize account features.', 'error');
    }
  });
})();
