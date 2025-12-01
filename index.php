<?php
// File: index.php
require_once 'config.php';

// Settings نکالیں
$settingsResult = $conn->query("SELECT * FROM settings LIMIT 1");
$settings = $settingsResult->fetch_assoc();

// Active products
$productsResult = $conn->query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($settings['site_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: system-ui, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            direction: rtl;
            text-align: right;
        }
        header {
            background: #d32f2f;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 900px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        h1, h2 {
            margin-top: 0;
        }
        .contact {
            margin-bottom: 20px;
            font-size: 14px;
        }
        .product-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 15px;
        }
        .product-card {
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 8px;
            background: #fafafa;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .product-price {
            font-size: 18px;
            margin-top: 5px;
        }
        .btn {
            display: inline-block;
            padding: 8px 14px;
            border-radius: 4px;
            text-decoration: none;
            background: #d32f2f;
            color: #fff;
            font-size: 14px;
            margin-top: 10px;
        }
        footer {
            text-align: center;
            padding: 15px;
            font-size: 13px;
            color: #777;
        }
    </style>
</head>
<body>

<header>
    <h1><?php echo htmlspecialchars($settings['site_name']); ?></h1>
    <p>Welcome / خوش آمدید</p>
</header>

<div class="container">
    <div class="contact">
        <p><strong>فون:</strong> <?php echo htmlspecialchars($settings['phone']); ?></p>
        <p><strong>ایڈریس:</strong> <?php echo htmlspecialchars($settings['address']); ?></p>
    </div>

    <h2>ہمارا مینیو</h2>

    <?php if ($productsResult->num_rows > 0): ?>
        <div class="product-list">
            <?php while ($row = $productsResult->fetch_assoc()): ?>
                <div class="product-card">
                    <div class="product-name">
                        <?php echo htmlspecialchars($row['name']); ?>
                    </div>
                    <div class="product-price">
                        قیمت: <?php echo number_format($row['price'], 2); ?> روپے
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    <?php else: ?>
        <p>ابھی کوئی آئٹم موجود نہیں۔</p>
    <?php endif; ?>
</div>

<footer>
    &copy; <?php echo date('Y'); ?> <?php echo htmlspecialchars($settings['site_name']); ?>
</footer>

</body>
</html>
