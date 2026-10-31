-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3307
-- Generation Time: Oct 31, 2026 at 07:20 AM
-- Server version: 8.0.30
-- PHP Version: 7.4.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `geark_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `address_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `recipient_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `street_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`address_id`, `user_id`, `recipient_name`, `recipient_phone`, `street_address`, `created_at`, `updated_at`) VALUES
(1, 3, 'Nguyễn Văn Khách', '0987654321', 'Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(2, 3, 'Ngô Hiếu Kiên', '0213915237', '180 Cao Lỗ, Q8, TP HCM', '2026-10-21 04:26:14', '2026-10-21 04:26:14'),
(3, 1, 'Ngô Hiếu Kiên', '0975198232', '180 Cao Lỗ,Q8 TP HCM', '2026-10-21 04:54:34', '2026-10-21 04:54:34'),
(4, 5, 'kien', '0123456789', 'sfsdfdsfdsfsdf', '2026-10-26 06:48:38', '2026-10-26 06:48:38'),
(5, 5, 'ădawd', '213213', 'áddas', '2026-10-26 06:54:59', '2026-10-26 06:54:59'),
(6, 7, 'Nguyen Van Pending', '0912345678', '123 Pho Hue, Hai Ba Trung, Ha Noi', '2026-10-26 08:54:41', '2026-10-26 08:54:41'),
(7, 8, 'Nguyen Van Pending', '0912345678', '123 Pho Hue, Hai Ba Trung, Ha Noi', '2026-10-26 08:55:41', '2026-10-26 08:55:41'),
(8, 9, 'A', '0987654321', 'B', '2026-10-26 08:56:26', '2026-10-26 08:56:26'),
(9, 10, 'Khach Hang Pending', '0987654321', '123 Pho Hue, HN', '2026-10-26 08:57:01', '2026-10-26 08:57:01'),
(10, 11, 'Khach', '0987654321', '123 HN', '2026-10-26 08:57:12', '2026-10-26 08:57:12'),
(11, 12, 'Khach Hang Pending', '0987654321', '123 Pho Hue, HN', '2026-10-26 09:00:12', '2026-10-26 09:00:12'),
(12, 13, 'Test Buy 2', '0987654321', '123 HN', '2026-10-26 09:01:23', '2026-10-26 09:01:23'),
(13, 1, 'Test VNPay Buyer', '0987654321', '123 VNPay Street', '2026-10-27 16:26:59', '2026-10-27 16:26:59');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `banner_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'home_main',
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `brand_id` bigint UNSIGNED NOT NULL,
  `brand_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`brand_id`, `brand_name`, `slug`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'Razer', 'razer', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(2, 'Logitech G', 'logitech-g', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(3, 'Corsair', 'corsair', 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=300&q=80', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(4, 'SteelSeries', 'steelseries', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(5, 'Asus ROG', 'asus-rog', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(7, 'cc', 'cc', NULL, '2026-10-26 16:56:50', '2026-10-26 16:56:50');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`cart_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 3, '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(2, 1, '2026-10-14 00:07:10', '2026-10-14 00:07:10'),
(3, 2, '2026-10-14 02:59:08', '2026-10-14 02:59:08'),
(4, 4, '2026-10-14 05:28:02', '2026-10-14 05:28:02'),
(5, 5, '2026-10-26 06:47:47', '2026-10-26 06:47:47'),
(6, 6, '2026-10-26 08:47:30', '2026-10-26 08:47:30'),
(7, 7, '2026-10-26 08:54:41', '2026-10-26 08:54:41'),
(8, 8, '2026-10-26 08:55:41', '2026-10-26 08:55:41'),
(9, 9, '2026-10-26 08:56:26', '2026-10-26 08:56:26'),
(10, 10, '2026-10-26 08:57:01', '2026-10-26 08:57:01'),
(11, 11, '2026-10-26 08:57:12', '2026-10-26 08:57:12'),
(12, 12, '2026-10-26 09:00:12', '2026-10-26 09:00:12'),
(13, 13, '2026-10-26 09:01:23', '2026-10-26 09:01:23');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` bigint UNSIGNED NOT NULL,
  `cart_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NOT NULL,
  `quantity` int UNSIGNED NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `cart_id`, `variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(16, 3, 1, 1, '2026-10-26 06:29:18', '2026-10-26 06:29:18'),
(23, 8, 4, 1, '2026-10-26 08:55:41', '2026-10-26 08:55:41'),
(24, 9, 3, 1, '2026-10-26 08:56:26', '2026-10-26 08:56:26'),
(25, 10, 3, 1, '2026-10-26 08:57:01', '2026-10-26 08:57:01'),
(26, 11, 1, 1, '2026-10-26 08:57:12', '2026-10-26 08:57:12'),
(39, 5, 1, 1, '2026-10-26 16:46:40', '2026-10-26 16:46:40');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `category_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `parent_id`, `category_name`, `slug`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Bàn phím cơ Gaming', 'ban-phim-co', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(2, NULL, 'Chuột Gaming', 'chuot-gaming', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(3, NULL, 'Tai nghe Gaming', 'tai-nghe-gaming', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(4, NULL, 'Màn hình Gaming', 'man-hinh-gaming', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(5, NULL, 'Case', 'case', '2026-10-21 04:18:48', '2026-10-21 04:18:48'),
(6, NULL, 'Nguồn', 'nguon', '2026-10-21 04:18:53', '2026-10-21 04:18:53'),
(7, NULL, 'Tản Nhiệt', 'tan-nhiet', '2026-10-21 04:18:58', '2026-10-21 04:18:58'),
(8, NULL, 'Ổ cứng', 'o-cung', '2026-10-21 04:41:31', '2026-10-21 04:41:31'),
(9, NULL, 'Ram', 'ram', '2026-10-21 04:41:36', '2026-10-21 04:41:36'),
(10, NULL, 'Thẻ Nhớ', 'the-nho', '2026-10-21 04:42:00', '2026-10-21 04:42:00'),
(11, NULL, 'Tai Nghe', 'tai-nghe', '2026-10-21 04:42:33', '2026-10-21 04:42:33');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `coupon_id` bigint UNSIGNED NOT NULL,
  `coupon_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percent','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usage_limit` int UNSIGNED DEFAULT NULL,
  `start_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_date` datetime DEFAULT NULL,
  `used_count` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Số lần đã sử dụng'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`coupon_id`, `coupon_code`, `discount_type`, `discount_value`, `created_at`, `usage_limit`, `start_date`, `end_date`, `used_count`) VALUES
(1, 'GEARK10', 'percent', '10.00', '2026-10-13 10:30:21', 100, '2026-10-26 15:11:46', NULL, 1),
(5, 'MUNGNGAY2010', 'fixed', '15000.00', '2026-10-21 14:13:43', 25, '2026-10-26 07:00:00', '2026-11-27 00:00:00', 0),
(6, 'B2S', 'percent', '5.00', '2026-10-21 14:14:14', 50, '2026-10-26 15:11:46', NULL, 4),
(10, 'SADDSA1', 'percent', '100.00', '2026-10-27 16:39:27', NULL, '2026-10-27 00:00:00', '2026-10-30 23:59:59', 1);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `inventory_transaction_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NOT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `transaction_type` enum('purchase','sale','return','adjustment','damage') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_delta` int NOT NULL,
  `stock_after` int NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `inventory_transactions`
--

INSERT INTO `inventory_transactions` (`inventory_transaction_id`, `variant_id`, `created_by`, `transaction_type`, `quantity_delta`, `stock_after`, `note`, `created_at`) VALUES
(1, 1, 3, 'sale', -2, 23, NULL, '2026-10-21 04:30:41'),
(2, 1, 1, 'sale', -2, 21, NULL, '2026-10-21 04:55:01'),
(3, 1, 1, 'sale', -5, 16, NULL, '2026-10-21 14:03:58'),
(4, 4, 1, 'sale', -3, 12, NULL, '2026-10-21 14:03:58'),
(5, 5, 1, 'sale', -1, 19, NULL, '2026-10-21 14:03:58'),
(6, 4, 1, 'sale', -1, 11, NULL, '2026-10-21 14:04:11'),
(7, 6, 1, 'sale', -1, 7, NULL, '2026-10-21 14:05:33'),
(8, 1, 1, 'sale', -1, 15, NULL, '2026-10-21 14:40:39'),
(9, 5, 1, 'sale', -1, 18, NULL, '2026-10-21 14:40:39'),
(10, 1, 1, 'sale', -1, 14, NULL, '2026-10-21 15:07:32'),
(11, 1, 1, 'sale', -1, 13, NULL, '2026-10-21 15:10:04'),
(12, 5, 1, 'sale', -1, 17, NULL, '2026-10-24 08:21:39'),
(13, 4, 1, 'sale', -2, 9, NULL, '2026-10-25 16:15:55'),
(14, 4, 1, 'sale', -1, 8, NULL, '2026-10-25 16:18:08'),
(15, 13, 1, 'purchase', 10, 30, 'Nh?p hàng lô ??t 1 testcase', '2026-10-25 17:12:18'),
(16, 13, 1, 'adjustment', -4, 26, 'Xu?t 4 s?n ph?m: Xu?t ?i?u chuy?n ki?m kê showroom', '2026-10-25 17:12:18'),
(17, 13, 1, 'adjustment', -6, 20, 'Xu?t 6 s?n ph?m: Hoàn tác testcase', '2026-10-25 17:12:18'),
(18, 13, 1, 'purchase', 10, 30, 'Nh?p hàng lô ??t 1 testcase', '2026-10-25 17:16:57'),
(19, 13, 1, 'adjustment', -4, 26, 'Xu?t 4 s?n ph?m: Xu?t ?i?u chuy?n ki?m kê showroom', '2026-10-25 17:16:57'),
(20, 13, 1, 'adjustment', -6, 20, 'Xu?t 6 s?n ph?m: Hoàn tác testcase', '2026-10-25 17:16:57'),
(21, 13, 1, 'purchase', 10, 30, 'Nh?p kho 10 s?n ph?m', '2026-10-25 17:18:16'),
(22, 4, 1, 'adjustment', -2, 6, 'Xu?t 2 s?n ph?m: Ki?m kê / ?i?u chuy?n kho', '2026-10-25 17:19:59'),
(23, 20, 1, 'purchase', 10, 30, 'Nh?p hàng lô ??t 1 testcase', '2026-10-25 17:32:48'),
(24, 20, 1, 'adjustment', -4, 26, 'Xu?t 4 s?n ph?m: Xu?t ?i?u chuy?n ki?m kê showroom', '2026-10-25 17:32:48'),
(25, 20, 1, 'adjustment', -6, 20, 'Xu?t 6 s?n ph?m: Hoàn tác testcase', '2026-10-25 17:32:48'),
(26, 4, 1, 'sale', -1, 5, NULL, '2026-10-26 06:31:25'),
(27, 6, 5, 'sale', -1, 7, NULL, '2026-10-26 06:48:46'),
(28, 6, 5, 'sale', -1, 6, NULL, '2026-10-26 08:50:06'),
(29, 1, 12, 'sale', -1, 12, NULL, '2026-10-26 09:00:12'),
(30, 1, 13, 'sale', -1, 11, NULL, '2026-10-26 09:01:24'),
(31, 3, 13, 'sale', -1, 29, NULL, '2026-10-26 09:01:24'),
(32, 1, 5, 'sale', -1, 10, NULL, '2026-10-26 09:05:47'),
(33, 5, 5, 'sale', -1, 16, NULL, '2026-10-26 09:05:47'),
(34, 1, 5, 'sale', -1, 9, NULL, '2026-10-26 09:08:40'),
(35, 3, 5, 'sale', -2, 27, NULL, '2026-10-26 09:08:40'),
(36, 1, 5, 'sale', -1, 8, NULL, '2026-10-26 09:09:36'),
(37, 4, 5, 'sale', -1, 4, NULL, '2026-10-26 09:09:36'),
(38, 4, 1, 'sale', -1, 3, NULL, '2026-10-26 16:12:10'),
(39, 5, 1, 'sale', -1, 15, NULL, '2026-10-26 16:12:10'),
(41, 5, 1, 'sale', -1, 14, NULL, '2026-10-27 16:30:03'),
(42, 5, 1, 'sale', -1, 13, NULL, '2026-10-27 16:40:16'),
(43, 4, 1, 'sale', -1, 2, NULL, '2026-10-27 16:40:16'),
(44, 6, 1, 'sale', -1, 5, 'Xuất 1 sản phẩm: Kiểm kê / điều chuyển kho', '2026-10-31 06:49:43');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `address_id` bigint UNSIGNED DEFAULT NULL,
  `order_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `order_status` enum('pending','confirmed','processing','shipping','completed','cancelled','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','partially_paid','refunded','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `address_id`, `order_code`, `total_amount`, `order_status`, `payment_status`, `created_at`, `updated_at`) VALUES
(1, 3, 2, 'GK-20261021-UX53V', '7780000.00', 'shipping', 'unpaid', '2026-10-21 04:30:41', '2026-10-21 05:05:07'),
(2, 1, 3, 'GK-20261021-C5F7Z', '7002000.00', 'shipping', 'unpaid', '2026-10-21 04:55:01', '2026-10-21 05:05:10'),
(3, 1, 3, 'GK-20261021-J4WGQ', '38610000.00', 'completed', 'paid', '2026-10-21 14:03:58', '2026-10-21 15:17:30'),
(4, 1, 3, 'GK-20261021-SWKC5', '4890000.00', 'completed', 'paid', '2026-10-21 14:04:11', '2026-10-21 15:17:23'),
(5, 1, 3, 'GK-20261021-TA2SO', '23990000.00', 'processing', 'paid', '2026-10-21 14:05:33', '2026-10-26 16:15:52'),
(6, 1, 3, 'GK-20261021-9CJXS', '8380000.00', 'completed', 'paid', '2026-10-21 14:40:39', '2026-10-25 15:52:24'),
(7, 1, 3, 'GK-20261021-P8MGH', '3695500.00', 'completed', 'paid', '2026-10-21 15:07:32', '2026-10-25 15:52:22'),
(8, 1, 3, 'GK-20261021-IVD6J', '3695500.00', 'completed', 'paid', '2026-10-21 15:10:04', '2026-10-25 15:52:21'),
(9, 1, 3, 'GK-20261024-6EV5W', '4490000.00', 'completed', 'paid', '2026-10-24 08:21:39', '2026-10-25 15:52:20'),
(10, 1, 3, 'GK-20261025-4ZWCF', '9780000.00', 'completed', 'paid', '2026-10-25 16:15:55', '2026-10-25 17:24:31'),
(11, 1, 3, 'GK-20261025-XWQ9S', '4645500.00', 'completed', 'paid', '2026-10-25 16:18:08', '2026-10-25 17:23:26'),
(12, 1, 3, 'GK-20261026-TUTLQ', '4645500.00', 'confirmed', 'unpaid', '2026-10-26 06:31:25', '2026-10-26 07:26:08'),
(13, 5, 4, 'GK-20261026-NY0UJ', '23990000.00', 'confirmed', 'unpaid', '2026-10-26 06:48:46', '2026-10-26 07:26:07'),
(16, 5, 5, 'GK-20261026-LREUF', '23990000.00', 'confirmed', 'unpaid', '2026-10-26 08:50:06', '2026-10-26 16:12:36'),
(20, 12, 11, 'GK-20261026-ZA9XN', '3890000.00', 'completed', 'paid', '2026-10-26 09:00:12', '2026-10-26 09:00:12'),
(21, 13, 12, 'GK-20261026-20REM', '7280000.00', 'confirmed', 'unpaid', '2026-10-26 09:01:24', '2026-10-26 16:12:35'),
(22, 5, 4, 'GK-20261026-FKLYS', '8380000.00', 'confirmed', 'unpaid', '2026-10-26 09:05:47', '2026-10-26 16:12:34'),
(23, 5, 4, 'GK-20261026-WDVLI', '10670000.00', 'confirmed', 'unpaid', '2026-10-26 09:08:40', '2026-10-26 16:12:32'),
(24, 5, 5, 'GK-20261026-VG718', '8780000.00', 'confirmed', 'unpaid', '2026-10-26 09:09:36', '2026-10-26 16:12:31'),
(25, 1, 3, 'GK-20261026-IDJIT', '9380000.00', 'confirmed', 'unpaid', '2026-10-26 16:12:10', '2026-10-26 16:12:30'),
(27, 1, 13, 'GK-20261027-VQV3L', '4490000.00', 'confirmed', 'paid', '2026-10-27 16:30:03', '2026-10-27 16:30:03'),
(28, 1, 13, 'GK-20261027-K7DX5', '0.00', 'pending', 'unpaid', '2026-10-27 16:40:16', '2026-10-27 16:40:16');

-- --------------------------------------------------------

--
-- Table structure for table `order_coupons`
--

CREATE TABLE `order_coupons` (
  `order_id` bigint UNSIGNED NOT NULL,
  `coupon_id` bigint UNSIGNED NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `order_coupons`
--

INSERT INTO `order_coupons` (`order_id`, `coupon_id`, `discount_amount`) VALUES
(2, 1, '778000.00'),
(7, 6, '194500.00'),
(8, 6, '194500.00'),
(11, 6, '244500.00'),
(12, 6, '244500.00'),
(28, 10, '9380000.00');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `line_total` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `variant_id`, `product_name`, `variant_name`, `unit_price`, `quantity`, `line_total`) VALUES
(1, 1, 1, 'Chu?t không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 2, '7780000.00'),
(2, 2, 1, 'Chu?t không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 2, '7780000.00'),
(3, 3, 1, 'Chu?t không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 5, '19450000.00'),
(4, 3, 4, 'Bàn phím c? Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 3, '14670000.00'),
(5, 3, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên b?n ?en Không Dây', '4490000.00', 1, '4490000.00'),
(6, 4, 4, 'Bàn phím c? Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 1, '4890000.00'),
(7, 5, 6, 'Màn hình Gaming Asus ROG Swift OLED PG27AQDM 27 inch 240Hz 0.03ms', 'B?n Tiêu Chu?n 240Hz OLED', '23990000.00', 1, '23990000.00'),
(8, 6, 1, 'Chu?t không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 1, '3890000.00'),
(9, 6, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên b?n ?en Không Dây', '4490000.00', 1, '4490000.00'),
(10, 7, 1, 'Chu?t không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 1, '3890000.00'),
(11, 8, 1, 'Chu?t không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 1, '3890000.00'),
(12, 9, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên b?n ?en Không Dây', '4490000.00', 1, '4490000.00'),
(13, 10, 4, 'Bàn phím c? Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 2, '9780000.00'),
(14, 11, 4, 'Bàn phím c? Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 1, '4890000.00'),
(15, 12, 4, 'Bàn phím c? Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 1, '4890000.00'),
(16, 13, 6, 'Màn hình Gaming Asus ROG Swift OLED PG27AQDM 27 inch 240Hz 0.03ms', 'B?n Tiêu Chu?n 240Hz OLED', '23990000.00', 1, '23990000.00'),
(17, 16, 6, 'Màn hình Gaming Asus ROG Swift OLED PG27AQDM 27 inch 240Hz 0.03ms', 'B?n Tiêu Chu?n 240Hz OLED', '23990000.00', 1, '23990000.00'),
(18, 20, 1, 'Chuột không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 1, '3890000.00'),
(19, 21, 1, 'Chuột không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 1, '3890000.00'),
(20, 21, 3, 'Chuột không dây Logitech G Pro X Superlight 2 Lightspeed', 'Màu ?en Nhám', '3390000.00', 1, '3390000.00'),
(21, 22, 1, 'Chuột không dây Razer Viper V3 Pro', 'Màu ?en (Black)', '3890000.00', 1, '3890000.00'),
(22, 22, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên b?n ?en Không Dây', '4490000.00', 1, '4490000.00'),
(23, 23, 1, 'Chuột không dây Razer Viper V3 Pro', 'Màu Đen (Black)', '3890000.00', 1, '3890000.00'),
(24, 23, 3, 'Chuột không dây Logitech G Pro X Superlight 2 Lightspeed', 'Màu Đen Nhám', '3390000.00', 2, '6780000.00'),
(25, 24, 1, 'Chuột không dây Razer Viper V3 Pro', 'Màu Đen (Black)', '3890000.00', 1, '3890000.00'),
(26, 24, 4, 'Bàn phím cơ Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 1, '4890000.00'),
(27, 25, 4, 'Bàn phím cơ Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 1, '4890000.00'),
(28, 25, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên bản Đen Không Dây', '4490000.00', 1, '4490000.00'),
(30, 27, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên bản Đen Không Dây', '4490000.00', 1, '4490000.00'),
(31, 28, 5, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'Phiên bản Đen Không Dây', '4490000.00', 1, '4490000.00'),
(32, 28, 4, 'Bàn phím cơ Corsair K70 MAX RGB Magnetic-Mechanical', 'Switch CORSAIR MGX Magnetic', '4890000.00', 1, '4890000.00');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `history_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `changed_by` bigint UNSIGNED DEFAULT NULL,
  `old_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`history_id`, `order_id`, `changed_by`, `old_status`, `new_status`, `changed_at`) VALUES
(1, 1, 3, NULL, 'pending', '2026-10-21 04:30:41'),
(2, 2, 1, NULL, 'pending', '2026-10-21 04:55:01'),
(3, 2, 1, 'pending', 'confirmed', '2026-10-21 05:04:48'),
(4, 1, 1, 'pending', 'shipping', '2026-10-21 05:05:07'),
(5, 2, 1, 'confirmed', 'shipping', '2026-10-21 05:05:10'),
(6, 3, 1, NULL, 'pending', '2026-10-21 14:03:58'),
(7, 4, 1, NULL, 'pending', '2026-10-21 14:04:11'),
(8, 5, 1, NULL, 'pending', '2026-10-21 14:05:33'),
(9, 5, 1, 'pending', 'completed', '2026-10-21 14:11:20'),
(10, 6, 1, NULL, 'pending', '2026-10-21 14:40:39'),
(11, 7, 1, NULL, 'pending', '2026-10-21 15:07:32'),
(12, 8, 1, NULL, 'pending', '2026-10-21 15:10:04'),
(13, 8, 1, 'pending', 'confirmed', '2026-10-21 15:17:14'),
(14, 7, 1, 'pending', 'confirmed', '2026-10-21 15:17:15'),
(15, 4, 1, 'pending', 'completed', '2026-10-21 15:17:23'),
(16, 3, 1, 'pending', 'completed', '2026-10-21 15:17:30'),
(17, 5, 1, 'completed', 'cancelled', '2026-10-21 15:17:43'),
(18, 9, 1, NULL, 'pending', '2026-10-24 08:21:39'),
(19, 9, 1, 'pending', 'processing', '2026-10-24 08:23:09'),
(20, 9, 1, 'processing', 'completed', '2026-10-25 15:52:20'),
(21, 8, 1, 'confirmed', 'completed', '2026-10-25 15:52:21'),
(22, 7, 1, 'confirmed', 'completed', '2026-10-25 15:52:22'),
(23, 6, 1, 'pending', 'completed', '2026-10-25 15:52:24'),
(24, 10, 1, NULL, 'pending', '2026-10-25 16:15:55'),
(25, 11, 1, NULL, 'pending', '2026-10-25 16:18:08'),
(26, 11, 1, 'pending', 'completed', '2026-10-25 17:23:26'),
(27, 10, 1, 'pending', 'completed', '2026-10-25 17:24:31'),
(28, 12, 1, NULL, 'pending', '2026-10-26 06:31:25'),
(29, 13, 5, NULL, 'pending', '2026-10-26 06:48:46'),
(30, 13, 1, 'pending', 'confirmed', '2026-10-26 07:26:07'),
(31, 12, 1, 'pending', 'confirmed', '2026-10-26 07:26:08'),
(32, 16, 5, NULL, 'pending', '2026-10-26 08:50:06'),
(33, 20, 12, NULL, 'pending', '2026-10-26 09:00:12'),
(34, 20, 1, 'pending', 'completed', '2026-10-26 09:00:12'),
(35, 21, 13, NULL, 'pending', '2026-10-26 09:01:24'),
(36, 22, 5, NULL, 'pending', '2026-10-26 09:05:47'),
(37, 23, 5, NULL, 'pending', '2026-10-26 09:08:40'),
(38, 24, 5, NULL, 'pending', '2026-10-26 09:09:36'),
(39, 25, 1, NULL, 'pending', '2026-10-26 16:12:10'),
(40, 25, 1, 'pending', 'confirmed', '2026-10-26 16:12:30'),
(41, 24, 1, 'pending', 'confirmed', '2026-10-26 16:12:31'),
(42, 23, 1, 'pending', 'confirmed', '2026-10-26 16:12:32'),
(43, 22, 1, 'pending', 'confirmed', '2026-10-26 16:12:34'),
(44, 21, 1, 'pending', 'confirmed', '2026-10-26 16:12:35'),
(45, 16, 1, 'pending', 'confirmed', '2026-10-26 16:12:36'),
(46, 5, 1, 'cancelled', 'processing', '2026-10-26 16:15:52'),
(48, 27, 1, NULL, 'confirmed', '2026-10-27 16:30:03'),
(49, 28, 1, NULL, 'pending', '2026-10-27 16:40:16');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_status` enum('pending','success','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `order_id`, `payment_method`, `amount`, `payment_status`, `paid_at`, `created_at`) VALUES
(1, 1, 'cod', '7780000.00', 'pending', NULL, '2026-10-21 04:30:41'),
(2, 2, 'cod', '7002000.00', 'pending', NULL, '2026-10-21 04:55:01'),
(3, 3, 'cod', '38610000.00', 'success', '2026-10-21 15:17:30', '2026-10-21 14:03:58'),
(4, 4, 'cod', '4890000.00', 'success', '2026-10-21 15:17:23', '2026-10-21 14:04:11'),
(5, 5, 'cod', '23990000.00', 'success', '2026-10-21 14:11:20', '2026-10-21 14:05:33'),
(6, 6, 'cod', '8380000.00', 'success', '2026-10-25 15:52:24', '2026-10-21 14:40:39'),
(7, 7, 'cod', '3695500.00', 'success', '2026-10-25 15:52:22', '2026-10-21 15:07:32'),
(8, 8, 'cod', '3695500.00', 'success', '2026-10-25 15:52:21', '2026-10-21 15:10:04'),
(9, 9, 'cod', '4490000.00', 'success', '2026-10-25 15:52:20', '2026-10-24 08:21:39'),
(10, 10, 'cod', '9780000.00', 'success', '2026-10-25 17:24:31', '2026-10-25 16:15:55'),
(11, 11, 'cod', '4645500.00', 'success', '2026-10-25 17:23:26', '2026-10-25 16:18:08'),
(12, 12, 'cod', '4645500.00', 'pending', NULL, '2026-10-26 06:31:25'),
(13, 13, 'cod', '23990000.00', 'pending', NULL, '2026-10-26 06:48:46'),
(14, 16, 'cod', '23990000.00', 'pending', NULL, '2026-10-26 08:50:06'),
(15, 20, 'cod', '3890000.00', 'success', '2026-10-26 09:00:12', '2026-10-26 09:00:12'),
(16, 21, 'cod', '7280000.00', 'pending', NULL, '2026-10-26 09:01:24'),
(17, 22, 'cod', '8380000.00', 'pending', NULL, '2026-10-26 09:05:47'),
(18, 23, 'cod', '10670000.00', 'pending', NULL, '2026-10-26 09:08:40'),
(19, 24, 'cod', '8780000.00', 'pending', NULL, '2026-10-26 09:09:36'),
(20, 25, 'cod', '9380000.00', 'pending', NULL, '2026-10-26 16:12:10'),
(22, 27, 'VNPay', '4490000.00', 'success', '2026-10-27 16:30:03', '2026-10-27 16:30:03'),
(23, 28, 'cod', '0.00', 'pending', NULL, '2026-10-27 16:40:16');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `brand_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(270) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','active','inactive','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `category_id`, `brand_id`, `product_name`, `slug`, `description`, `thumbnail_url`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Chuột không dây Razer Viper V3 Pro', 'chuot-khong-day-razer-viper-v3-pro', 'Chuột thể thao điện tử không dây siêu nhẹ 54g, cảm biến quang học Focus Pro Gen-2 35K DPI, công nghệ không dây HyperPolling 8000Hz đỉnh cao.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 'active', '2026-10-13 10:30:21', '2026-10-21 05:17:34'),
(2, 2, 2, 'Chuột không dây Logitech G Pro X Superlight 2 Lightspeed', 'chuot-khong-day-logitech-g-pro-x-superlight-2-lightspeed', 'Biểu tượng eSports thế hệ mới với switch lai cơ học-quang học LIGHTFORCE, cảm biến HERO 2 độ chính xác sub-micron, thời lượng pin 95 giờ.', 'https://images.unsplash.com/photo-1627856014955-490b3ff6383e?auto=format&fit=crop&w=800&q=80', 'inactive', '2026-10-13 10:30:21', '2026-10-21 05:17:39'),
(3, 1, 3, 'Bàn phím cơ Corsair K70 MAX RGB Magnetic-Mechanical', 'corsair-k70-max-rgb', 'Trang bị Switch từ tính CORSAIR MGX cho phép tùy chỉnh hành trình nhận phím từ 0.4mm đến 3.6mm với tính năng Rapid Trigger siêu nhạy.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 'active', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(4, 3, 1, 'Tai nghe không dây Razer BlackShark V2 Pro (2023)', 'razer-blackshark-v2-pro', 'Tai nghe eSports chuẩn mực với mic HyperClear Super Wideband, driver TriForce Titanium 50mm, âm thanh không gian THX Spatial Audio.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 'active', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(5, 4, 5, 'Màn hình Gaming Asus ROG Swift OLED PG27AQDM 27 inch 240Hz 0.03ms', 'asus-rog-swift-oled-pg27aqdm', 'Tấm nền OLED độ phân giải 2K QHD (2560x1440), tần số quét siêu mượt 240Hz, thời gian phản hồi 0.03ms GTG, tản nhiệt buồng hơi tùy chỉnh độc quyền.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 'active', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(6, 1, 1, 'Chuột Test Gaming Gear 1792946344651', 'test-gear-mouse-1792946344651', 'Chuột gaming test tính năng Multer và Variant Images', '/uploads/img-1792946344626-456304567.png', 'archived', '2026-10-25 16:39:04', '2026-10-25 17:29:28'),
(9, 5, 5, 'cccc', 'cccc', 'cccc', '/uploads/img-1792947324153-120423292.png', 'archived', '2026-10-25 16:56:02', '2026-10-26 05:12:57'),
(12, 1, 1, 'Chuột Test Tự Sinh SKU GearK', 'chuot-test-tu-sinh-sku-geark', 'Test tự sinh SKU', NULL, 'draft', '2026-10-25 17:30:28', '2026-10-25 17:30:28'),
(16, 1, 1, 'Bàn phím cơ Test SKU 7813', 'ban-phim-co-test-sku-7813', 'Test tự sinh SKU', NULL, 'draft', '2026-10-25 17:31:37', '2026-10-25 17:31:37');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `image_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `primary_guard` bigint UNSIGNED GENERATED ALWAYS AS (if((`is_primary` = 1),`product_id`,NULL)) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`image_id`, `product_id`, `image_url`, `alt_text`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 'Razer Viper V3 Pro Black', 1, 0, '2026-10-13 10:30:21'),
(2, 2, 'https://images.unsplash.com/photo-1627856014955-490b3ff6383e?auto=format&fit=crop&w=800&q=80', 'Logitech G Pro X Superlight 2', 1, 0, '2026-10-13 10:30:21'),
(3, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 'Corsair K70 MAX', 1, 0, '2026-10-13 10:30:21'),
(4, 4, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 'Razer BlackShark V2 Pro', 1, 0, '2026-10-13 10:30:21'),
(5, 5, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 'Asus ROG Swift OLED', 1, 0, '2026-10-13 10:30:21'),
(6, 9, '/uploads/img-1792947327107-177282597.png', 'cccc', 1, 0, '2026-10-25 16:56:02'),
(7, 9, '/uploads/img-1792947332675-478460585.png', 'cccc', 0, 1, '2026-10-25 16:56:02'),
(8, 9, '/uploads/img-1792947332681-888930643.png', 'cccc', 0, 2, '2026-10-25 16:56:02'),
(9, 9, '/uploads/img-1792947332688-540920624.png', 'cccc', 0, 3, '2026-10-25 16:56:02');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `variant_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(15,2) NOT NULL,
  `sale_price` decimal(15,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `warranty_months` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`variant_id`, `product_id`, `sku`, `variant_name`, `specifications`, `price`, `sale_price`, `stock`, `warranty_months`, `created_at`, `updated_at`) VALUES
(1, 1, 'RAZER-V3PRO-BLK', 'Màu Đen (Black)', '{\"dpi\": 35000, \"color\": \"Đen\", \"sensor\": \"Focus Pro 35K\", \"weight\": \"54g\", \"polling_rate\": \"8000Hz\"}', '4190000.00', '3890000.00', 8, 24, '2026-10-13 10:30:21', '2026-10-27 16:26:59'),
(2, 1, 'RAZER-V3PRO-WHT', 'Màu Trắng (White)', '{\"dpi\": 35000, \"color\": \"Trắng\", \"sensor\": \"Focus Pro 35K\", \"weight\": \"54g\", \"polling_rate\": \"8000Hz\"}', '4190000.00', '3890000.00', 18, 24, '2026-10-13 10:30:21', '2026-10-26 09:07:41'),
(3, 2, 'LOGI-GPX2-BLK', 'Màu Đen Nhám', '{\"color\": \"Đen\", \"sensor\": \"HERO 2 32K\", \"weight\": \"60g\", \"battery_life\": \"95 giờ\"}', '3690000.00', '3390000.00', 27, 24, '2026-10-13 10:30:21', '2026-10-26 09:08:40'),
(4, 3, 'CORSAIR-K70MAX', 'Switch CORSAIR MGX Magnetic', '{\"switch\": \"CORSAIR MGX Từ Tính\", \"actuation\": \"0.4mm - 3.6mm\", \"polling_rate\": \"8000Hz\", \"rapid_trigger\": \"Có\"}', '5390000.00', '4890000.00', 2, 24, '2026-10-13 10:30:21', '2026-10-27 16:40:16'),
(5, 4, 'RAZER-BSV2PRO-BLK', 'Phiên bản Đen Không Dây', '{\"audio\": \"THX Spatial Audio\", \"driver\": \"TriForce Titanium 50mm\", \"battery_life\": \"70 giờ\"}', '4990000.00', '4490000.00', 13, 24, '2026-10-13 10:30:21', '2026-10-27 16:40:16'),
(6, 5, 'ASUS-PG27AQDM', 'Bản Tiêu Chuẩn 240Hz OLED', '{\"panel\": \"OLED\", \"resolution\": \"2560x1440 (2K)\", \"refresh_rate\": \"240Hz\", \"response_time\": \"0.03ms GTG\"}', '25990000.00', '23990000.00', 5, 36, '2026-10-13 10:30:21', '2026-10-31 06:49:43'),
(7, 6, 'SKU-TEST-WHT-4651', 'Bản Trắng Moonlight', NULL, '1590000.00', '1390000.00', 50, 24, '2026-10-25 16:39:04', '2026-10-26 09:07:41'),
(8, 6, 'SKU-TEST-BLK-4651', 'Bản Đen Stealth', NULL, '1590000.00', NULL, 30, 24, '2026-10-25 16:39:04', '2026-10-26 09:07:41'),
(13, 9, 'cccc', 'ccc', '{\"Bảo hành\": \"24 tháng\", \"Tình trạng\": \"Mới 100% fullbox\"}', '5324324.00', '342424.00', 30, 12, '2026-10-25 16:56:02', '2026-10-25 17:18:16'),
(18, 12, 'TEST-TU-DO-NHAM-A40O', 'Màu Đỏ Nhám', NULL, '2500000.00', NULL, 15, 12, '2026-10-25 17:30:28', '2026-10-26 09:07:41'),
(19, 16, 'TEST-SKU-DO-NHAM-EIRO', 'Màu Đỏ Nhám', NULL, '2500000.00', NULL, 15, 12, '2026-10-25 17:31:37', '2026-10-26 09:07:41'),
(20, 16, 'TEST-SKU-XANH-DUO-JND5', 'Màu Xanh Dương', NULL, '2600000.00', NULL, 20, 12, '2026-10-25 17:31:37', '2026-10-26 09:07:41');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `purchase_order_id` bigint UNSIGNED NOT NULL,
  `supplier_id` bigint UNSIGNED NOT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `purchase_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','ordered','partially_received','received','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`purchase_order_id`, `supplier_id`, `created_by`, `purchase_code`, `status`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'PO-338319', 'received', '12000000.00', '2026-10-25 17:12:18', '2026-10-25 17:12:18'),
(2, 1, 1, 'PO-617022', 'received', '12000000.00', '2026-10-25 17:16:57', '2026-10-25 17:16:57'),
(3, 1, 1, 'PO-696774', 'received', '150000000.00', '2026-10-25 17:18:16', '2026-10-25 17:18:16'),
(4, 1, 1, 'PO-568643', 'received', '12000000.00', '2026-10-25 17:32:48', '2026-10-25 17:32:48');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `purchase_order_item_id` bigint UNSIGNED NOT NULL,
  `purchase_order_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NOT NULL,
  `quantity_ordered` int UNSIGNED NOT NULL,
  `quantity_received` int UNSIGNED NOT NULL DEFAULT '0',
  `unit_cost` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`purchase_order_item_id`, `purchase_order_id`, `variant_id`, `quantity_ordered`, `quantity_received`, `unit_cost`) VALUES
(1, 1, 13, 10, 10, '1200000.00'),
(2, 2, 13, 10, 10, '1200000.00'),
(3, 3, 13, 10, 10, '15000000.00'),
(4, 4, 20, 10, 10, '1200000.00');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `order_item_id` bigint UNSIGNED DEFAULT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `user_id`, `product_id`, `order_item_id`, `rating`, `content`, `created_at`, `updated_at`) VALUES
(1, 3, 1, NULL, 5, 'Chu?t siêu nh?, c?m c?c ??m tay và sensor 35K b?n CS2 v?i Valorant r?t chu?n xác!', '2026-10-13 10:30:21', '2026-10-13 10:30:21'),
(2, 2, 1, NULL, 4, 'web xin', '2026-10-14 05:46:11', '2026-10-14 05:46:11'),
(3, 2, 1, NULL, 1, 'chuot xiu ngon', '2026-10-14 05:46:31', '2026-10-14 05:46:31'),
(4, 1, 3, NULL, 5, '?', '2026-10-26 08:36:08', '2026-10-26 08:36:08'),
(5, 5, 3, NULL, 5, 'dsfs', '2026-10-26 08:37:00', '2026-10-26 08:37:00'),
(6, 1, 1, 11, 5, 'Review khong mua', '2026-10-26 08:46:56', '2026-10-26 08:46:56'),
(7, 12, 1, 18, 5, 'Da nhan duoc hang! Chuot cam qua phe', '2026-10-26 09:00:12', '2026-10-26 09:00:12');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` bigint UNSIGNED NOT NULL,
  `supplier_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `supplier_name`, `phone`, `email`, `created_at`) VALUES
(1, 'Nhà phân phối Viễn Sơn (Asus, Corsair)', '02838326085', 'contact@vienson.vn', '2026-10-25 17:09:34'),
(2, 'Synnex FPT Distribution', '02473006666', 'sales@synnexfpt.com.vn', '2026-10-25 17:09:34'),
(3, 'Mai Hoàng Informatics (Logitech, Razer)', '02435377109', 'kinhdoanh@maihoang.com.vn', '2026-10-25 17:09:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint UNSIGNED NOT NULL,
  `full_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','staff','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`, `status`) VALUES
(1, 'Quản trị viên GearK', 'admin@geark.vn', '$2b$10$o5yNEwvfQ2Bb1/o2j5htf.Ec7fjfjWTwVugVks2CscH2ZpaxaaIGq', 'admin', '2026-10-13 10:30:21', '2026-10-13 10:30:21', 'active'),
(2, 'Nhân viên Hỗ trợ GearK', 'staff@geark.vn', '$2b$10$o5yNEwvfQ2Bb1/o2j5htf.gvfmdD61sh3abQpFz0/E0M560Enc34C', 'staff', '2026-10-13 10:30:21', '2026-10-13 10:30:21', 'active'),
(3, 'Nguyễn Văn Khách', 'customer@geark.vn', '$2b$10$o5yNEwvfQ2Bb1/o2j5htf.hxpyuekQb.U56XpOLRicZU42vCf.kxC', 'customer', '2026-10-13 10:30:21', '2026-10-13 10:30:21', 'active'),
(4, 'Ngo Hieu Kien', 'ngohieukien12@gmail.com', '$2b$10$j23p0sRqu184yh/pELiVuOSp2c/2UFfw6ZZoX1xRF/yVG5DGzBqLO', 'customer', '2026-10-14 05:28:02', '2026-10-14 05:28:02', 'active'),
(5, 'vinh', 'vinh@gmail.com', '$2b$10$K1FhSkn1ZN0d1P/T6RshdOYogEIu9jii9EsHsANFA.iXDf..mSyo2', 'staff', '2026-10-26 06:47:47', '2026-10-26 07:58:26', 'active'),
(6, 'Nguyen Van Khong Mua', 'user_nobuy_4251@test.com', '$2b$10$Pbsc5JtjI8giHfBpPYXD1Odn7hAgeUEop/r6kqOGVA/eIpw9PgG3W', 'customer', '2026-10-26 08:47:30', '2026-10-26 08:47:30', 'active'),
(7, 'Nguyen Van Pending', 'user_pending_3953@test.com', '$2b$10$FnlCg7xMunj5iCCZbnKZxe6KGV3FHZ63ed61X/lrfpGHo6q5i9dUu', 'customer', '2026-10-26 08:54:41', '2026-10-26 08:54:41', 'active'),
(8, 'Nguyen Van Pending', 'user_pending_6708@test.com', '$2b$10$pc91s5.NmClNf2.kL1Khs.uKOVZbNYtAJszc0STIq36u.LfJS4xD6', 'customer', '2026-10-26 08:55:41', '2026-10-26 08:55:41', 'active'),
(9, 'Test', 't_1793004986300@t.com', '$2b$10$RbypfVoLZ0sGrB3p2/YfUuEoAYN/n6dxIVPM4dcH31PWV8jT06cvW', 'customer', '2026-10-26 08:56:26', '2026-10-26 08:56:26', 'active'),
(10, 'Khach Hang Pending', 'kh_1793005021278@geark.vn', '$2b$10$XGOATvWetElxG6rmBtmqwuGMbOjZAvubhmB3cD2r3l4rsAuMSqQwa', 'customer', '2026-10-26 08:57:01', '2026-10-26 08:57:01', 'active'),
(11, 'Khach Hang Pending', 'kh_1793005032104@geark.vn', '$2b$10$h3CY.6r6TbpsrW.jUN0kVet/A/IQLTs1RZpvA4ytltvxFv24Q0tOa', 'customer', '2026-10-26 08:57:12', '2026-10-26 08:57:12', 'active'),
(12, 'Khach Hang Pending', 'kh_1793005212130@geark.vn', '$2b$10$LxW3eJxCTJYX00VMGV7e/.qAqx2y5AFR9qXbXn1ldkv1OVUxqv6YC', 'customer', '2026-10-26 09:00:12', '2026-10-26 09:00:12', 'active'),
(13, 'Test Buy 2', 'buy2_1793005283625@geark.vn', '$2b$10$fgDg3AKWOjJi8m9.Kn936.5e37sz.TvxaMRU2zbLgf9mZpvzV4FSa', 'customer', '2026-10-26 09:01:23', '2026-10-26 09:01:23', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `variant_images`
--

CREATE TABLE `variant_images` (
  `image_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `primary_guard` bigint UNSIGNED GENERATED ALWAYS AS (if((`is_primary` = 1),`variant_id`,NULL)) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `variant_images`
--

INSERT INTO `variant_images` (`image_id`, `variant_id`, `image_url`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 7, '/uploads/img-1792946344626-456304567.png', 1, 0, '2026-10-25 16:39:04'),
(2, 7, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', 0, 1, '2026-10-25 16:39:04'),
(3, 8, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', 1, 0, '2026-10-25 16:39:04'),
(12, 13, '/uploads/img-1792947358598-293302314.png', 1, 0, '2026-10-25 16:56:02'),
(13, 13, '/uploads/img-1792947358608-766264918.png', 0, 1, '2026-10-25 16:56:02'),
(14, 13, '/uploads/img-1792947358619-994846158.png', 0, 2, '2026-10-25 16:56:02'),
(15, 13, '/uploads/img-1792947358631-391489908.png', 0, 3, '2026-10-25 16:56:02'),
(16, 13, '/uploads/img-1792947358634-397928357.png', 0, 4, '2026-10-25 16:56:02'),
(17, 13, '/uploads/img-1792947358649-78421603.png', 0, 5, '2026-10-25 16:56:02');

-- --------------------------------------------------------

--
-- Table structure for table `vnpay_transactions`
--

CREATE TABLE `vnpay_transactions` (
  `txn_ref` varchar(100) NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `order_data` longtext NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `vnp_response_code` varchar(10) DEFAULT NULL,
  `vnp_transaction_no` varchar(100) DEFAULT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vnpay_transactions`
--

INSERT INTO `vnpay_transactions` (`txn_ref`, `user_id`, `amount`, `order_data`, `status`, `vnp_response_code`, `vnp_transaction_no`, `order_id`, `created_at`, `updated_at`) VALUES
('2610272328246645', 1, '4490000.00', '{\"address_id\":13,\"recipient_name\":\"Test VNPay Buyer\",\"recipient_phone\":\"0987654321\",\"street_address\":\"123 VNPay Street\",\"items\":[{\"variant_id\":5,\"quantity\":1}],\"notes\":\"\"}', 'failed', '24', '15716713', NULL, '2026-10-27 16:28:24', '2026-10-27 16:29:27'),
('2610272329355375', 1, '4490000.00', '{\"address_id\":13,\"recipient_name\":\"Test VNPay Buyer\",\"recipient_phone\":\"0987654321\",\"street_address\":\"123 VNPay Street\",\"items\":[{\"variant_id\":5,\"quantity\":1}],\"notes\":\"\"}', 'success', '00', '15716714', 27, '2026-10-27 16:29:35', '2026-10-27 16:30:03');

-- --------------------------------------------------------

--
-- Table structure for table `warranty_claims`
--

CREATE TABLE `warranty_claims` (
  `claim_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','repairing','completed','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `admin_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `warranty_records`
--

CREATE TABLE `warranty_records` (
  `warranty_id` bigint UNSIGNED NOT NULL,
  `order_item_id` bigint UNSIGNED NOT NULL,
  `serial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_start` date NOT NULL,
  `warranty_end` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `wishlist_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`wishlist_id`, `user_id`, `created_at`) VALUES
(1, 3, '2026-10-13 10:30:21'),
(2, 1, '2026-10-14 00:07:10'),
(3, 2, '2026-10-14 02:59:08'),
(4, 4, '2026-10-14 05:28:02'),
(5, 5, '2026-10-26 06:47:47'),
(6, 6, '2026-10-26 08:47:30'),
(7, 7, '2026-10-26 08:54:41'),
(8, 8, '2026-10-26 08:55:41'),
(9, 9, '2026-10-26 08:56:26'),
(10, 10, '2026-10-26 08:57:01'),
(11, 11, '2026-10-26 08:57:12'),
(12, 12, '2026-10-26 09:00:12'),
(13, 13, '2026-10-26 09:01:23');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `wishlist_item_id` bigint UNSIGNED NOT NULL,
  `wishlist_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `wishlist_items`
--

INSERT INTO `wishlist_items` (`wishlist_item_id`, `wishlist_id`, `variant_id`, `created_at`) VALUES
(7, 2, 4, '2026-10-26 06:01:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`) USING BTREE,
  ADD KEY `idx_addresses_user` (`user_id`) USING BTREE;

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`banner_id`) USING BTREE;

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`brand_id`) USING BTREE,
  ADD UNIQUE KEY `uq_brands_name` (`brand_name`) USING BTREE,
  ADD UNIQUE KEY `uq_brands_slug` (`slug`) USING BTREE;

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`) USING BTREE,
  ADD UNIQUE KEY `uq_carts_user` (`user_id`) USING BTREE;

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`) USING BTREE,
  ADD UNIQUE KEY `uq_cart_variant` (`cart_id`,`variant_id`) USING BTREE,
  ADD KEY `idx_cart_items_variant` (`variant_id`) USING BTREE;

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`) USING BTREE,
  ADD UNIQUE KEY `uq_categories_slug` (`slug`) USING BTREE,
  ADD KEY `idx_categories_parent` (`parent_id`) USING BTREE;

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`coupon_id`) USING BTREE,
  ADD UNIQUE KEY `uq_coupons_code` (`coupon_code`) USING BTREE;

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`inventory_transaction_id`) USING BTREE,
  ADD KEY `idx_inv_variant` (`variant_id`,`created_at`) USING BTREE,
  ADD KEY `idx_inv_created_by` (`created_by`) USING BTREE;

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`) USING BTREE,
  ADD UNIQUE KEY `uq_orders_code` (`order_code`) USING BTREE,
  ADD KEY `idx_orders_user` (`user_id`) USING BTREE,
  ADD KEY `idx_orders_address` (`address_id`) USING BTREE,
  ADD KEY `idx_orders_status` (`order_status`,`payment_status`) USING BTREE;

