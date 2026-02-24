package dsa.sorting;
public class BubbleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i=0; i<n-1; i++)
            for (int j=0; j<n-i-1; j++)
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
    }
    public static void main(String[] args) {
        int[] data = {64, 34, 25, 12};
        sort(data);
        for(int x: data) System.out.print(x + " ");
    }
}
