-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2026 at 08:16 AM
-- Server version: 12.3.1-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u116573049_ijitest_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(255) NOT NULL,
  `action` varchar(100) NOT NULL,
  `performed_by` varchar(36) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `type` enum('reviewer','editor') NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `institute` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `cv_url` varchar(500) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_interests`
--

CREATE TABLE `application_interests` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `interest_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  `receiver_id` varchar(36) NOT NULL,
  `submission_id` int(11) DEFAULT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `master_interests`
--

CREATE TABLE `master_interests` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `action_link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `status` enum('pending','paid','verified','failed','waived') NOT NULL DEFAULT 'pending',
  `provider` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `publications`
--

CREATE TABLE `publications` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `final_pdf_url` varchar(500) NOT NULL,
  `start_page` int(11) DEFAULT NULL,
  `end_page` int(11) DEFAULT NULL,
  `doi` varchar(100) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT current_timestamp(),
  `views` int(11) NOT NULL DEFAULT 0,
  `downloads` int(11) NOT NULL DEFAULT 0,
  `citations` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `publications`
--

INSERT INTO `publications` (`id`, `submission_id`, `issue_id`, `final_pdf_url`, `start_page`, `end_page`, `doi`, `published_at`, `views`, `downloads`, `citations`) VALUES
(1, 1, 1, '/uploads/published/IJITEST-2026-001-published.pdf', 1, 7, NULL, '2026-03-28 09:00:00', 2, 0, 0),
(2, 2, 1, '/uploads/published/IJITEST-2026-002-published.pdf', 8, 12, NULL, '2026-03-29 10:00:00', 1, 0, 0),
(3, 3, 1, '/uploads/published/IJITEST-2026-003-published.pdf', 13, 20, NULL, '2026-03-29 11:00:00', 3, 0, 0),
(4, 4, 1, '/uploads/published/IJITEST-2026-004-published.pdf', 21, 26, NULL, '2026-03-30 12:00:00', 1, 0, 0),
(5, 5, 1, '/uploads/published/IJITEST-2026-005-published.pdf', 27, 32, NULL, '2026-03-31 13:00:00', 1, 0, 0),
(6, 6, 1, '/uploads/published/IJITEST-2026-006-published.pdf', 33, 37, NULL, '2026-03-31 14:00:00', 1, 0, 0),
(7, 7, 1, '/uploads/published/IJITEST-2026-007-published.pdf', 38, 41, NULL, '2026-03-31 15:00:00', 0, 0, 0),
(8, 8, 1, '/uploads/published/IJITEST-2026-008-published.pdf', 42, 45, NULL, '2026-03-31 16:00:00', 0, 0, 0),
(9, 9, 1, '/uploads/published/IJITEST-2026-009-published.pdf', 46, 49, NULL, '2026-03-31 17:00:00', 0, 0, 0),
(10, 10, 1, '/uploads/published/IJITEST-2026-010-published.pdf', 50, 53, NULL, '2026-03-31 18:00:00', 3, 1, 0),
(11, 58, 2, '/uploads/published/IJITEST-2026-011-published.pdf', NULL, NULL, NULL, '2026-05-02 07:21:24', 14, 1, 0),
(12, 59, 2, '/uploads/published/IJITEST-2026-012-published.pdf', NULL, NULL, NULL, '2026-05-02 07:21:24', 3, 0, 0),
(13, 60, 2, '/uploads/published/IJITEST-2026-013-published.pdf', NULL, NULL, NULL, '2026-05-02 07:21:24', 2, 0, 0),
(14, 61, 3, '/uploads/published/IJITEST-2026-014-published.pdf', 1, 7, NULL, '2026-05-28 02:48:22', 5, 2, 0);

-- --------------------------------------------------------

--
-- Table structure for table `rate_limits`
--

CREATE TABLE `rate_limits` (
  `key` varchar(255) NOT NULL,
  `count` int(11) NOT NULL DEFAULT 0,
  `reset_at` bigint(20) NOT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rate_limits`
--

INSERT INTO `rate_limits` (`key`, `count`, `reset_at`, `updated_at`) VALUES
('submit:razh1977@gmail.com', 1, 1779902578820, '2026-05-27 17:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `decision` enum('accept','minorRevision','majorRevision','reject') NOT NULL,
  `score` int(11) DEFAULT NULL,
  `confidence` int(11) DEFAULT NULL,
  `comments_to_author` text DEFAULT NULL,
  `comments_to_editor` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `assignment_id`, `decision`, `score`, `confidence`, `comments_to_author`, `comments_to_editor`, `created_at`, `submitted_at`) VALUES
(2, 6, 'minorRevision', 9, 5, '1. Organization is good\r\n2. Better to give more references\r\n3. More details required for LSTM method\r\n4. Accepted if minor rivisions corrected', '', '2026-05-27 17:48:51', '2026-05-27 17:48:51');

-- --------------------------------------------------------

--
-- Table structure for table `review_assignments`
--

CREATE TABLE `review_assignments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` varchar(36) NOT NULL,
  `version_id` int(11) NOT NULL,
  `assigned_by` varchar(36) NOT NULL,
  `review_round` int(11) NOT NULL DEFAULT 1,
  `status` enum('assigned','accepted','declined','completed') NOT NULL DEFAULT 'assigned',
  `deadline` date DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `review_assignments`
--

INSERT INTO `review_assignments` (`id`, `submission_id`, `reviewer_id`, `version_id`, `assigned_by`, `review_round`, `status`, `deadline`, `assigned_at`, `responded_at`) VALUES
(5, 61, '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 15, '87b55eae-e296-4a65-a82f-3c503beadf7e', 1, 'assigned', '2026-05-30', '2026-05-27 17:20:21', NULL),
(6, 61, 'af963fdb-af8a-4687-b843-dc604df4ff1c', 15, '87b55eae-e296-4a65-a82f-3c503beadf7e', 1, 'completed', '2026-05-30', '2026-05-27 17:21:29', '2026-05-27 17:48:51');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('apcDescription', 'APC covers DOI assignment, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.', '2026-05-13 17:54:00'),
('apcInr', '0', '2026-05-13 17:53:59'),
('apcUsd', '0', '2026-05-13 17:53:59'),
('copyrightUrl', '/docs/copyright-form.docx', '2026-05-14 06:55:31'),
('isPromotionActive', 'true', '2026-05-13 17:54:00'),
('issnNumber', 'Applied For', '2026-05-14 08:43:30'),
('journalLanguage', 'English', '2026-05-14 08:43:30'),
('journalName', 'International Journal of Innovative Trends in Engineering Science and Technology', '2026-05-13 17:53:59'),
('journalShortName', 'IJITEST', '2026-05-13 17:53:59'),
('journalSubject', 'Multidisciplinary (Engineering, Science and Technology, Healthcare, Management Sciences)', '2026-05-14 06:56:40'),
('officeAddress', 'Dr. Ravibabu T.\r\nAssociate Professor\r\nDepartment of Electronics and Communication Engineering\r\nMES Group of Institutions, Vizianagaram,\r\nAndhra Pradesh, India - 530048', '2026-05-14 08:43:30'),
('publicationFrequency', 'Monthly (12 Issues per year)', '2026-05-14 08:43:30'),
('publisherName', 'Felix Academic Publications', '2026-05-13 17:53:59'),
('startingYear', '2026', '2026-05-14 08:43:30'),
('submission_sequence_2026', '14', '2026-05-27 17:12:58'),
('supportEmail', 'support@ijitest.org', '2026-05-14 06:58:03'),
('supportPhone', '+91 8919643590', '2026-05-13 17:54:00'),
('templateUrl', '/docs/template-url.docx', '2026-05-14 06:55:31'),
('udyamRegistration', 'UDYAM-AP-10-0125617', '2026-05-14 08:26:44');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `paper_id` varchar(100) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `status` enum('submitted','editorAssigned','underReview','revisionRequested','accepted','rejected','paymentPending','published','retracted') NOT NULL DEFAULT 'submitted',
  `final_decision` enum('accept','reject','withdrawn') DEFAULT NULL,
  `decision_at` timestamp NULL DEFAULT NULL,
  `decision_by` varchar(36) DEFAULT NULL,
  `corresponding_author_id` varchar(36) NOT NULL,
  `issue_id` int(11) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `paper_id`, `slug`, `status`, `final_decision`, `decision_at`, `decision_by`, `corresponding_author_id`, `issue_id`, `submitted_at`, `updated_at`, `deleted_at`) VALUES
