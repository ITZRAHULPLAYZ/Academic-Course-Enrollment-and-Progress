package dsa.lists;

public class CircularLinkedList {
    static class Node {
        int data;
        Node next;

        Node(int data) {
            this.data = data;
        }
    }

    Node head = null;
    Node tail = null;

    public void insert(int data) {
        Node newNode = new Node(data);
        if (head == null) {
            head = newNode;
            tail = newNode;
            newNode.next = head;
        } else {
            tail.next = newNode;
            tail = newNode;
            tail.next = head;
        }
    }

    public void display() {
        if (head == null) {
            System.out.println("List is empty");
            return;
        }
        Node current = head;
        do {
            System.out.print(current.data + " -> ");
            current = current.next;
        } while (current != head);
        System.out.println("(head)");
    }

    public void delete(int key) {
        if (head == null)
            return;

        Node current = head;
        Node prev = tail;

        // If only one node
        if (head == tail) {
            if (head.data == key) {
                head = null;
                tail = null;
            }
            return;
        }

        // Search for node
        do {
            if (current.data == key) {
                if (current == head) {
                    head = head.next;
                    tail.next = head;
                } else {
                    prev.next = current.next;
                    if (current == tail) {
                        tail = prev;
                    }
                }
                return;
            }
            prev = current;
            current = current.next;
        } while (current != head);
    }

    public static void main(String[] args) {
        CircularLinkedList cll = new CircularLinkedList();
        cll.insert(10);
        cll.insert(20);
        cll.insert(30);
        cll.insert(40);

        System.out.println("Circular Linked List:");
        cll.display();

        System.out.println("\nDeleting 20:");
        cll.delete(20);
        cll.display();

        System.out.println("\nDeleting 10 (Head):");
        cll.delete(10);
        cll.display();
    }
}
