<?php
// convert_collation.php
// Script to convert database and table collations to utf8mb4_unicode_ci

$servername = "localhost";
$username = "your_db_username";
$password = "your_db_password";
$dbname = "ecommerce_db";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Change database collation
    $pdo->exec("ALTER DATABASE `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database collation changed successfully<br>";
    
    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Convert each table
    foreach ($tables as $table) {
        $pdo->exec("ALTER TABLE `$table` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "Table `$table` collation changed successfully<br>";
    }
    
    echo "All collations updated successfully!";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>