--
-- Indexes for table `order_coupons`
--
ALTER TABLE `order_coupons`
  ADD PRIMARY KEY (`order_id`,`coupon_id`) USING BTREE,
  ADD KEY `idx_order_coupons_coupon` (`coupon_id`) USING BTREE;

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`) USING BTREE,
  ADD KEY `idx_order_items_order` (`order_id`) USING BTREE,
  ADD KEY `idx_order_items_variant` (`variant_id`) USING BTREE;

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`history_id`) USING BTREE,
  ADD KEY `idx_osh_order` (`order_id`,`changed_at`) USING BTREE,
  ADD KEY `idx_osh_changed_by` (`changed_by`) USING BTREE;

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`) USING BTREE,
  ADD KEY `idx_payments_order` (`order_id`) USING BTREE;

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`) USING BTREE,
  ADD UNIQUE KEY `uq_products_slug` (`slug`) USING BTREE,
  ADD KEY `idx_products_category` (`category_id`) USING BTREE,
  ADD KEY `idx_products_brand` (`brand_id`) USING BTREE,
  ADD KEY `idx_products_status` (`status`) USING BTREE;

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`image_id`) USING BTREE,
  ADD UNIQUE KEY `uq_product_one_primary` (`primary_guard`) USING BTREE,
  ADD KEY `idx_product_images_sort` (`product_id`,`sort_order`) USING BTREE;

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`variant_id`) USING BTREE,
  ADD UNIQUE KEY `uq_variants_sku` (`sku`) USING BTREE,
  ADD KEY `idx_variants_product` (`product_id`) USING BTREE;

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`purchase_order_id`) USING BTREE,
  ADD UNIQUE KEY `uq_purchase_code` (`purchase_code`) USING BTREE,
  ADD KEY `idx_po_supplier` (`supplier_id`) USING BTREE,
  ADD KEY `idx_po_created_by` (`created_by`) USING BTREE;

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`purchase_order_item_id`) USING BTREE,
  ADD UNIQUE KEY `uq_po_variant` (`purchase_order_id`,`variant_id`) USING BTREE,
  ADD KEY `idx_poi_variant` (`variant_id`) USING BTREE;

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`) USING BTREE,
  ADD UNIQUE KEY `uq_review_order_item` (`order_item_id`) USING BTREE,
  ADD KEY `idx_reviews_product` (`product_id`) USING BTREE,
  ADD KEY `idx_reviews_user` (`user_id`) USING BTREE;

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`) USING BTREE;

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`) USING BTREE,
  ADD UNIQUE KEY `uq_users_email` (`email`) USING BTREE;

