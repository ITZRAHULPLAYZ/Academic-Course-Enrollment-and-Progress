var bookCatalog = new ArrayList();
var userHashTable = new HashTable(64);
var borrowStack = new Stack();
var recentlyViewed = new CircularLinkedList(5);
var bookIdCounter = 1;

function saveState() {
    localStorage.setItem('bookCatalog', JSON.stringify(bookCatalog.toJSON()));
    localStorage.setItem('userHashTable', JSON.stringify(userHashTable.toJSON()));
    localStorage.setItem('borrowStack', JSON.stringify(borrowStack.toJSON()));
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed.toJSON()));
    localStorage.setItem('bookIdCounter', bookIdCounter);
}

function loadState() {
    const bc = localStorage.getItem('bookCatalog');
    const uht = localStorage.getItem('userHashTable');
    const bs = localStorage.getItem('borrowStack');
    const rv = localStorage.getItem('recentlyViewed');

    if (bc) { bookCatalog = ArrayList.fromJSON(JSON.parse(bc)); }
    if (uht) { userHashTable = HashTable.fromJSON(JSON.parse(uht)); }
    if (bs) { borrowStack = Stack.fromJSON(JSON.parse(bs)); }
    if (rv) { recentlyViewed = CircularLinkedList.fromJSON(JSON.parse(rv), 5); }

    const ctr = localStorage.getItem('bookIdCounter');
    if (ctr) bookIdCounter = parseInt(ctr);
}

function checkAuth() {
    var user = localStorage.getItem('currentUser');
    var nav = document.querySelector('nav');
    var loginBtn = nav.lastElementChild;
    if (user) {
        loginBtn.textContent = 'Logout (' + user + ')';
        loginBtn.onclick = function () {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentRole');
            location.reload();
        };
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = function () { window.location.href = 'login.html'; };
    }
}

window.onload = function () {
    loadState();
    checkAuth();

    const section = new URLSearchParams(window.location.search).get('section');
    if (section) showSection(section);

    if (bookCatalog.size === 0) {
        bookCatalog.add({ id: bookIdCounter++, title: 'Introduction to Algorithms', author: 'Cormen' });
        bookCatalog.add({ id: bookIdCounter++, title: 'Clean Code', author: 'Robert Martin' });
        bookCatalog.add({ id: bookIdCounter++, title: 'Design Patterns', author: 'Gamma' });
    }

    if (!userHashTable.containsKey('admin@library.com')) {
        userHashTable.put('admin@library.com', {
            id: 0, name: 'Admin', email: 'admin@library.com',
            role: 'admin', password: 'admin', isBanned: false
        });
        userHashTable.put('alice@example.com', {
            id: 1, name: 'Alice Smith', email: 'alice@example.com',
            role: 'user', password: 'alice123', isBanned: false
        });
        userHashTable.put('bob@example.com', {
            id: 2, name: 'Bob Jones', email: 'bob@example.com',
            role: 'user', password: 'bob123', isBanned: false
        });
    }

    saveState();
    renderBooks(bookCatalog.toArray());
    renderUsers();
    renderBorrowHistory();
    renderRecentlyViewed();
};

