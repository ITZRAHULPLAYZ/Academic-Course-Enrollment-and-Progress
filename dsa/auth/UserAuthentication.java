package dsa.auth;

import dsa.hashing.HashTable;
import java.util.Scanner;

public class UserAuthentication {
    private HashTable users;

    public UserAuthentication(int capacity) {
        users = new HashTable(capacity);
    }

    public boolean register(String username, String password) {
        if (users.containsKey(username)) {
            System.out.println("Username already exists!");
            return false;
        }
        users.put(username, password);
        System.out.println("User registered successfully.");
        return true;
    }

    public boolean login(String username, String password) {
        String storedPassword = users.get(username);
        if (storedPassword != null && storedPassword.equals(password)) {
            System.out.println("Login Successful! Welcome, " + username);
            return true;
        }
        System.out.println("Invalid username or password.");
        return false;
    }

    public static void main(String[] args) {
        UserAuthentication auth = new UserAuthentication(100);
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("\n1. Register\n2. Login\n3. Exit");
            System.out.print("Choose an option: ");
            int choice = scanner.nextInt();
            scanner.nextLine();

            if (choice == 1) {
                System.out.print("Enter username: ");
                String user = scanner.nextLine();
                System.out.print("Enter password: ");
                String pass = scanner.nextLine();
                auth.register(user, pass);
            } else if (choice == 2) {
                System.out.print("Enter username: ");
                String user = scanner.nextLine();
                System.out.print("Enter password: ");
                String pass = scanner.nextLine();
                auth.login(user, pass);
            } else if (choice == 3) {
                break;
            } else {
                System.out.println("Invalid choice.");
            }
        }
        scanner.close();
    }
}