(1, 'IJITEST-2026-001', 'ijitest2026001', 'published', NULL, NULL, NULL, 'ac34b85e-d7c0-454b-9ef9-4b73e39ee30a', 1, '2026-03-28 09:00:00', '2026-04-19 05:41:03', NULL),
(2, 'IJITEST-2026-002', 'ijitest2026002', 'published', NULL, NULL, NULL, 'cd2ef493-3626-483a-93c6-8236287bf7a1', 1, '2026-03-29 10:00:00', '2026-04-19 05:41:03', NULL),
(3, 'IJITEST-2026-003', 'ijitest2026003', 'published', NULL, NULL, NULL, 'cd2ef493-3626-483a-93c6-8236287bf7a1', 1, '2026-03-29 11:00:00', '2026-04-19 05:41:03', NULL),
(4, 'IJITEST-2026-004', 'ijitest2026004', 'published', NULL, NULL, NULL, 'cd2ef493-3626-483a-93c6-8236287bf7a1', 1, '2026-03-30 12:00:00', '2026-04-19 05:41:03', NULL),
(5, 'IJITEST-2026-005', 'ijitest2026005', 'published', NULL, NULL, NULL, 'cd2ef493-3626-483a-93c6-8236287bf7a1', 1, '2026-03-31 13:00:00', '2026-04-19 05:41:03', NULL),
(6, 'IJITEST-2026-006', 'ijitest2026006', 'published', NULL, NULL, NULL, 'ec6f9428-c3e0-4bdf-bb28-07ea86ba2440', 1, '2026-03-31 14:00:00', '2026-04-19 05:41:03', NULL),
(7, 'IJITEST-2026-007', 'ijitest2026007', 'published', NULL, NULL, NULL, 'ec45d5c4-0ec8-49ff-a9c0-d18ea988bfb2', 1, '2026-03-31 15:00:00', '2026-04-19 05:41:03', NULL),
(8, 'IJITEST-2026-008', 'ijitest2026008', 'published', NULL, NULL, NULL, 'fa60af47-276f-4c3a-8c34-89aae8ee28dd', 1, '2026-03-31 16:00:00', '2026-04-19 05:41:03', NULL),
(9, 'IJITEST-2026-009', 'ijitest2026009', 'published', NULL, NULL, NULL, 'a0d1d251-cccd-4a52-93ff-26bcc7ae428a', 1, '2026-03-31 17:00:00', '2026-04-19 05:41:03', NULL),
(10, 'IJITEST-2026-010', 'ijitest2026010', 'published', NULL, NULL, NULL, 'c411a1e8-1a94-4ba8-bf5c-d3bead1b617b', 1, '2026-03-31 18:00:00', '2026-04-19 05:41:03', NULL),
(58, 'IJITEST-2026-011', 'ijitest2026011', 'published', NULL, NULL, NULL, '9196f358-d1ce-448b-a854-4cc641684f97', 2, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL),
(59, 'IJITEST-2026-012', 'ijitest2026012', 'published', NULL, NULL, NULL, '86bbe9e3-45f7-11f1-ad3e-c05465fbbdc2', 2, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL),
(60, 'IJITEST-2026-013', 'ijitest2026013', 'published', NULL, NULL, NULL, 'cd2ef493-3626-483a-93c6-8236287bf7a1', 2, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL),
(61, 'IJITEST-2026-014', 'ijitest2026014', 'published', NULL, NULL, NULL, '79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 3, '2026-05-27 17:12:58', '2026-05-28 02:48:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `submission_authors`
--

CREATE TABLE `submission_authors` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_corresponding` tinyint(1) NOT NULL DEFAULT 0,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `phone` varchar(20) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `institution` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission_authors`
--

INSERT INTO `submission_authors` (`id`, `submission_id`, `name`, `email`, `is_corresponding`, `order_index`, `phone`, `designation`, `institution`) VALUES
(1, 1, 'Gulshan Sribabu Thorlapati', 'gulshansribabu@gmail.com', 1, 0, NULL, NULL, 'Department of CIVIL, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(2, 1, 'Chekatla Swapna Priya', 'swapnachsp@gmail.com', 0, 1, NULL, NULL, 'Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(3, 1, 'Suseela Kocho', 'jackbenison12@gmail.com', 0, 2, NULL, NULL, 'SGT, Department of school education, India'),
(4, 2, 'CheekatlaSwapna Priya', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(5, 3, 'Swapna Priya Chikatla', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(6, 3, 'Thorlapati Gulshan Sri Babu', 'gulshansribabu@gmail.com', 0, 1, NULL, NULL, 'Student,Department of CIVIL, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(7, 3, 'S Naga Mallik Raj', 'mallikblue@gmail.com', 0, 2, NULL, NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(8, 4, 'Swapna Priya Chikatla', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(9, 4, 'Mahendra Narla', 'nmahendra@gpcet.ac.in', 0, 1, NULL, NULL, 'Associate Professor,Department of AI&DS, G.Pullaiah College of Engineering and Technology, Kurnool, India'),
(10, 4, 'PSN Bhashar', 'bhaskarpsn@gmail.com', 0, 2, NULL, NULL, 'Assistant Professor,Department of ECE, SVP Engineering College, Visakhapatnam, India'),
(11, 5, 'Swapna Priya Chikatla', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(12, 5, 'S Naga Mallik Raj', 'mallikblue@gmail.com', 0, 1, NULL, NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(13, 5, 'Thorlapati Gulshan Sri Babu', 'gulshansribabu@gmail.com', 0, 2, NULL, NULL, 'Student,Department of CIVIL, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(14, 5, 'CH. Subba Rao', 'subbaraochappa@gmail.com', 0, 3, NULL, NULL, 'Associate Professor,Department of ECE, Miracle Educational Society Group of Institutions(A), Vizianagaram, India'),
(15, 6, 'T. Ravi babu', 'rthorlapati@miracleeducationalsociety.com', 1, 0, NULL, NULL, 'Associate Professor,Department of ECE, Miracle Educational Society Group of Institutions(A), Vizianagaram, India'),
(16, 7, 'S. Sai Durga Jagan Mohan', 'missing_email_ijitest-2026-007_32ad464c@ijitest.org', 1, 0, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(17, 7, 'P. Dinesh', 'coauthor_17@ijitest.org', 0, 1, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(18, 7, 'P. Rama Krishna', 'coauthor_18@ijitest.org', 0, 2, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(19, 7, 'N. Lakshmi Vara Prasad', 'coauthor_19@ijitest.org', 0, 3, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(20, 7, 'G. Sagar', 'coauthor_20@ijitest.org', 0, 4, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(21, 8, 'N.UmeshChandra', 'umeshchandra15623@gmail.com', 1, 0, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(22, 8, 'S.HarshaVardhan', 'harshavardhansingani@gmail.com', 0, 1, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(23, 8, 'K.Naveen', 'kongarapunaveen866@gmail.com', 0, 2, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(24, 8, 'V.Jayakrishna', 'jayakrishnavantakula@gmail.com', 0, 3, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(25, 8, 'N.Abhiram', 'neelapuabhiram007@gmail.com', 0, 4, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(26, 8, 'V.Pradeep Kumar', 'pradeepvommi@gmail.com', 0, 5, NULL, NULL, 'Associate Professor,Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(27, 9, 'S D. Jagadeesh', 'jagadishdunna2005@gmail.com', 1, 0, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(28, 9, 'K. Jeevan Kumar', 'jeevankumarkella@gmail.com', 0, 1, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(29, 9, 'P. Venkata Jagadeesh', 'pallavenkat11@gmail.com', 0, 2, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(30, 9, 'B. Sai Kumar', 'saikumarbolla31@gmail.com', 0, 3, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(31, 9, 'T. Karthik', 'telukarthik9@gmail.com', 0, 4, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(32, 9, 'K.K.R. Parimala', 'radhikaparimala325@gmail.com', 0, 5, NULL, NULL, 'Assistant Professor,Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(33, 10, 'Laharadithya', 'missing_email_ijitest-2026-010_c5545a38@ijitest.org', 1, 0, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(34, 10, 'K. Chandu', 'coauthor_34@ijitest.org', 0, 1, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(35, 10, 'Y. Chanikya', 'coauthor_35@ijitest.org', 0, 2, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(36, 10, 'B. Chaitanya', 'coauthor_36@ijitest.org', 0, 3, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(37, 10, 'P. Venkataramana', 'coauthor_37@ijitest.org', 0, 4, NULL, NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(38, 10, 'K. Deepthi', 'coauthor_38@ijitest.org', 0, 5, NULL, NULL, 'Associate Professor,Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India'),
(44, 2, 'S Naga Mallik Raj', 'mallikblue@gmail.com', 0, 1, NULL, NULL, 'Associate Professor, Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(45, 2, 'Gulshan Sri Babu Thorlapati', 'gulshansribabu@gmail.com', 0, 2, NULL, NULL, 'Student, Department of CIVIL, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(46, 2, 'G. Madhavi', 'gmadhavi@gmail.com', 0, 3, NULL, NULL, 'Assistant Professor, Department of BS&H, Vignans Institute of Information Technology (A), Visakhapatnam, India'),
(47, 6, 'A. Venkateswara Rao', 'vallu@miracleeducationalsociety.com', 0, 1, NULL, NULL, 'Associate Professor, Department of ECE, Miracle Educational Society Group of Institutions(A), Vizianagaram, India'),
(48, 6, 'CH. Subba Rao', 'schappa@miracleeducationalsociety.com', 0, 2, NULL, NULL, 'Assistant Professor, Department of ECE, Miracle Educational Society Group of Institutions(A), Vizianagaram, India'),
(54, 58, 'Dr. S. NagaMallik Raj', 'mallikblue@gmail.com', 1, 0, NULL, 'Associate Professor', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(55, 58, 'Nadiminti Raghavendra', 'raghavnadiminti@gmail.com', 0, 1, NULL, 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(56, 58, 'Malla Mohith Sai', 'mallamohith20@gmail.com', 0, 2, NULL, 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(57, 59, 'Markandeya Gupta N', 'manasamarkandeya@gmail.com', 1, 0, NULL, 'Associate Professor', 'Department of ECE, Sri Sivani college of engineering (A), Srikakulam, India'),
(58, 59, 'Ch Manohar Kumar', 'manohar@gvpcdpgc.edu.in', 0, 1, NULL, 'Associate Professor', 'Department of ECE, Gayatri Vidya Parishad college for Degree and PG Courses (A), Visakhapatnam, India'),
(59, 59, 'V. Mutyala Naidu', 'vmn90gvd@gmail.com', 0, 2, NULL, 'Assistant Professor', 'Department of ECE, Gayatri Vidya Parishad college for Degree and PG Courses (A), Visakhapatnam, India'),
(60, 60, 'Dr. Ch. Swapna Priya', 'swapnachsp@gmail.com', 1, 0, NULL, 'Associate Professor', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(61, 60, 'Mahamed Mastan Jani', 'mdjani1209@gmail.com', 0, 1, NULL, 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(62, 60, 'Bharath Karthik Mycherla', 'bharathkarthik2006@gmail.com', 0, 2, NULL, 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(63, 60, 'Surya Teja Medisetty', 'suryatejamedisetty000@gmail.com', 0, 3, NULL, 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(64, 60, 'Kalpana Pulipati', 'pkalpana1109@gmail.com', 0, 4, NULL, 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam'),
(65, 61, 'Dr. CH. Swapna Priya Chikatla', 'razh1977@gmail.com', 1, 0, '', 'Associate Professor', 'Vignan’s Institute of Information Technology (A)'),
(66, 61, 'Mahendra Narla,', 'nmahendra@gpcet.ac.in', 0, 1, NULL, 'Associate Professor', 'G.Pullaiah College of Engineering and Technology');

-- --------------------------------------------------------

--
-- Table structure for table `submission_editors`
--

CREATE TABLE `submission_editors` (
  `submission_id` int(11) NOT NULL,
  `editor_id` varchar(36) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submission_files`
--

CREATE TABLE `submission_files` (
  `id` int(11) NOT NULL,
  `version_id` int(11) NOT NULL,
  `file_type` enum('mainManuscript','pdfVersion','copyrightForm','supplementary','feedback','paymentProof') NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission_files`
--

INSERT INTO `submission_files` (`id`, `version_id`, `file_type`, `file_url`, `original_name`, `file_size`, `created_at`) VALUES
(1, 1, 'pdfVersion', '/uploads/published/IJITEST-2026-001-published.pdf', 'IJITEST-2026-001.pdf', NULL, '2026-04-19 05:41:03'),
(2, 2, 'pdfVersion', '/uploads/published/IJITEST-2026-002-published.pdf', 'IJITEST-2026-002.pdf', NULL, '2026-04-19 05:41:03'),
(3, 3, 'pdfVersion', '/uploads/published/IJITEST-2026-003-published.pdf', 'IJITEST-2026-003.pdf', NULL, '2026-04-19 05:41:03'),
(4, 4, 'pdfVersion', '/uploads/published/IJITEST-2026-004-published.pdf', 'IJITEST-2026-004.pdf', NULL, '2026-04-19 05:41:03'),
(5, 5, 'pdfVersion', '/uploads/published/IJITEST-2026-005-published.pdf', 'IJITEST-2026-005.pdf', NULL, '2026-04-19 05:41:03'),
(6, 6, 'pdfVersion', '/uploads/published/IJITEST-2026-006-published.pdf', 'IJITEST-2026-006.pdf', NULL, '2026-04-19 05:41:03'),
(7, 7, 'pdfVersion', '/uploads/published/IJITEST-2026-007-published.pdf', 'IJITEST-2026-007.pdf', NULL, '2026-04-19 05:41:03'),
(8, 8, 'pdfVersion', '/uploads/published/IJITEST-2026-008-published.pdf', 'IJITEST-2026-008.pdf', NULL, '2026-04-19 05:41:03'),
(9, 9, 'pdfVersion', '/uploads/published/IJITEST-2026-009-published.pdf', 'IJITEST-2026-009.pdf', NULL, '2026-04-19 05:41:03'),
(10, 10, 'pdfVersion', '/uploads/published/IJITEST-2026-010-published.pdf', 'IJITEST-2026-010.pdf', NULL, '2026-04-19 05:41:03'),
(20, 12, 'pdfVersion', '/uploads/published/IJITEST-2026-011-published.pdf', 'IJITEST-2026-011-published.pdf', NULL, '2026-05-02 07:21:24'),
(21, 13, 'pdfVersion', '/uploads/published/IJITEST-2026-012-published.pdf', 'IJITEST-2026-012-published.pdf', NULL, '2026-05-02 07:21:24'),
(22, 14, 'pdfVersion', '/uploads/published/IJITEST-2026-013-published.pdf', 'IJITEST-2026-013-published.pdf', NULL, '2026-05-02 07:21:24'),
(23, 15, 'mainManuscript', '/api/files/submissions/manuscript_61_1779901978843.docx', 'IJITEST-2026-014.docx', 1996900, '2026-05-27 17:12:58'),
(25, 15, 'pdfVersion', '/api/files/submissions/final_manuscript_61_v1_1779936467333.pdf', '14.pdf', 1615361, '2026-05-28 02:47:47');

-- --------------------------------------------------------

--
-- Table structure for table `submission_versions`
--

CREATE TABLE `submission_versions` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `version_number` int(11) NOT NULL DEFAULT 1,
  `title` text NOT NULL,
  `abstract` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `subject_area` varchar(255) DEFAULT NULL,
  `changelog` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission_versions`
--

INSERT INTO `submission_versions` (`id`, `submission_id`, `version_number`, `title`, `abstract`, `keywords`, `subject_area`, `changelog`, `created_at`) VALUES
(1, 1, 1, 'Digital Revolution: The Role of Informatics in Industry 4.0 and 5.0', 'The emergence of Industry 5.0 predicts a paradigm shift in industrial development, as cutting-edge devicessuch as AI-enhanced robotscollaborate harmoniously with human labourers to maximize productivity. This phase emphasizes the significance of human engagement while emphasizing sustainability and resilience. This development based on innovations has led to industry 4.0, the fourth industrial revolution has changed production and production techniques. Changes are motivated by the strong progress of automation, robots, Big data, Internet of Things, Machine learning, artificial intelligence and virtualization. In addition to the successful automation and technological integration of its predecessor, largely related to production and efficiency stimulation, industry 5.0 to create both sustainable innovations and focus on people. Looking for a long -term balance between technology development and environmental protection and the happiness of our society is the main goal. This requires intentional approach to innovation, ensuring that our progress increases the living standards of people while benefiting our natural systems to support us.', '[\"Industry 4.0\", \"Industry 5.0\"]', 'Engineering', NULL, '2026-03-28 09:00:00'),
(2, 2, 1, 'Optimization and Performance Evaluation of RIS-Integrated Hybrid Precoding in Millimeter Wave Massive MIMO', 'The evolution toward sixth-generation (6G) wireless systems requires extremely high data rates, massive device connectivity, very low latency, and improved energy efficiency. Millimeter-wave (mmWave) communication is considered a key enabler due to its large available bandwidth and ability to support multi-gigabit transmission. Nevertheless, mmWave signals experience high path loss, vulnerability to blockage, and increased implementation complexity caused by large antenna arrays and multiple RF chains.To overcome these limitations, this thesis explores the integration of Reconfigurable Intelligent Surfaces (RIS) with hybrid analogdigital precoding in mmWave Massive MIMO systems. RIS enables intelligent control of signal propagation by adjusting the phase of reflected waves, while hybrid precoding reduces hardware cost and power consumption without significantly degrading performance. A detailed system model, mathematical analysis, and optimization strategies for precoders and RIS phase shifts are presented. Performance evaluation based on spectral efficiency, energy efficiency, and hardware complexity demonstrates that RIS- assisted hybrid architectures provide notable improvements in coverage, achievable rate, and power utilization.', '[\"Reconfigurable\", \"Intelligent Surfaces\", \"mmWave Massive MIMO systems\", \"Precoders\", \"RIS phase shifters\"]', 'Engineering', NULL, '2026-03-29 10:00:00'),
(3, 3, 1, 'Quantum-Enabled Security Framework for 6G Communications Based on QKD-OFDM Integration', 'Ultra-high data rates, efficient use of the terahertz spectrum, and significant connectivity are anticipated as Sixth Generation (6G) wireless communication emerges. However, traditional cryptographic algorithms like RSA and Elliptic Curve Cryptography, which are currently employed in wireless networks, are seriously threatened by the quick development of quantum computing. Future 6G systems must incorporate quantum-safe security measures to allay this worry. The incorporation of Quantum Key Distribution (QKD) into the physical layer of 6G communication networks is investigated in this paper. To facilitate secure key exchange and identify eavesdropping, QKD makes use of quantum concepts like superposition, entanglement, and the no-cloning theorem. Realistic wireless channel conditions are used to analyze the BB84 and E91 protocols. A proposed 6G channel model incorporates Nakagami-m fading, additive white Gaussian noise, and path loss. Detector noise and channel disturbances are taken into account when modeling the Quantum Bit Error Rate (QBER). In an OFDM framework, MATLAB simulations evaluate the secure key rate performance with respect to signal- to-noise ratio, transmission distance, and noise probability. The findings highlight the potential of QKD for secure 6G communications by showing that secure key generation is possible when the QBER stays below the theoretical threshold. Index Terms 5G and 6G wireless communications, Quantum Key Distribution, Fading Channels.', '[\"Cryptographic algorithms\", \"Quantum Key Distribution\", \"quantum computing\", \"Fading Channels\"]', 'Engineering', NULL, '2026-03-29 11:00:00'),
(4, 4, 1, 'RNN and CNNEnhanced EM-GAMP for Sparse Channel Estimation via Quantum Compressed Sensing in Massive MIMO-OFDM', 'Quantum Compressed Sensing (QCS) is an efficient framework that exploits signal sparsity to reconstruct quantum states and quantum-inspired communication signals using fewer measurements than conventional approaches. It combines compressed sensing theory with quantum information processing to reduce sampling complexity and computational cost in high- dimensional systems. Advanced estimation techniques such as OMP-based methods, deep learning-assisted recovery, and quantum-inspired neural models improve reconstruction accuracy under noisy conditions. These approaches utilize sparsity in quantum states, wireless channels, and system parameters while lowering the burden of quantum measurements. QCS is particularly useful in emerging applications like next-generation wireless networks, quantum sensing, and optical communication where measurement resources are limited. Compared to classical compressed sensing, QCS methods offer better scalability and stronger resilience to estimation errors. They also enable modeling of quantum features such as superposition and correlated system behavior. Performance evaluation is typically carried out using metrics like BER versus SNR, MMSE, and recovery accuracy. Overall, QCS supports efficient signal acquisition and reliable estimation in large-scale quantum-aware systems.', '[\"Quantum Compressed Sensing\", \"OMP-based methods\", \"sparse recovery techniques\", \"compressed sensing\"]', 'Engineering', NULL, '2026-03-30 12:00:00'),
(5, 5, 1, 'Energy-Efficient Ternary Logic Processor Using CNTFETs for Advanced Nanotechnology Applications', 'The increasing demand for energy-efficient computing has driven research into novel logic architectures beyond traditional binary logic. This paper presents the design and implementation of an energy-efficient ternary logic processor using Carbon Nanotube Field-Effect Transistors (CNTFETs) for advanced nanotechnology applications. Ternary logic, which operates with three discrete states (0, 1, 2), offers higher computational density, reduced transistor count, and lower power consumption compared to conventional binary architectures. CNTFETs, with their superior electrical properties such as high carrier mobility, low sub-threshold swing, and excellent scalability, serve as an ideal candidate for implementing ternary logic circuits. The proposed ternary processor integrates ternary logic gates, arithmetic units, multiplexers, memory units, and control circuits, all optimized for low-power operation. Simulation results demonstrate significant improvements in energy efficiency, area reduction, and computational throughput compared to conventional CMOS-based binary processors. Additionally, the processor\'s architecture is tailored for emerging applications in artificial intelligence, cryptography, and IoT devices, where power efficiency and performance are critical. The findings of this study highlight the potential of CNTFET-based ternary computing as a promising alternative for next-generation low- power processors in nanotechnology-driven applications.', '[\"Ternary Logic Processor\", \"CNTFET\", \"Low-Power Computing\", \"Nanotechnology\", \"Energy-Efficient Architecture\"]', 'Engineering', NULL, '2026-03-31 13:00:00'),
(6, 6, 1, 'Quantum Communication for 5G-6G Qubit-Driven Massive MIMO-OFDM Performance Analysis', 'Communication frameworks that are extremely effective, intelligent, and secure are required due to the rapid shift from 5G to 6G networks. Through a performance analysis of qubit-driven Massive MIMO-OFDM, this paper investigates the integration of quantum communication concepts into conventional wireless systems. It provides a detailed comparison of quantum bit (qubit) representations and traditional binary bit processing. The study evaluates key performance measures across different channel models, such as Rayleigh and Nakagami-m fading, including Bit Error Rate (BER), spectral efficiency, Peak-to-Average Power Ratio (PAPR), and computational complexity. We demonstrate the potential for better robustness, reduced BER, and increased reliability in difficult wireless situations by incorporating qubit-based modulation, quantum channel estimation, and quantum error correction techniques into the OFDM and Massive MIMO framework. MATLAB simulation results show that qubit-based systems outperform classical binary systems, particularly in scenarios with high user density and mobility, making them a viable choice for upcoming 6G applications. Important information about the benefits and trade-offs of switching from classical to quantum-enhanced wireless communication systems is provided by the comparative study', '[\"Quantum Communication\", \"Qubits and Binary Bits\", \"Massive MIMO-OFDM\", \" 5G and 6G Networks\", \"Bit Error Rate\", \"Channel Estimation\"]', 'Engineering', NULL, '2026-03-31 14:00:00'),
(7, 7, 1, 'Fabrication of Multipurpose Agriculture Machine', 'Agriculture plays a vital role in economic development, and modern technology integration is essential for improving productivity. This paper presents the fabrication of a multipurpose agricultural machine that performs spraying, seeding, and plowing operations using solar power as the primary energy source. The system reduces manual labor, minimizes fuel consumption, and promotes eco-friendly farming. The machine consists of a solar panel, battery storage, DC motors, and mechanical assemblies for three agricultural tasks: uniform pesticide spraying, controlled seed placement at proper depth and spacing, and soil plowing for aeration. Testing on a 100 sq.m test plot demonstrates 90% spraying uniformity, 88% seed placement accuracy at 15cm spacing, plowing depth of 10cm in medium soil, and 3 hours continuous operation on solar charge, achieving 70% labor reduction and 55% cost savings compared to manual farming methods', '[\"Agriculture Machine\", \"Solar Power\", \"Multipurpose\", \"Spraying\", \"Seeding\", \"Plowing\", \"DC Motor\", \"Renewable Energy\"]', 'Engineering', NULL, '2026-03-31 15:00:00'),
(8, 8, 1, 'Fabrication of Automatic Tire Inflating System', 'Proper tire pressure is essential for vehicle safety, fuel efficiency, and tire longevity, but manual checking and inflating is often neglected. This paper presents the fabrication of an Automatic Tire Inflating System that monitors and regulates tire pressure without manual intervention. The system uses pressure sensors, an Arduino microcontroller, and a 12V DC air compressor to continuously detect tire air pressure and automatically activate inflation when pressure falls below the preset limit. An LCD display shows real-time pressure readings, while LED indicators and a buzzer provide alerts for under- inflation and over-inflation conditions. The system automatically deactivates the compressor when optimal pressure is reached. Testing demonstrates  0.5 PSI measurement accuracy, automatic inflation response within 3 seconds of pressure drop detection, and inflation rate of 2 PSI per minute, achieving the target pressure of 32 PSI within 5 minutes from a 22 PSI under- inflated condition. The system enhances vehicle safety, improves fuel efficiency by 35%, and extends tire life by up to 20%.', '[\"Automatic Tire Inflation\", \"Pressure Sensor\", \"Microcontroller\", \"Air Compressor\", \"Vehicle Safety\", \"Fuel Efficiency\"]', 'Engineering', NULL, '2026-03-31 16:00:00'),
(9, 9, 1, 'Fabrication of Solar Grass Cutter with Bluetooth Control', 'This paper presents the fabrication of a solar- powered grass cutter with Bluetooth-based mobile phone control, combining renewable energy with wireless automation for modern gardening and agriculture. The machine operates using solar power stored in a rechargeable battery, driving cutting motors and a Bluetooth-controlled movement system. Users control forward, backward, left, and right movement through a mobile application, reducing manual labour and improving safety. The system consists of a solar panel (20W), 12V lead-acid battery, DC motors for movement and cutting, HC-05 Bluetooth module, L298N motor driver, Arduino Uno controller, and a robust chassis. Testing demonstrates continuous operation for 2.5 hours on a full solar charge, cutting efficiency of 85% on grass up to 15cm height, Bluetooth control range of 10 meters, and 60% reduction in operational cost compared to petrol-driven alternatives, making it eco-friendly and suitable for lawns, gardens, and playgrounds', '[\"Solar Energy\", \"Grass Cutter\", \"Bluetooth Control\", \"DC Motor\", \"Renewable Energy\", \"Automation\", \"Mobile Application\"]', 'Engineering', NULL, '2026-03-31 17:00:00'),
(10, 10, 1, 'Fabrication of 90 Degree Steering System', 'Conventional steering systems are limited by their large turning radius, making vehicle maneuvering difficult in congested urban areas. This paper presents the fabrication of a 90 Degree Steering System that allows all four wheels to rotate up to 90 degrees, enabling lateral (sideways) movement of the vehicle. The system uses electric motors, rack and pinion mechanism, bevel gears, sprockets, and chain drive arrangements. The prototype features four DC motors for wheel motion and an additional motor arrangement for 90-degree wheel rotation. Powered by a rechargeable 12V battery and controlled through an electronic control unit, the system demonstrates successful sideways parking capability, zero-radius turning, and diagonal movement. Testing shows the turning radius reduces from 5.2m (conventional) to effectively 0m (in- place rotation), lateral parking time reduces by 65%, and the system operates reliably across 200 test cycles.', '[\"90 Degree Steering\", \"Lateral Movement\", \"Rack\", \"Pinion\", \"Bevel Gear\", \"Four-Wheel Steering\", \"Parking Mechanism\"]', 'Engineering', NULL, '2026-03-31 18:00:00'),
(12, 58, 1, 'Green Aquaculture Practices: Promoting Sustainable Aquaculture Techniques to Enhance Productivity While Preserving Marine Ecosystems', 'This article presents a research proposal for an IoT enabled, AI-driven Green Aquaculture framework integrating Recirculating Aquaculture Systems (RAS), Integrated Multi Trophic Aquaculture (IMTA), and edge intelligence. Conventional aquaculture faces pressure from environmental damage and global protein demand. The proposed system utilizes deep learning models, specifically YOLO architectures, for real-time fish behavior monitoring, biomass estimation, and precise feeding control. Central to this framework is the “Self Healing Ecosystem” concept, where machine learning optimizes the balance between fed and extractive species to achieve zero waste discharge. This work aligns with India’s Pradhan Mantri Matsya Sampada Yojana (PMMSY) to move toward a sustainable, high-tech aquaculture model.', '[\"IoT Sensors\",\"Recirculating Aquaculture Systems (RAS)\",\"Integrated Multi-Trophic Aquaculture (IMTA)\",\"Precision Feeding\",\"Water Quality Prediction\",\"Sustainable Fisheries\",\"Edge Intelligence\",\"Machine Learning\"]', NULL, NULL, '2026-05-02 07:21:24'),
(13, 59, 1, 'Hybrid Quantum Machine Learning and Quantum Compressed Sensing for Robust Channel Estimation in Massive MIMO-OFDM Systems', 'This paper describes a hybrid architecture that combines Quantum Compressed Sensing (QCS) and Quantum Machine Learning (QML) to improve channel prediction in Massive MIMO-OFDM systems. The proposed method addresses the limitations of standard compressed sensing techniques, which rely heavily on strict sparsity assumptions, as well as machine learning models, which require large training datasets. Initially, QCS is used to achieve sparse channel recovery with fewer pilot observations, lowering overhead and improving spectral efficiency. The channel estimate is then revised using a QML-based model that is capable of learning nonlinear channel properties and adapting to dynamic propagation settings. This two-stage architecture allows for increased estimation accuracy in both sparse and non-sparse channel circumstances. The paradigm is notably relevant for the forthcoming 6G communication systems, which operate in high frequency bands with complex fading and noise behaviors. A hybrid loss function is used to optimize sparsity restrictions while also performing learning-based reconstruction. Simulation findings show that the suggested method reduces bit error rates and improves normalized mean square error when compared to standalone QCS and QML methods. Furthermore, the model exhibits robustness to noise and channel fluctuation, making it ideal for practical deployment. The combination of quantum inspired approaches with data-driven learning provides a scalable solution for next-generation wireless networks. In summary, the suggested method finds a balance between computing efficiency and estimation performance, while also opening up new possibilities for integrating model-based and learning-based paradigms into communication system design.', '[\"Quantum Machine Learning (QML)\", \"Quantum Compressed Sensing (QCS)\", \"Massive MIMO-OFDM\", \"Channel Estimation\", \"6G Communication\", \"Sparse Signal Recovery\"]', NULL, NULL, '2026-05-02 07:21:24'),
(14, 60, 1, 'Deep Reinforcement Learning for Dynamic Resource Management in Ephemeral Edge Computing Networks', 'Efficient resource orchestration in modern edge computing deployments is increasingly challenged by node mobility, stochastic workloads, and limited energy budgets. Conventional static and heuristic scheduling methods are fundamentally inadequate for volatile environments such as UAV swarms and vehicular ad hoc networks, where topology and resource availability evolve continuously. This paper proposes a novel adaptive resource management framework grounded in Proximal Policy Optimization (PPO), a state-of-the-art Deep Reinforcement Learning (DRL) algorithm, tailored for ephemeral edge computing scenarios. The resource allocation problem is rigorously formalized as a Markov Decision Process (MDP) that jointly accounts for end-to-end task latency, cumulative energy expenditure, load distribution fairness, and Service Level Agreement (SLA) compliance. Through iterative interaction with a realistic simulation environment encompassing 20 mobile UAV nodes, the PPO agent acquires nuanced allocation policies that balance competing performance objectives. Our key novelty lies in a composite reward signal that explicitly penalizes battery depletion events, discouraging greedy local processing in favor of energy-balanced, network-lifetime-aware decisions. Experimental results demonstrate that the proposed PPO-based framework reduces SLA violations by approximately 30% and extends network operational lifetime by up to 47% compared to Deep Q-Network (DQN) baselines and classical static schedulers.', '[\"Deep Reinforcement Learning\", \"Proximal Policy Optimization (PPO)\", \"Edge Computing\", \"Dynamic Resource Allocation\", \"Markov Decision Process\", \"UAV Networks\", \"Energy Efficiency\", \"SLA Compliance\"]', NULL, NULL, '2026-05-02 07:21:24'),
(15, 61, 1, 'Performance Analysis of CNN, RNN, and LSTM Based Channel Estimation in Massive MIMO-OFDM ', 'The ability of Massive Multiple-Input Multiple-Output (Massive MIMO) technology to provide excellent spectral efficiency and increased network capacity makes it an essential enabler for the next generation of wireless communication systems. However, the intricacies of high-dimensional channel matrices, pilot contamination, and sparse multipath propagation settings make accurate channel estimation in Massive MIMO systems a major issue. Conventional estimating techniques, such as compressed sensing and Least Squares (LS), are more computationally demanding and have worse accuracy when the signal-to-noise ratio (SNR) is low. In order to address these issues, this research presents a hybrid framework for sparse channel estimation that makes use of deep learning, particularly Convolutional Neural Networks (CNN) and Recurrent Neural Networks (RNN). The suggested framework is tested under Rayleigh fading conditions in a Massive MIMO-OFDM setting. Metrics like Bit Error Rate (BER), Mean Square Error (MSE), and estimation accuracy are used in performance evaluations. When compared to conventional LS and compressed sensing techniques, simulation results show that the CNN-RNN methodology considerably lowers BER and improves channel estimation performance. Additionally, the suggested paradigm strengthens robustness in dynamic wireless environments and successfully reduces pilot overhead. For the advanced wireless communication systems of 5G and the upcoming 6G, the created framework provides an effective and scalable solution.', 'Massive MIMO, Channel Estimation, Convolutional Neural Network (CNN), Recurrent Neural Network (RNN), Sparse Wireless Communication.', NULL, NULL, '2026-05-27 17:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('admin','editor','reviewer','author') NOT NULL DEFAULT 'author',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `has_seen_promotion` tinyint(1) NOT NULL DEFAULT 0,
  `last_active_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `is_active`, `is_email_verified`, `email_verified_at`, `created_at`, `updated_at`, `deleted_at`, `has_seen_promotion`, `last_active_at`) VALUES
('02d01172-bb6f-4227-b980-f4abe1bd64ff', 'radhikaparimala325@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('29c83ca4-8361-4315-aa52-1628b3c38e22', 'kongarapunaveen866@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('41a2a42d-a5ce-4540-a8b2-ed1cbca451f6', 'pradeepvommi@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('4ea6669a-41b9-4f80-9be4-829a156f9089', 'nmahendra@gpcet.ac.in', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('5afb6ea1-45f9-4d45-b023-4e3e6c1fb025', 'harshavardhansingani@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('5d1f1b23-01bf-422b-9a83-a84d09249a85', 'jayakrishnavantakula@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('5e46659a-9c4d-4740-811d-ce905ef103d0', 'bhaskarpsn@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('79dbcba4-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar21@gmail.com', '$2b$10$m6iHhngwesUoMWr/iPAuaepnWyTSiWv7ubOwAnVl0jwdzHdiICDAa', 'editor', 1, 0, NULL, '2026-02-06 14:24:33', '2026-04-06 14:04:06', NULL, 0, NULL),
('79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 'razh1976@gmail.com', '$2b$10$82mvRvTC4qGrcZWaIxe37eAvSGyfLNu45aKuiogg29q1NRLGZgMRa', 'reviewer', 1, 0, NULL, '2026-02-14 15:49:00', '2026-04-06 14:04:06', NULL, 0, NULL),
('79dc7b1c-31c1-11f1-ad3e-c05465fbbdc2', 'somasekhar.ece@anits.edu.in', '$2b$10$p83k/rGRp24YN44Uao3xFeLoYFHfEZna9pY8sg5qdq2jShzvXRK/W', 'reviewer', 1, 0, NULL, '2026-02-15 12:22:35', '2026-04-11 03:23:44', NULL, 0, NULL),
('79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 'manohar@gvpcdpgc.edu.in', '$2b$10$AD6WPbFIDVEoOoPZUCZAfeHqZ4YoQjexBjQOO6.3bDReU30H20AFK', 'reviewer', 1, 0, NULL, '2026-02-19 16:12:14', '2026-04-06 14:04:06', NULL, 0, NULL),
('79dcf791-31c1-11f1-ad3e-c05465fbbdc2', 'venkatesh15793@gmail.com', '$2b$10$vCuOl9r0XinmX3pezxSBqOLGzBD3P5UgMh/D1XZWyDdtnisNaDmtK', 'reviewer', 1, 0, NULL, '2026-02-19 16:12:20', '2026-04-06 14:04:06', NULL, 0, NULL),
('79dd80d7-31c1-11f1-ad3e-c05465fbbdc2', 'skaredla@gitam.edu', NULL, 'reviewer', 1, 0, NULL, '2026-03-03 14:08:13', '2026-04-11 03:23:59', NULL, 0, NULL),
('79de0a1f-31c1-11f1-ad3e-c05465fbbdc2', 'norsuzila@salam.uitm.edu.my', '$2b$10$SoJp3xko/HImNINIVY2RjO9Vk17ERTTcijrIXECZ.f1/2EtiEwZfm', 'editor', 1, 0, NULL, '2026-03-03 14:29:56', '2026-04-06 14:04:06', NULL, 0, NULL),
('79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 'razh1977@gmail.com', '$2b$10$ukCLsMdXnS8tCeYkYTzlu.FgxfsmiNGlp/XEq3IItohUu/Qcwabym', 'editor', 1, 1, '2026-05-27 17:51:31', '2026-03-03 15:34:37', '2026-05-27 17:51:31', NULL, 0, NULL),
('79df667a-31c1-11f1-ad3e-c05465fbbdc2', 'trinadhphd33@gmail.com', NULL, 'editor', 1, 0, NULL, '2026-03-05 15:56:46', '2026-04-29 12:14:17', NULL, 0, NULL),
('79dfcee0-31c1-11f1-ad3e-c05465fbbdc2', 'mr.challa33@gmail.com', NULL, 'editor', 1, 0, NULL, '2026-03-05 15:56:53', '2026-04-29 12:14:35', NULL, 0, NULL),
('82b7987d-f90d-4a19-b1d3-1947671914db', 'telukarthik9@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('866d93bc-b280-4bc0-a776-ce70477630df', 'jeevankumarkella@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('86b68318-45f7-11f1-ad3e-c05465fbbdc2', 'raghavnadiminti@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86b9b0e9-45f7-11f1-ad3e-c05465fbbdc2', 'mallamohith20@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86bbe9e3-45f7-11f1-ad3e-c05465fbbdc2', 'manasamarkandeya@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86be333a-45f7-11f1-ad3e-c05465fbbdc2', 'vmn90gvd@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86c035ab-45f7-11f1-ad3e-c05465fbbdc2', 'mdjani1209@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86c2652d-45f7-11f1-ad3e-c05465fbbdc2', 'bharathkarthik2006@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86c50c19-45f7-11f1-ad3e-c05465fbbdc2', 'suryatejamedisetty000@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('86c79e83-45f7-11f1-ad3e-c05465fbbdc2', 'pkalpana1109@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24', NULL, 0, NULL),
('87b55eae-e296-4a65-a82f-3c503beadf7e', 'editor@ijitest.org', '$2b$10$HpElpKNYCXaqdUpivIxWA.CLDniLlVW/GIb7VyiDv4Syl3WsKsdqy', 'admin', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 06:38:53', NULL, 1, NULL),
('9196f358-d1ce-448b-a854-4cc641684f97', 'mallikblue@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('94a51dbe-acc8-4df8-a3c6-03ecc15287a0', 'subbaraochappa@gmail.com', '$2a$12$M2tKWAune7p18LlnZgnfkecIDlaQvQ6SkhDYrbMiX.9fOAPFpqYVy', 'reviewer', 1, 1, NULL, '2026-04-19 05:41:03', '2026-04-19 06:38:53', NULL, 0, NULL),
('a0d1d251-cccd-4a52-93ff-26bcc7ae428a', 'jagadishdunna2005@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('ac34b85e-d7c0-454b-9ef9-4b73e39ee30a', 'gulshansribabu@gmail.com', '$2a$12$XMa6PiA6G0OIOUFRuwnA..cADNcHYX61xvBHtNeHHPqfIgM3LXoKC', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-05-07 15:51:51', NULL, 0, NULL),
('af963fdb-af8a-4687-b843-dc604df4ff1c', 'jackbenison12@gmail.com', '$2b$10$yX2afSBH9VoTNfs8aQVMtuI6TNOVcn.Xm/bc56Z1P.GCKJd/o96te', 'reviewer', 1, 1, '2026-05-27 17:29:42', '2026-04-19 05:41:03', '2026-05-27 17:29:42', NULL, 0, NULL),
('bce1657c-32a6-492d-9df5-a03dcb465726', 'indalamohankumar@gmail.com', '$2b$10$2nF2wRdIXIfGGFeFYJHYtOhuyufINNFC/pvZr/bAftSh6l4mql3H2', 'reviewer', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 06:38:53', NULL, 0, NULL),
('c411a1e8-1a94-4ba8-bf5c-d3bead1b617b', 'missing_email_ijitest-2026-010_c5545a38@ijitest.org', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('cd2ef493-3626-483a-93c6-8236287bf7a1', 'swapnachsp@gmail.com', '$2b$10$S3VJhjb7uats5M8.eKctHeoiu2fIDsZfvimEDmMTOY8UFMoiFh12m', 'editor', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 06:38:53', NULL, 0, NULL),
('e3052d0b-2a66-462a-8541-bda5c7c09f6d', 'pallavenkat11@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('ec45d5c4-0ec8-49ff-a9c0-d18ea988bfb2', 'missing_email_ijitest-2026-007_32ad464c@ijitest.org', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('ec6f9428-c3e0-4bdf-bb28-07ea86ba2440', 'rthorlapati@miracleeducationalsociety.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('f7905eac-6c28-4718-a00f-3fe9849bc465', 'saikumarbolla31@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('f83fee8d-5304-4b40-806d-59531ed01db5', 'neelapuabhiram007@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('fa60af47-276f-4c3a-8c34-89aae8ee28dd', 'umeshchandra15623@gmail.com', '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u', 'author', 1, 0, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03', NULL, 0, NULL),
('u19-mahendra-uuid-003', 'narlamahendracai@gpcet.ac.in', '$2a$12$M2tKWAune7p18LlnZgnfkecIDlaQvQ6SkhDYrbMiX.9fOAPFpqYVy', 'reviewer', 1, 1, NULL, '2026-04-08 14:24:12', '2026-04-26 03:22:35', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_invitations`
--

CREATE TABLE `user_invitations` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('editor','reviewer','author') NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `invited_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_invitations`
--

INSERT INTO `user_invitations` (`id`, `email`, `role`, `token`, `expires_at`, `invited_by`, `created_at`) VALUES
(1, 'skaredla@gitam.edu', 'editor', '09de0294e967aeb6a30abfeda5a51c62340e2d9aeb8a20b4e1143bdd46f95c3d', '2026-03-04 14:08:13', NULL, '2026-03-03 14:08:13'),
(2, 'jackbenison12@gmail.com', 'editor', 'c606a2bab40b8cdae84258591cbd5da5e7fd771750d5ee06337519e2abb54438', '2026-03-04 14:09:25', NULL, '2026-03-03 14:09:25'),
(4, 'trinadhphd33@gmail.com', 'editor', '46a219ab8c1a6157080a9886c7342c574ce6595408da12cdbcdb637f4cf53088', '2026-03-06 15:56:46', NULL, '2026-03-05 15:56:46'),
(5, 'mr.challa33@gmail.com', 'reviewer', '2f0d0f6f1068bb271034e7e22878c5660fa2e090e756ff31d6d898c5f73b8b52', '2026-03-06 15:56:53', NULL, '2026-03-05 15:56:53'),
(21, 'norsuzila@salam.uitm.edu.my', 'editor', '19f0fa58b5f10f5eea3a9c89de079d37af5b0278db54e25424b9d70145930d3a', '2026-05-06 09:32:59', NULL, '2026-05-06 08:32:59'),
(22, 'manohar@gvpcdpgc.edu.in', 'reviewer', '2c59548db768dfd36e4d4956ee3fe6eb39ead58f4cc63cc0c4b2a03fb42e418c', '2026-06-03 17:20:21', NULL, '2026-05-27 17:20:21');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `institute` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `orcid_id` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'India',
  `bio` text DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `full_name`, `designation`, `institute`, `phone`, `orcid_id`, `nationality`, `bio`, `photo_url`, `created_at`, `updated_at`) VALUES
(1, '5e46659a-9c4d-4740-811d-ce905ef103d0', 'PSN Bhashar', NULL, 'Assistant Professor,Department of ECE, SVP Engineering College, Visakhapatnam, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(2, '87b55eae-e296-4a65-a82f-3c503beadf7e', 'Dr. Ravibabu T.', 'Associate Professor', 'Department of Electronics and Communication Engineering, MES Group of Institutions', '+918919643590', '', 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-28 16:36:38'),
(3, 'ac34b85e-d7c0-454b-9ef9-4b73e39ee30a', 'Gulshan Sribabu Thorlapati', NULL, 'Department of CIVIL, Vignans Institute of Information Technology (A), Visakhapatnam, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(4, '5afb6ea1-45f9-4d45-b023-4e3e6c1fb025', 'S.HarshaVardhan', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(5, 'bce1657c-32a6-492d-9df5-a03dcb465726', 'Mohan Kumar', NULL, 'IJITEST Admin', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(6, 'af963fdb-af8a-4687-b843-dc604df4ff1c', 'Suseela Kocho', NULL, 'SGT, Department of school education, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(7, 'a0d1d251-cccd-4a52-93ff-26bcc7ae428a', 'S D. Jagadeesh', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(8, '5d1f1b23-01bf-422b-9a83-a84d09249a85', 'V.Jayakrishna', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(9, '866d93bc-b280-4bc0-a776-ce70477630df', 'K. Jeevan Kumar', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(10, '29c83ca4-8361-4315-aa52-1628b3c38e22', 'K.Naveen', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(11, '9196f358-d1ce-448b-a854-4cc641684f97', 'S Naga Mallik Raj', NULL, 'Associate Professor,Department of CSE, Vignans Institute of Information Technology (A), Visakhapatnam, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(12, 'ec45d5c4-0ec8-49ff-a9c0-d18ea988bfb2', 'S. Sai Durga Jagan Mohan', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(13, 'c411a1e8-1a94-4ba8-bf5c-d3bead1b617b', 'Laharadithya', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(14, 'f83fee8d-5304-4b40-806d-59531ed01db5', 'N.Abhiram', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(15, '4ea6669a-41b9-4f80-9be4-829a156f9089', 'Mahendra Narla', NULL, 'Associate Professor,Department of AI&DS, G.Pullaiah College of Engineering and Technology, Kurnool, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(16, 'e3052d0b-2a66-462a-8541-bda5c7c09f6d', 'P. Venkata Jagadeesh', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(17, '41a2a42d-a5ce-4540-a8b2-ed1cbca451f6', 'V.Pradeep Kumar', NULL, 'Associate Professor,Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(18, '02d01172-bb6f-4227-b980-f4abe1bd64ff', 'K.K.R. Parimala', NULL, 'Assistant Professor,Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(19, 'ec6f9428-c3e0-4bdf-bb28-07ea86ba2440', 'T. Ravi babu', NULL, 'Associate Professor,Department of ECE, Miracle Educational Society Group of Institutions(A), Vizianagaram, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(20, 'f7905eac-6c28-4718-a00f-3fe9849bc465', 'B. Sai Kumar', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(21, '94a51dbe-acc8-4df8-a3c6-03ecc15287a0', 'CH. Subba Rao', NULL, 'Associate Professor,Department of ECE, Miracle Educational Society Group of Institutions(A), Vizianagaram, India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(22, 'cd2ef493-3626-483a-93c6-8236287bf7a1', 'Cheekatla Swapnapriya ', 'Associate professor', 'Vignan\'s institute of information technology ', '9505175015', NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-25 05:55:52'),
(23, '82b7987d-f90d-4a19-b1d3-1947671914db', 'T. Karthik', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(24, 'fa60af47-276f-4c3a-8c34-89aae8ee28dd', 'N.UmeshChandra', NULL, 'Department of Mechanical Engineering,Avanthi Institute of Engineering and Technology, Vizianagaram, A.P., India', NULL, NULL, 'India', NULL, NULL, '2026-04-19 05:41:03', '2026-04-19 05:41:03'),
(25, '79de0a1f-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. Norsuzila Ya\'acob', 'Professor', 'Dept. of Electrical Engineering, University of Teknologi MARA, Shah Alam, Malaysia', NULL, NULL, 'Malaysia', NULL, NULL, '2026-04-23 05:01:48', '2026-04-23 05:01:48'),
(26, 'u19-mahendra-uuid-003', 'Dr. Mahendra Narla', 'Associate Professor', 'Dept of Artificial Intelligence and Data Science, GPCET, Kurnool, India', NULL, NULL, 'India', NULL, NULL, '2026-04-23 05:01:48', '2026-04-23 05:01:48'),
(27, '79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. CH. Swapna Priya Chikatla', 'Associate Professor', 'Vignan’s Institute of Information Technology (A)', '', NULL, 'Malaysia', NULL, NULL, '2026-04-23 05:01:48', '2026-05-27 17:12:58'),
(28, '79df667a-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. Trinadha Rao Challa', 'Associate Professor', 'Dept of Mechanical Engineering, MES Group of Institutions, India', NULL, NULL, 'India', NULL, NULL, '2026-04-23 05:01:48', '2026-04-23 05:01:48'),
(29, '79dc7b1c-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. Somasekhar Borugadda', 'Professor', 'Anil Neerukonda Institute of Technology and Sciences, Visakhapatnam, AP, India', NULL, NULL, 'India', NULL, NULL, '2026-04-23 05:01:48', '2026-04-23 05:01:48'),
(30, '79dcf791-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. Appalabathula Venkatesh', 'Associate Professor', 'Anil Neerukonda Institute of Technology and Sciences, India', NULL, NULL, 'India', NULL, NULL, '2026-04-23 05:01:48', '2026-04-23 05:01:48'),
(31, '79dd80d7-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. Srinivasa Rao Thammada', 'Professor', 'Dept of Computer Science Engineering, GITAM University, India', NULL, NULL, 'India', NULL, NULL, '2026-04-23 05:01:48', '2026-04-23 05:01:48'),
(47, '86b68318-45f7-11f1-ad3e-c05465fbbdc2', 'Nadiminti Raghavendra', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(48, '86b9b0e9-45f7-11f1-ad3e-c05465fbbdc2', 'Malla Mohith Sai', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(49, '86bbe9e3-45f7-11f1-ad3e-c05465fbbdc2', 'Markandeya Gupta N', 'Associate Professor', 'Department of ECE, Sri Sivani college of engineering (A), Srikakulam, India', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(50, '86be333a-45f7-11f1-ad3e-c05465fbbdc2', 'V. Mutyala Naidu', 'Assistant Professor', 'Department of ECE, Gayatri Vidya Parishad college for Degree and PG Courses (A), Visakhapatnam, India', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(51, '86c035ab-45f7-11f1-ad3e-c05465fbbdc2', 'Mahamed Mastan Jani', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(52, '86c2652d-45f7-11f1-ad3e-c05465fbbdc2', 'Bharath Karthik Mycherla', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(53, '86c50c19-45f7-11f1-ad3e-c05465fbbdc2', 'Surya Teja Medisetty', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(54, '86c79e83-45f7-11f1-ad3e-c05465fbbdc2', 'Kalpana Pulipati', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', NULL, NULL, 'India', NULL, NULL, '2026-05-02 07:21:24', '2026-05-02 07:21:24'),
(55, '79dbcba4-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar21', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-06-01 05:56:40', '2026-06-01 05:56:40'),
(56, '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 'manohar', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-06-01 05:56:40', '2026-06-01 05:56:40'),
(57, '79dfcee0-31c1-11f1-ad3e-c05465fbbdc2', 'mr.challa33', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-06-01 05:56:40', '2026-06-01 05:56:40'),
(58, '79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 'razh1976', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-06-01 05:56:40', '2026-06-01 05:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `volumes_issues`
--

CREATE TABLE `volumes_issues` (
  `id` int(11) NOT NULL,
  `volume_number` int(11) NOT NULL,
  `issue_number` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `month_range` varchar(100) DEFAULT NULL,
  `status` enum('open','published') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `volumes_issues`
--

INSERT INTO `volumes_issues` (`id`, `volume_number`, `issue_number`, `year`, `month_range`, `status`, `created_at`) VALUES
(1, 1, 1, 2026, 'March', 'published', '2026-04-19 05:41:03'),
(2, 1, 2, 2026, 'April', 'published', '2026-04-19 05:41:03'),
(3, 1, 3, 2026, 'May', 'published', '2026-05-05 18:18:58');

-- --------------------------------------------------------

--
-- Table structure for table `_user_id_mapping`
--

CREATE TABLE `_user_id_mapping` (
  `old_id` int(11) NOT NULL,
  `new_uuid` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_user_id_mapping`
--

INSERT INTO `_user_id_mapping` (`old_id`, `new_uuid`, `email`) VALUES
(1, '79daefad-31c1-11f1-ad3e-c05465fbbdc2', 'editor@ijitest.org'),
(2, '79db5a7a-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar@gmail.com'),
(3, '79dbcba4-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar21@gmail.com'),
(4, '79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 'razh1976@gmail.com'),
(5, '79dc7b1c-31c1-11f1-ad3e-c05465fbbdc2', 'somasekhar.ece@anits.edu.in'),
(6, '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 'manohar@gvpcdpgc.edu.in'),
(7, '79dcf791-31c1-11f1-ad3e-c05465fbbdc2', 'venkatesh15793@gmail.com'),
(12, '79dd4a83-31c1-11f1-ad3e-c05465fbbdc2', 'swapnachsp@gmail.com'),
(13, '79dd80d7-31c1-11f1-ad3e-c05465fbbdc2', 'skaredla@gitam.edu'),
(17, '79ddcf7f-31c1-11f1-ad3e-c05465fbbdc2', 'jackbenison12@gmail.com'),
(22, '79de0a1f-31c1-11f1-ad3e-c05465fbbdc2', 'norsuzila@salam.uitm.edu.my'),
(23, '79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 'razh1977@gmail.com'),
(24, '79df667a-31c1-11f1-ad3e-c05465fbbdc2', 'trinadhphd33@gmail.com'),
(25, '79dfcee0-31c1-11f1-ad3e-c05465fbbdc2', 'mr.challa33@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `__drizzle_migrations`
--

CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_performed_by_users_id_fk` (`performed_by`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_email_type_unique` (`email`,`type`),
  ADD KEY `applications_reviewed_by_users_id_fk` (`reviewed_by`);

--
-- Indexes for table `application_interests`
--
ALTER TABLE `application_interests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_interests_application_id_applications_id_fk` (`application_id`),
  ADD KEY `application_interests_interest_id_master_interests_id_fk` (`interest_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_idx` (`sender_id`),
  ADD KEY `receiver_idx` (`receiver_id`),
  ADD KEY `submission_chat_idx` (`submission_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `master_interests`
--
ALTER TABLE `master_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `master_interests_name_unique` (`name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notif_user_idx` (`user_id`,`is_read`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_submission_id_unique` (`submission_id`),
  ADD UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`);

--
-- Indexes for table `publications`
--
ALTER TABLE `publications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `publications_submission_id_unique` (`submission_id`),
  ADD UNIQUE KEY `publications_doi_unique` (`doi`),
  ADD KEY `publications_issue_id_volumes_issues_id_fk` (`issue_id`);

--
-- Indexes for table `rate_limits`
--
ALTER TABLE `rate_limits`
  ADD PRIMARY KEY (`key`),
  ADD KEY `rate_limits_reset_at_idx` (`reset_at`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_assignment_id_unique` (`assignment_id`);

--
-- Indexes for table `review_assignments`
--
ALTER TABLE `review_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`submission_id`,`reviewer_id`,`version_id`,`review_round`),
  ADD KEY `review_assignments_version_id_submission_versions_id_fk` (`version_id`),
  ADD KEY `review_assignments_reviewer_id_users_id_fk` (`reviewer_id`),
  ADD KEY `review_assignments_assigned_by_users_id_fk` (`assigned_by`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submissions_paper_id_unique` (`paper_id`),
  ADD UNIQUE KEY `submissions_slug_unique` (`slug`),
  ADD KEY `submissions_issue_id_volumes_issues_id_fk` (`issue_id`),
  ADD KEY `status_idx` (`status`),
  ADD KEY `author_idx` (`corresponding_author_id`),
  ADD KEY `submissions_decision_by_users_id_fk` (`decision_by`);

--
-- Indexes for table `submission_authors`
--
ALTER TABLE `submission_authors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_author_idx` (`submission_id`),
  ADD KEY `author_order_idx` (`submission_id`,`order_index`);

--
-- Indexes for table `submission_editors`
--
ALTER TABLE `submission_editors`
  ADD PRIMARY KEY (`submission_id`,`editor_id`),
  ADD KEY `submission_editors_editor_id_users_id_fk` (`editor_id`);

--
-- Indexes for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file_version_idx` (`version_id`);

--
-- Indexes for table `submission_versions`
--
ALTER TABLE `submission_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_version_unique` (`submission_id`,`version_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `role_idx` (`role`);

--
-- Indexes for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_invitations_token_unique` (`token`),
  ADD KEY `user_invitations_invited_by_users_id_fk` (`invited_by`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_profiles_user_id_unique` (`user_id`);

--
-- Indexes for table `volumes_issues`
--
ALTER TABLE `volumes_issues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vol_issue_year` (`volume_number`,`issue_number`,`year`);

--
-- Indexes for table `_user_id_mapping`
--
ALTER TABLE `_user_id_mapping`
  ADD PRIMARY KEY (`old_id`);

--
-- Indexes for table `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_interests`
--
ALTER TABLE `application_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `master_interests`
--
ALTER TABLE `master_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `publications`
--
ALTER TABLE `publications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `review_assignments`
--
ALTER TABLE `review_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `submission_authors`
--
ALTER TABLE `submission_authors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `submission_files`
--
ALTER TABLE `submission_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `submission_versions`
--
ALTER TABLE `submission_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user_invitations`
--
ALTER TABLE `user_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `volumes_issues`
--
ALTER TABLE `volumes_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_performed_by_users_id_fk` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `application_interests`
--
ALTER TABLE `application_interests`
  ADD CONSTRAINT `application_interests_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `application_interests_interest_id_master_interests_id_fk` FOREIGN KEY (`interest_id`) REFERENCES `master_interests` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_receiver_id_users_id_fk` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `chat_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `chat_messages_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `publications`
--
ALTER TABLE `publications`
  ADD CONSTRAINT `publications_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `publications_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_assignment_id_review_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `review_assignments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `review_assignments`
--
ALTER TABLE `review_assignments`
  ADD CONSTRAINT `review_assignments_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `review_assignments_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `review_assignments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `review_assignments_version_id_submission_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `submission_versions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_corresponding_author_id_users_id_fk` FOREIGN KEY (`corresponding_author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `submissions_decision_by_users_id_fk` FOREIGN KEY (`decision_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `submissions_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `submission_authors`
--
ALTER TABLE `submission_authors`
  ADD CONSTRAINT `submission_authors_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submission_editors`
--
ALTER TABLE `submission_editors`
  ADD CONSTRAINT `submission_editors_editor_id_users_id_fk` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `submission_editors_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD CONSTRAINT `submission_files_version_id_submission_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `submission_versions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submission_versions`
--
ALTER TABLE `submission_versions`
  ADD CONSTRAINT `submission_versions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD CONSTRAINT `user_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