function showSection(id) {
    ['home', 'books', 'users'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
}

function addBook() {
    if (!localStorage.getItem('currentUser')) {
        alert('You must be logged in to add books!');
        window.location.href = 'login.html'; return;
    }
    var title = document.getElementById('bookTitle').value.trim();
    var author = document.getElementById('bookAuthor').value.trim();
    if (!title || !author) { alert('Please fill in all fields.'); return; }

    var book = { id: bookIdCounter++, title: title, author: author };
    bookCatalog.add(book);
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    saveState();
    renderBooks(bookCatalog.toArray());
    alert('Book added successfully!');
}

function deleteBook(id) {
    if (!localStorage.getItem('currentUser')) { alert('Login required.'); return; }
    bookCatalog.remove(id);
    saveState();
    renderBooks(bookCatalog.toArray());
}

function renderBooks(list) {
    var tbody = document.getElementById('bookTableBody');
    tbody.innerHTML = '';
    var role = localStorage.getItem('currentRole');
    for (var i = 0; i < list.length; i++) {
        var b = list[i];
        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + b.id + '</td>' +
            '<td>' + b.title + '</td>' +
            '<td>' + b.author + '</td>' +
            '<td>' +
            '<button class="action-btn borrow-btn" onclick="borrowBook(' + b.id + ')">📖 Borrow</button>' +
            '<button class="action-btn view-btn"   onclick="viewBook(' + b.id + ')">👁 View</button>' +
            (role === 'admin' ? '<button class="action-btn delete-btn" onclick="deleteBook(' + b.id + ')">🗑 Delete</button>' : '') +
            '</td>';
        tbody.appendChild(row);
    }
}

function searchBooks() {
    var query = document.getElementById('searchBookInput').value.trim().toLowerCase();
    if (!query) { renderBooks(bookCatalog.toArray()); return; }
    var results = bookCatalog.toArray().filter(b =>
        b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
    );
    renderBooks(results);
}

function borrowBook(id) {
    if (!localStorage.getItem('currentUser')) {
        alert('You must be logged in to borrow books!');
        window.location.href = 'login.html'; return;
    }
    var book = bookCatalog.find(id);
    if (!book) { alert('Book not found.'); return; }

    borrowStack.push({ bookId: book.id, title: book.title, borrowedAt: new Date().toLocaleString() });
    saveState();
    renderBorrowHistory();
    alert('"' + book.title + '" borrowed!');
}

function undoBorrow() {
    if (borrowStack.isEmpty()) { alert('No borrow history to undo.'); return; }
    var last = borrowStack.pop();
    saveState();
    renderBorrowHistory();
    alert('"' + last.title + '" removed from borrow history.');
}

function renderBorrowHistory() {
    var list = document.getElementById('borrowHistoryList');
    if (!list) return;
    var items = borrowStack.toArray();
    if (items.length === 0) {
        list.innerHTML = '<li class="empty-note">No borrow history yet. Borrow a book!</li>';
        return;
    }
    list.innerHTML = items.map((item, i) =>
        '<li>' +
        '<span class="stack-badge">#' + (items.length - i) + '</span>' +
        '<strong>' + item.title + '</strong>' +
        '<span class="borrow-date">' + item.borrowedAt + '</span>' +
        '</li>'
    ).join('');
}

function viewBook(id) {
    var book = bookCatalog.find(id);
    if (!book) return;
    recentlyViewed.insert({ id: book.id, title: book.title });
    saveState();
    renderRecentlyViewed();
}

function renderRecentlyViewed() {
    var list = document.getElementById('recentlyViewedList');
    if (!list) return;
    var items = recentlyViewed.toArray();
    if (items.length === 0) {
        list.innerHTML = '<li class="empty-note">No books viewed yet. Click 👁 View on any book!</li>';
        return;
    }
    list.innerHTML = items.map(item =>
        '<li>📚 ' + item.title + '</li>'
    ).join('');
}

function renderUsers() {
    var tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var role = localStorage.getItem('currentRole');
    var allUsers = userHashTable.toJSON().map(e => e.value);

    for (var i = 0; i < allUsers.length; i++) {
        var u = allUsers[i];
        var statusText = u.role === 'admin' ? 'Admin' : (u.isBanned ? 'BANNED' : 'Active');
        var statusColor = u.role === 'admin' ? 'blue' : (u.isBanned ? 'red' : 'green');
        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + u.id + '</td>' +
            '<td>' + u.name + '</td>' +
            '<td>' + u.email + '</td>' +
            '<td style="color:' + statusColor + ';font-weight:bold">' + statusText + '</td>' +
            '<td>' + (role === 'admin' && u.role !== 'admin' && !u.isBanned
                ? '<button class="action-btn delete-btn" onclick="banUser(\'' + u.email + '\')">🚫 Ban</button>'
                : (u.isBanned ? '🚫' : '')) + '</td>';
        tbody.appendChild(row);
    }
}

function banUser(email) {
    if (localStorage.getItem('currentRole') !== 'admin') {
        alert('Only Admins can ban users!'); return;
    }
    var user = userHashTable.get(email);
    if (!user) return;
    if (user.role === 'admin') { alert('Cannot ban an Admin.'); return; }
    user.isBanned = true;
    userHashTable.put(email, user);
    saveState();
    renderUsers();
    alert(user.name + ' has been banned.');
}

function clearUsers() {
    if (!localStorage.getItem('currentUser')) {
        alert('Login required.'); return;
    }
    if (!confirm('Delete ALL non-admin users? This cannot be undone.')) return;

    var newHT = new HashTable(64);
    newHT.put('admin@library.com', {
        id: 0, name: 'Admin', email: 'admin@library.com',
        role: 'admin', password: 'admin', isBanned: false
    });
    userHashTable = newHT;
    saveState();
    renderUsers();
    alert('User database cleared (Admin preserved).');
}