--
-- Indexes for table `variant_images`
--
ALTER TABLE `variant_images`
  ADD PRIMARY KEY (`image_id`) USING BTREE,
  ADD UNIQUE KEY `uq_variant_one_primary` (`primary_guard`) USING BTREE,
  ADD KEY `idx_variant_images_sort` (`variant_id`,`sort_order`) USING BTREE;

--
-- Indexes for table `vnpay_transactions`
--
ALTER TABLE `vnpay_transactions`
  ADD PRIMARY KEY (`txn_ref`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `warranty_claims`
--
ALTER TABLE `warranty_claims`
  ADD PRIMARY KEY (`claim_id`) USING BTREE;

--
-- Indexes for table `warranty_records`
--
ALTER TABLE `warranty_records`
  ADD PRIMARY KEY (`warranty_id`) USING BTREE,
  ADD UNIQUE KEY `uq_warranty_serial` (`serial_number`) USING BTREE,
  ADD KEY `idx_warranty_order_item` (`order_item_id`) USING BTREE;

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`wishlist_id`) USING BTREE,
  ADD UNIQUE KEY `uq_wishlists_user` (`user_id`) USING BTREE;

--
-- Indexes for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`wishlist_item_id`) USING BTREE,
  ADD UNIQUE KEY `uq_wishlist_variant` (`wishlist_id`,`variant_id`) USING BTREE,
  ADD KEY `idx_wishlist_items_variant` (`variant_id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `banner_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `brand_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `coupon_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `inventory_transaction_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `history_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `image_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `variant_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `purchase_order_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `purchase_order_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `variant_images`
--
ALTER TABLE `variant_images`
  MODIFY `image_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `warranty_claims`
--
ALTER TABLE `warranty_claims`
  MODIFY `claim_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warranty_records`
--
ALTER TABLE `warranty_records`
  MODIFY `warranty_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `wishlist_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `wishlist_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `fk_inv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inv_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `order_coupons`
--
ALTER TABLE `order_coupons`
  ADD CONSTRAINT `fk_order_coupons_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_coupons_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `fk_osh_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_osh_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `fk_po_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `fk_poi_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`purchase_order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_poi_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `variant_images`
--
ALTER TABLE `variant_images`
  ADD CONSTRAINT `fk_variant_images_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `warranty_records`
--
ALTER TABLE `warranty_records`
  ADD CONSTRAINT `fk_warranty_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `fk_wishlist_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wishlist_items_wishlist` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`wishlist_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
