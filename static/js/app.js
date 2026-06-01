/* ═══════════════════════════════════════════
   SKILL EXCHANGE — Main App JS
   ═══════════════════════════════════════════ */

const API = {
  base: '',

  headers() {
    const h = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async get(path) {
    const res = await fetch(this.base + path, { headers: this.headers() });
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async put(path, body) {
    const res = await fetch(this.base + path, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async patch(path) {
    const res = await fetch(this.base + path, {
      method: 'PATCH',
      headers: this.headers()
    });
    return res.json();
  },

  async delete(path) {
    const res = await fetch(this.base + path, {
      method: 'DELETE',
      headers: this.headers()
    });
    return res.json();
  }
};

/* ── STATE ── */
let state = {
  user: null,
  skills: [],
  mySkills: [],
  bookings: [],
  availability: [],
  reviews: [],
  messages: {}
};

/* ── AUTH ── */
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

async function loadUser() {
  if (!isLoggedIn()) return;
  try {
    const data = await API.get('/auth/me');
    if (data.id) {
      state.user = data;
      updateHeaderUser();
    }
  } catch(e) {}
}

function updateHeaderUser() {
  const u = state.user;
  if (!u) return;
  const avatarEl = document.getElementById('headerAvatar');
  const pointsEl = document.getElementById('headerPoints');
  if (avatarEl) avatarEl.textContent = u.name[0].toUpperCase();
  if (pointsEl) pointsEl.textContent = u.points + ' pts';
}

async function login(email, password) {
  const data = await API.post('/auth/login', { email, password });
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    await loadUser();
    showApp();
    navigate('dashboard');
    toast('Welcome back! 👋', 'success');
  } else {
    toast(data.message || 'Login failed', 'error');
  }
}

async function register(name, email, password) {
  const data = await API.post('/auth/register', { name, email, password });
  if (data.message && data.message.toLowerCase().includes('success')) {
    toast('Account created! Please log in.', 'success');
    showAuthTab('login');
  } else {
    toast(data.message || 'Registration failed', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  state.user = null;
  showAuth();
  toast('Logged out successfully', 'info');
}

/* ── ROUTING ── */
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  switch(page) {
    case 'dashboard': loadDashboard(); break;
    case 'marketplace': loadMarketplace(); break;
    case 'my-skills': loadMySkills(); break;
    case 'bookings': loadBookings(); break;
    case 'availability': loadAvailability(); break;
    case 'messages': loadMessages(); break;
    case 'profile': loadProfile(); break;
    case 'reviews': loadReviews(); break;
  }
}

/* ── SHOW/HIDE ── */
function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-layout').style.display = 'grid';
}

function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app-layout').style.display = 'none';
}

function showAuthTab(tab) {
  document.querySelectorAll('.auth-tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('auth-' + tab).classList.add('active');
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-auth-tab="${tab}"]`).classList.add('active');
}

/* ── TOAST ── */
function toast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── MODAL ── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* ── TABS ── */
function switchTab(groupId, tabId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  group.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */
async function loadDashboard() {
  const u = state.user;
  if (u) {
    document.getElementById('dash-greeting').textContent = `Good day, ${u.name.split(' ')[0]} 👋`;
    document.getElementById('dash-points').textContent = u.points;
    document.getElementById('dash-role').textContent = u.role;
  }

  try {
    const skills = await API.get('/skill/my-skills');
    document.getElementById('dash-skill-count').textContent = Array.isArray(skills) ? skills.length : 0;
  } catch(e) {}

  try {
    const bookings = await API.get('/booking/mine');
    document.getElementById('dash-booking-count').textContent = Array.isArray(bookings) ? bookings.length : 0;
    const pending = Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending').length : 0;
    document.getElementById('dash-pending-count').textContent = pending;
  } catch(e) {}

  try {
    const skills = await API.get('/skill/skills');
    renderRecentSkills(Array.isArray(skills) ? skills.slice(0, 6) : []);
  } catch(e) {
    renderRecentSkills([]);
  }
}

function renderRecentSkills(skills) {
  const el = document.getElementById('dash-recent-skills');
  if (!skills.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🌱</div><div class="empty-state-title">No skills yet</div><div class="empty-state-desc">Be the first to add a skill!</div></div>`;
    return;
  }
  el.innerHTML = skills.map(s => skillCardHTML(s)).join('');
}

/* ══════════════════════════════════════
   MARKETPLACE
══════════════════════════════════════ */
async function loadMarketplace() {
  document.getElementById('marketplace-grid').innerHTML = `<div class="loading-overlay col-span-3"><div class="loader"></div></div>`;
  try {
    const skills = await API.get('/skill/skills');
    state.skills = Array.isArray(skills) ? skills : [];
    renderMarketplace(state.skills);
  } catch(e) {
    document.getElementById('marketplace-grid').innerHTML = `<div class="empty-state"><div class="empty-state-icon">😕</div><div class="empty-state-title">Failed to load skills</div></div>`;
  }
}

function renderMarketplace(skills) {
  const el = document.getElementById('marketplace-grid');
  if (!skills.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No skills found</div><div class="empty-state-desc">Try a different search or filter.</div></div>`;
    return;
  }
  el.innerHTML = skills.map(s => skillCardHTML(s, true)).join('');
}

async function searchMarketplace() {
  const skill = document.getElementById('search-skill-input').value;
  const user = document.getElementById('search-user-input').value;
  const sort = document.getElementById('search-sort').value;

  let query = '/search/?';
  if (skill) query += `skill=${encodeURIComponent(skill)}&`;
  if (user) query += `user=${encodeURIComponent(user)}&`;
  if (sort) query += `sort=${sort}`;

  try {
    const res = await API.get(query);
    renderMarketplace(Array.isArray(res) ? res : []);
  } catch(e) {
    toast('Search failed', 'error');
  }
}

function filterByCategory(cat) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  if (cat === 'all') {
    renderMarketplace(state.skills);
  } else {
    renderMarketplace(state.skills.filter(s => s.category && s.category.toLowerCase() === cat.toLowerCase()));
  }
}

function skillCardHTML(s, showBook = false) {
  const initials = s.owner_name ? s.owner_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U';
  const expClass = `exp-${(s.experience_level || 'beginner').toLowerCase()}`;
  return `
    <div class="skill-card">
      <div class="skill-category-tag">🏷 ${s.category || 'General'}</div>
      <div class="skill-title">${s.title}</div>
      <div class="skill-desc">${s.description || 'No description provided.'}</div>
      <div class="skill-footer">
        <div class="skill-user">
          <div class="mini-avatar">${initials}</div>
          <span>${s.owner_name || 'Unknown'}</span>
        </div>
        <div class="flex-row" style="gap:6px">
          <span class="exp-badge ${expClass}">${s.experience_level || 'Beginner'}</span>
          <span class="points-chip">⚡ ${s.exchange_points || 10}</span>
        </div>
      </div>
      ${showBook && isLoggedIn() ? `
        <button class="btn btn-primary btn-sm mt-4" onclick="openBookingModal(${s.id}, '${s.title}', ${s.user_id})">
          📅 Book Session
        </button>
      ` : ''}
    </div>
  `;
}

/* ══════════════════════════════════════
   MY SKILLS
══════════════════════════════════════ */
async function loadMySkills() {
  document.getElementById('my-skills-list').innerHTML = `<div class="loading-overlay"><div class="loader"></div></div>`;
  try {
    const skills = await API.get('/skill/my-skills');
    state.mySkills = Array.isArray(skills) ? skills : [];
    renderMySkills(state.mySkills);
  } catch(e) {
    document.getElementById('my-skills-list').innerHTML = `<div class="empty-state"><div class="empty-state-icon">😕</div><div class="empty-state-title">Failed to load</div></div>`;
  }
}

function renderMySkills(skills) {
  const el = document.getElementById('my-skills-list');
  if (!skills.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💡</div><div class="empty-state-title">No skills added yet</div><div class="empty-state-desc">Share your expertise with the community.</div></div>`;
    return;
  }
  el.innerHTML = skills.map(s => `
    <div class="card" style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:12px;">
      <div style="flex:1">
        <div class="flex-row mb-4">
          <span class="skill-category-tag">🏷 ${s.category}</span>
          <span class="exp-badge exp-${(s.experience_level||'beginner').toLowerCase()}">${s.experience_level}</span>
        </div>
        <div class="card-title">${s.title}</div>
        <div class="card-subtitle mt-4">${s.description || 'No description.'}</div>
        <div class="flex-row mt-4">
          <span class="points-chip">⚡ ${s.exchange_points} pts</span>
        </div>
      </div>
      <div class="flex-row" style="gap:8px; flex-shrink:0;">
        <button class="btn btn-ghost btn-sm" onclick="openEditSkillModal(${JSON.stringify(s).replace(/"/g,'&quot;')})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSkill(${s.id})">🗑 Delete</button>
      </div>
    </div>
  `).join('');
}

async function addSkill() {
  const data = {
    title: document.getElementById('skill-title').value,
    category: document.getElementById('skill-category').value,
    description: document.getElementById('skill-desc').value,
    experience_level: document.getElementById('skill-level').value,
    exchange_points: parseInt(document.getElementById('skill-points').value) || 10
  };
  if (!data.title || !data.category || !data.experience_level) {
    toast('Please fill all required fields', 'warning'); return;
  }
  const res = await API.post('/skill/create', data);
  if (res.id || res.title) {
    closeModal('modal-add-skill');
    toast('Skill added! 🎉', 'success');
    loadMySkills();
    document.getElementById('add-skill-form').reset();
  } else {
    toast(res.message || 'Failed to add skill', 'error');
  }
}

async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  await API.delete(`/skill/delete/${id}`);
  toast('Skill deleted', 'info');
  loadMySkills();
}

