(function () {
  const DB_NAME = 'zorexium-app-db';
  const DB_VERSION = 1;
  const ACCOUNTS_STORE = 'accounts';
  const POSTS_STORE = 'posts';
  const SESSION_STORE = 'session';
  const MEDIA_STORE = 'media';
  const WINDOW_SESSION_PREFIX = 'zorexium-session:';
  const MAX_IMAGE_COUNT = 10;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_VIDEO_DURATION_SECONDS = 10 * 60;
  const PASSWORD_ITERATIONS = 600000;

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

  let currentUser = null;
  let appDbPromise = null;
  let generatedMediaUrls = [];

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

  async function syncCurrentUserFromSession() {
    const session = await getCurrentSession();
    currentUser = session ? await getUserById(session.userId) : null;
    if (!currentUser && session) {
      await clearCurrentSession();
    }
    updateAuthControls();
  }

  async function logout() {
    currentUser = null;
    await clearCurrentSession();
    updateAuthControls();
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

  function addLikeBehavior(button) {
    button.addEventListener('click', function () {
      const isLiked = button.getAttribute('data-liked') === 'true';
      const currentCount = Number(button.getAttribute('data-count') || '0');
      const nextCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
      button.setAttribute('data-liked', String(!isLiked));
      button.setAttribute('data-count', String(nextCount));
      button.style.color = isLiked ? '' : 'var(--accent)';
      const countNode = button.querySelector('.post-action-count');
      if (countNode) {
        countNode.textContent = String(nextCount);
      }
    });
  }

  function createActionButton(count, svgMarkup, isLike) {
    const button = document.createElement('button');
    button.className = 'post-action';
    button.type = 'button';
    if (isLike) {
      button.setAttribute('data-action', 'like');
      button.setAttribute('data-count', String(count || 0));
      addLikeBehavior(button);
    }

    const icon = document.createElement('span');
    icon.className = 'post-action-icon';
    icon.innerHTML = svgMarkup;
    button.appendChild(icon);

    if (count !== null) {
      const countNode = document.createElement('span');
      countNode.className = 'post-action-count';
      countNode.textContent = String(count || 0);
      button.appendChild(countNode);
    }

    return button;
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
        item.appendChild(image);
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

        const video = document.createElement('video');
        video.className = 'post-video';
        video.src = mediaUrl;
        video.setAttribute('aria-label', altBase + ' (video)');
        video.controls = true;
        video.preload = 'metadata';
        fragment.appendChild(video);
      }
    }

    return fragment;
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
      if (!user) {
        continue;
      }

      const article = document.createElement('article');
      article.className = 'post-card';
      article.setAttribute('data-user-generated', 'true');

      const header = document.createElement('div');
      header.className = 'post-header';

      const avatar = document.createElement('div');
      avatar.className = 'post-avatar';
      avatar.style.background = getAvatarColor(user.username);
      avatar.textContent = getInitials(user.name, user.username);
      header.appendChild(avatar);

      const meta = document.createElement('div');
      meta.className = 'post-meta';

      const username = document.createElement('span');
      username.className = 'post-username';
      username.textContent = user.name;

      const handle = document.createElement('span');
      handle.className = 'post-handle';
      handle.textContent = formatHandle(user.username) + ' · ' + formatRelativeTime(post.createdAt);

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
      actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', true));
      actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', false));
      actions.appendChild(createActionButton(0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>', false));
      actions.appendChild(createActionButton(null, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>', false));
      article.appendChild(actions);

      postFeed.insertBefore(article, anchor);
    }
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

    await putRecord(POSTS_STORE, {
      id: generateId('post'),
      userId: currentUser.id,
      text: text,
      imageMediaIds: imageMediaIds,
      videoMediaId: videoMediaId,
      createdAt: Date.now()
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
          updateAuthControls();
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
            passwordSalt: passwordSalt,
            passwordVerifier: passwordVerifier,
            createdAt: Date.now()
          };

          await putRecord(ACCOUNTS_STORE, account);
          currentUser = account;
          await setCurrentSession(account.id, true);
          updateAuthControls();
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
        await renderSavedPosts();
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
      });
    });
  }

  function initAuthTabs() {
    authTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchAuthView(tab.getAttribute('data-auth-view'));
      }, true);
    });
  }

  async function initSharedHandlers() {
    injectNameField();
    initAuthTabs();
    attachAuthSubmitHandlers();
    attachNewPostHandler();
    attachAuthGuards();
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

  initSharedHandlers().then(function () {
    if (postFeed) {
      return renderSavedPosts();
    }
  }).catch(function (error) {
    if (authStatus) {
      setAuthStatus(error && error.message ? error.message : 'Unable to initialize account features.', 'error');
    }
  });
})();
