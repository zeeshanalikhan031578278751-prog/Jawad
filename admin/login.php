<?php
// File: admin/login.php
require_once '../config.php';

// اگر پہلے سے لاگ اِن ہے تو سیدھا dashboard
if (isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    $stmt = $conn->prepare("SELECT id, password FROM admins WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 1) {
        $admin = $res->fetch_assoc();
        // یہاں ہم simple comparison کر رہے ہیں (plain text)
        if ($password === $admin['password']) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $username;
            header("Location: index.php");
            exit;
        } else {
            $error = "غلط پاس ورڈ۔";
        }
    } else {
        $error = "یوزر نہیں ملا۔";
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <title>ایڈمن لاگ اِن</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: system-ui, Arial;
            background: #f5f5f5;
            direction: rtl;
            text-align: right;
        }
        .login-box {
            max-width: 350px;
            margin: 80px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
        }
        h2 {
            margin-top: 0;
            text-align: center;
        }
        label {
            display: block;
            margin: 10px 0 5px;
        }
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
        .btn {
            margin-top: 15px;
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 4px;
            background: #d32f2f;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
        }
        .error {
            margin-top: 10px;
            color: #d32f2f;
            font-size: 13px;
        }
    </style>
</head>
<body>

<div class="login-box">
    <h2>ایڈمن لاگ اِن</h2>
    <form method="post">
        <label>یوزر نیم</label>
        <input type="text" name="username" required>

        <label>پاس ورڈ</label>
        <input type="password" name="password" required>

        <button type="submit" class="btn">لاگ اِن</button>

        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
    </form>
</div>

</body>
</html>
