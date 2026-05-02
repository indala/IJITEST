-- Migration: Insert Papers 011, 012, 013
-- Goal: Manually insert published papers and update sequence.

SET @default_password = '$2a$10$7RmsVl.z6.v6jW9Vd1vU8.OsqYf4A5U5u5u5u5u5u5u5u5u5u5u';
SET @issue_id = 2; -- Volume 1 Issue 2

START TRANSACTION;

-- 1. Create New Users and Profiles
-- Paper 011 Co-authors
SET @u_raghav = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_raghav, 'raghavnadiminti@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_raghav, 'Nadiminti Raghavendra', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam');

SET @u_mohith = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_mohith, 'mallamohith20@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_mohith, 'Malla Mohith Sai', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam');

-- Paper 012 Lead and Co-author
SET @u_markandeya = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_markandeya, 'manasamarkandeya@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_markandeya, 'Markandeya Gupta N', 'Associate Professor', 'Department of ECE, Sri Sivani college of engineering (A), Srikakulam, India');

SET @u_mutyala = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_mutyala, 'vmn90gvd@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_mutyala, 'V. Mutyala Naidu', 'Assistant Professor', 'Department of ECE, Gayatri Vidya Parishad college for Degree and PG Courses (A), Visakhapatnam, India');

-- Paper 013 Co-authors
SET @u_mastan = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_mastan, 'mdjani1209@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_mastan, 'Mahamed Mastan Jani', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam');

SET @u_bharath = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_bharath, 'bharathkarthik2006@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_bharath, 'Bharath Karthik Mycherla', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam');

SET @u_surya = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_surya, 'suryatejamedisetty000@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_surya, 'Surya Teja Medisetty', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam');

