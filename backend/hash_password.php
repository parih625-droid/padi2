<?php
// hash_password.php
// Use this script to generate a hashed password for your admin user

if (isset($_POST['password'])) {
    $password = $_POST['password'];
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    echo "Hashed Password: " . $hashedPassword;
} else {
    echo '
    <form method="post">
        <label for="password">Enter password to hash:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">Generate Hash</button>
    </form>
    ';
}
?>