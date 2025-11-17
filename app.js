// ========================
// Simple SPA page handling
// ========================
const pages = document.querySelectorAll('.page');

function showPage(pageId) {
  pages.forEach(page => page.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
}

// ====================================
// Local "database" for users (Vincent)
// ====================================
const USERS_KEY = 'robodoc_users';
let currentUserEmail = null;

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Utility: password rule (min 8 + special char)
function isStrongPassword(pw) {
  if (!pw || pw.length < 8) return false;
  return /[^A-Za-z0-9]/.test(pw); // at least one special char
}

// =======================
// Auth UI logic
// =======================
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const changeForm = document.getElementById('change-credentials-form');
const currentUserLabel = document.getElementById('current-user-label');

function setAuthTab(mode) {
  if (mode === 'login') {
    tabLogin.classList.add('text-blue-600', 'border-blue-600', 'font-semibold');
    tabLogin.classList.remove('text-gray-500');
    tabSignup.classList.remove('text-blue-600', 'border-blue-600', 'font-semibold');
    tabSignup.classList.add('text-gray-500');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    tabSignup.classList.add('text-blue-600', 'border-blue-600', 'font-semibold');
    tabSignup.classList.remove('text-gray-500');
    tabLogin.classList.remove('text-blue-600', 'border-blue-600', 'font-semibold');
    tabLogin.classList.add('text-gray-500');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

tabLogin.addEventListener('click', () => setAuthTab('login'));
tabSignup.addEventListener('click', () => setAuthTab('signup'));

// Sign up
signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;

  if (!isStrongPassword(password)) {
    alert('Password must be at least 8 characters and include a special character.');
    return;
  }

  const users = loadUsers();
  const existing = users.find(u => u.email === email);

  if (existing) {
    alert('An account with that email already exists.');
    return;
  }

  users.push({ email, password });
  saveUsers(users);

  alert('Account created! Please log in.');
  setAuthTab('login');
});

// Log in
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('Invalid email or password.');
    return;
  }

  currentUserEmail = email;
  currentUserLabel.textContent = `Logged in as ${currentUserEmail}`;
  showPage('page-input');
});

// Change email/password
changeForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentUserEmail) {
    alert('You must be logged in to change your email or password.');
    return;
  }

  const newEmailEl = document.getElementById('new-email');
  const newPasswordEl = document.getElementById('new-password');
  const newEmail = newEmailEl.value.trim().toLowerCase();
  const newPassword = newPasswordEl.value;

  const users = loadUsers();
  const currentUser = users.find(u => u.email === currentUserEmail);

  if (!currentUser) {
    alert('Current user not found. Please log in again.');
    return;
  }

  // Validate email change
  if (newEmail && newEmail !== currentUser.email) {
    const emailExists = users.some(u => u.email === newEmail);
    if (emailExists) {
      alert('That email is already in use by another account.');
      return;
    }
    currentUser.email = newEmail;
    currentUserEmail = newEmail;
  }

  // Validate password change
  if (newPassword) {
    if (newPassword === currentUser.password) {
      alert('New password cannot be the same as the old password.');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      alert('New password must be at least 8 characters and include a special character.');
      return;
    }
    currentUser.password = newPassword;
  }

  saveUsers(users);
  currentUserLabel.textContent = `Logged in as ${currentUserEmail}`;
  newEmailEl.value = '';
  newPasswordEl.value = '';
  alert('Credentials updated.');
});

// ============================================
// Mock medicine "database" + recommendation
// ============================================

