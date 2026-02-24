package dsa.lists;
public class SinglyLinkedList {
    static class Node { int d; Node next; Node(int d){this.d=d;} }
    Node h;
    public void ins(int d) { Node n=new Node(d); if(h==null) h=n; else { Node t=h; while(t.next!=null) t=t.next; t.next=n; } }
    public void del(int k) { if(h==null)return; if(h.d==k) h=h.next; else { Node t=h; while(t.next!=null && t.next.d!=k) t=t.next; if(t.next!=null) t.next=t.next.next; } }
    public void disp() { Node t=h; while(t!=null) { System.out.print(t.d+" -> "); t=t.next; } System.out.println("null"); }
    public static void main(String[] a) {
        SinglyLinkedList l=new SinglyLinkedList(); l.ins(10); l.ins(20); l.disp(); l.del(10); l.disp();
    }
}
