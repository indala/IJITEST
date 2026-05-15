export interface BoardMember {
    full_name: string;
    designation: string;
    institute: string;
    email?: string;
    role: string;
    nationality?: string;
    department?: string;
    secondaryEmail?: string;
    profileLink?: string;
    officialAddress?: string;
}

export const staticEditorialBoardMembers: BoardMember[] = [
    {
        full_name: "Dr. Y. Prasanna Kumar",
        designation: "Professor of Mining Engineering",
        department: "School of Mining Engineering",
        institute: "Papua New Guinea University of Technology, Morobe Province",
        role: "editor",
        nationality: "Papua New Guinea",
        email: "prasanna.ky@pnguot.ac.pg",
        profileLink: "https://www.pnguot.ac.pg/school-of-mining-engineering/about-mining-engineering/mining-engineering-staff/",
        officialAddress: "Lae, Morobe Province, Papua New Guinea."
    },
    {
        full_name: "Dr. Sreenu Naik Bhukya",
        designation: "Assistant Professor",
        department: "Department of Computer Science and Engineering",
        institute: "National Institute of Technology Calicut (NITC)",
        role: "editor",
        nationality: "India",
        email: "bsnaik_81@nitc.ac.in",
        profileLink: "https://nitc.ac.in/department/computer-science-amp-engineering/faculty-and-staff/faculty/91d32305-2e1f-489a-b6b2-4f3df5efdb63",
        officialAddress: "CSED #104, NIT Campus (PO), Calicut-67360, Kerala, India"
    },
    {
        full_name: "Prof. Basim Alhadidi",
        designation: "Professor",
        department: "Computer Information Systems Department",
        institute: "Al-Balqa Applied University, Jordan",
        role: "editor",
        nationality: "Jordan",
        email: "b_hadidi@bau.edu.jo",
        profileLink: "https://www.bau.edu.jo/user/@b_hadidi",
        officialAddress: "Al-Salt, Jordan"
    },
    {
        full_name: "Dr. CH. Swapna Priya",
        designation: "Associate Professor",
        department: "Dept of Computer Science Engineering",
        institute: "Vignan's Institute of Information Technology",
        role: "editor",
        nationality: "India",
        email: "swapnavignan@vignaniit.edu.in",
        officialAddress: "Beside VSEZ, Vadlapudi, Duvvada, Visakhapatnam - 530049, Andhra Pradesh, India."
    },
    {
        full_name: "Dr S Nagamallik Raj",
        designation: "Associate Professor",
        department: "Dept of Computer Science Engineering",
        institute: "Vignan's Institute of Information Technology",
        role: "editor",
        nationality: "India",
        email: "mallikrajvignan@vignaniit.edu.in",
        profileLink: "https://vignaniit.irins.org/profile/218684#expertise_information_panel",
        officialAddress: "Beside VSEZ, Vadlapudi, Duvvada, Visakhapatnam - 530049, Andhra Pradesh, India."
    },
    {
        full_name: "Assoc. Prof. Ir. Gs. Ts. Dr. Norsuzila Ya'acob",
        designation: "Professor",
        department: "School of Electrical Engineering",
        institute: "UiTM Shah Alam, Selangor, Malaysia",
        role: "editor",
        nationality: "Malaysia",
        email: "norsuzila@uitm.edu.my",
        profileLink: "https://expert.uitm.edu.my/V2/page-detail.php?id=HFfQ5e+EwsSznaHFJEhCyC/gWPhXPTfTO6N1pYSn4lQ=",
        officialAddress: "T2-A12-6C, School of Electrical Engineering, UiTM Shah Alam, Selangor, Malaysia"
    },
    {
        full_name: "Dr. Mahendra Narla",
        designation: "Assistant Professor",
        department: "Department of Artificial Intelligence and Data Science",
        institute: "G. Pullaiah College of Engineering & Technology (GPCET)",
        role: "editor",
        nationality: "India",
        email: "narlamahendracai@gpcet.ac.in",
        officialAddress: "Nandikotkur Road, Near Venkayapalle, Pasupula Village, Kurnool - 518452, Andhra Pradesh, India."
    },
    {
        full_name: "Dr. Oguz Kucur",
        designation: "Professor",
        department: "Department of Electronics Engineering",
        institute: "Gebze Technical University, Turkey",
        role: "editor",
        nationality: "Turkey",
        email: "okucur@gtu.edu.tr",
        officialAddress: "Block A2, Office: ELM 241, Cumhuriyet, 2254. Sk. No:2, 41400, Turkey"
    },
    {
        full_name: "Dr Somasekhar Borugadda",
        designation: "Professor",
        department: "Electronics and Communication Engineering (ECE)",
        institute: "Anil Neerukonda Institute of Technology and Sciences",
        role: "editor",
        nationality: "India",
        email: "somasekhar.ece@anits.edu.in",
        profileLink: "https://anits.irins.org/profile/291233",
        officialAddress: "Sangivalasa, Bheemunipatnam Mandal, Visakhapatnam District, Andhra Pradesh, India"
    },
    {
        full_name: "Prof. Dr. Emin Anarım",
        designation: "Professor",
        department: "Department of Electrical and Electronic Engineering",
        institute: "Boğaziçi University, Turkey",
        role: "editor",
        nationality: "Turkey",
        email: "anarim@boun.edu.tr",
        officialAddress: "North Campus- Square Block, 34342 Bebek/Istanbul, Turkey"
    },
    {
        full_name: "Razalingah",
        designation: "Professor",
        department: "Faculty of Electrical Engineering",
        institute: "Universiti Teknologi Malaysia (UTM), Malaysia",
        role: "editor",
        nationality: "Malaysia",
        email: "razalingah@utm.my",
        officialAddress: "Skudai, Johor Bahru, Malaysia"
    },
    {
        full_name: "Dr Trinadha Rao Challa",
        designation: "Associate Professor",
        institute: "Miracle Educational Society",
        role: "editor",
        nationality: "India",
        email: "tchalla@miracleeducationalsociety.com",
        profileLink: "",
        officialAddress: "Miracle City, Munjeru Village, Bhogapuram Mandal, Vizianagaram District, Andhra Pradesh, 535216, India"
    },
    {
        full_name: "Dr. K. Murali Krishna",
        designation: "Professor",
        department: "Department of Electronics and Communication Engineering",
        institute: "Vignan's Institute of Information Technology (A)",
        role: "editor",
        nationality: "India",
        email: "muralikrishnadoma@vignan.ac.in",
        officialAddress: "Beside VSEZ, Vadlapudi Post, Duvvada, Gajuwaka, Visakhapatnam - 530049, Andhra Pradesh, India."
    },
    {
        full_name: "Prof. Khan Iftekharuddin",
        designation: "Professor",
        department: "Department of Electrical & Computer Engineering",
        institute: "Old Dominion University, USA",
        role: "editor",
        nationality: "USA",
        email: "kiftekha@odu.edu",
        profileLink: "https://www.odu.edu/directory/khan-iftekharuddin",
        officialAddress: "Frank Batten College of Engineering & Technology, 1210 West 45th Street, Norfolk, VA 23529, USA"
    },
    {
        full_name: "Dr Appalabathula Venkatesh",
        designation: "Assistant Professor",
        department: "Dept of Electrical and Electronic Engineering",
        institute: "Anil Neerukonda Institute of Technology and Sciences",
        role: "editor",
        nationality: "India",
        email: "avenkatesh.eee@anits.edu.in",
        profileLink: "https://anits.irins.org/profile/150637",
        officialAddress: "Sangivalasa, Bheemunipatnam Mandal, Visakhapatnam District, Andhra Pradesh, India"
    },
    {
        full_name: "Dr. Srinivasa Rao Thammada",
        designation: "Associate Professor",
        department: "Department of Computer Science Engineering",
        institute: "GITAM (Deemed to be University)",
        role: "editor",
        nationality: "India",
        email: "sthamada@gitam.edu",
        profileLink: "https://www.gitam.edu/faculty/t-srinivasa-rao",
        officialAddress: "Gandhi Nagar, Rushikonda, Visakhapatnam - 530045, Andhra Pradesh, India."
    },
    {
        full_name: "Dr. Ibrahim Altunabas",
        designation: "Professor",
        department: "Faculty of Electrical and Electronics Engineering",
        institute: "Istanbul Technical University, Turkey",
        role: "editor",
        nationality: "Turkey",
        email: "ibraltunbas@itu.edu.tr",
        officialAddress: "34469, Maslak, İstanbul/TÜRKİYE, Turkey"
    },
    {
        full_name: "Dr. Haris Haralambous",
        designation: "Professor",
        department: "Department of Electrical Engineering, Computer Engineering and Informatics",
        institute: "Frederick University, Cyprus",
        role: "editor",
        nationality: "Cyprus",
        email: "eng.hh@frederick.ac.cy",
        profileLink: "https://frederick.ac.cy/en/about-us/faculty-staff/faculty?view=page&id=108&lid=196",
        officialAddress: "7, Y. Frederickou Str. Pallouriotisa, 1036, Nicosia, Cyprus"
    },
    {
        full_name: "Dr. G Manmadha Rao",
        designation: "Professor & Dean",
        department: "Department of Electronics and Communication Engineering",
        institute: "Anil Neerukonda Institute of Technology and Sciences",
        role: "editor",
        nationality: "India",
        email: "profmanmadharao.ece@anits.edu.in",
        profileLink: "https://anits.irins.org/profile/180280",
        officialAddress: "Sangivalasa, Bheemunipatnam Mandal, Visakhapatnam District, Andhra Pradesh, India"
    },
    {
        full_name: "Dr. GBSR Naidu",
        designation: "Professor",
        department: "Department of Electronics and Communication Engineering",
        institute: "GMRIT deemed to be University",
        role: "editor",
        nationality: "India",
        email: "naiu.gbsr@gmrit.edu.in",
        profileLink: "https://gmrit.edu.in/du/faculty-directory.php?search=&dept=ECE",
        officialAddress: "Srikakulam District, Andhra Pradesh, India"
    },
    {
        full_name: "Dr. M. Satish",
        designation: "Professor",
        department: "Department of Information Technology",
        institute: "GMRIT deemed to be University",
        role: "editor",
        nationality: "India",
        email: "satish.m@gmrit.edu.in",
        profileLink: "https://gmrit.edu.in/du/faculty-directory.php?search=&dept=IT",
        officialAddress: "Srikakulam District, Andhra Pradesh, India"
    },
    {
        full_name: "Mrs. A Bhagya Lakshmi",
        designation: "Assistant Professor",
        department: "Department of Computers and Data Science",
        institute: "Anil Neerukonda Institute of Technology and Sciences",
        role: "editor",
        nationality: "India",
        email: "bhagyalakshmi.csd@anits.edu.in",
        profileLink: "https://anits.irins.org/profile/594758",
        officialAddress: "Sangivalasa, Bheemunipatnam Mandal, Visakhapatnam District, Andhra Pradesh, India"
    }
];