SET @u_kalpana = UUID();
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`) VALUES (@u_kalpana, 'pkalpana1109@gmail.com', @default_password, 'author');
INSERT INTO `user_profiles` (`user_id`, `full_name`, `designation`, `institute`) VALUES (@u_kalpana, 'Kalpana Pulipati', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam');

-- 2. Insert Submissions
-- IJITEST-2026-011
INSERT INTO `submissions` (`paper_id`, `slug`, `status`, `corresponding_author_id`, `issue_id`) 
VALUES ('IJITEST-2026-011', 'ijitest2026011', 'published', '9196f358-d1ce-448b-a854-4cc641684f97', @issue_id);
SET @s11 = LAST_INSERT_ID();

-- IJITEST-2026-012
INSERT INTO `submissions` (`paper_id`, `slug`, `status`, `corresponding_author_id`, `issue_id`) 
VALUES ('IJITEST-2026-012', 'ijitest2026012', 'published', @u_markandeya, @issue_id);
SET @s12 = LAST_INSERT_ID();

-- IJITEST-2026-013
INSERT INTO `submissions` (`paper_id`, `slug`, `status`, `corresponding_author_id`, `issue_id`) 
VALUES ('IJITEST-2026-013', 'ijitest2026013', 'published', 'cd2ef493-3626-483a-93c6-8236287bf7a1', @issue_id);
SET @s13 = LAST_INSERT_ID();

-- 3. Insert Versions
INSERT INTO `submission_versions` (`submission_id`, `version_number`, `title`, `abstract`, `keywords`) VALUES
(@s11, 1, 'Green Aquaculture Practices: Promoting Sustainable Aquaculture Techniques to Enhance Productivity While Preserving Marine Ecosystems', 'This article presents a research proposal for an IoT enabled, AI-driven Green Aquaculture framework integrating Recirculating Aquaculture Systems (RAS), Integrated Multi Trophic Aquaculture (IMTA), and edge intelligence. Conventional aquaculture faces pressure from environmental damage and global protein demand. The proposed system utilizes deep learning models, specifically YOLO architectures, for real-time fish behavior monitoring, biomass estimation, and precise feeding control. Central to this framework is the “Self Healing Ecosystem” concept, where machine learning optimizes the balance between fed and extractive species to achieve zero waste discharge. This work aligns with India’s Pradhan Mantri Matsya Sampada Yojana (PMMSY) to move toward a sustainable, high-tech aquaculture model.', '["IoT Sensors","Recirculating Aquaculture Systems (RAS)","Integrated Multi-Trophic Aquaculture (IMTA)","Precision Feeding","Water Quality Prediction","Sustainable Fisheries","Edge Intelligence","Machine Learning"]'),
(@s12, 1, 'Hybrid Quantum Machine Learning and Quantum Compressed Sensing for Robust Channel Estimation in Massive MIMO-OFDM Systems', 'This paper describes a hybrid architecture that combines Quantum Compressed Sensing (QCS) and Quantum Machine Learning (QML) to improve channel prediction in Massive MIMO-OFDM systems. The proposed method addresses the limitations of standard compressed sensing techniques, which rely heavily on strict sparsity assumptions, as well as machine learning models, which require large training datasets. Initially, QCS is used to achieve sparse channel recovery with fewer pilot observations, lowering overhead and improving spectral efficiency. The channel estimate is then revised using a QML-based model that is capable of learning nonlinear channel properties and adapting to dynamic propagation settings. This two-stage architecture allows for increased estimation accuracy in both sparse and non-sparse channel circumstances. The paradigm is notably relevant for the forthcoming 6G communication systems, which operate in high frequency bands with complex fading and noise behaviors. A hybrid loss function is used to optimize sparsity restrictions while also performing learning-based reconstruction. Simulation findings show that the suggested method reduces bit error rates and improves normalized mean square error when compared to standalone QCS and QML methods. Furthermore, the model exhibits robustness to noise and channel fluctuation, making it ideal for practical deployment. The combination of quantum inspired approaches with data-driven learning provides a scalable solution for next-generation wireless networks. In summary, the suggested method finds a balance between computing efficiency and estimation performance, while also opening up new possibilities for integrating model-based and learning-based paradigms into communication system design.', '["Quantum Machine Learning (QML)", "Quantum Compressed Sensing (QCS)", "Massive MIMO-OFDM", "Channel Estimation", "6G Communication", "Sparse Signal Recovery"]'),
(@s13, 1, 'Deep Reinforcement Learning for Dynamic Resource Management in Ephemeral Edge Computing Networks', 'Efficient resource orchestration in modern edge computing deployments is increasingly challenged by node mobility, stochastic workloads, and limited energy budgets. Conventional static and heuristic scheduling methods are fundamentally inadequate for volatile environments such as UAV swarms and vehicular ad hoc networks, where topology and resource availability evolve continuously. This paper proposes a novel adaptive resource management framework grounded in Proximal Policy Optimization (PPO), a state-of-the-art Deep Reinforcement Learning (DRL) algorithm, tailored for ephemeral edge computing scenarios. The resource allocation problem is rigorously formalized as a Markov Decision Process (MDP) that jointly accounts for end-to-end task latency, cumulative energy expenditure, load distribution fairness, and Service Level Agreement (SLA) compliance. Through iterative interaction with a realistic simulation environment encompassing 20 mobile UAV nodes, the PPO agent acquires nuanced allocation policies that balance competing performance objectives. Our key novelty lies in a composite reward signal that explicitly penalizes battery depletion events, discouraging greedy local processing in favor of energy-balanced, network-lifetime-aware decisions. Experimental results demonstrate that the proposed PPO-based framework reduces SLA violations by approximately 30% and extends network operational lifetime by up to 47% compared to Deep Q-Network (DQN) baselines and classical static schedulers.', '["Deep Reinforcement Learning", "Proximal Policy Optimization (PPO)", "Edge Computing", "Dynamic Resource Allocation", "Markov Decision Process", "UAV Networks", "Energy Efficiency", "SLA Compliance"]');

SET @v11 = (SELECT id FROM submission_versions WHERE submission_id = @s11 AND version_number = 1);
SET @v12 = (SELECT id FROM submission_versions WHERE submission_id = @s12 AND version_number = 1);
SET @v13 = (SELECT id FROM submission_versions WHERE submission_id = @s13 AND version_number = 1);

-- 4. Insert Authors
-- 011 Authors
INSERT INTO `submission_authors` (`submission_id`, `name`, `email`, `designation`, `institution`, `is_corresponding`, `order_index`) VALUES
(@s11, 'Dr. S. NagaMallik Raj', 'mallikblue@gmail.com', 'Associate Professor', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 1, 0),
(@s11, 'Nadiminti Raghavendra', 'raghavnadiminti@gmail.com', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 0, 1),
(@s11, 'Malla Mohith Sai', 'mallamohith20@gmail.com', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 0, 2);

-- 012 Authors
INSERT INTO `submission_authors` (`submission_id`, `name`, `email`, `designation`, `institution`, `is_corresponding`, `order_index`) VALUES
(@s12, 'Markandeya Gupta N', 'manasamarkandeya@gmail.com', 'Associate Professor', 'Department of ECE, Sri Sivani college of engineering (A), Srikakulam, India', 1, 0),
(@s12, 'Ch Manohar Kumar', 'manohar@gvpcdpgc.edu.in', 'Associate Professor', 'Department of ECE, Gayatri Vidya Parishad college for Degree and PG Courses (A), Visakhapatnam, India', 0, 1),
(@s12, 'V. Mutyala Naidu', 'vmn90gvd@gmail.com', 'Assistant Professor', 'Department of ECE, Gayatri Vidya Parishad college for Degree and PG Courses (A), Visakhapatnam, India', 0, 2);

-- 013 Authors
INSERT INTO `submission_authors` (`submission_id`, `name`, `email`, `designation`, `institution`, `is_corresponding`, `order_index`) VALUES
(@s13, 'Dr. Ch. Swapna Priya', 'swapnachsp@gmail.com', 'Associate Professor', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 1, 0),
(@s13, 'Mahamed Mastan Jani', 'mdjani1209@gmail.com', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 0, 1),
(@s13, 'Bharath Karthik Mycherla', 'bharathkarthik2006@gmail.com', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 0, 2),
(@s13, 'Surya Teja Medisetty', 'suryatejamedisetty000@gmail.com', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 0, 3),
(@s13, 'Kalpana Pulipati', 'pkalpana1109@gmail.com', 'Final-year B.Tech Student', 'Department of CSE, Vignan’s Institute of Information Technology (A), Visakhapatnam', 0, 4);

-- 5. Insert Files
INSERT INTO `submission_files` (`version_id`, `file_type`, `file_url`, `original_name`) VALUES
(@v11, 'pdf_version', '/uploads/published/IJITEST-2026-011-published.pdf', 'IJITEST-2026-011-published.pdf'),
(@v12, 'pdf_version', '/uploads/published/IJITEST-2026-012-published.pdf', 'IJITEST-2026-012-published.pdf'),
(@v13, 'pdf_version', '/uploads/published/IJITEST-2026-013-published.pdf', 'IJITEST-2026-013-published.pdf');

-- 6. Insert Publications
INSERT INTO `publications` (`submission_id`, `issue_id`, `final_pdf_url`) VALUES
(@s11, @issue_id, '/uploads/published/IJITEST-2026-011-published.pdf'),
(@s12, @issue_id, '/uploads/published/IJITEST-2026-012-published.pdf'),
(@s13, @issue_id, '/uploads/published/IJITEST-2026-013-published.pdf');

-- 7. Update Sequence
UPDATE `settings` SET `setting_value` = '13' WHERE `setting_key` = 'submission_sequence_2026';

COMMIT;
