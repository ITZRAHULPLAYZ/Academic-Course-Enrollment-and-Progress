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

    toJSON() {
        const out = [];
        for (let bucket of this.table) {
            for (let entry of bucket) out.push(entry);
        }
        return out;
    }

    static fromJSON(entries, capacity = 64) {
        const ht = new HashTable(capacity);
        for (let e of entries) ht.put(e.key, e.value);
        return ht;
    }
}

class ArrayList {
    constructor() {
        this.data = [];
        this.size = 0;
    }

    add(item) {
        this.data[this.size] = item;
        this.size++;
    }

    remove(id) {
        const idx = this.data.findIndex(item => item.id === id);
        if (idx === -1) return;
        for (let i = idx; i < this.size - 1; i++) {
            this.data[i] = this.data[i + 1];
        }
        this.data.length = this.size - 1;
        this.size--;
    }

    find(id) {
        for (let i = 0; i < this.size; i++) {
            if (this.data[i].id === id) return this.data[i];
        }
        return null;
    }

    toArray() {
        return this.data.slice(0, this.size);
    }

    toJSON() {
        return this.toArray();
    }

    static fromJSON(arr) {
        const list = new ArrayList();
        for (let item of arr) list.add(item);
        return list;
    }
}

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
        if (this.size > this.maxSize) {
            this.head = this.head.next;
            this.tail.next = this.head;
            this.size--;
        }
    }

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
