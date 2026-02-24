package dsa.searching;
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int l=0, r=arr.length-1;
        while(l<=r) {
            int m = l + (r-l)/2;
            if(arr[m]==target) return m;
            if(arr[m]<target) l=m+1;
            else r=m-1;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] sorted = {10, 20, 30, 40, 50};
        System.out.println("Found 40 at index: " + search(sorted, 40));
    }
}