const medDatabase = [
  {
    id: 'ibuprofen',
    name: 'Ibuprofen (Advil, Motrin)',
    description: 'Over-the-counter pain reliever & fever reducer.',
    symptoms: ['fever', 'pain', 'headache', 'sore throat', 'body aches'],
    avoidIfAllergy: ['ibuprofen', 'advil', 'motrin', 'nsaid'],
    avoidIfHistory: ['kidney', 'ulcer', 'bleeding disorder'],
    pros: ['Reduces fever effectively', 'Helps with body aches', 'Widely available'],
    cons: ['Can cause stomach upset', 'Not recommended with kidney issues'],
    costLabel: 'Low Cost'
  },
  {
    id: 'acetaminophen',
    name: 'Acetaminophen (Tylenol)',
    description: 'Over-the-counter pain reliever & fever reducer.',
    symptoms: ['fever', 'pain', 'headache'],
    avoidIfAllergy: ['acetaminophen', 'tylenol'],
    avoidIfHistory: ['liver', 'hepatitis'],
    pros: ['Gentler on the stomach', 'Effective for pain and fever', 'Fewer drug interactions'],
    cons: ['Not an anti-inflammatory', 'Risk of liver damage if taken in high doses'],
    costLabel: 'Low Cost'
  },
  {
    id: 'throat-lozenges',
    name: 'Sore Throat Lozenges',
    description: 'Medicated drops to soothe throat irritation.',
    symptoms: ['sore throat', 'cough', 'throat pain'],
    avoidIfAllergy: ['menthol', 'benzocaine'],
    avoidIfHistory: [],
    pros: ['Provides immediate relief', 'Can numb throat slightly', 'Easy to use'],
    cons: ['Relief is temporary', 'Does not treat the underlying cause'],
    costLabel: 'Low Cost'
  },
  {
    id: 'saline-spray',
    name: 'Saline Nasal Spray',
    description: 'Non-medicated spray to ease congestion and dryness.',
    symptoms: ['congestion', 'stuffy nose'],
    avoidIfAllergy: [],
    avoidIfHistory: [],
    pros: ['Safe for most people', 'Can be used frequently', 'Non-medicated'],
    cons: ['Mild, may not be enough alone for severe symptoms'],
    costLabel: 'Low Cost'
  }
];

// Very simple keyword extraction from free text
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map(t => t.trim())
    .filter(Boolean);
}

function getRecommendations(symptomText, historyText, allergyText) {
  const symptomTokens = tokenize(symptomText);
  const historyTokens = tokenize(historyText || '');
  const allergyTokens = tokenize(allergyText || '');

  const matches = [];

  medDatabase.forEach(med => {
    // Does med match at least one symptom?
    const symptomMatch = med.symptoms.some(sym =>
      symptomTokens.some(token => sym.includes(token) || token.includes(sym))
    );
    if (!symptomMatch) return;

    // Check allergies
    const hasAllergyConflict = med.avoidIfAllergy.some(allergen =>
      allergyTokens.includes(allergen)
    );

    // Check medical history
    const hasHistoryConflict = med.avoidIfHistory.some(flag =>
      historyTokens.includes(flag)
    );

    if (hasAllergyConflict || hasHistoryConflict) {
      matches.push({
        med,
        safe: false,
        reason: hasAllergyConflict
          ? 'Possible allergy conflict.'
          : 'May not be recommended with your medical history.'
      });
    } else {
      matches.push({
        med,
        safe: true,
        reason: 'No obvious conflicts detected in this mock system.'
      });
    }
  });

  return matches;
}

// ==============================
// "AI-style" chat (Sean's part)
// ==============================
const chatOutput = document.getElementById('chat-output');

