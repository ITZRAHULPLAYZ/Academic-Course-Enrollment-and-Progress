// ============================================================
//  dsa.js  —  All DSA structures powering the Library System
// ============================================================

// ─────────────────────────────────────────────
// 1. HASH TABLE  (mirrors HashTable.java)
//    Used for: User authentication store
// ─────────────────────────────────────────────
class HashTable {
    constructor(capacity = 64) {
        this.capacity = capacity;
        this.table = Array.from({ length: capacity }, () => []);
    }

    _hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % this.capacity;
        }
        return Math.abs(hash);
    }

    put(key, value) {
        const idx = this._hash(key);
        const bucket = this.table[idx];
        for (let entry of bucket) {
            if (entry.key === key) { entry.value = value; return; }
        }
        bucket.push({ key, value });
    }

    get(key) {
        const idx = this._hash(key);
        for (let entry of this.table[idx]) {
            if (entry.key === key) return entry.value;
        }
        return null;
    }

    containsKey(key) {
        return this.get(key) !== null;
    }

    remove(key) {
        const idx = this._hash(key);
        this.table[idx] = this.table[idx].filter(e => e.key !== key);
    }

    // Serialize to plain object for localStorage
    toJSON() {
        const out = [];
        for (let bucket of this.table) {
            for (let entry of bucket) out.push(entry);
        }
        return out;
    }

    // Restore from localStorage
    static fromJSON(entries, capacity = 64) {
        const ht = new HashTable(capacity);
        for (let e of entries) ht.put(e.key, e.value);
        return ht;
    }
}

// ─────────────────────────────────────────────
// 2. STACK  (mirrors StackArray.java)
//    Used for: Borrow History (push on borrow, pop on undo)
// ─────────────────────────────────────────────
class Stack {
    constructor() {
        this.data = [];
        this.top = -1;
    }

    push(x) {
        this.top++;
        this.data[this.top] = x;
    }

    pop() {
        if (this.top < 0) return null;
        return this.data[this.top--];
    }

    peek() {
        if (this.top < 0) return null;
        return this.data[this.top];
    }

    isEmpty() { return this.top < 0; }

    size() { return this.top + 1; }

    // Return all items top→bottom
    toArray() {
        return this.data.slice(0, this.top + 1).reverse();
    }

    toJSON() { return this.data.slice(0, this.top + 1); }

    static fromJSON(arr) {
        const s = new Stack();
        for (let item of arr) s.push(item);
        return s;
    }
}

// ─────────────────────────────────────────────
// 3. SINGLY LINKED LIST  (mirrors SinglyLinkedList.java)
//    Used for: Book catalog storage
// ─────────────────────────────────────────────
class LinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class SinglyLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    insert(data) {
        const node = new LinkedListNode(data);
        if (!this.head) {
            this.head = node;
        } else {
            let curr = this.head;
            while (curr.next) curr = curr.next;
            curr.next = node;
        }
        this.size++;
    }

    delete(id) {
        if (!this.head) return;
        if (this.head.data.id === id) {
            this.head = this.head.next;
            this.size--;
            return;
        }
        let curr = this.head;
        while (curr.next && curr.next.data.id !== id) curr = curr.next;
        if (curr.next) { curr.next = curr.next.next; this.size--; }
    }

    find(id) {
        let curr = this.head;
        while (curr) {
            if (curr.data.id === id) return curr.data;
            curr = curr.next;
        }
        return null;
    }

    // Convert to plain array for rendering
    toArray() {
        const arr = [];
        let curr = this.head;
        while (curr) { arr.push(curr.data); curr = curr.next; }
        return arr;
    }

    toJSON() { return this.toArray(); }

    static fromJSON(arr) {
        const list = new SinglyLinkedList();
        for (let item of arr) list.insert(item);
        return list;
    }
}

// ─────────────────────────────────────────────
// 4. CIRCULAR LINKED LIST  (mirrors CircularLinkedList.java)
//    Used for: Recently Viewed books (last 5, cycles)
// ─────────────────────────────────────────────
class CircularNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class CircularLinkedList {
    constructor(maxSize = 5) {
        this.head = null;
        this.tail = null;
        this.maxSize = maxSize;
        this.size = 0;
    }

    insert(data) {
        const node = new CircularNode(data);
        if (!this.head) {
            this.head = node;
            this.tail = node;
            node.next = this.head;
        } else {
            this.tail.next = node;
            this.tail = node;
            this.tail.next = this.head;
        }
        this.size++;

        // Remove oldest if over maxSize
        if (this.size > this.maxSize) {
            this.head = this.head.next;
            this.tail.next = this.head;
            this.size--;
        }
    }

    // Return all items as array (head → tail)
    toArray() {
        if (!this.head) return [];
        const arr = [];
        let curr = this.head;
        do {
            arr.push(curr.data);
            curr = curr.next;
        } while (curr !== this.head);
        return arr;
    }

    toJSON() { return this.toArray(); }

    static fromJSON(arr, maxSize = 5) {
        const cll = new CircularLinkedList(maxSize);
        for (let item of arr) cll.insert(item);
        return cll;
    }
}

// ─────────────────────────────────────────────
// 5. BUBBLE SORT  (mirrors BubbleSort.java)
//    Used for: Sort Books by Title button
// ─────────────────────────────────────────────
function bubbleSort(arr) {
    const a = [...arr]; // don't mutate original
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (a[j].title.toLowerCase() > a[j + 1].title.toLowerCase()) {
                const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
            }
        }
    }
    return a;
}

// ─────────────────────────────────────────────
// 6. LINEAR SEARCH  (mirrors LinearSearch.java)
//    Used for: Search books by title
// ─────────────────────────────────────────────
function linearSearch(arr, query) {
    const q = query.toLowerCase();
    const results = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].title.toLowerCase().indexOf(q) !== -1 ||
            arr[i].author.toLowerCase().indexOf(q) !== -1) {
            results.push(arr[i]);
        }
    }
    return results;
}

// ─────────────────────────────────────────────
// 7. BINARY SEARCH  (mirrors BinarySearch.java)
//    Used for: Find Book by ID (requires sorted-by-ID array)
// ─────────────────────────────────────────────
function binarySearch(arr, targetId) {
    let l = 0, r = arr.length - 1;
    while (l <= r) {
        const m = Math.floor(l + (r - l) / 2);
        if (arr[m].id === targetId) return arr[m];
        if (arr[m].id < targetId) l = m + 1;
        else r = m - 1;
    }
    return null;
}

// ─────────────────────────────────────────────
// 8. INFIX TO POSTFIX  (mirrors InfixToPostfix.java)
//    Used for: DSA Tools panel — live expression converter
// ─────────────────────────────────────────────
function infixToPostfix(expression) {
    const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
    const stack = new Stack(); // uses our own Stack class!
    let result = '';

    for (let c of expression.replace(/\s/g, '')) {
        if (/[a-zA-Z0-9]/.test(c)) {
            result += c;
        } else if (c === '(') {
            stack.push(c);
        } else if (c === ')') {
            while (!stack.isEmpty() && stack.peek() !== '(') {
                result += stack.pop();
            }
            stack.pop(); // remove '('
        } else if (prec[c] !== undefined) {
            while (!stack.isEmpty() && prec[stack.peek()] >= prec[c]) {
                result += stack.pop();
            }
            stack.push(c);
        }
    }

    while (!stack.isEmpty()) {
        const top = stack.pop();
        if (top === '(') return 'Invalid Expression';
        result += top;
    }
    return result;
}
