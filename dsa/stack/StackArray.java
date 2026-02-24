package dsa.stack;

public class StackArray {
    int[] d;
    int top = -1;

    public StackArray(int s) {
        d = new int[s];
    }

    public void push(int x) {
        if (top < d.length - 1)
            d[++top] = x;
        else
            System.out.println("Full");
    }

    public int pop() {
        return (top >= 0) ? d[top--] : -1;
    }

    public int peek() {
        return (top >= 0) ? d[top] : -1;
    }

    public static void main(String[] a) {
        StackArray s = new StackArray(5);
        s.push(10);
        s.push(20);
        System.out.println("Peek: " + s.peek() + " Pop: " + s.pop());
    }
}
