package dsa.queue;
public class QueueArray {
    int[] q; int f=0,r=-1,sz=0;
    public QueueArray(int s) { q=new int[s]; }
    public void enq(int x) { if(sz<q.length) { r=(r+1)%q.length; q[r]=x; sz++; } else System.out.println("Full"); }
    public int deq() { if(sz>0) { int t=q[f]; f=(f+1)%q.length; sz--; return t; } return -1; }
    public static void main(String[] a) {
        QueueArray q=new QueueArray(5); q.enq(10); q.enq(20);
        System.out.println("Deq: "+q.deq());
    }
}
