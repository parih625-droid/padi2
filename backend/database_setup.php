<?php
// database_setup.php
// This script helps initialize your database tables

$servername = "localhost";
$username = "padidekh_ecommerce";
$password = "Re1317821Za";
$dbname = "padidekh_ecommerce_db";

try {
    $pdo = new PDO("mysql:host=$servername", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database created successfully<br>";
    
    // Use database
    $pdo->exec("USE `$dbname`");
    
    // Create Categories table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `categories` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(100) NOT NULL,
          `description` text DEFAULT NULL,
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Categories table created successfully<br>";
    
    // Create Users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(100) NOT NULL,
          `email` varchar(191) NOT NULL,
          `password` varchar(255) NOT NULL,
          `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
          `phone` varchar(20) DEFAULT NULL,
          `address` text DEFAULT NULL,
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Users table created successfully<br>";
    
    // Create Products table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `products` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(255) NOT NULL,
          `description` text DEFAULT NULL,
          `price` decimal(10,2) NOT NULL,
          `image_url` varchar(300) DEFAULT NULL,
          `category_id` int(11) DEFAULT NULL,
          `stock_quantity` int(11) NOT NULL DEFAULT '0',
          `is_active` tinyint(1) NOT NULL DEFAULT '1',
          `sales_count` int(11) NOT NULL DEFAULT '0',
          `is_amazing_offer` tinyint(1) NOT NULL DEFAULT '0',
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `category_id` (`category_id`),
          CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Products table created successfully<br>";
    
    // Create Product Images table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `product_images` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `product_id` int(11) NOT NULL,
          `image_url` varchar(300) NOT NULL,
          `is_primary` tinyint(1) NOT NULL DEFAULT '0',
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `product_id` (`product_id`),
          CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Product Images table created successfully<br>";
    
    // Create Cart table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `cart` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `user_id` int(11) NOT NULL,
          `product_id` int(11) NOT NULL,
          `quantity` int(11) NOT NULL DEFAULT '1',
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`),
          KEY `product_id` (`product_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Cart table created successfully<br>";
    
    // Create Orders table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `orders` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `user_id` int(11) NOT NULL,
          `total_amount` decimal(10,2) NOT NULL,
          `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
          `shipping_address` text NOT NULL,
          `payment_method` varchar(50) NOT NULL,
          `payment_status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
          `transaction_id` varchar(255) DEFAULT NULL,
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Orders table created successfully<br>";
    
    // Create Order Items table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `order_items` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `order_id` int(11) NOT NULL,
          `product_id` int(11) NOT NULL,
          `quantity` int(11) NOT NULL,
          `price` decimal(10,2) NOT NULL,
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `order_id` (`order_id`),
          KEY `product_id` (`product_id`),
          CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
          CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Order Items table created successfully<br>";
    
    // Insert sample data
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM categories");
    $stmt->execute();
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        // Insert sample categories
        $pdo->exec("
            INSERT INTO `categories` (`name`, `description`) VALUES
            ('Electronics', 'Electronic devices and gadgets'),
            ('Clothing', 'Men and women clothing'),
            ('Books', 'Books and educational materials'),
            ('Home & Garden', 'Home improvement and garden supplies'),
            ('Sports', 'Sports and fitness equipment')
        ");
        echo "Sample categories inserted<br>";
        
        // Insert sample products
        $pdo->exec("
            INSERT INTO `products` (`name`, `description`, `price`, `image_url`, `category_id`, `stock_quantity`) VALUES
            ('Smartphone', 'Latest model smartphone with advanced features', 699.99, '/uploads/smartphone.jpg', 1, 50),
            ('Laptop', 'High-performance laptop for work and gaming', 1299.99, '/uploads/laptop.jpg', 1, 30),
            ('T-Shirt', 'Comfortable cotton t-shirt', 19.99, '/uploads/tshirt.jpg', 2, 100),
            ('Jeans', 'Classic blue jeans', 49.99, '/uploads/jeans.jpg', 2, 75),
            ('Programming Book', 'Learn web development', 39.99, '/uploads/book.jpg', 3, 25),
            ('Garden Tools Set', 'Complete set of garden tools', 89.99, '/uploads/garden-tools.jpg', 4, 40),
            ('Running Shoes', 'Professional running shoes', 129.99, '/uploads/running-shoes.jpg', 5, 60)
        ");
        echo "Sample products inserted<br>";
        
        // Note: For security reasons, we won't create an admin user here
        // You should create one manually with a strong password
        echo "IMPORTANT: Create an admin user manually with a strong password<br>";
    } else {
        echo "Sample data already exists<br>";
    }
    
    echo "Database setup completed successfully!";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>