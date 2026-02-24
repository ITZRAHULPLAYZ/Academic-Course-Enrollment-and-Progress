package dsa.hashing;

import java.util.LinkedList;

public class HashTable {
    private LinkedList<Entry>[] table;
    private int capacity;

    static class Entry {
        String key;
        String value;

        Entry(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    @SuppressWarnings("unchecked")
    public HashTable(int capacity) {
        this.capacity = capacity;
        table = new LinkedList[capacity];
        for (int i = 0; i < capacity; i++) {
            table[i] = new LinkedList<>();
        }
    }

    private int hash(String key) {
        return Math.abs(key.hashCode()) % capacity;
    }

    public void put(String key, String value) {
        int index = hash(key);
        for (Entry e : table[index]) {
            if (e.key.equals(key)) {
                e.value = value;
                return;
            }
        }
        table[index].add(new Entry(key, value));
    }

    public String get(String key) {
        int index = hash(key);
        for (Entry e : table[index]) {
            if (e.key.equals(key)) {
                return e.value;
            }
        }
        return null;
    }

    public boolean containsKey(String key) {
        int index = hash(key);
        for (Entry e : table[index]) {
            if (e.key.equals(key)) {
                return true;
            }
        }
        return false;
    }

    public void remove(String key) {
        int index = hash(key);
        table[index].removeIf(e -> e.key.equals(key));
    }

    public void display() {
        for (int i = 0; i < capacity; i++) {
            if (!table[i].isEmpty()) {
                System.out.print("Bucket " + i + ": ");
                for (Entry e : table[i]) {
                    System.out.print("[" + e.key + "=" + e.value + "] -> ");
                }
                System.out.println("null");
            }
        }
    }

    public static void main(String[] args) {
        HashTable ht = new HashTable(10);
        ht.put("user1", "pass123");
        ht.put("admin", "adminPass");

        System.out.println("Displaying HashTable:");
        ht.display();

        System.out.println("\nGet admin: " + ht.get("admin"));
        System.out.println("Contains user1? " + ht.containsKey("user1"));
        System.out.println("Contains user2? " + ht.containsKey("user2"));
    }
}
