(function () {
  const ACCOUNTS_KEY = 'zorexium.accounts.v1';
  const POSTS_KEY = 'zorexium.posts.v1';
  const LOCAL_SESSION_KEY = 'zorexium.session.local.v1';
  const SESSION_SESSION_KEY = 'zorexium.session.session.v1';
  const MEDIA_DB_NAME = 'zorexium-media-db';
  const MEDIA_STORE_NAME = 'media';
  const MAX_IMAGE_COUNT = 10;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_VIDEO_DURATION_SECONDS = 10 * 60;

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
  let mediaDbPromise = null;
  let generatedMediaUrls = [];

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readAccounts() {
    return safeParse(localStorage.getItem(ACCOUNTS_KEY), []);
  }

  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  function readPosts() {
    return safeParse(localStorage.getItem(POSTS_KEY), []);
  }

  function savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  function generateId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return prefix + '-' + window.crypto.randomUUID();
    }
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
  }

  function getCurrentSession() {
    const localSession = safeParse(localStorage.getItem(LOCAL_SESSION_KEY), null);
    if (localSession && localSession.userId) {
      return localSession;
    }
    const sessionSession = safeParse(sessionStorage.getItem(SESSION_SESSION_KEY), null);
    return sessionSession && sessionSession.userId ? sessionSession : null;
  }

  function setCurrentSession(userId, remember) {
    const payload = JSON.stringify({ userId: userId });
    if (remember) {
      localStorage.setItem(LOCAL_SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_SESSION_KEY, payload);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }

  function clearCurrentSession() {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    sessionStorage.removeItem(SESSION_SESSION_KEY);
  }

  function getUserById(userId) {
    return readAccounts().find(function (account) {
      return account.id === userId;
    }) || null;
  }

  async function hashPassword(password) {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      const data = new TextEncoder().encode(password);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest)).map(function (value) {
        return value.toString(16).padStart(2, '0');
      }).join('');
    }
    return String(password || '');
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

  function escapeHandle(username) {
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
    const palette = ['#e02020', '#2563eb', '#16a34a', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#059669'];
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
      headerNotificationsButton.setAttribute('title', isAuthenticated ? 'Notifications' : 'Notifications');
    }
    document.body.setAttribute('data-authenticated', isAuthenticated ? 'true' : 'false');
  }

  function syncCurrentUserFromSession() {
    const session = getCurrentSession();
    currentUser = session ? getUserById(session.userId) : null;
    if (!currentUser && session) {
      clearCurrentSession();
    }
    updateAuthControls();
  }

  function logout() {
    currentUser = null;
    clearCurrentSession();
    updateAuthControls();
    setAuthStatus('You have been logged out.', 'success');
    closeAuthModal();
  }

  function openMediaDb() {
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not available in this browser.'));
        return;
      }
      const request = window.indexedDB.open(MEDIA_DB_NAME, 1);
      request.onupgradeneeded = function () {
        const database = request.result;
        if (!database.objectStoreNames.contains(MEDIA_STORE_NAME)) {
          database.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error || new Error('Failed to open media database.'));
      };
    });
    return mediaDbPromise;
  }

  async function putMediaFile(file) {
    const database = await openMediaDb();
    const id = generateId('media');
    await new Promise(function (resolve, reject) {
      const transaction = database.transaction(MEDIA_STORE_NAME, 'readwrite');
      transaction.objectStore(MEDIA_STORE_NAME).put({
        id: id,
        blob: file,
        name: file.name,
        type: file.type,
        size: file.size,
        createdAt: Date.now()
      });
      transaction.oncomplete = resolve;
      transaction.onerror = function () {
        reject(transaction.error || new Error('Failed to save media.'));
      };
      transaction.onabort = function () {
        reject(transaction.error || new Error('Failed to save media.'));
      };
    });
    return id;
  }

  async function getMediaRecord(id) {
    const database = await openMediaDb();
    return new Promise(function (resolve, reject) {
      const transaction = database.transaction(MEDIA_STORE_NAME, 'readonly');
      const request = transaction.objectStore(MEDIA_STORE_NAME).get(id);
      request.onsuccess = function () {
        resolve(request.result || null);
      };
      request.onerror = function () {
        reject(request.error || new Error('Failed to load media.'));
      };
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

  function addLikeBehavior(button) {
    if (!button) return;
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

  function createActionButton(label, count, svgMarkup, isLike) {
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

    if (typeof count !== 'undefined' && count !== null) {
      const countNode = document.createElement('span');
      countNode.className = 'post-action-count';
      countNode.textContent = String(count);
      button.appendChild(countNode);
    } else if (label) {
      button.appendChild(document.createTextNode(label));
    }

    return button;
  }

  async function buildMediaFragment(post) {
    const fragment = document.createDocumentFragment();
    const imageIds = Array.isArray(post.imageMediaIds) ? post.imageMediaIds : [];
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
        image.alt = (post.text || 'User upload').slice(0, 80) || 'User upload';
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

    const posts = readPosts().slice().sort(function (left, right) {
      return right.createdAt - left.createdAt;
    });
    const anchor = postFeed.firstElementChild;

    for (let index = posts.length - 1; index >= 0; index -= 1) {
      const post = posts[index];
      const user = getUserById(post.userId);
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
      handle.textContent = escapeHandle(user.username) + ' · ' + formatRelativeTime(post.createdAt);

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
      actions.appendChild(createActionButton('', 0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', true));
      actions.appendChild(createActionButton('', 0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', false));
      actions.appendChild(createActionButton('', 0, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>', false));
      actions.appendChild(createActionButton('', null, '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>', false));
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

    const post = {
      id: generateId('post'),
      userId: currentUser.id,
      text: text,
      imageMediaIds: imageMediaIds,
      videoMediaId: videoMediaId,
      createdAt: Date.now()
    };

    const posts = readPosts();
    posts.push(post);
    savePosts(posts);
    return post;
  }

  function attachAuthenticatedClickGuard(button, onAuthenticatedClick) {
    if (!button) return;
    button.addEventListener('click', function (event) {
      if (!currentUser) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onAuthenticatedClick();
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

        const email = normalizeEmail(document.getElementById('login-email') ? document.getElementById('login-email').value : '');
        const password = document.getElementById('login-password') ? document.getElementById('login-password').value : '';
        const remember = Boolean(document.getElementById('remember-login') && document.getElementById('remember-login').checked);

        const account = readAccounts().find(function (candidate) {
          return candidate.email === email;
        });

        if (!account) {
          setAuthStatus('No account found for that email address.', 'error');
          return;
        }

        const passwordHash = await hashPassword(password);
        if (account.passwordHash !== passwordHash) {
          setAuthStatus('Incorrect password. Please try again.', 'error');
          return;
        }

        currentUser = account;
        setCurrentSession(account.id, remember);
        updateAuthControls();
        setAuthStatus('Logged in successfully.', 'success');
        setTimeout(closeAuthModal, 800);
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
        const email = normalizeEmail(emailInput ? emailInput.value : '');
        const password = String(passwordInput ? passwordInput.value : '');
        const confirmPassword = String(confirmPasswordInput ? confirmPasswordInput.value : '');

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

        if (password !== confirmPassword) {
          setAuthStatus('Passwords do not match.', 'error');
          return;
        }

        const accounts = readAccounts();
        const usernameKey = normalizeUsername(username);
        if (accounts.some(function (account) { return account.usernameKey === usernameKey; })) {
          setAuthStatus('That username is already taken.', 'error');
          return;
        }

        if (accounts.some(function (account) { return account.email === email; })) {
          setAuthStatus('That email is already in use.', 'error');
          return;
        }

        const passwordHash = await hashPassword(password);
        const account = {
          id: generateId('user'),
          name: name,
          username: username,
          usernameKey: usernameKey,
          email: email,
          passwordHash: passwordHash,
          createdAt: Date.now()
        };

        accounts.push(account);
        saveAccounts(accounts);
        currentUser = account;
        setCurrentSession(account.id, true);
        updateAuthControls();
        registerForm.reset();
        setAuthStatus('Account created and logged in successfully.', 'success');
        setTimeout(closeAuthModal, 800);
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
      logout();
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

  function initSharedHandlers() {
    injectNameField();
    syncCurrentUserFromSession();
    initAuthTabs();
    attachAuthSubmitHandlers();
    attachNewPostHandler();
    attachAuthGuards();
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

  initSharedHandlers();
  if (postFeed) {
    renderSavedPosts().catch(function () {
    });
  }
})();
