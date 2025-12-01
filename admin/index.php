<?php
// File: admin/index.php
require_once '../config.php';

// ایڈمن چیک
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

// Settings
$settingsResult = $conn->query("SELECT * FROM settings LIMIT 1");
$settings = $settingsResult->fetch_assoc();

// فارم سبمٹ (نیا آئٹم یا اپڈیٹ)
$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['form_type']) && $_POST['form_type'] === 'product_form') {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $is_active = isset($_POST['is_active']) ? 1 : 0;

    if ($name === '' || $price <= 0) {
        $message = "نام اور قیمت صحیح درج کریں۔";
    } else {
        if ($id > 0) {
            // Update
            $stmt = $conn->prepare("UPDATE products SET name = ?, price = ?, is_active = ? WHERE id = ?");
            $stmt->bind_param("sdii", $name, $price, $is_active, $id);
            $stmt->execute();
            $stmt->close();
            $message = "پروڈکٹ اپڈیٹ ہو گئی۔";
        } else {
            // Insert
            $stmt = $conn->prepare("INSERT INTO products (name, price, is_active) VALUES (?, ?, ?)");
            $stmt->bind_param("sdi", $name, $price, $is_active);
            $stmt->execute();
            $stmt->close();
            $message = "نئی پروڈکٹ شامل ہو گئی۔";
        }
    }
}

// Delete
if (isset($_GET['delete'])) {
    $delId = intval($_GET['delete']);
    $conn->query("DELETE FROM products WHERE id = $delId");
    $message = "پروڈکٹ حذف ہو گئی۔";
}

// ایڈیٹ کے لیے ایک پروڈکٹ نکالیں (اگر id دی ہو)
$editProduct = null;
if (isset($_GET['edit'])) {
    $editId = intval($_GET['edit']);
    $res = $conn->query("SELECT * FROM products WHERE id = $editId");
    if ($res->num_rows === 1) {
        $editProduct = $res->fetch_assoc();
    }
}

// تمام پروڈکٹس
$productsResult = $conn->query("SELECT * FROM products ORDER BY created_at DESC");

// Settings اپڈیٹ فارم
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['form_type']) && $_POST['form_type'] === 'settings_form') {
    $site_name = trim($_POST['site_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');

    $stmt = $conn->prepare("UPDATE settings SET site_name = ?, phone = ?, address = ? WHERE id = ?");
    $idSettings = $settings['id'];
    $stmt->bind_param("sssi", $site_name, $phone, $address, $idSettings);
    $stmt->execute();
    $stmt->close();

    $message = "سیٹنگز اپڈیٹ ہو گئیں۔";
    // دوبارہ لوڈ کریں
    $settingsResult = $conn->query("SELECT * FROM settings LIMIT 1");
    $settings = $settingsResult->fetch_assoc();
}
?>
<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <title>ایڈمن ڈیش بورڈ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: system-ui, Arial;
            background: #f5f5f5;
            direction: rtl;
            text-align: right;
        }
        header {
            background: #333;
            color: #fff;
            padding: 15px;
        }
        header .title {
            font-size: 18px;
        }
        header .right {
            float: left;
        }
        .container {
            max-width: 1000px;
            margin: 20px auto;
            background: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
        }
        h2 {
            margin-top: 0;
        }
        .message {
            margin-bottom: 10px;
            color: #2e7d32;
            font-size: 14px;
        }
        .error {
            color: #d32f2f;
        }
        form {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-top: 8px;
            font-size: 14px;
        }
        input[type="text"],
        input[type="number"],
        textarea {
            width: 100%;
            padding: 7px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 14px;
        }
        textarea {
            resize: vertical;
        }
        .btn {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 14px;
            border-radius: 4px;
            border: none;
            background: #1976d2;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
        }
        .btn-danger {
            background: #d32f2f;
        }
        .btn-secondary {
            background: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
        }
        th {
            background: #f0f0f0;
        }
        .top-links {
            margin-top: 5px;
            font-size: 13px;
        }
        .top-links a {
            color: #fff;
            text-decoration: none;
            margin-left: 10px;
        }
        .checkbox-label {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 8px;
        }
    </style>
