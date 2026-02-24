package dsa.analysis;
public class AlgorithmAnalysis {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        System.out.println("O(1) Access: " + arr[0]);
        System.out.println("O(n) Traversal:");
        for(int x : arr) System.out.print(x + " ");
        System.out.println();
    }
}
