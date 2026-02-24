// ============================================================
//  script.js  —  Library Management System (DSA-powered)
// ============================================================
//  DSA structures used (all from dsa.js):
//  • SinglyLinkedList  →  Book catalog
//  • HashTable         →  User store (auth)
//  • Stack             →  Borrow history
//  • CircularLinkedList→  Recently viewed books
//  • bubbleSort()      →  Sort books by title
//  • linearSearch()    →  Search books
//  • binarySearch()    →  Find book by ID
// ============================================================

// ─── State ───────────────────────────────────────────────────
var bookCatalog = new SinglyLinkedList();  // replaces plain books[]
var userHashTable = new HashTable(64);       // replaces plain users[]
var borrowStack = new Stack();             // borrow history
var recentlyViewed = new CircularLinkedList(5); // last 5 viewed books
var bookIdCounter = 1;

// ─── Persist / Restore from localStorage ─────────────────────
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

    if (bc) { bookCatalog = SinglyLinkedList.fromJSON(JSON.parse(bc)); }
    if (uht) { userHashTable = HashTable.fromJSON(JSON.parse(uht)); }
    if (bs) { borrowStack = Stack.fromJSON(JSON.parse(bs)); }
    if (rv) { recentlyViewed = CircularLinkedList.fromJSON(JSON.parse(rv), 5); }

    const ctr = localStorage.getItem('bookIdCounter');
    if (ctr) bookIdCounter = parseInt(ctr);
}

// ─── Authentication Check ─────────────────────────────────────
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

// ─── Init ─────────────────────────────────────────────────────
window.onload = function () {
    loadState();
    checkAuth();

    // Navigate to section from URL param
    const section = new URLSearchParams(window.location.search).get('section');
    if (section) showSection(section);

    // Seed default books if catalog empty
    if (bookCatalog.size === 0) {
        bookCatalog.insert({ id: bookIdCounter++, title: 'Introduction to Algorithms', author: 'Cormen' });
        bookCatalog.insert({ id: bookIdCounter++, title: 'Clean Code', author: 'Robert Martin' });
        bookCatalog.insert({ id: bookIdCounter++, title: 'Design Patterns', author: 'Gamma' });
    }

    // Seed default users into HashTable if empty
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

// ─── Navigation ───────────────────────────────────────────────
function showSection(id) {
    ['home', 'books', 'users', 'dsa-tools'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
}

// ─── Book Logic ───────────────────────────────────────────────
function addBook() {
    if (!localStorage.getItem('currentUser')) {
        alert('You must be logged in to add books!');
        window.location.href = 'login.html'; return;
    }
    var title = document.getElementById('bookTitle').value.trim();
    var author = document.getElementById('bookAuthor').value.trim();
    if (!title || !author) { alert('Please fill in all fields.'); return; }

    var book = { id: bookIdCounter++, title: title, author: author };
    bookCatalog.insert(book);  // ← SinglyLinkedList.insert()
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    saveState();
    renderBooks(bookCatalog.toArray());
    alert('Book added successfully!');
}

function deleteBook(id) {
    if (!localStorage.getItem('currentUser')) { alert('Login required.'); return; }
    bookCatalog.delete(id);    // ← SinglyLinkedList.delete()
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

// Search books by title or author
function searchBooks() {
    var query = document.getElementById('searchBookInput').value.trim();
    if (!query) { renderBooks(bookCatalog.toArray()); return; }
    var results = linearSearch(bookCatalog.toArray(), query);
    renderBooks(results);
}

function sortBooks() {
    var sorted = bubbleSort(bookCatalog.toArray());
    renderBooks(sorted);
}

function findBookById() {
    var id = parseInt(document.getElementById('findByIdInput').value.trim());
    if (isNaN(id)) { alert('Enter a valid book ID.'); return; }
    var sortedById = bookCatalog.toArray().sort((a, b) => a.id - b.id);
    var found = binarySearch(sortedById, id);
    if (found) { renderBooks([found]); }
    else { alert('No book found with ID ' + id + '.'); renderBooks([]); }
}

// STACK — Borrow a book (push)
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

// STACK — Undo last borrow (pop)
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
    var items = borrowStack.toArray(); // top of stack first
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

// CIRCULAR LINKED LIST — View a book (insert into recently viewed)
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
    var items = recentlyViewed.toArray(); // ← CircularLinkedList.toArray()
    if (items.length === 0) {
        list.innerHTML = '<li class="empty-note">No books viewed yet. Click 👁 View on any book!</li>';
        return;
    }
    list.innerHTML = items.map(item =>
        '<li>📚 ' + item.title + '</li>'
    ).join('');
}

// ─── User Logic ───────────────────────────────────────────────
function renderUsers() {
    var tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var role = localStorage.getItem('currentRole');

    // Pull all users from HashTable
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
    var user = userHashTable.get(email); // ← HashTable.get()
    if (!user) return;
    if (user.role === 'admin') { alert('Cannot ban an Admin.'); return; }
    user.isBanned = true;
    userHashTable.put(email, user); // ← HashTable.put() (update)
    saveState();
    renderUsers();
    alert(user.name + ' has been banned.');
}

function clearUsers() {
    if (!localStorage.getItem('currentUser')) {
        alert('Login required.'); return;
    }
    if (!confirm('Delete ALL non-admin users? This cannot be undone.')) return;

    // Rebuild HashTable keeping only admin
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

// ─── DSA Tools Panel ─────────────────────────────────────────
// INFIX TO POSTFIX (uses our Stack class internally in dsa.js)
function convertExpression() {
    var input = document.getElementById('infixInput').value.trim();
    var output = document.getElementById('postfixOutput');
    if (!input) { output.textContent = 'Enter an expression first.'; return; }
    var result = infixToPostfix(input); // ← infixToPostfix() using Stack
    output.textContent = result;
}
