// ============================================================
//  login.js  —  Auth powered by HashTable (from dsa.js)
// ============================================================

var card = document.getElementById('card');
function openRegister() { card.style.transform = 'rotateY(-180deg)'; }
function openLogin() { card.style.transform = 'rotateY(0deg)'; }

// Helper: load HashTable from localStorage
function loadUserHashTable() {
    var raw = localStorage.getItem('userHashTable');
    if (raw) return HashTable.fromJSON(JSON.parse(raw));
    return new HashTable(64);
}

// Helper: save HashTable back to localStorage
function saveUserHashTable(ht) {
    localStorage.setItem('userHashTable', JSON.stringify(ht.toJSON()));
}

// ─── LOGIN ────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var emailOrUser = document.getElementById('loginUser').value.trim();
    var password = document.getElementById('loginPass').value.trim();

    // Hardcoded admin shortcut
    if (emailOrUser === 'Admin' || emailOrUser === 'admin' || emailOrUser === 'admin@library.com') {
        localStorage.setItem('currentUser', 'Admin');
        localStorage.setItem('currentRole', 'admin');
        window.location.href = 'index.html?section=users';
        return;
    }

    var ht = loadUserHashTable();

    // Try lookup by email first (HashTable.get)
    var user = ht.get(emailOrUser);

    // If not found by email, scan for matching name (fallback)
    if (!user) {
        var allUsers = ht.toJSON().map(e => e.value);
        user = allUsers.find(u => u.name === emailOrUser) || null;
    }

    if (!user) {
        alert('No account found with that email/username. Please register first.');
        return;
    }

    if (user.isBanned) {
        alert('Your account has been BANNED. Contact support.');
        return;
    }

    // Password check
    if (password && user.password && user.password !== password) {
        alert('Incorrect password. Try again.');
        return;
    }

    localStorage.setItem('currentUser', user.name);
    localStorage.setItem('currentRole', user.role || 'user');
    window.location.href = 'index.html?section=books';
});

// ─── REGISTER ─────────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('regUser').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPass').value.trim();

    if (!name || !email || !password) {
        alert('Please fill in all fields.'); return;
    }

    var ht = loadUserHashTable();

    // Duplicate email check using HashTable.containsKey()
    if (ht.containsKey(email)) {
        alert('This email is already registered! Redirecting to login...');
        openLogin();
        return;
    }

    // Generate ID
    var existing = ht.toJSON();
    var newId = existing.length > 0 ? Math.max(...existing.map(e => e.value.id || 0)) + 1 : 1;

    // Store user in HashTable keyed by email
    ht.put(email, {
        id: newId,
        name: name,
        email: email,
        role: 'user',
        password: password,
        isBanned: false
    });

    saveUserHashTable(ht);

    localStorage.setItem('currentUser', name);
    localStorage.setItem('currentRole', 'user');
    window.location.href = 'index.html?section=books';
});
