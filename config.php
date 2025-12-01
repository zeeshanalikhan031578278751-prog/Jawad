<?php
// File: config.php

// Database settings
$host = "localhost";
$dbname = "my_food_site";
$dbuser = "root";      // hosting پر عموماً یہ different ہوگا
$dbpass = "";          // XAMPP/WAMP میں اکثر خالی ہوتا ہے

try {
    $conn = new mysqli($host, $dbuser, $dbpass, $dbname);
    if ($conn->connect_error) {
        die("Database connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