function addChatMessage(text, from = 'ai') {
  const wrapper = document.createElement('div');
  wrapper.classList.add('flex', 'w-full');

  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', from === 'user' ? 'chat-user' : 'chat-ai');

  bubble.textContent = text;

  if (from === 'user') {
    wrapper.classList.add('justify-end');
  } else {
    wrapper.classList.add('justify-start');
  }

  wrapper.appendChild(bubble);
  chatOutput.appendChild(wrapper);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// ==============================
// Hooking up input → analysis → summary
// ==============================
const analyzeBtn = document.getElementById('analyze-btn');
const backBtn = document.getElementById('back-btn');
const summaryCondition = document.getElementById('summary-condition');
const recommendationList = document.getElementById('recommendation-list');
const noResultsMessage = document.getElementById('no-results-message');

analyzeBtn.addEventListener('click', () => {
  const diagnosis = document.getElementById('diagnosis').value.trim();
  const history = document.getElementById('history').value.trim();
  const allergies = document.getElementById('allergies').value.trim();

  if (!diagnosis) {
    alert('Please enter your primary symptoms or diagnosis first.');
    return;
  }

  // Move to analysis page
  showPage('page-analysis');

  // "AI processing" delay
  setTimeout(() => {
    // Get recommendations
    const recs = getRecommendations(diagnosis, history, allergies);

    // Update summary header text
    summaryCondition.textContent = diagnosis.length > 50
      ? diagnosis.slice(0, 47) + '...'
      : diagnosis;

    // Clear old content
    recommendationList.innerHTML = '';
    chatOutput.innerHTML = '';
    noResultsMessage.classList.add('hidden');

    // Build chat flow
    addChatMessage(`Thanks for sharing your symptoms. I see you're dealing with: ${diagnosis}.`, 'ai');

    if (history) {
      addChatMessage(`I'll also keep in mind your medical history: ${history}.`, 'ai');
    }

    if (allergies) {
      addChatMessage(`And I’ll avoid options related to these allergies: ${allergies}.`, 'ai');
    }

    // Fill recommendation cards
    if (recs.length === 0) {
      noResultsMessage.classList.remove('hidden');
      addChatMessage(
        "I couldn't match your symptoms with any options in this mock database. This demo can't replace a real doctor, so please talk to a professional if you're concerned.",
        'ai'
      );
    } else {
      const safeCount = recs.filter(r => r.safe).length;
      const unsafeCount = recs.filter(r => !r.safe).length;

      addChatMessage(
        `Based on our mock rules, I found ${safeCount} option(s) that look generally safe and ${unsafeCount} that may have conflicts.`,
        'ai'
      );

      recs.forEach(({ med, safe, reason }) => {
        const card = document.createElement('div');
        card.className = 'pro-con-card bg-white border border-gray-200 rounded-lg p-5';

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-bold text-gray-900">${med.name}</h3>
              <p class="text-sm text-gray-600">${med.description}</p>
              <p class="mt-1 text-xs ${safe ? 'text-green-600' : 'text-red-600'} font-semibold">
                ${safe ? 'Mock status: Likely OK' : 'Mock status: Use caution'}
              </p>
              <p class="mt-1 text-xs text-gray-500">${reason}</p>
            </div>
            <div class="text-center ml-4 flex-shrink-0">
              <p class="text-lg font-bold text-green-600">$</p>
              <p class="text-xs text-gray-500">${med.costLabel}</p>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="bg-green-50 p-3 rounded-md">
              <h4 class="font-semibold text-green-800 mb-2">Pros</h4>
              <ul class="list-disc list-inside space-y-1 text-green-700">
                ${med.pros.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
            <div class="bg-red-50 p-3 rounded-md">
              <h4 class="font-semibold text-red-800 mb-2">Potential Cons</h4>
              <ul class="list-disc list-inside space-y-1 text-red-700">
                ${med.cons.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;

        recommendationList.appendChild(card);
      });

      addChatMessage(
        'These suggestions are generated from a limited, hard-coded database just for demo purposes. Please consult a licensed healthcare provider before taking any medication.',
        'ai'
      );
    }

    // Show summary page
    showPage('page-summary');
  }, 2000); // 2s "analysis"
});

backBtn.addEventListener('click', () => {
  document.getElementById('diagnosis').value = '';
  document.getElementById('history').value = '';
  document.getElementById('allergies').value = '';
  recommendationList.innerHTML = '';
  chatOutput.innerHTML = '';
  noResultsMessage.classList.add('hidden');
  showPage('page-input');
});

// Start on auth page by default
showPage('page-auth');
setAuthTab('login');
