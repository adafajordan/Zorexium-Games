(function () {
  const DB_NAME = 'zorexium-app-db';
  const DB_VERSION = 3;
  const ACCOUNTS_STORE = 'accounts';
  const POSTS_STORE = 'posts';
  const SESSION_STORE = 'session';
  const MEDIA_STORE = 'media';
  const COMMENTS_STORE = 'comments';
  const NOTIFICATIONS_STORE = 'notifications';
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
  const VIDEO_SEEK_MAX_VALUE = 1000;
  const PASSWORD_ITERATIONS = 600000;
  const PROFILE_NAME_MIN_LENGTH = 2;
  const EMAIL_ADDRESS_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
  const MENTION_PATTERN = /@([a-zA-Z0-9_]+)/g;
  const LEGACY_PROFILE_BIO_MESSAGE = 'Welcome back, user. Your posts, replies, articles, and media all update here automatically';

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
  const notificationsList = document.getElementById('notifications-list');

  let currentUser = null;
  let appDbPromise = null;
  let generatedMediaUrls = [];
  let lastMediaWheelZoomAt = 0;
  let profileEditEscapeHandlerAttached = false;
  let activeDashboardTab = 'posts';
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
    type: null,
    src: '',
    label: ''
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
    transaction.objectStore(storeName).put(record);
    await transactionDone(transaction);
  }

  async function deleteRecord(storeName, key) {
    const database = await openAppDb();
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(key);
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
      const mediaGrid = article.querySelector('.post-media-grid');
      const mediaWrapper = article.querySelector('.post-media-wrapper');
      const videoShell = article.querySelector('.post-video-shell');
      if (repostBanner) postContainer.appendChild(repostBanner.cloneNode(true));
      if (header) postContainer.appendChild(header.cloneNode(true));
      if (body) postContainer.appendChild(body.cloneNode(true));
      if (imagePlaceholder) postContainer.appendChild(imagePlaceholder.cloneNode(true));
      if (mediaGrid) postContainer.appendChild(mediaGrid.cloneNode(true));
      if (mediaWrapper) postContainer.appendChild(mediaWrapper.cloneNode(true));
      if (videoShell) {
        const videoShellClone = videoShell.cloneNode(true);
        videoShellClone.removeAttribute('data-video-enhanced');
        videoShellClone.querySelectorAll('.post-video-center-play, .post-video-controls').forEach(function (node) {
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
      if (event.target.closest('.post-actions, .post-comment-box, .post-media-toolbar, [data-action], .post-detail-modal')) {
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
    return /^blob:/i.test(String(url || ''));
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
    return (Array.isArray(post.imageMediaIds) && post.imageMediaIds.length > 0) || Boolean(post.videoMediaId);
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
        return String(post.text || '').trim().length >= 180;
      }),
      media: userPosts.filter(function (post) {
        return hasPostMedia(post);
      }),
      likes: [],
      saved: savedPosts,
      marketplace: []
    };
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
    handle.textContent = formatHandle(authorHandle) + ' · ' + formatRelativeTime(post.createdAt);
    meta.appendChild(handle);

    header.appendChild(meta);
    article.appendChild(header);

    if (post.text) {
      const body = document.createElement('div');
      body.className = 'post-body';
      body.textContent = post.text;
      article.appendChild(body);
    }

    const mediaFragment = await buildMediaFragment(post);
    if (mediaFragment.childNodes.length) {
      article.appendChild(mediaFragment);
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
    }
    if (notificationsList) {
      await renderNotificationsPage();
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

  async function putMediaFile(file) {
    const record = {
      id: generateId('media'),
      blob: file,
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: Date.now()
    };
    await putRecord(MEDIA_STORE, record);
    return record.id;
  }

  async function getMediaRecord(id) {
    return getRecord(MEDIA_STORE, id);
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

  function setMediaViewerScale(scale) {
    if (!mediaViewerContent) return;
    const nextScale = Math.min(MAX_MEDIA_SCALE, Math.max(MIN_MEDIA_SCALE, scale));
    mediaViewerState.scale = nextScale;
    const mediaElement = mediaViewerContent.querySelector('.media-viewer-media');
    if (!mediaElement || mediaViewerState.type !== 'image') {
      return;
    }
    mediaElement.style.transform = 'scale(' + nextScale + ')';
    mediaElement.style.transformOrigin = 'center center';
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
    mediaViewerState = {
      scale: 1,
      type: null,
      src: '',
      label: ''
    };
  }

  async function requestElementFullscreen(element) {
    if (!element) return;
    const requestFn = element.requestFullscreen || element.webkitRequestFullscreen;
    if (typeof requestFn === 'function') {
      try {
        const result = requestFn.call(element);
        if (result && typeof result.catch === 'function') {
          await result;
        }
      } catch (error) {
        // iOS Safari doesn't support requestFullscreen on any element;
        // fall back to the video-native webkitEnterFullscreen API.
        if (element.tagName === 'VIDEO' && typeof element.webkitEnterFullscreen === 'function') {
          element.webkitEnterFullscreen();
          return;
        }
        setInterfaceStatus('Fullscreen mode could not be opened.', 'error');
        throw error;
      }
      return;
    }
    // iOS: no requestFullscreen at all – use video-native API when available.
    if (element.tagName === 'VIDEO' && typeof element.webkitEnterFullscreen === 'function') {
      element.webkitEnterFullscreen();
      return;
    }
    setInterfaceStatus('Fullscreen mode is not supported in this browser.', 'error');
  }

  function openMediaViewer(type, src, label) {
    if (!mediaViewerModal || !mediaViewerContent) return;
    mediaViewerState = {
      scale: 1,
      type: type,
      src: src,
      label: label || 'Media viewer'
    };
    if (!isSafeMediaUrl(src)) {
      setInterfaceStatus('This media could not be opened safely.', 'error');
      return;
    }
    mediaViewerContent.innerHTML = '';
    if (mediaViewerTitle) {
      mediaViewerTitle.textContent = mediaViewerState.label;
    }
    const mediaElement = document.createElement(type === 'video' ? 'video' : 'img');
    mediaElement.className = 'media-viewer-media';
    mediaElement.src = src;
    if (type === 'video') {
      mediaElement.controls = true;
      mediaElement.preload = 'metadata';
      mediaElement.setAttribute('playsinline', 'true');
      mediaElement.setAttribute('aria-label', mediaViewerState.label);
    } else {
      mediaElement.alt = mediaViewerState.label;
    }
    mediaViewerContent.appendChild(mediaElement);
    mediaViewerModal.classList.add('open');
    mediaViewerModal.setAttribute('aria-hidden', 'false');
    setMediaViewerScale(1);
    if (mediaViewerZoomInButton) {
      mediaViewerZoomInButton.disabled = type !== 'image';
    }
    if (mediaViewerZoomOutButton) {
      mediaViewerZoomOutButton.disabled = type !== 'image';
    }
    if (mediaViewerFitButton) {
      mediaViewerFitButton.disabled = type !== 'image';
    }
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

  function enhancePostVideoPresentation(article) {
    if (!article) return;
    article.querySelectorAll('.post-video-shell').forEach(function (shell) {
      if (shell.getAttribute('data-video-enhanced') === 'true') return;
      shell.setAttribute('data-video-enhanced', 'true');
      const video = shell.querySelector('.post-video');
      if (!video) return;
      shell.style.position = 'relative';

      const controls = document.createElement('div');
      controls.className = 'post-video-controls';

      // ── Fullscreen post-info overlay ─────────────────────────────
      const fsInfo = document.createElement('div');
      fsInfo.className = 'post-video-fs-info';

      const articleAvatar = article.querySelector('.post-avatar');
      const articleUsername = article.querySelector('.post-username');
      const articleHandle = article.querySelector('.post-handle');
      const articleBody = article.querySelector('.post-body');

      const fsUserRow = document.createElement('div');
      fsUserRow.className = 'post-video-fs-user-row';

      if (articleAvatar) {
        const fsAvatar = document.createElement('div');
        fsAvatar.className = 'post-video-fs-avatar';
        fsAvatar.style.cssText = articleAvatar.style.cssText;
        fsAvatar.textContent = articleAvatar.textContent;
        fsUserRow.appendChild(fsAvatar);
      }

      const fsUserMeta = document.createElement('div');
      fsUserMeta.className = 'post-video-fs-user-meta';
      if (articleUsername) {
        const fsName = document.createElement('span');
        fsName.className = 'post-video-fs-name';
        fsName.textContent = articleUsername.textContent;
        fsUserMeta.appendChild(fsName);
      }
      if (articleHandle) {
        // handle.textContent is formatted as "@user · 2h" — split on · to get just the handle
        const rawHandle = articleHandle.textContent.split('·')[0].trim();
        const fsHandle = document.createElement('span');
        fsHandle.className = 'post-video-fs-handle';
        fsHandle.textContent = rawHandle;
        fsUserMeta.appendChild(fsHandle);
      }
      fsUserRow.appendChild(fsUserMeta);
      fsInfo.appendChild(fsUserRow);

      if (articleBody && articleBody.textContent.trim()) {
        const fsText = document.createElement('div');
        fsText.className = 'post-video-fs-text';
        fsText.textContent = articleBody.textContent.trim();
        fsInfo.appendChild(fsText);
      }

      const fsActions = document.createElement('div');
      fsActions.className = 'post-video-fs-actions';
      const fsBtnDefs = [
        { action: 'comment', label: 'Comment', svg: VIDEO_FS_ICON_COMMENT },
        { action: 'repost', label: 'Repost', svg: VIDEO_FS_ICON_REPOST },
        { action: 'like', label: 'Like', svg: VIDEO_FS_ICON_LIKE },
        { action: 'save', label: 'Save', svg: VIDEO_FS_ICON_SAVE },
      ];
      fsBtnDefs.forEach(function (def) {
        const articleBtn = article.querySelector('.post-action[data-action="' + def.action + '"]');
        if (!articleBtn) return;
        const btn = document.createElement('button');
        btn.className = 'post-video-fs-action-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', def.label);
        btn.innerHTML = def.svg;
        const countEl = articleBtn.querySelector('.post-action-count');
        let countSpan = null;
        if (countEl) {
          countSpan = document.createElement('span');
          countSpan.className = 'post-video-fs-action-count';
          countSpan.textContent = countEl.textContent || '';
          btn.appendChild(countSpan);
        }
        btn.addEventListener('click', function () {
          articleBtn.click();
          if (countSpan) {
            const updated = articleBtn.querySelector('.post-action-count');
            if (updated) countSpan.textContent = updated.textContent;
          }
        });
        fsActions.appendChild(btn);
      });
      fsInfo.appendChild(fsActions);

      // ── Seek bar ─────────────────────────────────────────────────
      const seek = document.createElement('input');
      seek.className = 'post-video-seek';
      seek.type = 'range';
      seek.min = '0';
      seek.max = String(VIDEO_SEEK_MAX_VALUE);
      seek.step = '1';
      seek.value = '0';
      seek.setAttribute('aria-label', 'Seek video');

      // ── Controls row ─────────────────────────────────────────────
      const controlsRow = document.createElement('div');
      controlsRow.className = 'post-video-controls-row';

      const playButton = document.createElement('button');
      playButton.className = 'post-video-control';
      playButton.type = 'button';
      playButton.setAttribute('data-control', 'play');
      playButton.setAttribute('aria-label', 'Pause video');
      playButton.innerHTML = VIDEO_ICON_PAUSE;

      const muteButton = document.createElement('button');
      muteButton.className = 'post-video-control';
      muteButton.type = 'button';
      muteButton.setAttribute('data-control', 'mute');
      muteButton.setAttribute('aria-label', 'Unmute video');
      muteButton.innerHTML = VIDEO_ICON_MUTED;

      const timeLabel = document.createElement('span');
      timeLabel.className = 'post-video-time';
      timeLabel.textContent = '0:00';

      const fullscreenButton = document.createElement('button');
      fullscreenButton.className = 'post-video-control';
      fullscreenButton.type = 'button';
      fullscreenButton.setAttribute('data-control', 'fullscreen');
      fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
      fullscreenButton.innerHTML = VIDEO_ICON_EXIT_FULLSCREEN;

      controlsRow.appendChild(playButton);
      controlsRow.appendChild(muteButton);
      controlsRow.appendChild(timeLabel);
      controlsRow.appendChild(fullscreenButton);
      controls.appendChild(fsInfo);
      controls.appendChild(seek);
      controls.appendChild(controlsRow);
      shell.appendChild(controls);

      configurePostVideoElement(video);
      let isSeeking = false;

      function isInFullscreen() {
        return document.fullscreenElement === video || document.webkitFullscreenElement === video ||
               (typeof video.webkitDisplayingFullscreen === 'boolean' && video.webkitDisplayingFullscreen);
      }

      function updateControls() {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const currentTime = Math.max(0, video.currentTime || 0);
        const isPlaying = !video.paused && !video.ended;
        shell.classList.toggle('is-playing', isPlaying);
        playButton.innerHTML = isPlaying ? VIDEO_ICON_PAUSE : VIDEO_ICON_PLAY;
        playButton.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');
        const isMuted = video.muted || video.volume === 0;
        muteButton.innerHTML = isMuted ? VIDEO_ICON_MUTED : VIDEO_ICON_UNMUTED;
        muteButton.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
        if (!isSeeking) {
          seek.value = duration > 0 ? String(Math.min(VIDEO_SEEK_MAX_VALUE, Math.round((currentTime / duration) * VIDEO_SEEK_MAX_VALUE))) : '0';
        }
        const remaining = duration > 0 ? Math.max(0, duration - currentTime) : 0;
        timeLabel.textContent = '-' + formatVideoDuration(remaining);
      }

      function togglePlayback() {
        if (video.paused || video.ended) {
          pauseOtherPostVideos(video);
          video.play().catch(function (error) {
            console.debug('Video playback was blocked by the browser.', error);
          });
          return;
        }
        video.pause();
      }

      function enterFullscreenAndPlay() {
        requestElementFullscreen(video).catch(function (error) {
          console.debug('Fullscreen request was blocked by the browser.', error);
        });
      }

      video.addEventListener('click', function () {
        if (isInFullscreen()) return;
        enterFullscreenAndPlay();
      });
      playButton.addEventListener('click', function () {
        togglePlayback();
      });
      muteButton.addEventListener('click', function () {
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
        updateControls();
      });

      seek.addEventListener('input', function () {
        isSeeking = true;
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        if (duration > 0) {
          video.currentTime = (Number(seek.value) / VIDEO_SEEK_MAX_VALUE) * duration;
        }
        updateControls();
      });
      seek.addEventListener('change', function () {
        isSeeking = false;
        updateControls();
      });

      fullscreenButton.addEventListener('click', function () {
        if (isInFullscreen()) {
          const exitFn = document.exitFullscreen || document.webkitExitFullscreen;
          if (exitFn) exitFn.call(document).catch(function () {});
        } else {
          requestElementFullscreen(video).catch(function (error) {
            console.debug('Fullscreen request was blocked by the browser.', error);
          });
        }
      });

      function onFullscreenChange() {
        if (isInFullscreen()) {
          // Enable native browser controls so the user has play/seek/exit UI in fullscreen.
          video.controls = true;
          if (video.muted) {
            video.muted = false;
            const prevVol = Number(video.getAttribute('data-previous-volume') || String(DEFAULT_POST_VIDEO_VOLUME));
            if (video.volume === 0) {
              video.volume = prevVol > 0 ? prevVol : DEFAULT_POST_VIDEO_VOLUME;
            }
          }
          pauseOtherPostVideos(video);
          video.play().catch(function () {});
        } else {
          // Restore custom-controls-only mode.
          video.controls = false;
        }
        updateControls();
      }
      document.addEventListener('fullscreenchange', onFullscreenChange);
      document.addEventListener('webkitfullscreenchange', onFullscreenChange);
      // iOS Safari fires these events on the video element itself.
      video.addEventListener('webkitbeginfullscreen', onFullscreenChange);
      video.addEventListener('webkitendfullscreen', onFullscreenChange);

      video.addEventListener('loadedmetadata', updateControls);
      video.addEventListener('timeupdate', updateControls);
      video.addEventListener('play', updateControls);
      video.addEventListener('pause', updateControls);
      video.addEventListener('ended', updateControls);
      video.addEventListener('volumechange', function () {
        if (!video.muted && video.volume > 0) {
          video.setAttribute('data-previous-volume', String(video.volume));
        }
        updateControls();
      });
      video.play().catch(function (error) {
        console.debug('Autoplay was blocked by the browser.', error);
      });
      updateControls();
    });
  }

  async function buildMediaFragment(post) {
    const fragment = document.createDocumentFragment();
    const imageIds = Array.isArray(post.imageMediaIds) ? post.imageMediaIds : [];
    const altBase = post.text ? post.text.trim().replace(/\s+/g, ' ').split(' ').slice(0, 12).join(' ') : 'User upload';

    if (imageIds.length) {
      const grid = document.createElement('div');
      grid.className = 'post-media-grid' + (imageIds.length === 1 ? ' single' : '');

      for (let index = 0; index < imageIds.length; index += 1) {
        const mediaRecord = await getMediaRecord(imageIds[index]);
        if (!mediaRecord || !(mediaRecord.blob instanceof Blob)) {
          continue;
        }
        const mediaUrl = URL.createObjectURL(mediaRecord.blob);
        generatedMediaUrls.push(mediaUrl);

        const item = document.createElement('div');
        item.className = 'post-media-item';

        const image = document.createElement('img');
        image.src = mediaUrl;
        image.alt = altBase + ' (image ' + (index + 1) + ' of ' + imageIds.length + ')';
        image.loading = 'lazy';

        const trigger = document.createElement('button');
        trigger.className = 'post-media-button';
        trigger.type = 'button';
        trigger.setAttribute('aria-label', 'Open ' + image.alt + ' in fullscreen viewer');
        trigger.addEventListener('click', function () {
          openMediaViewer('image', mediaUrl, image.alt);
        });

        trigger.appendChild(image);
        item.appendChild(trigger);
        grid.appendChild(item);
      }

      if (grid.children.length) {
        fragment.appendChild(grid);
      }
    }

    if (post.videoMediaId) {
      const mediaRecord = await getMediaRecord(post.videoMediaId);
      if (mediaRecord && mediaRecord.blob instanceof Blob) {
        const mediaUrl = URL.createObjectURL(mediaRecord.blob);
        generatedMediaUrls.push(mediaUrl);

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
    const orderedPosts = posts.slice().sort(function (left, right) {
      return right.createdAt - left.createdAt;
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
      handle.textContent = formatHandle(authorHandle) + ' · ' + formatRelativeTime(post.createdAt);

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

      const mediaFragment = await buildMediaFragment(post);
      if (mediaFragment.childNodes.length) {
        article.appendChild(mediaFragment);
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
    const input = document.getElementById('new-post-images');
    return input && input.files ? Array.from(input.files) : [];
  }

  function getSelectedVideo() {
    const input = document.getElementById('new-post-video');
    return input && input.files && input.files[0] ? input.files[0] : null;
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
    if (images.length > MAX_IMAGE_COUNT) {
      throw new Error('You can upload up to 10 pictures per post.');
    }

    for (let index = 0; index < images.length; index += 1) {
      if (images[index].size > MAX_IMAGE_SIZE) {
        throw new Error('Each picture must be 10MB or smaller.');
      }
    }

    if (video) {
      const duration = await loadVideoDuration(video);
      if (!Number.isFinite(duration) || duration > MAX_VIDEO_DURATION_SECONDS) {
        throw new Error('Your video must be 10 minutes or shorter.');
      }
    }
  }

  async function savePost(text, images, video) {
    const imageMediaIds = [];
    for (let index = 0; index < images.length; index += 1) {
      imageMediaIds.push(await putMediaFile(images[index]));
    }

    let videoMediaId = null;
    if (video) {
      videoMediaId = await putMediaFile(video);
    }

    const postRecord = {
      id: generateId('post'),
      userId: currentUser.id,
      text: text,
      imageMediaIds: imageMediaIds,
      videoMediaId: videoMediaId,
      createdAt: Date.now()
    };
    await putRecord(POSTS_STORE, postRecord);
    await addMentionNotifications(postRecord, text);
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
      return right.createdAt - left.createdAt;
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

      if (!text && !images.length && !video) {
        setNewPostStatus('Add text, photos, or a video before posting.', 'error');
        return;
      }

      try {
        await validatePostMedia(images, video);
        setNewPostStatus('Publishing post…', 'success');
        await savePost(text, images, video);
        await refreshUserFacingViews();
        setNewPostStatus('Post published successfully.', 'success');
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
      if (event.key === 'Escape' && mediaViewerModal.classList.contains('open')) {
        closeMediaViewer();
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

  initSharedHandlers().catch(function (error) {
    if (authStatus) {
      setAuthStatus(error && error.message ? error.message : 'Unable to initialize account features.', 'error');
    }
  });
})();
