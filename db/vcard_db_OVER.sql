/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: vcard_db
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-1+b1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `complain`
--

DROP TABLE IF EXISTS `complain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `complain` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `user_id` int(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `agility` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complain`
--

LOCK TABLES `complain` WRITE;
/*!40000 ALTER TABLE `complain` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `complain` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `feedback` VALUES
(1,'qa','aqaa','qaa'),
(2,'nexa','theicon','screen blackout\n');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `related_type` enum('report','complaint','user') DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=420 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `notifications` VALUES
(5,3,'New Card Created!','User \"zombie\" with email \"zombie@gmail.com\" Created a new vcard nexa vile.',24,'user',0,'2025-11-07 12:21:15'),
(6,3,'New Staff Added','Staff with username: \"sox\" and email: \"Paulmako49@gmail.com\" has just Added.',10,'user',0,'2025-11-07 12:21:15'),
(9,11,'New Card Created!','User \"Assistant Supreme\" with email \"Paulmako49@gmail.com\" Created a new vcard Assistant Admin.',26,'user',1,'2025-11-07 12:21:15'),
(10,11,'Card Deleted!','User \"zombie\" with email \"zombie@gmail.com\" has deleted card 24.',0,'user',1,'2025-11-07 12:21:15'),
(12,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-10-24 19:05:20',11,'user',1,'2025-11-07 12:21:15'),
(13,11,'New Scan!','Your Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-10-24 19:05:20',11,'user',1,'2025-11-07 12:21:15'),
(14,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-10-24 19:09:27',11,'user',1,'2025-11-07 12:21:15'),
(15,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-10-24 19:09:27',11,'user',1,'2025-11-07 12:21:15'),
(17,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-10-24 21:40:53',11,'user',1,'2025-11-07 12:21:15'),
(18,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-10-24 21:40:53',11,'user',1,'2025-11-07 12:21:15'),
(19,11,'New Scan!','Card with ID:-\"26\" has been scanned from undefined in undefined at 2025-10-24 23:12:47',10,'user',1,'2025-11-07 12:21:15'),
(20,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-10-24 23:12:47',10,'user',1,'2025-11-07 12:21:15'),
(21,10,'Card Updated!','You Successfully Updated Your Card (\"Assistant Admin\") with id number \"26\" at Sat Oct 25 2025 02:14:25 GMT+0300 (East Africa Time).',10,'user',1,'2025-11-07 12:21:15'),
(22,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-10-25 00:37:33',11,'user',1,'2025-11-07 12:21:15'),
(23,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-10-25 00:37:33',11,'user',1,'2025-11-07 12:21:15'),
(24,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 08:10:40',11,'user',1,'2025-11-07 12:21:15'),
(25,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 08:10:40',11,'user',1,'2025-11-07 12:21:15'),
(26,11,'New Complaint Submitted','Complaint #1 has been submitted.',1,'complaint',1,'2025-11-07 12:21:15'),
(27,11,'New Complaint Submitted','Complaint #2 has been submitted.',2,'complaint',1,'2025-11-07 12:21:15'),
(28,11,'New Scan!','Card with ID:-\"26\" has been scanned from undefined in undefined at 2025-11-07 10:45:02',10,'user',1,'2025-11-07 12:21:15'),
(29,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-07 10:45:02',10,'user',1,'2025-11-07 12:21:15'),
(30,11,'New Scan!','Card with ID:-\"26\" has been scanned from undefined in undefined at 2025-11-07 10:46:32',10,'user',1,'2025-11-07 12:21:15'),
(31,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-07 10:46:32',10,'user',1,'2025-11-07 12:21:15'),
(32,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 12:03:24',11,'user',1,'2025-11-07 12:21:15'),
(33,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 12:03:24',11,'user',1,'2025-11-07 12:21:15'),
(34,11,'New Scan!','Card with ID:-\"26\" has been scanned from undefined in undefined at 2025-11-07 12:47:12',10,'user',1,'2025-11-07 12:47:12'),
(35,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-07 12:47:12',10,'user',1,'2025-11-07 12:47:12'),
(36,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 12:47:50',4,'user',1,'2025-11-07 12:47:50'),
(38,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:08:38',4,'user',1,'2025-11-07 15:08:38'),
(40,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:18:06',4,'user',1,'2025-11-07 15:18:06'),
(42,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:34:18',4,'user',1,'2025-11-07 15:34:18'),
(44,11,'New Card Created!','User \"zombie\" with email \"zombie@gmail.com\" Created a new vcard anaza.',27,'user',1,'2025-11-07 15:34:50'),
(45,11,'New Scan!','Card with ID:-\"27\" has been scanned from undefined in undefined at 2025-11-07 15:34:55',4,'user',1,'2025-11-07 15:34:55'),
(47,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:35:06',4,'user',1,'2025-11-07 15:35:06'),
(49,11,'New Scan!','Card with ID:-\"27\" has been scanned from undefined in undefined at 2025-11-07 15:35:31',4,'user',1,'2025-11-07 15:35:31'),
(51,11,'Card Deleted!','User \"zombie\" with email \"zombie@gmail.com\" has deleted card 27.',0,'user',1,'2025-11-07 15:35:41'),
(52,4,'Card Deleted!','You Successfully Deleted Card Number \"27\"',4,'user',1,'2025-11-07 15:35:41'),
(53,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:51:11',4,'user',1,'2025-11-07 15:51:11'),
(55,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:57:16',4,'user',1,'2025-11-07 15:57:16'),
(57,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:57:54',4,'user',1,'2025-11-07 15:57:54'),
(59,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:59:20',4,'user',1,'2025-11-07 15:59:20'),
(61,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 15:59:54',4,'user',1,'2025-11-07 15:59:54'),
(63,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:00:29',4,'user',1,'2025-11-07 16:00:29'),
(65,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:01:17',4,'user',1,'2025-11-07 16:01:17'),
(67,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:01:27',4,'user',1,'2025-11-07 16:01:27'),
(69,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:01:28',4,'user',1,'2025-11-07 16:01:28'),
(71,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:06:10',4,'user',1,'2025-11-07 16:06:10'),
(73,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:07:14',4,'user',1,'2025-11-07 16:07:14'),
(75,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:07:20',4,'user',1,'2025-11-07 16:07:20'),
(77,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:07:23',4,'user',1,'2025-11-07 16:07:23'),
(79,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:12:42',4,'user',1,'2025-11-07 16:12:42'),
(81,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:12:48',4,'user',1,'2025-11-07 16:12:48'),
(83,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:12:52',4,'user',1,'2025-11-07 16:12:52'),
(85,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:12:52',4,'user',1,'2025-11-07 16:12:52'),
(87,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:13:02',4,'user',1,'2025-11-07 16:13:02'),
(89,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:13:34',4,'user',1,'2025-11-07 16:13:34'),
(91,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:13:59',4,'user',1,'2025-11-07 16:13:59'),
(93,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:09',4,'user',1,'2025-11-07 16:14:09'),
(95,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:14',4,'user',1,'2025-11-07 16:14:14'),
(97,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:17',4,'user',1,'2025-11-07 16:14:17'),
(99,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:19',4,'user',1,'2025-11-07 16:14:19'),
(101,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:19',4,'user',1,'2025-11-07 16:14:19'),
(103,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:29',4,'user',1,'2025-11-07 16:14:29'),
(105,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:36',4,'user',1,'2025-11-07 16:14:36'),
(107,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:14:40',4,'user',1,'2025-11-07 16:14:40'),
(109,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:15:07',4,'user',1,'2025-11-07 16:15:07'),
(111,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:16:36',4,'user',1,'2025-11-07 16:16:36'),
(113,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:21:25',4,'user',1,'2025-11-07 16:21:25'),
(115,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:21:30',4,'user',1,'2025-11-07 16:21:30'),
(117,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:22:27',4,'user',1,'2025-11-07 16:22:27'),
(119,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:23:18',4,'user',1,'2025-11-07 16:23:18'),
(121,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:23:39',4,'user',1,'2025-11-07 16:23:39'),
(123,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:25:42',4,'user',1,'2025-11-07 16:25:42'),
(125,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:28:08',4,'user',1,'2025-11-07 16:28:08'),
(127,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:28:13',4,'user',1,'2025-11-07 16:28:13'),
(129,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:28:19',4,'user',1,'2025-11-07 16:28:19'),
(131,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:28:25',4,'user',1,'2025-11-07 16:28:25'),
(133,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:30:42',4,'user',1,'2025-11-07 16:30:42'),
(136,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:33:21',4,'user',1,'2025-11-07 16:33:21'),
(138,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:34:33',4,'user',1,'2025-11-07 16:34:33'),
(140,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:34:49',4,'user',1,'2025-11-07 16:34:49'),
(142,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:38:35',4,'user',1,'2025-11-07 16:38:35'),
(144,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:39:31',4,'user',1,'2025-11-07 16:39:31'),
(146,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:39:40',4,'user',1,'2025-11-07 16:39:40'),
(148,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:05',4,'user',1,'2025-11-07 16:40:05'),
(150,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:10',4,'user',1,'2025-11-07 16:40:10'),
(152,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:12',4,'user',1,'2025-11-07 16:40:12'),
(154,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:14',4,'user',1,'2025-11-07 16:40:14'),
(156,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:25',4,'user',1,'2025-11-07 16:40:25'),
(158,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:30',4,'user',1,'2025-11-07 16:40:30'),
(160,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:40:59',4,'user',1,'2025-11-07 16:40:59'),
(162,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:41:09',4,'user',1,'2025-11-07 16:41:09'),
(164,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:43:41',4,'user',1,'2025-11-07 16:43:41'),
(166,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:54:43',4,'user',1,'2025-11-07 16:54:43'),
(168,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 16:54:55',4,'user',1,'2025-11-07 16:54:55'),
(170,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:01:35',4,'user',1,'2025-11-07 17:01:35'),
(172,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:01:36',4,'user',1,'2025-11-07 17:01:36'),
(174,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:08:33',4,'user',1,'2025-11-07 17:08:33'),
(176,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:09:33',4,'user',1,'2025-11-07 17:09:33'),
(178,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:09:40',4,'user',1,'2025-11-07 17:09:40'),
(180,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:10:21',4,'user',1,'2025-11-07 17:10:21'),
(181,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at 2025-11-07 17:10:21',4,'user',1,'2025-11-07 17:10:21'),
(182,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:10:29',4,'user',1,'2025-11-07 17:10:29'),
(183,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at 2025-11-07 17:10:29',4,'user',1,'2025-11-07 17:10:29'),
(184,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:10:30',4,'user',1,'2025-11-07 17:10:30'),
(185,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at 2025-11-07 17:10:30',4,'user',1,'2025-11-07 17:10:30'),
(186,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:10:36',4,'user',1,'2025-11-07 17:10:36'),
(187,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at 2025-11-07 17:10:36',4,'user',1,'2025-11-07 17:10:36'),
(188,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:10:38',4,'user',1,'2025-11-07 17:10:38'),
(189,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at 2025-11-07 17:10:38',4,'user',1,'2025-11-07 17:10:38'),
(190,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:10:41',4,'user',1,'2025-11-07 17:10:41'),
(191,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at 2025-11-07 17:10:41',4,'user',1,'2025-11-07 17:10:41'),
(192,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:17:06',4,'user',1,'2025-11-07 17:17:06'),
(195,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:19:11',4,'user',1,'2025-11-07 17:19:11'),
(197,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:19:27',4,'user',1,'2025-11-07 17:19:27'),
(199,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:20:38',4,'user',1,'2025-11-07 17:20:38'),
(201,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:20:39',4,'user',1,'2025-11-07 17:20:39'),
(203,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:23:12',4,'user',1,'2025-11-07 17:23:12'),
(205,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:23:20',4,'user',1,'2025-11-07 17:23:20'),
(207,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:23:30',4,'user',1,'2025-11-07 17:23:30'),
(209,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:23:53',4,'user',1,'2025-11-07 17:23:53'),
(211,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:25:13',4,'user',1,'2025-11-07 17:25:13'),
(213,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:35:12',4,'user',1,'2025-11-07 17:35:12'),
(215,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:35:50',4,'user',1,'2025-11-07 17:35:50'),
(218,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:39:31',4,'user',1,'2025-11-07 17:39:31'),
(220,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:40:58',4,'user',1,'2025-11-07 17:40:58'),
(222,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:41:29',4,'user',1,'2025-11-07 17:41:29'),
(224,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:41:40',4,'user',1,'2025-11-07 17:41:40'),
(226,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:41:47',4,'user',1,'2025-11-07 17:41:47'),
(228,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:42:11',4,'user',1,'2025-11-07 17:42:11'),
(230,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:42:17',4,'user',1,'2025-11-07 17:42:17'),
(232,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:42:20',4,'user',1,'2025-11-07 17:42:20'),
(234,11,'New Scan!','Card with ID:-\"2\" has been scanned from undefined in undefined at 2025-11-07 17:44:16',4,'user',1,'2025-11-07 17:44:16'),
(236,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:49:50',11,'user',1,'2025-11-07 17:49:50'),
(237,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:49:50',11,'user',1,'2025-11-07 17:49:50'),
(238,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:56:17',11,'user',1,'2025-11-07 17:56:17'),
(239,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:56:17',11,'user',1,'2025-11-07 17:56:17'),
(240,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:56:35',11,'user',1,'2025-11-07 17:56:35'),
(241,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:56:35',11,'user',1,'2025-11-07 17:56:35'),
(242,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:57:39',11,'user',1,'2025-11-07 17:57:39'),
(243,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:57:39',11,'user',1,'2025-11-07 17:57:39'),
(244,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:57:43',11,'user',1,'2025-11-07 17:57:43'),
(245,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:57:43',11,'user',1,'2025-11-07 17:57:43'),
(246,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:57:44',11,'user',1,'2025-11-07 17:57:44'),
(247,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:57:44',11,'user',1,'2025-11-07 17:57:44'),
(248,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:57:46',11,'user',1,'2025-11-07 17:57:46'),
(249,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:57:46',11,'user',1,'2025-11-07 17:57:46'),
(250,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:58:56',11,'user',1,'2025-11-07 17:58:56'),
(251,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:58:56',11,'user',1,'2025-11-07 17:58:56'),
(252,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:58:56',11,'user',1,'2025-11-07 17:58:56'),
(253,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:58:56',11,'user',1,'2025-11-07 17:58:56'),
(254,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:59:06',11,'user',1,'2025-11-07 17:59:06'),
(255,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:59:06',11,'user',1,'2025-11-07 17:59:06'),
(256,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:59:13',11,'user',1,'2025-11-07 17:59:13'),
(257,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:59:13',11,'user',1,'2025-11-07 17:59:13'),
(258,11,'New Scan!','Card with ID:-\"25\" has been scanned from undefined in undefined at 2025-11-07 17:59:20',11,'user',1,'2025-11-07 17:59:20'),
(259,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at 2025-11-07 17:59:20',11,'user',1,'2025-11-07 17:59:20'),
(260,11,'New Scan!','Card with ID:-\"26\" has been scanned from undefined in undefined at 2025-11-07 18:04:00',10,'user',1,'2025-11-07 18:04:00'),
(261,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-07 18:04:00',10,'user',1,'2025-11-07 18:04:00'),
(262,11,'New Scan!','Card with ID:-\"26\" has been scanned from Unknown in Unknown at 2025-11-09 11:42:24',10,'user',1,'2025-11-09 11:42:24'),
(263,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-09 11:42:24',10,'user',1,'2025-11-09 11:42:24'),
(264,11,'New Scan!','Card with ID:-\"26\" has been scanned from Unknown in Unknown at 2025-11-09 11:43:50',10,'user',1,'2025-11-09 11:43:50'),
(265,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-09 11:43:50',10,'user',1,'2025-11-09 11:43:50'),
(266,11,'New Scan!','Card with ID:-\"26\" has been scanned from Unknown in Unknown at 2025-11-09 11:56:33',10,'user',1,'2025-11-09 11:56:33'),
(267,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at 2025-11-09 11:56:33',10,'user',1,'2025-11-09 11:56:33'),
(268,10,'Card Updated!','You Successfully Updated Your Card (\"Paul .M .P .M\") with id number \"26\" at Sun Nov 09 2025 14:59:10 GMT+0300 (East Africa Time).',10,'user',1,'2025-11-09 11:59:10'),
(269,11,'New Card Created!','User \"Assistant Supreme\" with email \"Paulmako49@gmail.com\" Created a new vcard admin.',28,'user',1,'2025-11-09 12:00:55'),
(270,10,'Card Updated!','You Successfully Updated Your Card (\"Admin\") with id number \"26\" at Sun Nov 09 2025 15:01:12 GMT+0300 (East Africa Time).',10,'user',0,'2025-11-09 12:01:12'),
(271,11,'New Scan!','Card with ID:-\"28\" has been scanned from Unknown in Unknown at 2025-11-09 12:02:03',10,'user',1,'2025-11-09 12:02:03'),
(272,10,'New Scan!','Your Card with ID:-\"28\" has been scanned  at 2025-11-09 12:02:03',10,'user',0,'2025-11-09 12:02:03'),
(273,11,'New Scan!','Card with ID:-\"28\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:07:36 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-09 12:07:36'),
(274,10,'New Scan!','Your Card with ID:-\"28\" has been scanned  at Sun Nov 09 2025 15:07:36 GMT+0300 (East Africa Time)',10,'user',0,'2025-11-09 12:07:36'),
(275,11,'New Scan!','Card with ID:-\"28\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:16:14 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-09 12:16:14'),
(276,10,'New Scan!','Your Card with ID:-\"28\" has been scanned  at Sun Nov 09 2025 15:16:14 GMT+0300 (East Africa Time)',10,'user',0,'2025-11-09 12:16:14'),
(277,11,'New Scan!','Card with ID:-\"26\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:22:56 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-09 12:22:56'),
(278,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at Sun Nov 09 2025 15:22:56 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-09 12:22:56'),
(279,11,'New Scan!','Card with ID:-\"28\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:23:06 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-09 12:23:06'),
(280,10,'New Scan!','Your Card with ID:-\"28\" has been scanned  at Sun Nov 09 2025 15:23:06 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-09 12:23:06'),
(281,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:25:30 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:25:30'),
(282,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:25:30 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:25:30'),
(283,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:26:18 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:26:18'),
(284,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:26:18 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:26:18'),
(285,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:26:24 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:26:24'),
(286,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:26:24 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:26:24'),
(287,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:26:27 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:26:27'),
(288,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:26:27 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:26:27'),
(289,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:28:10 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:28:10'),
(290,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:28:10 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:28:10'),
(291,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:34:48 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:34:48'),
(292,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:34:48 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:34:48'),
(293,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 15:37:22 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:37:22'),
(294,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Sun Nov 09 2025 15:37:22 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-09 12:37:22'),
(295,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Sun Nov 09 2025 17:54:59 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-09 14:54:59'),
(296,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Sun Nov 09 2025 17:54:59 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-09 14:54:59'),
(297,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:16:31 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:16:31'),
(298,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Mon Nov 10 2025 04:16:31 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:16:31'),
(299,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:19:04 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:04'),
(300,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Mon Nov 10 2025 04:19:04 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:04'),
(301,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:19:10 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:10'),
(303,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:19:10 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:10'),
(304,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Mon Nov 10 2025 04:19:10 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:10'),
(305,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:19:12 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:12'),
(306,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Mon Nov 10 2025 04:19:12 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:12'),
(307,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:19:13 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:13'),
(308,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Mon Nov 10 2025 04:19:13 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:19:13'),
(309,11,'New Scan!','Card with ID:-\"2\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:28:59 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:28:59'),
(310,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Mon Nov 10 2025 04:28:59 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 01:28:59'),
(311,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:37:40 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-10 01:37:40'),
(312,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Mon Nov 10 2025 04:37:40 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-10 01:37:40'),
(313,11,'New Scan!','Card with ID:-\"25\" has been scanned from Unknown in Unknown at Mon Nov 10 2025 04:37:57 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-10 01:37:57'),
(314,11,'New Scan!','Your Card with ID:-\"25\" has been scanned  at Mon Nov 10 2025 04:37:57 GMT+0300 (East Africa Time)',11,'user',1,'2025-11-10 01:37:57'),
(315,11,'New Scan!','Card with ID:-\"26\" has been scanned from Zanzibar Urban/West in Tanzania at Mon Nov 10 2025 04:52:13 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-10 01:52:13'),
(316,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at Mon Nov 10 2025 04:52:13 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-10 01:52:13'),
(317,11,'New Scan!','Card with ID:-\"26\" has been scanned from Zanzibar Urban/West in Tanzania at Mon Nov 10 2025 05:28:30 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-10 02:28:30'),
(318,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at Mon Nov 10 2025 05:28:30 GMT+0300 (East Africa Time)',10,'user',0,'2025-11-10 02:28:30'),
(319,11,'New Scan!','Card with ID:-\"28\" has been scanned from Zanzibar Urban/West in Tanzania at Mon Nov 10 2025 05:32:18 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-10 02:32:18'),
(320,10,'New Scan!','Your Card with ID:-\"28\" has been scanned  at Mon Nov 10 2025 05:32:18 GMT+0300 (East Africa Time)',10,'user',0,'2025-11-10 02:32:18'),
(321,11,'New Scan!','Card with ID:-\"28\" has been scanned from Zanzibar Urban/West in Tanzania at Mon Nov 10 2025 05:32:59 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-10 02:32:59'),
(322,10,'New Scan!','Your Card with ID:-\"28\" has been scanned  at Mon Nov 10 2025 05:32:59 GMT+0300 (East Africa Time)',10,'user',0,'2025-11-10 02:32:59'),
(323,11,'New Scan!','Card with ID:-\"26\" has been scanned from Zanzibar Urban/West in Tanzania at Mon Nov 10 2025 06:36:43 GMT+0300 (East Africa Time)',10,'user',1,'2025-11-10 03:36:43'),
(324,10,'New Scan!','Your Card with ID:-\"26\" has been scanned  at Mon Nov 10 2025 06:36:43 GMT+0300 (East Africa Time)',10,'user',0,'2025-11-10 03:36:43'),
(325,11,'Card Deleted!','User \"Assistant Supreme\" with email \"Paulmako49@gmail.com\" has deleted card 28.',0,'user',1,'2025-11-10 10:52:55'),
(326,10,'Card Deleted!','You Successfully Deleted Card Number \"28\"',10,'user',0,'2025-11-10 10:52:55'),
(327,10,'Card Updated!','You Successfully Updated Your Card (\"supreme Admin\") with id number \"26\" at Mon Nov 10 2025 14:10:45 GMT+0300 (East Africa Time).',10,'user',0,'2025-11-10 11:10:45'),
(328,11,'New User Registered','User \"Kowa\" with email \"kowajames0@gmail.com\" has just signed up.',13,'user',1,'2025-11-10 20:00:32'),
(329,11,'New Scan!','Card with ID:-\"2\" has been scanned from Zanzibar Urban/West in Tanzania at Tue Nov 11 2025 02:42:10 GMT+0300 (East Africa Time)',4,'user',1,'2025-11-10 23:42:10'),
(330,4,'New Scan!','Your Card with ID:-\"2\" has been scanned  at Tue Nov 11 2025 02:42:10 GMT+0300 (East Africa Time)',4,'user',0,'2025-11-10 23:42:10'),
(336,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 13:02:29'),
(338,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 13:02:35'),
(356,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 14:18:13'),
(360,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 14:21:20'),
(364,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 14:22:23'),
(366,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 14:23:55'),
(376,13,'Billing Update','Your Billing Status is Now  \"undefined\". Any consult, kindly communication with us. THANK YOU ',NULL,'user',0,'2025-11-13 14:33:38'),
(379,11,'billing Update','User:\"zombie\" with Email:\"zombie@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',0,'2025-11-13 14:40:15'),
(380,4,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 14:40:15'),
(381,11,'billing Update','User:\"Kowa\" with Email:\"kowajames0@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 14:47:42'),
(382,13,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 14:47:42'),
(383,11,'billing Update','User:\"Assistant Supreme\" with Email:\"Paulmako49@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',0,'2025-11-13 15:18:59'),
(384,10,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 15:18:59'),
(385,11,'billing Update','User:\"Assistant Supreme\" with Email:\"Paulmako49@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 15:19:55'),
(386,10,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 15:19:55'),
(387,11,'billing Update','User:\"Supreme Admin\" with Email:\"zero@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',1,'2025-11-13 15:20:08'),
(388,11,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',1,'2025-11-13 15:20:08'),
(389,11,'billing Update','User:\"Supreme Admin\" with Email:\"zero@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 15:20:12'),
(390,11,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',1,'2025-11-13 15:20:12'),
(391,11,'billing Update','User:\"Assistant Supreme\" with Email:\"Paulmako49@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',0,'2025-11-13 15:20:18'),
(392,10,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 15:20:18'),
(393,11,'billing Update','User:\"Kowa\" with Email:\"kowajames0@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',1,'2025-11-13 15:24:26'),
(394,13,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 15:24:26'),
(395,11,'Card Updated!','You Successfully Updated Your Card (\"supreme admin\") with id number \"25\" at Thu Nov 13 2025 19:10:06 GMT+0300 (East Africa Time).',11,'user',1,'2025-11-13 16:10:06'),
(396,11,'Card Updated!','You Successfully Updated Your Card (\"supreme admin\") with id number \"25\" at Thu Nov 13 2025 19:28:24 GMT+0300 (East Africa Time).',11,'user',0,'2025-11-13 16:28:24'),
(397,11,'Card Updated!','You Successfully Updated Your Card (\"supreme admin\") with id number \"25\" at Thu Nov 13 2025 19:28:36 GMT+0300 (East Africa Time).',11,'user',0,'2025-11-13 16:28:36'),
(398,11,'Card Updated!','You Successfully Updated Your Card (\"supreme admin\") with id number \"25\" at Thu Nov 13 2025 19:30:00 GMT+0300 (East Africa Time).',11,'user',0,'2025-11-13 16:30:00'),
(399,11,'Card Updated!','You Successfully Updated Your Card (\"supreme\") with id number \"25\" at Thu Nov 13 2025 19:30:41 GMT+0300 (East Africa Time).',11,'user',0,'2025-11-13 16:30:41'),
(400,11,'Card Updated!','You Successfully Updated Your Card (\"supreme\") with id number \"25\" at Thu Nov 13 2025 19:32:49 GMT+0300 (East Africa Time).',11,'user',0,'2025-11-13 16:32:49'),
(401,11,'Card Updated!','You Successfully Updated Your Card (\"supreme\") with id number \"25\" at Thu Nov 13 2025 19:37:47 GMT+0300 (East Africa Time).',11,'user',0,'2025-11-13 16:37:47'),
(402,11,'billing Update','User:\"Supreme Admin\" with Email:\"zero@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',0,'2025-11-13 17:06:53'),
(403,11,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 17:06:53'),
(404,11,'billing Update','User:\"Supreme Admin\" with Email:\"zero@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',1,'2025-11-13 17:07:13'),
(405,11,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',1,'2025-11-13 17:07:13'),
(406,11,'billing Update','User:\"zombie\" with Email:\"zombie@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 19:03:49'),
(407,4,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 19:03:49'),
(408,11,'billing Update','User:\"zombie\" with Email:\"zombie@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',0,'2025-11-13 19:52:57'),
(409,4,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 19:52:57'),
(410,11,'billing Update','User:\"Kowa\" with Email:\"kowajames0@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 20:00:25'),
(411,13,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 20:00:25'),
(412,11,'billing Update','User:\"zombie\" with Email:\"zombie@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 20:01:06'),
(413,4,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 20:01:06'),
(414,11,'billing Update','User:\"Assistant Supreme\" with Email:\"Paulmako49@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-13 20:38:25'),
(415,10,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-13 20:38:25'),
(416,11,'billing Update','User:\"zombie\" with Email:\"zombie@gmail.com\" Billings are Updated to \"paid\".',NULL,'user',0,'2025-11-14 13:03:52'),
(417,4,'Billing Update','Your Billing Status is Now  \"paid\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-14 13:03:52'),
(418,11,'billing Update','User:\"zombie\" with Email:\"zombie@gmail.com\" Billings are Updated to \"suspended\".',NULL,'user',0,'2025-11-14 13:04:01'),
(419,4,'Billing Update','Your Billing Status is Now  \"suspended\". Any consult, kindly communicate with Admin. THANK YOU ',NULL,'user',0,'2025-11-14 13:04:01');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `scan_logs`
--

DROP TABLE IF EXISTS `scan_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `scan_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `card_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `platform` varchar(255) DEFAULT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `scanned_at` timestamp NULL DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scan_logs`
--

LOCK TABLES `scan_logs` WRITE;
/*!40000 ALTER TABLE `scan_logs` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `scan_logs` VALUES
(17,24,4,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(18,2,4,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(19,24,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(22,2,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(23,24,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(26,2,4,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(27,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(28,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(29,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(30,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(31,26,10,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(32,24,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1',NULL,NULL,'2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(33,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(34,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(35,25,11,'ios','unknown','::ffff:127.0.0.1','39.26951','-6.82349','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(36,26,10,'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0','unknown','::ffff:127.0.0.1',NULL,NULL,'2025-11-09 11:55:10','SINGIDA','Tanzania'),
(37,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1',NULL,NULL,'2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(38,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1',NULL,NULL,'2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(39,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(40,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(41,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(42,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(47,27,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(48,2,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(49,27,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(50,2,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(140,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(141,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(142,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(143,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(144,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(145,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(146,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(147,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(148,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(149,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(150,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(151,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','Dar es-Salaam','Tanzania'),
(152,26,10,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(153,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(154,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 11:55:10','SINGIDA','Tanzania'),
(155,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 08:56:33','SINGIDA','Tanzania'),
(156,28,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 09:02:03','Dar es-Salaam','Tanzania'),
(157,28,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:07:36','Dar es-Salaam','Tanzania'),
(158,28,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:16:14','Dar es-Salaam','Tanzania'),
(159,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:22:56','SINGIDA','Tanzania'),
(160,28,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:23:06','Dar es-Salaam','Tanzania'),
(161,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:25:29','Dar es-Salaam','Tanzania'),
(162,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:26:18','Dar es-Salaam','Tanzania'),
(163,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:26:24','Dar es-Salaam','Tanzania'),
(164,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:26:27','Dar es-Salaam','Tanzania'),
(165,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:28:10','Dar es-Salaam','Tanzania'),
(166,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:34:48','Dar es-Salaam','Tanzania'),
(167,25,11,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.2675','-6.827','2025-11-09 12:37:22','Dar es-Salaam','Tanzania'),
(175,2,4,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 01:28:59','SINGIDA','Tanzania'),
(176,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 01:37:40','Dar es-Salaam','Tanzania'),
(177,25,11,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 01:37:57','Dar es-Salaam','Tanzania'),
(178,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 01:52:13','SINGIDA','Tanzania'),
(179,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 02:28:30','Zanzibar Urban/West','Tanzania'),
(180,28,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 02:32:18','Zanzibar Urban/West','Tanzania'),
(181,28,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 02:32:59','Zanzibar Urban/West','Tanzania'),
(182,26,10,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 03:36:43','Zanzibar Urban/West','Tanzania'),
(183,2,4,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','unknown','::ffff:127.0.0.1','39.19793','-6.16394','2025-11-10 23:42:10','Zanzibar Urban/West','Tanzania');
/*!40000 ALTER TABLE `scan_logs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `agility` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` varchar(255) DEFAULT NULL,
  `profile` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `bills` enum('paid','suspended','not paid') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(4,'zombie','zombie@gmail.com','$2b$10$.bQ/3C5hp7fVMtcmwOOhMu61sBTLrJr9u.kGuSZNW0ibxXQQgla.2','yuza','NULL','NULL','/uploads/1759654027897-266576824','2025-11-10 18:41:15','suspended'),
(10,'Assistant Supreme','Paulmako49@gmail.com','$2b$10$jPWySEV6nBtELmQ4Fmj9..0q30hQZvJcUuC6f80nmRzCnhDBb0J/2','staff','NULL','NULL','/uploads/1759418615941-274785780','2025-11-10 18:41:15','suspended'),
(11,'Supreme Admin','zero@gmail.com','$2b$10$oFZcj9X/kwTQEk6wcNCLn.dc7vszQqiBToYVEHDiBZYlRPDY.ROTe','supa','NULL','NULL','/uploads/1759429232757-912777234','2025-11-10 18:41:15','suspended'),
(13,'Kowa','kowajames0@gmail.com','$2b$10$ZWvNCwIzi2LrZhoLaZMWcuIMLxv4JWeqIWl5rnVrF.VeF4A8r8pTG','yuza','NULL','NULL',NULL,'2025-11-10 20:31:53','suspended');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `vcards`
--

DROP TABLE IF EXISTS `vcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `phones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`phones`)),
  `emails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`emails`)),
  `socials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`socials`)),
  `otherLinks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`otherLinks`)),
  `photoUri` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `vcards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vcards`
--

LOCK TABLES `vcards` WRITE;
/*!40000 ALTER TABLE `vcards` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `vcards` VALUES
(2,4,'Paul M Paul','Software Wizard','[\"+255 622 255 496\"]','[\"nexa.theicon@gmail.com\"]','{\"whatsapp\":\"+255 622 255 496\",\"instagram\":\"\",\"youtube\":\"\",\"telegram\":\"+255 622 255 496\"}','[\"nexatheiconn.netlify.app\",\"nexatheiconn.netlify.app\"]','/uploads/1762537149265-477037668','2025-09-09 00:10:40'),
(25,11,'supreme','Administrator here','[\"+255 622 255 496\"]','[\"zero@gmail.com\"]','{\"whatsapp\":\"+255 622 255 496\",\"instagram\":\"\",\"youtube\":\"\",\"telegram\":\"+255 622 255 496\"}','[\"nexa.theiconn.netlify.app\"]','/uploads/1761341208986-225954437','2025-10-23 22:58:40'),
(26,10,'supreme Admin','Administrator','[\"+255 622 255 496\"]','[\"paulmako49@gmail.com\"]','{\"whatsapp\":\"+255 622 255 496\",\"instagram\":\"\",\"youtube\":\"\",\"telegram\":\"+255 622 255 496\"}','[\"nexatheiconn.netlify.app\"]','/uploads/1761347665125-760722066','2025-10-23 23:14:47');
/*!40000 ALTER TABLE `vcards` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-11-14 16:16:59