function openEditSkillModal(skill) {
  document.getElementById('edit-skill-id').value = skill.id;
  document.getElementById('edit-skill-title').value = skill.title;
  document.getElementById('edit-skill-category').value = skill.category;
  document.getElementById('edit-skill-desc').value = skill.description || '';
  document.getElementById('edit-skill-level').value = skill.experience_level;
  document.getElementById('edit-skill-points').value = skill.exchange_points;
  openModal('modal-edit-skill');
}

async function updateSkill() {
  const id = document.getElementById('edit-skill-id').value;
  const data = {
    title: document.getElementById('edit-skill-title').value,
    category: document.getElementById('edit-skill-category').value,
    description: document.getElementById('edit-skill-desc').value,
    experience_level: document.getElementById('edit-skill-level').value,
    exchange_points: parseInt(document.getElementById('edit-skill-points').value) || 10
  };
  await API.put(`/skill/update/${id}`, data);
  closeModal('modal-edit-skill');
  toast('Skill updated!', 'success');
  loadMySkills();
}

/* ══════════════════════════════════════
   BOOKINGS
══════════════════════════════════════ */
async function loadBookings() {
  document.getElementById('bookings-table-body').innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px"><div class="loader"></div></td></tr>`;
  try {
    const bookings = await API.get('/booking/mine');
    state.bookings = Array.isArray(bookings) ? bookings : [];
    renderBookings(state.bookings);
  } catch(e) {
    document.getElementById('bookings-table-body').innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Failed to load bookings</td></tr>`;
  }
}

function renderBookings(bookings) {
  const el = document.getElementById('bookings-table-body');
  if (!bookings.length) {
    el.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">No bookings yet</div><div class="empty-state-desc">Browse the marketplace to book a skill session.</div></div></td></tr>`;
    return;
  }
  el.innerHTML = bookings.map(b => `
    <tr>
      <td><span class="font-display fw-bold">#${b.id}</span></td>
      <td>${b.skill_title || 'N/A'}</td>
      <td>${b.learner_name || b.teacher_name || 'N/A'}</td>
      <td>${b.scheduled_time || '—'}</td>
      <td><span class="status-badge status-${b.status}">${statusIcon(b.status)} ${b.status}</span></td>
      <td>
        <div class="flex-row" style="gap:6px">
          ${b.status === 'pending' ? `
            <button class="btn btn-primary btn-sm" onclick="updateBookingStatus(${b.id},'accept')">✓ Accept</button>
            <button class="btn btn-danger btn-sm" onclick="updateBookingStatus(${b.id},'reject')">✕ Reject</button>
          ` : ''}
          ${b.status === 'accepted' ? `
            <button class="btn btn-amber btn-sm" onclick="updateBookingStatus(${b.id},'complete')">✔ Complete</button>
            <button class="btn btn-secondary btn-sm" onclick="openChatModal(${b.id})">💬 Chat</button>
          ` : ''}
          ${b.status === 'completed' ? `
            <button class="btn btn-ghost btn-sm" onclick="openReviewModal(${b.id}, ${b.teacher_id})">⭐ Review</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function statusIcon(s) {
  return { pending: '⏳', accepted: '✅', rejected: '❌', completed: '🏆' }[s] || '•';
}

async function updateBookingStatus(id, action) {
  await API.patch(`/booking/${action}/${id}`);
  toast(`Booking ${action}ed!`, 'success');
  loadBookings();
}

function openBookingModal(skillId, skillTitle, teacherId) {
  document.getElementById('booking-skill-id').value = skillId;
  document.getElementById('booking-teacher-id').value = teacherId;
  document.getElementById('booking-skill-name').textContent = skillTitle;
  openModal('modal-booking');
}

async function createBooking() {
  const data = {
    skill_id: parseInt(document.getElementById('booking-skill-id').value),
    teacher_id: parseInt(document.getElementById('booking-teacher-id').value),
    scheduled_time: document.getElementById('booking-time').value,
    message: document.getElementById('booking-message').value
  };
  if (!data.scheduled_time) { toast('Please select a time', 'warning'); return; }
  const res = await API.post('/booking/create', data);
  if (res.id || res.message?.toLowerCase().includes('created')) {
    closeModal('modal-booking');
    toast('Booking request sent! 🎉', 'success');
    navigate('bookings');
  } else {
    toast(res.message || 'Booking failed', 'error');
  }
}

/* ══════════════════════════════════════
   AVAILABILITY
══════════════════════════════════════ */
async function loadAvailability() {
  document.getElementById('availability-slots').innerHTML = `<div class="loading-overlay"><div class="loader"></div></div>`;
  try {
    const data = await API.get('/availability/my');
    state.availability = Array.isArray(data) ? data : [];
    renderAvailability(state.availability);
  } catch(e) {
    document.getElementById('availability-slots').innerHTML = `<div class="empty-state"><div class="empty-state-icon">😕</div><div class="empty-state-title">Failed to load</div></div>`;
  }
}

function renderAvailability(slots) {
  const el = document.getElementById('availability-slots');
  if (!slots.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🗓</div><div class="empty-state-title">No time slots added</div><div class="empty-state-desc">Add your available times so learners can book you.</div></div>`;
    return;
  }
  el.innerHTML = `<div class="flex-row" style="flex-wrap:wrap; gap:10px;">` +
    slots.map(s => `
      <div class="slot-pill">
        🕐 ${s.day_of_week} ${s.start_time}–${s.end_time}
        <button onclick="deleteSlot(${s.id})" style="background:none;border:none;cursor:pointer;color:var(--coral);padding:0;font-size:0.9rem;margin-left:4px">✕</button>
      </div>
    `).join('') + `</div>`;
}

async function addSlot() {
  const data = {
    day_of_week: document.getElementById('slot-day').value,
    start_time: document.getElementById('slot-start').value,
    end_time: document.getElementById('slot-end').value
  };
  if (!data.day_of_week || !data.start_time || !data.end_time) {
    toast('Fill all fields', 'warning'); return;
  }
  await API.post('/availability/add', data);
  toast('Slot added!', 'success');
  loadAvailability();
  document.getElementById('slot-form').reset();
}

async function deleteSlot(id) {
  await API.delete(`/availability/delete/${id}`);
  toast('Slot removed', 'info');
  loadAvailability();
}

/* ══════════════════════════════════════
   MESSAGES
══════════════════════════════════════ */
let currentChatBookingId = null;

async function loadMessages() {
  try {
    const bookings = await API.get('/booking/mine');
    const accepted = Array.isArray(bookings) ? bookings.filter(b => b.status === 'accepted' || b.status === 'completed') : [];
    renderChatList(accepted);
  } catch(e) {}
}

function renderChatList(bookings) {
  const el = document.getElementById('chat-list');
  if (!bookings.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-title">No conversations</div><div class="empty-state-desc">Accepted bookings appear here as chats.</div></div>`;
    return;
  }
  el.innerHTML = bookings.map(b => `
    <div class="card" style="cursor:pointer;margin-bottom:10px" onclick="openChat(${b.id}, '${b.skill_title || 'Session'}')">
      <div class="flex-row">
        <div class="mini-avatar" style="width:36px;height:36px;font-size:0.9rem">${(b.skill_title||'S')[0]}</div>
        <div style="flex:1">
          <div class="card-title">${b.skill_title || 'Session'}</div>
          <div class="card-subtitle">Booking #${b.id} · <span class="status-badge status-${b.status}" style="font-size:0.7rem;padding:2px 6px">${b.status}</span></div>
        </div>
        <span style="font-size:1.2rem">→</span>
      </div>
    </div>
  `).join('');
}

async function openChat(bookingId, title) {
  currentChatBookingId = bookingId;
  document.getElementById('chat-modal-title').textContent = `💬 ${title}`;
  document.getElementById('chat-messages').innerHTML = `<div class="loading-overlay"><div class="loader"></div></div>`;
  openModal('modal-chat');
  try {
    const messages = await API.get(`/message/chat/${bookingId}`);
    renderChatMessages(Array.isArray(messages) ? messages : []);
  } catch(e) {
    document.getElementById('chat-messages').innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-title">No messages yet</div></div>`;
  }
}

function renderChatMessages(messages) {
  const el = document.getElementById('chat-messages');
  const myId = state.user?.id;
  if (!messages.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-title">No messages yet</div><div class="empty-state-desc">Start the conversation!</div></div>`;
    return;
  }
  el.innerHTML = messages.map(m => {
    const isMine = m.sender_id === myId;
    return `
      <div style="display:flex; flex-direction:column; align-items:${isMine ? 'flex-end' : 'flex-start'}">
        <div class="message-bubble ${isMine ? 'sent' : 'received'}">${m.content}</div>
        <div class="message-time">${m.sender_name || ''} · ${formatTime(m.timestamp)}</div>
      </div>
    `;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

async function sendMessage() {
  const content = document.getElementById('chat-input').value.trim();
  if (!content) return;
  const data = {
    booking_id: currentChatBookingId,
    receiver_id: null,
    content
  };
  try {
    await API.post('/message/send', data);
    document.getElementById('chat-input').value = '';
    openChat(currentChatBookingId, document.getElementById('chat-modal-title').textContent.replace('💬 ', ''));
  } catch(e) {
    toast('Failed to send', 'error');
  }
}

/* ══════════════════════════════════════
   PROFILE
══════════════════════════════════════ */
async function loadProfile() {
  try {
    const user = await API.get('/user/profile');
    if (user.id) {
      state.user = { ...state.user, ...user };
      renderProfile(user);
    }
  } catch(e) {}
}

function renderProfile(u) {
  document.getElementById('profile-name').textContent = u.name;
  document.getElementById('profile-email').textContent = u.email;
  document.getElementById('profile-role').textContent = u.role;
  document.getElementById('profile-points').textContent = u.points;
  document.getElementById('profile-rating').textContent = u.rating?.toFixed(1) || '—';
  document.getElementById('profile-location').textContent = u.location || 'Not set';
  document.getElementById('profile-bio').textContent = u.bio || 'No bio added.';
  document.getElementById('profile-avatar-text').textContent = u.name[0].toUpperCase();

  document.getElementById('edit-name').value = u.name;
  document.getElementById('edit-bio').value = u.bio || '';
  document.getElementById('edit-location').value = u.location || '';
  document.getElementById('edit-skills-offered').value = u.skills_offered || '';
  document.getElementById('edit-skills-wanted').value = u.skills_wanted || '';
}

async function updateProfile() {
  const data = {
    name: document.getElementById('edit-name').value,
    bio: document.getElementById('edit-bio').value,
    location: document.getElementById('edit-location').value,
    skills_offered: document.getElementById('edit-skills-offered').value,
    skills_wanted: document.getElementById('edit-skills-wanted').value,
  };
  await API.put('/user/profile/update', data);
  closeModal('modal-edit-profile');
  toast('Profile updated!', 'success');
  loadProfile();
  loadUser();
}

/* ══════════════════════════════════════
   REVIEWS
══════════════════════════════════════ */
async function loadReviews() {
  if (!state.user) return;
  document.getElementById('reviews-list').innerHTML = `<div class="loading-overlay"><div class="loader"></div></div>`;
  try {
    const reviews = await API.get(`/review/user/${state.user.id}`);
    state.reviews = Array.isArray(reviews) ? reviews : [];
    renderReviews(state.reviews);
  } catch(e) {
    document.getElementById('reviews-list').innerHTML = `<div class="empty-state"><div class="empty-state-icon">⭐</div><div class="empty-state-title">No reviews yet</div></div>`;
  }
}

function renderReviews(reviews) {
  const el = document.getElementById('reviews-list');
  if (!reviews.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⭐</div><div class="empty-state-title">No reviews yet</div><div class="empty-state-desc">Complete sessions to receive reviews.</div></div>`;
    return;
  }
  el.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-reviewer">
          <div class="mini-avatar">${(r.reviewer_name||'U')[0]}</div>
          ${r.reviewer_name || 'Learner'}
        </div>
        <div class="star-rating">
          ${[1,2,3,4,5].map(i => `<span class="star ${i <= (r.rating||0) ? '' : 'empty'}">★</span>`).join('')}
        </div>
      </div>
      <div class="review-text">${r.comment || 'Great session!'}</div>
    </div>
  `).join('');
}

function openReviewModal(bookingId, teacherId) {
  document.getElementById('review-booking-id').value = bookingId;
  document.getElementById('review-teacher-id').value = teacherId;
  openModal('modal-review');
}

async function submitReview() {
  const data = {
    booking_id: parseInt(document.getElementById('review-booking-id').value),
    teacher_id: parseInt(document.getElementById('review-teacher-id').value),
    rating: parseInt(document.getElementById('review-rating').value),
    comment: document.getElementById('review-comment').value
  };
  if (!data.rating) { toast('Please select a rating', 'warning'); return; }
  await API.post('/review/add', data);
  closeModal('modal-review');
  toast('Review submitted! ⭐', 'success');
}

/* ── UTILS ── */
function formatTime(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch(e) { return ts; }
}

function openChatModal(bookingId) {
  openChat(bookingId, `Booking #${bookingId}`);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (isLoggedIn()) {
    await loadUser();
    showApp();
    navigate('dashboard');
  } else {
    showAuth();
  }

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    await login(email, pass);
  });

  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    await register(name, email, pass);
  });

  document.getElementById('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  document.getElementById('search-skill-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchMarketplace();
  });
});
