-- 1. Ensure a Volume/Issue exists for the paper (Run this first)
INSERT INTO volumes_issues (volume_number, issue_number, year, month_range, status)
SELECT 1, 1, 2026, 'Jan - Mar', 'published'
WHERE NOT EXISTS (SELECT 1 FROM volumes_issues WHERE volume_number = 1 AND issue_number = 1 AND year = 2026);

-- 2. Update the sample paper with realistic metadata (Run this second)
-- We use REPLACE INTO to handle both Insert and Update based on the UNIQUE paper_id
REPLACE INTO submissions (
    paper_id, 
    title, 
    abstract, 
    keywords, 
    author_name, 
    author_email, 
    affiliation, 
    status, 
    issue_id
) VALUES (
    'IJITEST-2026-001',
    'A Comprehensive Analysis of Edge Computing Architectures for Real-Time IoT Applications',
    'Edge computing has emerged as a critical paradigm to address the latency and bandwidth constraints of traditional cloud computing in the context of the Internet of Things (IoT). This research presents a comprehensive analysis of various edge computing architectures, evaluating their performance in real-time applications such as industrial automation and smart city infrastructure. We investigate the trade-offs between computational offloading efficiency, energy consumption, and network reliability, providing a framework for selecting optimal architectures based on specific IoT requirements.',
    'Edge Computing, IoT, Distributed Systems, Real-Time Processing, Network Architecture',
    'Indala Mohan Kumar',
    'indalamohankumar@gmail.com',
    'Department of Computer Science and Engineering, GITAM University, Visakhapatnam, India',
    'published',
    (SELECT id FROM volumes_issues WHERE volume_number = 1 AND issue_number = 1 AND year = 2026 LIMIT 1)
);
