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
  if (id === 'modal-chat') stopChatPolling();
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

    // Show low-points nudge if balance is under 20
    const nudgeId = 'low-points-nudge';
    let nudge = document.getElementById(nudgeId);
    if (u.points < 20) {
      if (!nudge) {
        nudge = document.createElement('div');
        nudge.id = nudgeId;
        nudge.style.cssText = 'background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);border-radius:10px;padding:0.75rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;font-size:0.88rem;';
        nudge.innerHTML = `<span>⚠️ Low points balance (<strong>${u.points} pts</strong>). Top up to keep booking sessions!</span>
          <button class="btn-buy-points" onclick="openBuyPointsModal()" style="white-space:nowrap;flex-shrink:0">⚡ Buy Points</button>`;
        const statsGrid = document.querySelector('#page-dashboard .stats-grid');
        if (statsGrid) statsGrid.parentNode.insertBefore(nudge, statsGrid);
      } else {
        nudge.querySelector('strong').textContent = u.points + ' pts';
      }
    } else if (nudge) {
      nudge.remove();
    }
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

// Safe registry so skill data is never injected raw into onclick strings
window._skillRegistry = window._skillRegistry || {};

function skillCardHTML(s, showBook = false) {
  const initials = s.owner_name ? s.owner_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U';
  const expClass = `exp-${(s.experience_level || 'beginner').toLowerCase()}`;
  // Store full skill object by id so onclick never needs to embed strings
  window._skillRegistry[s.id] = s;
  const isOwn = state.user && state.user.id === s.user_id;
  // Dashboard cards (showBook=false) are clickable: own skills go to My Skills, others open booking
  const cardClick = !showBook ? (isOwn
    ? `onclick="navigate('my-skills')" style="cursor:pointer"`
    : `onclick="navigate('marketplace'); setTimeout(()=>openSkillDrawer(${s.id}),300)" style="cursor:pointer"`)
    : '';
  return `
    <div class="skill-card" ${cardClick}>
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
      ${showBook && isLoggedIn() && !(state.user && state.user.id === s.user_id) ? `
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="openSkillDrawer(${s.id})">
            👤 View Profile
          </button>
          <button class="btn btn-primary btn-sm" style="flex:1" onclick="openSkillDrawer(${s.id})">
            📅 Book Session
          </button>
        </div>
      ` : showBook && isLoggedIn() && state.user && state.user.id === s.user_id ? `
        <div class="btn btn-ghost btn-sm mt-4" style="cursor:default;opacity:0.6;pointer-events:none;">
          ✏️ Your Skill
        </div>
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
    title: document.getElementById('skill-title').value.trim(),
    category: document.getElementById('skill-category').value,
    description: document.getElementById('skill-desc').value,
    experience_level: document.getElementById('skill-level').value,
    exchange_points: parseInt(document.getElementById('skill-points').value) || 10
  };
  if (!data.title || !data.category || !data.experience_level) {
    toast('Please fill all required fields', 'warning'); return;
  }
  const btn = document.querySelector('#modal-add-skill .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
  try {
    const res = await API.post('/skill/create', data);
    if (res.id || res.message?.toLowerCase().includes('successfully')) {
      closeModal('modal-add-skill');
      toast('Skill added! 🎉', 'success');
      loadMySkills();
      document.getElementById('add-skill-form').reset();
    } else {
      toast(res.message || 'Failed to add skill', 'error');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Add Skill'; }
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
  el.innerHTML = bookings.map(b => {
    const isTeacher = b.role === 'teacher';
    const withName = isTeacher ? (b.learner_name || 'N/A') : (b.teacher_name || 'N/A');
    let actions = '';
    if (b.status === 'pending') {
      if (isTeacher) {
        actions = `
          <button class="btn btn-primary btn-sm" onclick="updateBookingStatus(${b.id},'accept')">✓ Accept</button>
          <button class="btn btn-danger btn-sm" onclick="updateBookingStatus(${b.id},'reject')">✕ Reject</button>`;
      } else {
        actions = `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">✕ Cancel Request</button>`;
      }
    } else if (b.status === 'accepted') {
      actions = `
        ${isTeacher ? `<button class="btn btn-amber btn-sm" onclick="updateBookingStatus(${b.id},'complete')">✔ Complete</button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="openChatModal(${b.id})">💬 Chat</button>`;
    } else if (b.status === 'completed' && !isTeacher) {
      actions = `<button class="btn btn-ghost btn-sm" onclick="openReviewModal(${b.id}, ${b.teacher_id})">⭐ Review</button>`;
    }
    return `
    <tr>
      <td><span class="font-display fw-bold">#${b.id}</span></td>
      <td>${b.skill_title || 'N/A'}</td>
      <td>${withName}</td>
      <td>${b.scheduled_time || '—'}</td>
      <td><span class="status-badge status-${b.status}">${statusIcon(b.status)} ${b.status}</span></td>
      <td><div class="flex-row" style="gap:6px">${actions}</div></td>
    </tr>`;
  }).join('');
}

function statusIcon(s) {
  return { pending: '⏳', accepted: '✅', rejected: '❌', completed: '🏆', cancelled: '🚫' }[s] || '•';
}

async function updateBookingStatus(id, action) {
  const res = await API.patch(`/booking/${action}/${id}`);
  if (res && res.message) {
    const msg = res.message.toLowerCase();
    if (msg.includes('insufficient') || msg.includes('not enough') || msg.includes('points')) {
      toast(`⚠️ ${res.message}`, 'error');
      // Offer to buy points if it's a points issue
      if (msg.includes('insufficient') || msg.includes('points')) {
        setTimeout(() => {
          if (confirm('The learner has insufficient points. Would you like to inform them to top up? (You can share the buy points option)')) {
            toast('💡 Learners can buy points from their Dashboard or Profile page.', 'info');
          }
        }, 400);
      }
    } else if (msg.includes('success')) {
      toast(`Booking ${action}ed!`, 'success');
    } else {
      toast(res.message, 'error');
    }
  } else {
    toast(`Booking ${action}ed!`, 'success');
  }
  loadBookings();
  // Refresh user points in case they changed
  await loadUser();
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking request?')) return;
  try {
    await API.patch(`/booking/cancel/${id}`);
    toast('Booking cancelled', 'success');
    loadBookings();
  } catch(e) {
    toast('Failed to cancel booking', 'error');
  }
}

// Safe entry point - reads from registry, never from raw onclick strings
function openBookingModalById(skillId) {
  const s = window._skillRegistry[skillId];
  if (!s) { toast('Skill data not found, please refresh the page', 'error'); return; }
  openBookingModal(s.id, s.title, s.user_id);
}

function openBookingModal(skillId, skillTitle, teacherId) {
  if (!skillId || !teacherId) {
    toast('Missing skill or teacher info', 'error');
    return;
  }
  document.getElementById('booking-skill-id').value = skillId;
  document.getElementById('booking-teacher-id').value = teacherId;
  document.getElementById('booking-skill-name').textContent = skillTitle;
  document.getElementById('booking-selected-date').value = '';
  document.getElementById('booking-selected-time').value = '';
  const msgEl = document.getElementById('booking-message');
  if (msgEl) msgEl.value = '';
  // Reset dates UI
  document.getElementById('booking-dates-list').innerHTML = '';
  document.getElementById('booking-dates-loading').style.display = 'block';
  document.getElementById('booking-no-dates-msg').style.display = 'none';
  // Reset slot UI
  document.getElementById('booking-slots-container').style.display = 'none';
  document.getElementById('booking-no-slots-msg').style.display = 'none';
  document.getElementById('booking-slots-list').innerHTML = '';
  document.getElementById('booking-selected-slot-display').style.display = 'none';
  const btn = document.getElementById('booking-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Select a slot to continue';
  openModal('modal-booking');
  loadAvailableDates(teacherId);
}

async function loadAvailableDates(teacherId) {
  const datesList = document.getElementById('booking-dates-list');
  const datesLoading = document.getElementById('booking-dates-loading');
  const noDatesMsg = document.getElementById('booking-no-dates-msg');
  try {
    const res = await API.get(`/booking/available-dates/${teacherId}`);
    const dates = res.available_dates || [];
    datesLoading.style.display = 'none';
    if (!dates.length) {
      noDatesMsg.style.display = 'block';
      return;
    }
    datesList.innerHTML = dates.map(d => {
      const dt = new Date(d + 'T00:00:00');
      const day = dt.toLocaleDateString('en-US', { weekday: 'short' });
      const mon = dt.toLocaleDateString('en-US', { month: 'short' });
      const num = dt.getDate();
      return `<button class="date-chip" onclick="selectAvailableDate('${d}', this)">`
        + `<span class="date-chip-day">${day}</span>`
        + `<span class="date-chip-num">${num}</span>`
        + `<span class="date-chip-mon">${mon}</span>`
        + `</button>`;
    }).join('');
  } catch (e) {
    datesLoading.textContent = 'Failed to load available days.';
    console.error('loadAvailableDates error:', e);
  }
}

function selectAvailableDate(date, btn) {
  // Highlight selected day chip
  document.querySelectorAll('#booking-dates-list .date-chip').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  // Reset slots
  document.getElementById('booking-slots-container').style.display = 'none';
  document.getElementById('booking-no-slots-msg').style.display = 'none';
  document.getElementById('booking-slots-list').innerHTML = '';
  document.getElementById('booking-selected-slot-display').style.display = 'none';
  document.getElementById('booking-selected-date').value = '';
  document.getElementById('booking-selected-time').value = '';
  document.getElementById('booking-submit-btn').disabled = true;
  document.getElementById('booking-submit-btn').textContent = 'Select a slot to continue';
  loadSlotsForDate(date);
}

async function loadSlotsForDate(date) {
  if (!date) return;
  const teacherId = document.getElementById('booking-teacher-id').value;
  const slotsList = document.getElementById('booking-slots-list');
  const slotsContainer = document.getElementById('booking-slots-container');
  const noSlotsMsg = document.getElementById('booking-no-slots-msg');
  const selectedDisplay = document.getElementById('booking-selected-slot-display');
  const btn = document.getElementById('booking-submit-btn');

  // Reset selection
  document.getElementById('booking-selected-date').value = '';
  document.getElementById('booking-selected-time').value = '';
  selectedDisplay.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Select a slot to continue';

  slotsList.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem">Loading slots...</span>';
  slotsContainer.style.display = 'block';
  noSlotsMsg.style.display = 'none';

  try {
    const res = await API.get(`/booking/slots/${teacherId}?date=${date}`);
    const slots = res.available_slots || [];

    if (!slots.length) {
      slotsContainer.style.display = 'none';
      noSlotsMsg.style.display = 'block';
      return;
    }

    noSlotsMsg.style.display = 'none';
    slotsContainer.style.display = 'block';

    // Generate 30-minute time slots within each availability window
    const bookedTimes = slots.flatMap(s => s.booked_times || []);
    let html = '';

    slots.forEach(slot => {
      const times = generateTimeSlots(slot.start_time, slot.end_time, 30);
      times.forEach(time => {
        const isTaken = bookedTimes.includes(time);
        if (isTaken) {
          html += `<button class="slot-btn taken" disabled title="Already booked">${time} (taken)</button>`;
        } else {
          html += `<button class="slot-btn" onclick="selectSlot('${date}', '${time}')">${time}</button>`;
        }
      });
    });

    slotsList.innerHTML = html || '<span style="color:var(--text-muted);font-size:0.85rem">No slots available on this date.</span>';

  } catch (e) {
    console.error('loadSlotsForDate error:', e);
    slotsList.innerHTML = '<span style="color:var(--coral);font-size:0.85rem">Failed to load slots. Please try again.</span>';
  }
}

// Generate time slots at given interval (minutes) between start and end
function generateTimeSlots(start, end, intervalMins) {
  const times = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur < endMin) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    times.push(`${h}:${m}`);
    cur += intervalMins;
  }
  return times;
}

function selectSlot(date, time) {
  // Deselect all
  document.querySelectorAll('#booking-slots-list .slot-btn').forEach(b => b.classList.remove('selected'));
  // Select clicked
  event.target.classList.add('selected');

  document.getElementById('booking-selected-date').value = date;
  document.getElementById('booking-selected-time').value = time;

  const label = document.getElementById('booking-slot-label');
  label.textContent = `${date} at ${time}`;
  document.getElementById('booking-selected-slot-display').style.display = 'block';

  const btn = document.getElementById('booking-submit-btn');
  btn.disabled = false;
  btn.textContent = 'Send Booking Request';
}

async function createBooking() {
  const skillId = parseInt(document.getElementById('booking-skill-id').value);
  const date = document.getElementById('booking-selected-date').value;
  const time = document.getElementById('booking-selected-time').value;

  if (!date || !time) { toast('Please select an available slot first', 'warning'); return; }
  if (!skillId || isNaN(skillId)) { toast('Skill not selected properly — please try again', 'error'); return; }

  const data = {
    skill_id: skillId,
    scheduled_time: `${date}T${time}`,
    message: document.getElementById('booking-message') ? document.getElementById('booking-message').value : ''
  };

  const btn = document.getElementById('booking-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await API.post('/booking/create', data);
    if (res.id || res.message?.toLowerCase().includes('created')) {
      closeModal('modal-booking');
      toast('Booking request sent!', 'success');
      navigate('bookings');
    } else {
      toast(res.message || 'Booking failed', 'error');
      btn.disabled = false;
      btn.textContent = 'Send Booking Request';
    }
  } catch (e) {
    console.error('createBooking error:', e);
    toast('Network error — could not reach server', 'error');
    btn.disabled = false;
    btn.textContent = 'Send Booking Request';
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
        🕐 ${s.date} ${s.start_time}–${s.end_time}
        <button onclick="deleteSlot(${s.id})" style="background:none;border:none;cursor:pointer;color:var(--coral);padding:0;font-size:0.9rem;margin-left:4px">✕</button>
      </div>
    `).join('') + `</div>`;
}

async function addSlot() {
  const data = {
    date: document.getElementById('slot-day').value,
    start_time: document.getElementById('slot-start').value,
    end_time: document.getElementById('slot-end').value
  };

  if (!data.date || !data.start_time || !data.end_time) {
    toast('Fill all fields', 'warning');
    return;
  }

  const res = await API.post('/availability/add', data);

  if (
    res.message &&
    res.message.toLowerCase().includes('success')
  ) {
    toast('Slot added!', 'success');

    document.getElementById('slot-form').reset();

    await loadAvailability();

  } else {

    toast(
      res.message || 'Failed to add slot',
      'error'
    );
  }
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
let chatPollInterval = null;
let lastRenderedMessageCount = 0;

function stopChatPolling() {
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
    chatPollInterval = null;
  }
}

async function refreshChatMessages() {
  if (!currentChatBookingId) return;
  try {
    const messages = await API.get(`/message/chat/${currentChatBookingId}`);
    renderChatMessages(Array.isArray(messages) ? messages : []);
  } catch(e) {}
}

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
  stopChatPolling();
  lastRenderedMessageCount = 0;
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
  // Poll for new messages every 3 seconds while chat is open
  chatPollInterval = setInterval(refreshChatMessages, 3000);
}

function renderChatMessages(messages) {
  const el = document.getElementById('chat-messages');
  const myId = state.user?.id;

  if (!messages.length) {
    if (lastRenderedMessageCount !== 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-title">No messages yet</div><div class="empty-state-desc">Start the conversation!</div></div>`;
      lastRenderedMessageCount = 0;
    }
    return;
  }

  // Only re-render when there are new messages
  if (messages.length === lastRenderedMessageCount) return;

  // Check if user is scrolled near the bottom before re-rendering
  const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;

  el.innerHTML = messages.map(m => {
    const isMine = m.sender_id === myId;
    return `
      <div style="display:flex; flex-direction:column; align-items:${isMine ? 'flex-end' : 'flex-start'}">
        <div class="message-bubble ${isMine ? 'sent' : 'received'}">${m.content}</div>
        <div class="message-time">${m.sender_name || ''} · ${formatTime(m.timestamp)}</div>
      </div>
    `;
  }).join('');

  lastRenderedMessageCount = messages.length;

  // Only auto-scroll if user was already near the bottom
  if (isNearBottom) el.scrollTop = el.scrollHeight;
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
    // Append the sent message immediately for instant feedback
    const el = document.getElementById('chat-messages');
    // Remove empty-state placeholder if present
    const emptyState = el.querySelector('.empty-state');
    if (emptyState) el.innerHTML = '';
    const now = new Date().toISOString();
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; flex-direction:column; align-items:flex-end';
    div.innerHTML = `
      <div class="message-bubble sent">${content}</div>
      <div class="message-time"> · ${formatTime(now)}</div>
    `;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
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

/* ══════════════════════════════════════
   SKILL DETAIL DRAWER
══════════════════════════════════════ */
let _drawerSkill = null;

function closeDrawer() {
  document.getElementById('skill-detail-drawer').classList.remove('open');
  _drawerSkill = null;
}

function closeDrawerOnBackdrop(e) {
  if (e.target === document.getElementById('skill-detail-drawer')) closeDrawer();
}

// Called from the "Book Session" button on skill cards
function openSkillDrawer(skillId) {
  const s = window._skillRegistry[skillId];
  if (!s) { toast('Skill data not found, please refresh', 'error'); return; }
  _drawerSkill = s;
  const drawer = document.getElementById('skill-detail-drawer');
  document.getElementById('drawer-skill-title').textContent = s.title;
  document.getElementById('drawer-body').innerHTML = `<div class="drawer-loading"><div class="loader"></div></div>`;
  drawer.classList.add('open');
  _populateDrawer(s);
}

async function _populateDrawer(s) {
  const initials = s.owner_name
    ? s.owner_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const expClass = `exp-${(s.experience_level || 'beginner').toLowerCase()}`;

  // Fetch reviews for this teacher
  let reviews = [];
  try {
    const raw = await API.get(`/review/user/${s.user_id}`);
    reviews = Array.isArray(raw) ? raw : [];
  } catch(e) {}

  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : null;

  // Build star display
  function starsHTML(rating, size = 'normal') {
    const r = Math.round(parseFloat(rating) || 0);
    return [1,2,3,4,5].map(i =>
      `<span style="color:${i <= r ? '#f9c23c' : 'var(--border)'}">★</span>`
    ).join('');
  }

  // Reviews section
  let reviewsHTML = '';
  if (!totalReviews) {
    reviewsHTML = `<div class="drawer-no-reviews">No reviews yet — be the first to learn from ${s.owner_name || 'this teacher'}!</div>`;
  } else {
    reviewsHTML = `<div class="drawer-reviews-list">` +
      reviews.slice(0, 5).map(r => `
        <div class="drawer-review-item">
          <div class="drawer-review-top">
            <div class="drawer-review-reviewer">
              <div class="mini-avatar" style="width:24px;height:24px;font-size:0.65rem">L</div>
              Learner
            </div>
            <div class="drawer-review-stars">${starsHTML(r.rating)}</div>
          </div>
          <div class="drawer-review-text">${r.review || r.comment || 'Great session!'}</div>
        </div>
      `).join('') +
    `</div>`;
  }

  document.getElementById('drawer-body').innerHTML = `
    <!-- Teacher Profile Row -->
    <div>
      <div class="drawer-section-label">Teacher</div>
      <div class="drawer-teacher-row">
        <div class="drawer-teacher-avatar">${initials}</div>
        <div class="drawer-teacher-info">
          <div class="drawer-teacher-name">${s.owner_name || 'Unknown'}</div>
          <div class="drawer-teacher-meta">
            ${s.owner_location ? `📍 ${s.owner_location}` : ''}
          </div>
          <div class="drawer-rating-row">
            ${avgRating ? `
              <span class="drawer-stars">${starsHTML(avgRating)}</span>
              <span class="drawer-rating-num">${avgRating}</span>
              <span class="drawer-review-count">(${totalReviews} review${totalReviews !== 1 ? 's' : ''})</span>
            ` : `<span class="drawer-review-count" style="font-size:0.78rem">No ratings yet</span>`}
          </div>
        </div>
        ${s.owner_rating ? `
          <div style="text-align:center;background:var(--teal-glow);border:1px solid var(--teal-dim);border-radius:10px;padding:8px 12px">
            <div style="font-size:1.3rem;font-weight:800;color:var(--teal)">${parseFloat(s.owner_rating).toFixed(1)}</div>
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em">Rating</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Skill Details -->
    <div>
      <div class="drawer-section-label">Skill Details</div>
      <div class="drawer-skill-info">
        <div class="drawer-tags">
          <span class="skill-category-tag">🏷 ${s.category || 'General'}</span>
          <span class="exp-badge ${expClass}">${s.experience_level || 'Beginner'}</span>
          <span class="points-chip">⚡ ${s.exchange_points || 10} pts</span>
        </div>
        <div class="drawer-skill-desc">${s.description || 'No description provided.'}</div>
      </div>
    </div>

    <!-- Reviews -->
    <div>
      <div class="drawer-section-label">Reviews ${totalReviews ? `· ${totalReviews}` : ''}</div>
      ${reviewsHTML}
    </div>
  `;
}

// Called from the drawer footer "Book This Session" button
function proceedToBooking() {
  if (!_drawerSkill) return;
  const s = _drawerSkill;
  closeDrawer();
  // Small delay lets drawer close smoothly before modal opens
  setTimeout(() => openBookingModal(s.id, s.title, s.user_id), 220);
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
   BUY POINTS
══════════════════════════════════════ */

const POINTS_PACKAGES = [
  { id: 'starter',   points: 50,   price: 79,   label: 'Starter Pack',   emoji: '🌱', color: '#4ade80' },
  { id: 'popular',   points: 150,  price: 199,  label: 'Popular Pack',   emoji: '⚡', color: '#f59e0b', badge: 'BEST VALUE' },
  { id: 'pro',       points: 400,  price: 399,  label: 'Pro Pack',       emoji: '🚀', color: '#818cf8' },
  { id: 'unlimited', points: 1000, price: 799,  label: 'Unlimited Pack', emoji: '💎', color: '#f472b6' },
];

function openBuyPointsModal() {
  const existing = document.getElementById('buy-points-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'buy-points-modal';
  modal.className = 'modal-overlay open';
  modal.innerHTML = `
    <div class="modal-box buy-points-modal-box">
      <div class="modal-header">
        <h2 class="modal-title">⚡ Buy Points</h2>
        <button class="modal-close" onclick="closeBuyPointsModal()">✕</button>
      </div>
      <p class="buy-points-subtitle">Top up your balance to keep learning. Points are used to book skill sessions.</p>
      <div class="buy-points-balance">
        Current Balance: <strong id="buy-modal-balance">${state.user?.points ?? 0} pts</strong>
      </div>
      <div class="buy-points-grid">
        ${POINTS_PACKAGES.map(pkg => `
          <div class="buy-points-card ${pkg.badge ? 'featured' : ''}" data-pkg-id="${pkg.id}">
            ${pkg.badge ? `<div class="pkg-badge">${pkg.badge}</div>` : ''}
            <div class="pkg-emoji">${pkg.emoji}</div>
            <div class="pkg-label">${pkg.label}</div>
            <div class="pkg-points" style="color:${pkg.color}">+${pkg.points} pts</div>
            <div class="pkg-price">₹${pkg.price}</div>
          </div>
        `).join('')}
      </div>
      <div id="buy-points-selected" class="buy-points-selected" style="display:none">
        <span id="buy-points-selected-text"></span>
      </div>
      <div class="buy-points-note">🔒 Demo mode — no real payment. Points are added instantly.</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeBuyPointsModal()">Cancel</button>
        <button class="btn btn-primary" id="confirm-buy-btn" onclick="confirmBuyPoints()" disabled>
          Confirm Purchase
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => {
    if (e.target === modal) { closeBuyPointsModal(); return; }
    const card = e.target.closest('.buy-points-card');
    if (card) selectPackage(card.dataset.pkgId, card);
  });
}

let selectedPackageId = null;

function selectPackage(pkgId, cardEl) {
  selectedPackageId = pkgId;
  document.querySelectorAll('.buy-points-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');

  const pkg = POINTS_PACKAGES.find(p => p.id === pkgId);
  const selDiv = document.getElementById('buy-points-selected');
  const selText = document.getElementById('buy-points-selected-text');
  selText.textContent = `${pkg.emoji} ${pkg.label}: +${pkg.points} pts for ₹${pkg.price}`;
  selDiv.style.display = 'block';
  document.getElementById('confirm-buy-btn').disabled = false;
}

function closeBuyPointsModal() {
  const modal = document.getElementById('buy-points-modal');
  if (modal) modal.remove();
  selectedPackageId = null;
}

async function confirmBuyPoints() {
  if (!selectedPackageId) return;

  const btn = document.getElementById('confirm-buy-btn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const res = await API.post('/user/points/buy', { package_id: selectedPackageId });
    if (res.new_balance !== undefined) {
      state.user.points = res.new_balance;
      updateHeaderUser();

      // Update points wherever displayed
      const dashPts = document.getElementById('dash-points');
      if (dashPts) dashPts.textContent = res.new_balance;
      const profPts = document.getElementById('profile-points');
      if (profPts) profPts.textContent = res.new_balance;

      closeBuyPointsModal();
      toast(`🎉 ${res.message}`, 'success');
    } else {
      toast(res.message || 'Purchase failed', 'error');
      btn.disabled = false;
      btn.textContent = 'Confirm Purchase';
    }
  } catch(e) {
    toast('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Confirm Purchase';
  }
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