</head>
<body>

<header>
    <div class="title">
        ایڈمن ڈیش بورڈ - <?php echo htmlspecialchars($settings['site_name']); ?>
    </div>
    <div class="right">
        <div class="top-links">
            لاگ اِن: <?php echo htmlspecialchars($_SESSION['admin_username']); ?> |
            <a href="logout.php">لاگ آؤٹ</a> |
            <a href="../index.php" target="_blank">ویب سائٹ دیکھیں</a>
        </div>
    </div>
    <div style="clear: both;"></div>
</header>

<div class="container">
    <?php if ($message): ?>
        <div class="message"><?php echo htmlspecialchars($message); ?></div>
    <?php endif; ?>

    <h2>ویب سائٹ سیٹنگز</h2>
    <form method="post">
        <input type="hidden" name="form_type" value="settings_form">
        <label>سائٹ کا نام</label>
        <input type="text" name="site_name" value="<?php echo htmlspecialchars($settings['site_name']); ?>" required>

        <label>فون</label>
        <input type="text" name="phone" value="<?php echo htmlspecialchars($settings['phone']); ?>">

        <label>ایڈریس</label>
        <textarea name="address" rows="2"><?php echo htmlspecialchars($settings['address']); ?></textarea>

        <button type="submit" class="btn">سیو کریں</button>
    </form>

    <hr>

    <h2><?php echo $editProduct ? 'پروڈکٹ ایڈٹ کریں' : 'نئی پروڈکٹ شامل کریں'; ?></h2>
    <form method="post">
        <input type="hidden" name="form_type" value="product_form">
        <input type="hidden" name="id" value="<?php echo $editProduct['id'] ?? 0; ?>">

        <label>پروڈکٹ کا نام</label>
        <input type="text" name="name" value="<?php echo htmlspecialchars($editProduct['name'] ?? ''); ?>" required>

        <label>قیمت (صرف نمبر)</label>
        <input type="number" step="0.01" name="price" value="<?php echo htmlspecialchars($editProduct['price'] ?? ''); ?>" required>

        <label class="checkbox-label">
            <input type="checkbox" name="is_active" <?php echo (!isset($editProduct['is_active']) || $editProduct['is_active']) ? 'checked' : ''; ?>>
            Active (ویب سائٹ پر دکھائیں)
        </label>

        <button type="submit" class="btn">
            <?php echo $editProduct ? 'اپڈیٹ کریں' : 'شامل کریں'; ?>
        </button>
        <?php if ($editProduct): ?>
            <a href="index.php" class="btn btn-secondary">نیا ایڈ موڈ</a>
        <?php endif; ?>
    </form>

    <hr>

    <h2>تمام پروڈکٹس</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>نام</th>
                <th>قیمت</th>
                <th>اسٹیٹس</th>
                <th>ایکشن</th>
            </tr>
        </thead>
        <tbody>
        <?php if ($productsResult->num_rows > 0): ?>
            <?php while ($row = $productsResult->fetch_assoc()): ?>
                <tr>
                    <td><?php echo $row['id']; ?></td>
                    <td><?php echo htmlspecialchars($row['name']); ?></td>
                    <td><?php echo number_format($row['price'], 2); ?></td>
                    <td><?php echo $row['is_active'] ? 'Active' : 'Hidden'; ?></td>
                    <td>
                        <a class="btn" href="index.php?edit=<?php echo $row['id']; ?>">ایڈٹ</a>
                        <a class="btn btn-danger" href="index.php?delete=<?php echo $row['id']; ?>"
                           onclick="return confirm('واقعی حذف کرنا ہے؟');">Delete</a>
                    </td>
                </tr>
            <?php endwhile; ?>
        <?php else: ?>
            <tr><td colspan="5">کوئی پروڈکٹ موجود نہیں۔</td></tr>
        <?php endif; ?>
        </tbody>
    </table>

</div>

</body>
</html>
