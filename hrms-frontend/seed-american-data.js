import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

console.log('Generating complete American enterprise dataset in:', dataDir);

// 1. TENANTS
const tenants = [
  {
    id: "tenant-1787291784650",
    name: "Auto Computation",
    slug: "auto-computation",
    status: "ACTIVE",
    logoUrl: "",
    offerLetterExpiryDays: 14,
    annualLeaveAllowance: 24,
    industry: "Software & Cloud Technology",
    countryCode: "US",
    currency: "USD",
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 30,
    timezone: "America/New_York (EST)",
    adminEmail: "admin@auto-computation.com",
    websiteUrl: "https://autocomputation.com",
    consultantCount: 1,
    employeeCount: 6,
    createdAt: "2026-01-15T08:00:00.000Z",
    features: {
      onboarding: true,
      leaveManagement: true,
      attendance: true,
      knowledgeBase: true,
      announcements: true,
      helpDesk: true,
      meetingRooms: true,
      documentVault: true,
      orgStructure: true
    }
  },
  {
    id: "tenant-apex-101",
    name: "Apex Cloud Dynamics",
    slug: "apex-cloud",
    status: "ACTIVE",
    logoUrl: "",
    offerLetterExpiryDays: 14,
    annualLeaveAllowance: 25,
    industry: "Enterprise Cloud & AI Infrastructure",
    countryCode: "US",
    currency: "USD",
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 30,
    timezone: "America/Los_Angeles (PST)",
    adminEmail: "admin@apexcloud.com",
    websiteUrl: "https://apexcloud.io",
    consultantCount: 1,
    employeeCount: 8,
    createdAt: "2026-01-10T09:30:00.000Z",
    features: {
      onboarding: true,
      leaveManagement: true,
      attendance: true,
      knowledgeBase: true,
      announcements: true,
      helpDesk: true,
      meetingRooms: true,
      documentVault: true,
      orgStructure: true
    }
  },
  {
    id: "tenant-horizon-102",
    name: "Horizon BioHealth",
    slug: "horizon-health",
    status: "ACTIVE",
    logoUrl: "",
    offerLetterExpiryDays: 10,
    annualLeaveAllowance: 22,
    industry: "Healthcare & Life Sciences",
    countryCode: "US",
    currency: "USD",
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 30,
    timezone: "America/Chicago (CST)",
    adminEmail: "admin@horizonbiohealth.com",
    websiteUrl: "https://horizonbiohealth.com",
    consultantCount: 1,
    employeeCount: 6,
    createdAt: "2026-02-01T10:15:00.000Z",
    features: {
      onboarding: true,
      leaveManagement: true,
      attendance: true,
      knowledgeBase: true,
      announcements: true,
      helpDesk: true,
      meetingRooms: true,
      documentVault: true,
      orgStructure: true
    }
  },
  {
    id: "tenant-vanguard-103",
    name: "Vanguard Financial Labs",
    slug: "vanguard-fintech",
    status: "ACTIVE",
    logoUrl: "",
    offerLetterExpiryDays: 7,
    annualLeaveAllowance: 26,
    industry: "Financial Services & Quantitative Trading",
    countryCode: "US",
    currency: "USD",
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 30,
    timezone: "America/New_York (EST)",
    adminEmail: "admin@vanguardfin.com",
    websiteUrl: "https://vanguardfinlabs.com",
    consultantCount: 1,
    employeeCount: 6,
    createdAt: "2026-02-15T11:00:00.000Z",
    features: {
      onboarding: true,
      leaveManagement: true,
      attendance: true,
      knowledgeBase: true,
      announcements: true,
      helpDesk: true,
      meetingRooms: true,
      documentVault: true,
      orgStructure: true
    }
  }
];

// 2. USERS
const users = [
  {
    id: "user-superadmin",
    name: "Melenie",
    email: "admin@Peopleworkplaces.hr",
    password: "password123",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    phone: "+1 (212) 555-0100"
  },
  {
    id: "user-consultant-1",
    name: "Alexander Reed",
    email: "consultant@Peopleworkplaces.hr",
    password: "password123",
    role: "CONSULTANT",
    assignedTenantIds: ["tenant-1787291784650", "tenant-apex-101", "tenant-horizon-102", "tenant-vanguard-103"],
    status: "ACTIVE",
    phone: "+1 (415) 555-0112"
  },
  // Auto Computation Users
  {
    id: "user-admin-tenant-1787291784650",
    name: "Auto Computation Admin",
    email: "admin@auto-computation.com",
    password: "Safari@1234",
    role: "TENANT_ADMIN",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (212) 555-0120"
  },
  {
    id: "user-emp-ac-1",
    name: "David Miller",
    email: "david.miller@autocomputation.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (212) 555-0131"
  },
  {
    id: "user-emp-ac-2",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@autocomputation.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (212) 555-0132"
  },
  {
    id: "user-emp-ac-3",
    name: "Michael Chang",
    email: "michael.chang@autocomputation.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (415) 555-0133"
  },
  {
    id: "user-emp-ac-4",
    name: "Emily Watson",
    email: "emily.watson@autocomputation.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (512) 555-0134"
  },
  {
    id: "user-emp-ac-5",
    name: "Robert Davis",
    email: "robert.davis@autocomputation.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (312) 555-0135"
  },
  {
    id: "user-emp-ac-6",
    name: "Jessica Martinez",
    email: "jessica.martinez@autocomputation.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-1787291784650",
    status: "ACTIVE",
    phone: "+1 (206) 555-0136"
  },
  // Apex Cloud Users
  {
    id: "user-admin-apex",
    name: "Apex Platform Admin",
    email: "admin@apexcloud.com",
    password: "Apex@1234",
    role: "TENANT_ADMIN",
    tenantId: "tenant-apex-101",
    status: "ACTIVE",
    phone: "+1 (415) 555-0140"
  },
  {
    id: "user-emp-apex-1",
    name: "Marcus Vance",
    email: "marcus.vance@apexcloud.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-apex-101",
    status: "ACTIVE",
    phone: "+1 (415) 555-0141"
  },
  {
    id: "user-emp-apex-2",
    name: "Elena Rostova",
    email: "elena.rostova@apexcloud.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-apex-101",
    status: "ACTIVE",
    phone: "+1 (415) 555-0142"
  },
  {
    id: "user-emp-apex-3",
    name: "Brandon Cole",
    email: "brandon.cole@apexcloud.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-apex-101",
    status: "ACTIVE",
    phone: "+1 (206) 555-0143"
  },
  {
    id: "user-emp-apex-4",
    name: "Rachel Green",
    email: "rachel.green@apexcloud.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-apex-101",
    status: "ACTIVE",
    phone: "+1 (512) 555-0144"
  },
  // Horizon BioHealth Users
  {
    id: "user-admin-horizon",
    name: "Horizon BioHealth Admin",
    email: "admin@horizonbiohealth.com",
    password: "Horizon@1234",
    role: "TENANT_ADMIN",
    tenantId: "tenant-horizon-102",
    status: "ACTIVE",
    phone: "+1 (312) 555-0150"
  },
  {
    id: "user-emp-hz-1",
    name: "Dr. Evelyn Carter",
    email: "evelyn.carter@horizonbiohealth.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-horizon-102",
    status: "ACTIVE",
    phone: "+1 (312) 555-0151"
  },
  {
    id: "user-emp-hz-2",
    name: "Jonathan Price",
    email: "jonathan.price@horizonbiohealth.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-horizon-102",
    status: "ACTIVE",
    phone: "+1 (617) 555-0152"
  },
  // Vanguard Financial Users
  {
    id: "user-admin-vanguard",
    name: "Vanguard Admin",
    email: "admin@vanguardfin.com",
    password: "Vanguard@1234",
    role: "TENANT_ADMIN",
    tenantId: "tenant-vanguard-103",
    status: "ACTIVE",
    phone: "+1 (212) 555-0160"
  },
  {
    id: "user-emp-vg-1",
    name: "Charlotte Hayes",
    email: "charlotte.hayes@vanguardfin.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-vanguard-103",
    status: "ACTIVE",
    phone: "+1 (212) 555-0161"
  },
  {
    id: "user-emp-vg-2",
    name: "Christopher Taylor",
    email: "christopher.taylor@vanguardfin.com",
    password: "Password@123",
    role: "EMPLOYEE",
    tenantId: "tenant-vanguard-103",
    status: "ACTIVE",
    phone: "+1 (212) 555-0162"
  }
];

// 3. REGIONS
const regions = [];
const regionDefs = [
  { code: "US-NY", name: "New York HQ (Manhattan)", timeZone: "America/New_York", locale: "en-US" },
  { code: "US-CA", name: "Silicon Valley Tech Center (San Francisco)", timeZone: "America/Los_Angeles", locale: "en-US" },
  { code: "US-TX", name: "Austin Campus (Texas)", timeZone: "America/Chicago", locale: "en-US" },
  { code: "US-IL", name: "Chicago Financial Center", timeZone: "America/Chicago", locale: "en-US" },
  { code: "US-WA", name: "Seattle Engineering Hub", timeZone: "America/Los_Angeles", locale: "en-US" },
  { code: "US-MA", name: "Boston Innovation Lab", timeZone: "America/New_York", locale: "en-US" }
];

tenants.forEach((t) => {
  regionDefs.forEach((rd, idx) => {
    regions.push({
      id: `reg-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      name: rd.name,
      countryCode: "US",
      timeZone: rd.timeZone,
      locale: rd.locale,
      status: "ACTIVE"
    });
  });
});

// 4. DEPARTMENTS
const departments = [];
const deptDefs = [
  { name: "Executive & Leadership", desc: "C-Suite, Strategy and Corporate Governance" },
  { name: "Cloud Engineering & Architecture", desc: "Core Platform, Backend Services & Scalability" },
  { name: "Artificial Intelligence & Data Science", desc: "Machine Learning Models, NLP & Data Analytics" },
  { name: "Product Design & UX Research", desc: "User Experience, UI Systems & Customer Journey" },
  { name: "Growth, Marketing & Brand", desc: "Digital Acquisition, Content Marketing & PR" },
  { name: "Enterprise Sales & Partnerships", desc: "B2B Accounts, Solution Architecture & Sales" },
  { name: "People Operations & HR", desc: "Talent Acquisition, Total Rewards & Employee Relations" },
  { name: "Finance, Tax & Legal Compliance", desc: "Financial Planning, Accounting, Payroll & Legal" },
  { name: "DevOps & Information Security", desc: "Cloud Infrastructure, SOC2 Compliance & Cyber Defense" }
];

tenants.forEach((t) => {
  deptDefs.forEach((dd, idx) => {
    departments.push({
      id: `dept-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      name: dd.name,
      description: dd.desc,
      parentDepartmentId: idx > 0 ? `dept-${t.slug}-1` : null,
      headEmployeeId: null,
      status: "ACTIVE"
    });
  });
});

// 5. DESIGNATIONS
const designations = [];
const desigDefs = [
  { name: "Chief Executive Officer (CEO)", deptIdx: 0 },
  { name: "Chief Technology Officer (CTO)", deptIdx: 1 },
  { name: "VP of Engineering", deptIdx: 1 },
  { name: "Principal Cloud Architect", deptIdx: 1 },
  { name: "Senior Staff Software Engineer", deptIdx: 1 },
  { name: "Lead AI/ML Research Scientist", deptIdx: 2 },
  { name: "Staff Machine Learning Engineer", deptIdx: 2 },
  { name: "Principal Product Designer", deptIdx: 3 },
  { name: "Senior UX Researcher", deptIdx: 3 },
  { name: "VP of Growth & Marketing", deptIdx: 4 },
  { name: "Enterprise Sales Director", deptIdx: 5 },
  { name: "Director of People & Culture", deptIdx: 6 },
  { name: "Senior HR Business Partner", deptIdx: 6 },
  { name: "Chief Financial Officer (CFO)", deptIdx: 7 },
  { name: "Senior Financial Analyst & Controller", deptIdx: 7 },
  { name: "Lead Cloud Security & DevOps Architect", deptIdx: 8 }
];

tenants.forEach((t) => {
  desigDefs.forEach((ds, idx) => {
    designations.push({
      id: `desig-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      name: ds.name,
      description: `Core ${ds.name} role within ${t.name}`,
      departmentId: `dept-${t.slug}-${ds.deptIdx + 1}`,
      status: "ACTIVE"
    });
  });
});

// 6. EMPLOYEES
const employees = [
  // Auto Computation Employees
  {
    id: "emp-ac-1",
    tenantId: "tenant-1787291784650",
    employeeId: "EMP-1001",
    name: "David Miller",
    email: "david.miller@autocomputation.com",
    phone: "+1 (212) 555-0131",
    departmentId: "dept-auto-computation-2",
    designationId: "desig-auto-computation-4",
    regionId: "reg-auto-computation-1",
    managerId: null,
    joiningDate: "2024-03-15",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1988-06-22",
    gender: "Male",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "O+",
    emergencyContactName: "Amanda Miller",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (212) 555-0988",
    currentAddress: "150 Central Park West, Apt 14B, New York, NY 10023",
    permanentAddress: "150 Central Park West, Apt 14B, New York, NY 10023",
    employmentType: "Full Time",
    confirmationDate: "2024-06-15",
    workLocation: "New York HQ",
    teamName: "Core Platform Architecture",
    skills: ["Go", "Kubernetes", "AWS", "Distributed Systems", "PostgreSQL", "Kafka"],
    ctcAnnual: 220000,
    basicSalary: 180000,
    variablePay: 40000,
    allowances: 15000,
    paymentMode: "Direct Deposit",
    bankName: "JPMorgan Chase Bank, N.A.",
    bankAccountNumber: "4401892837",
    ifscRoutingCode: "021000021"
  },
  {
    id: "emp-ac-2",
    tenantId: "tenant-1787291784650",
    employeeId: "EMP-1002",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@autocomputation.com",
    phone: "+1 (212) 555-0132",
    departmentId: "dept-auto-computation-7",
    designationId: "desig-auto-computation-12",
    regionId: "reg-auto-computation-1",
    managerId: null,
    joiningDate: "2024-01-10",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1991-09-14",
    gender: "Female",
    maritalStatus: "Single",
    nationality: "American",
    bloodGroup: "A+",
    emergencyContactName: "Katherine Jenkins",
    emergencyContactRelation: "Mother",
    emergencyContactPhone: "+1 (212) 555-0455",
    currentAddress: "420 East 54th Street, New York, NY 10022",
    permanentAddress: "420 East 54th Street, New York, NY 10022",
    employmentType: "Full Time",
    confirmationDate: "2024-04-10",
    workLocation: "New York HQ",
    teamName: "People & Organization",
    skills: ["HR Strategy", "Talent Acquisition", "Compensation & Benefits", "US Labor Law", "Performance Coaching"],
    ctcAnnual: 165000,
    basicSalary: 140000,
    variablePay: 25000,
    allowances: 12000,
    paymentMode: "Direct Deposit",
    bankName: "Bank of America",
    bankAccountNumber: "9823471029",
    ifscRoutingCode: "026009593"
  },
  {
    id: "emp-ac-3",
    tenantId: "tenant-1787291784650",
    employeeId: "EMP-1003",
    name: "Michael Chang",
    email: "michael.chang@autocomputation.com",
    phone: "+1 (415) 555-0133",
    departmentId: "dept-auto-computation-2",
    designationId: "desig-auto-computation-5",
    regionId: "reg-auto-computation-2",
    managerId: "emp-ac-1",
    joiningDate: "2024-05-20",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1994-02-18",
    gender: "Male",
    maritalStatus: "Single",
    nationality: "American",
    bloodGroup: "B+",
    emergencyContactName: "Grace Chang",
    emergencyContactRelation: "Sister",
    emergencyContactPhone: "+1 (415) 555-0722",
    currentAddress: "550 Battery St, San Francisco, CA 94111",
    permanentAddress: "550 Battery St, San Francisco, CA 94111",
    employmentType: "Full Time",
    confirmationDate: "2024-08-20",
    workLocation: "San Francisco Hub",
    teamName: "Backend Services",
    skills: ["TypeScript", "Node.js", "React", "GraphQL", "Redis", "Docker"],
    ctcAnnual: 175000,
    basicSalary: 150000,
    variablePay: 25000,
    allowances: 12000,
    paymentMode: "Direct Deposit",
    bankName: "Wells Fargo Bank, N.A.",
    bankAccountNumber: "1290384756",
    ifscRoutingCode: "121000247"
  },
  {
    id: "emp-ac-4",
    tenantId: "tenant-1787291784650",
    employeeId: "EMP-1004",
    name: "Emily Watson",
    email: "emily.watson@autocomputation.com",
    phone: "+1 (512) 555-0134",
    departmentId: "dept-auto-computation-4",
    designationId: "desig-auto-computation-8",
    regionId: "reg-auto-computation-3",
    managerId: "emp-ac-1",
    joiningDate: "2024-06-01",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1993-11-30",
    gender: "Female",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "O-",
    emergencyContactName: "Daniel Watson",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (512) 555-0811",
    currentAddress: "1204 South Congress Ave, Austin, TX 78704",
    permanentAddress: "1204 South Congress Ave, Austin, TX 78704",
    employmentType: "Full Time",
    confirmationDate: "2024-09-01",
    workLocation: "Austin Campus",
    teamName: "Product Experience",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Interaction Design"],
    ctcAnnual: 160000,
    basicSalary: 135000,
    variablePay: 25000,
    allowances: 10000,
    paymentMode: "Direct Deposit",
    bankName: "Citibank, N.A.",
    bankAccountNumber: "7729103847",
    ifscRoutingCode: "021000089"
  },
  {
    id: "emp-ac-5",
    tenantId: "tenant-1787291784650",
    employeeId: "EMP-1005",
    name: "Robert Davis",
    email: "robert.davis@autocomputation.com",
    phone: "+1 (312) 555-0135",
    departmentId: "dept-auto-computation-8",
    designationId: "desig-auto-computation-15",
    regionId: "reg-auto-computation-4",
    managerId: null,
    joiningDate: "2023-11-15",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1985-04-12",
    gender: "Male",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "AB+",
    emergencyContactName: "Claire Davis",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (312) 555-0933",
    currentAddress: "300 North LaSalle St, Chicago, IL 60654",
    permanentAddress: "300 North LaSalle St, Chicago, IL 60654",
    employmentType: "Full Time",
    confirmationDate: "2024-02-15",
    workLocation: "Chicago Office",
    teamName: "Financial Strategy",
    skills: ["Financial Modeling", "GAAP Compliance", "FP&A", "SaaS Metrics", "Tax Planning"],
    ctcAnnual: 190000,
    basicSalary: 160000,
    variablePay: 30000,
    allowances: 14000,
    paymentMode: "Direct Deposit",
    bankName: "Northern Trust",
    bankAccountNumber: "5519283746",
    ifscRoutingCode: "071000152"
  },
  {
    id: "emp-ac-6",
    tenantId: "tenant-1787291784650",
    employeeId: "EMP-1006",
    name: "Jessica Martinez",
    email: "jessica.martinez@autocomputation.com",
    phone: "+1 (206) 555-0136",
    departmentId: "dept-auto-computation-9",
    designationId: "desig-auto-computation-16",
    regionId: "reg-auto-computation-5",
    managerId: "emp-ac-1",
    joiningDate: "2024-08-01",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1996-07-25",
    gender: "Female",
    maritalStatus: "Single",
    nationality: "American",
    bloodGroup: "A-",
    emergencyContactName: "Carlos Martinez",
    emergencyContactRelation: "Father",
    emergencyContactPhone: "+1 (206) 555-0644",
    currentAddress: "1918 8th Ave, Seattle, WA 98101",
    permanentAddress: "1918 8th Ave, Seattle, WA 98101",
    employmentType: "Full Time",
    confirmationDate: "2024-11-01",
    workLocation: "Seattle Hub",
    teamName: "DevOps & Infrastructure",
    skills: ["Terraform", "AWS CloudFormation", "CI/CD", "Prometheus", "Kubernetes", "Linux"],
    ctcAnnual: 155000,
    basicSalary: 130000,
    variablePay: 25000,
    allowances: 10000,
    paymentMode: "Direct Deposit",
    bankName: "Chase Bank",
    bankAccountNumber: "8829103845",
    ifscRoutingCode: "021000021"
  },

  // Apex Cloud Dynamics Employees
  {
    id: "emp-apex-1",
    tenantId: "tenant-apex-101",
    employeeId: "APEX-2001",
    name: "Marcus Vance",
    email: "marcus.vance@apexcloud.com",
    phone: "+1 (415) 555-0141",
    departmentId: "dept-apex-cloud-2",
    designationId: "desig-apex-cloud-2",
    regionId: "reg-apex-cloud-2",
    managerId: null,
    joiningDate: "2023-01-15",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1984-12-05",
    gender: "Male",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "O+",
    emergencyContactName: "Sarah Vance",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (415) 555-0399",
    currentAddress: "220 Montgomery St, San Francisco, CA 94104",
    permanentAddress: "220 Montgomery St, San Francisco, CA 94104",
    employmentType: "Full Time",
    confirmationDate: "2023-04-15",
    workLocation: "Silicon Valley Tech Center",
    teamName: "Engineering Leadership",
    skills: ["Cloud Architecture", "Distributed Computing", "Executive Leadership", "AI Strategy", "Kubernetes"],
    ctcAnnual: 285000,
    basicSalary: 230000,
    variablePay: 55000,
    allowances: 20000,
    paymentMode: "Direct Deposit",
    bankName: "Silicon Valley Bank (First Citizens)",
    bankAccountNumber: "3301928475",
    ifscRoutingCode: "121140399"
  },
  {
    id: "emp-apex-2",
    tenantId: "tenant-apex-101",
    employeeId: "APEX-2002",
    name: "Elena Rostova",
    email: "elena.rostova@apexcloud.com",
    phone: "+1 (415) 555-0142",
    departmentId: "dept-apex-cloud-3",
    designationId: "desig-apex-cloud-6",
    regionId: "reg-apex-cloud-2",
    managerId: "emp-apex-1",
    joiningDate: "2023-06-01",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1990-03-28",
    gender: "Female",
    maritalStatus: "Single",
    nationality: "American",
    bloodGroup: "A+",
    emergencyContactName: "Victor Rostov",
    emergencyContactRelation: "Brother",
    emergencyContactPhone: "+1 (415) 555-0914",
    currentAddress: "101 California St, San Francisco, CA 94111",
    permanentAddress: "101 California St, San Francisco, CA 94111",
    employmentType: "Full Time",
    confirmationDate: "2023-09-01",
    workLocation: "Silicon Valley Tech Center",
    teamName: "AI Research",
    skills: ["PyTorch", "LLMs", "TensorFlow", "CUDA", "Python", "Deep Learning"],
    ctcAnnual: 240000,
    basicSalary: 195000,
    variablePay: 45000,
    allowances: 18000,
    paymentMode: "Direct Deposit",
    bankName: "Bank of America",
    bankAccountNumber: "9910293847",
    ifscRoutingCode: "026009593"
  },
  {
    id: "emp-apex-3",
    tenantId: "tenant-apex-101",
    employeeId: "APEX-2003",
    name: "Brandon Cole",
    email: "brandon.cole@apexcloud.com",
    phone: "+1 (206) 555-0143",
    departmentId: "dept-apex-cloud-9",
    designationId: "desig-apex-cloud-16",
    regionId: "reg-apex-cloud-5",
    managerId: "emp-apex-1",
    joiningDate: "2024-02-15",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1992-10-10",
    gender: "Male",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "B+",
    emergencyContactName: "Laura Cole",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (206) 555-0832",
    currentAddress: "500 Pine St, Seattle, WA 98101",
    permanentAddress: "500 Pine St, Seattle, WA 98101",
    employmentType: "Full Time",
    confirmationDate: "2024-05-15",
    workLocation: "Seattle Engineering Hub",
    teamName: "Security Operations",
    skills: ["SOC2 Compliance", "Cloud Security", "Zero Trust Architecture", "AWS IAM", "SIEM"],
    ctcAnnual: 195000,
    basicSalary: 165000,
    variablePay: 30000,
    allowances: 15000,
    paymentMode: "Direct Deposit",
    bankName: "Wells Fargo",
    bankAccountNumber: "4491029384",
    ifscRoutingCode: "121000247"
  },
  {
    id: "emp-apex-4",
    tenantId: "tenant-apex-101",
    employeeId: "APEX-2004",
    name: "Rachel Green",
    email: "rachel.green@apexcloud.com",
    phone: "+1 (512) 555-0144",
    departmentId: "dept-apex-cloud-5",
    designationId: "desig-apex-cloud-10",
    regionId: "reg-apex-cloud-3",
    managerId: null,
    joiningDate: "2023-10-01",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1989-08-19",
    gender: "Female",
    maritalStatus: "Single",
    nationality: "American",
    bloodGroup: "O+",
    emergencyContactName: "Monica Geller",
    emergencyContactRelation: "Friend",
    emergencyContactPhone: "+1 (512) 555-0199",
    currentAddress: "100 Congress Ave, Austin, TX 78701",
    permanentAddress: "100 Congress Ave, Austin, TX 78701",
    employmentType: "Full Time",
    confirmationDate: "2024-01-01",
    workLocation: "Austin Campus",
    teamName: "Marketing & Growth",
    skills: ["Brand Strategy", "Demand Generation", "Product Marketing", "PPC", "Enterprise PR"],
    ctcAnnual: 185000,
    basicSalary: 150000,
    variablePay: 35000,
    allowances: 14000,
    paymentMode: "Direct Deposit",
    bankName: "Chase Bank",
    bankAccountNumber: "7728192038",
    ifscRoutingCode: "021000021"
  },

  // Horizon BioHealth Employees
  {
    id: "emp-hz-1",
    tenantId: "tenant-horizon-102",
    employeeId: "BIO-3001",
    name: "Dr. Evelyn Carter",
    email: "evelyn.carter@horizonbiohealth.com",
    phone: "+1 (312) 555-0151",
    departmentId: "dept-horizon-health-1",
    designationId: "desig-horizon-health-1",
    regionId: "reg-horizon-health-4",
    managerId: null,
    joiningDate: "2023-04-01",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1982-11-12",
    gender: "Female",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "A-",
    emergencyContactName: "Dr. Thomas Carter",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (312) 555-0944",
    currentAddress: "676 North Michigan Ave, Chicago, IL 60611",
    permanentAddress: "676 North Michigan Ave, Chicago, IL 60611",
    employmentType: "Full Time",
    confirmationDate: "2023-07-01",
    workLocation: "Chicago Financial Center",
    teamName: "BioHealth Executive",
    skills: ["Genomics", "FDA Clinical Trials", "Biotech Strategy", "Healthcare Informatics", "Clinical Compliance"],
    ctcAnnual: 310000,
    basicSalary: 250000,
    variablePay: 60000,
    allowances: 25000,
    paymentMode: "Direct Deposit",
    bankName: "Northern Trust",
    bankAccountNumber: "1192837465",
    ifscRoutingCode: "071000152"
  },
  {
    id: "emp-hz-2",
    tenantId: "tenant-horizon-102",
    employeeId: "BIO-3002",
    name: "Jonathan Price",
    email: "jonathan.price@horizonbiohealth.com",
    phone: "+1 (617) 555-0152",
    departmentId: "dept-horizon-health-2",
    designationId: "desig-horizon-health-4",
    regionId: "reg-horizon-health-6",
    managerId: "emp-hz-1",
    joiningDate: "2024-03-01",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1990-05-14",
    gender: "Male",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "O+",
    emergencyContactName: "Melissa Price",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (617) 555-0728",
    currentAddress: "400 Technology Square, Cambridge, MA 02139",
    permanentAddress: "400 Technology Square, Cambridge, MA 02139",
    employmentType: "Full Time",
    confirmationDate: "2024-06-01",
    workLocation: "Boston Innovation Lab",
    teamName: "BioInformatics Platform",
    skills: ["Python", "R", "BioInformatics", "HIPAA Cloud Security", "HL7/FHIR", "PostgreSQL"],
    ctcAnnual: 185000,
    basicSalary: 155000,
    variablePay: 30000,
    allowances: 12000,
    paymentMode: "Direct Deposit",
    bankName: "State Street Bank",
    bankAccountNumber: "6629103847",
    ifscRoutingCode: "011000028"
  },

  // Vanguard Financial Labs Employees
  {
    id: "emp-vg-1",
    tenantId: "tenant-vanguard-103",
    employeeId: "VAN-4001",
    name: "Charlotte Hayes",
    email: "charlotte.hayes@vanguardfin.com",
    phone: "+1 (212) 555-0161",
    departmentId: "dept-vanguard-fintech-8",
    designationId: "desig-vanguard-fintech-14",
    regionId: "reg-vanguard-fintech-1",
    managerId: null,
    joiningDate: "2023-05-15",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1986-09-02",
    gender: "Female",
    maritalStatus: "Married",
    nationality: "American",
    bloodGroup: "B-",
    emergencyContactName: "William Hayes",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "+1 (212) 555-0377",
    currentAddress: "200 Vesey Street, New York, NY 10281",
    permanentAddress: "200 Vesey Street, New York, NY 10281",
    employmentType: "Full Time",
    confirmationDate: "2023-08-15",
    workLocation: "New York HQ (Manhattan)",
    teamName: "Quantitative Finance",
    skills: ["Algorithmic Trading", "Risk Management", "FINRA Compliance", "Stochastic Calculus", "C++", "Python"],
    ctcAnnual: 275000,
    basicSalary: 210000,
    variablePay: 65000,
    allowances: 20000,
    paymentMode: "Direct Deposit",
    bankName: "Goldman Sachs Bank USA",
    bankAccountNumber: "7719203847",
    ifscRoutingCode: "021000089"
  },
  {
    id: "emp-vg-2",
    tenantId: "tenant-vanguard-103",
    employeeId: "VAN-4002",
    name: "Christopher Taylor",
    email: "christopher.taylor@vanguardfin.com",
    phone: "+1 (212) 555-0162",
    departmentId: "dept-vanguard-fintech-2",
    designationId: "desig-vanguard-fintech-5",
    regionId: "reg-vanguard-fintech-1",
    managerId: "emp-vg-1",
    joiningDate: "2024-01-20",
    employmentStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "1992-04-18",
    gender: "Male",
    maritalStatus: "Single",
    nationality: "American",
    bloodGroup: "O+",
    emergencyContactName: "Patricia Taylor",
    emergencyContactRelation: "Mother",
    emergencyContactPhone: "+1 (212) 555-0899",
    currentAddress: "55 Water St, New York, NY 10041",
    permanentAddress: "55 Water St, New York, NY 10041",
    employmentType: "Full Time",
    confirmationDate: "2024-04-20",
    workLocation: "New York HQ (Manhattan)",
    teamName: "Low-Latency Engine",
    skills: ["C++20", "Ultra Low Latency Systems", "Linux Kernel Optimization", "FPGA", "Python"],
    ctcAnnual: 235000,
    basicSalary: 185000,
    variablePay: 50000,
    allowances: 18000,
    paymentMode: "Direct Deposit",
    bankName: "Morgan Stanley Private Bank",
    bankAccountNumber: "8829104729",
    ifscRoutingCode: "026013673"
  }
];

// 7. BUILDINGS & 8. ROOMS
const buildings = [];
const rooms = [];
const buildingDefs = [
  { name: "One Manhattan West Tower", address: "395 9th Ave, New York, NY 10001", floors: 67 },
  { name: "Salesforce Tower Silicon Center", address: "415 Mission St, San Francisco, CA 94105", floors: 61 },
  { name: "Silicon Hills Technology Complex", address: "500 West 2nd St, Austin, TX 78701", floors: 29 },
  { name: "Willis Innovation Plaza", address: "233 S Wacker Dr, Chicago, IL 60606", floors: 110 }
];

const roomTemplate = [
  { name: "Apollo Executive Boardroom", floor: 42, capacity: 24, facilities: ["4K Telepresence Video Wall", "Zoom Rooms Integration", "Wireless Boundary Mics", "Executive Catering Bar"] },
  { name: "Discovery Strategic Room", floor: 38, capacity: 16, facilities: ["Dual 85-inch Smart Displays", "Digital Whiteboard", "Conference Polycom", "High-Speed Fiber Wi-Fi 7"] },
  { name: "Endeavour Collaboration Hub", floor: 35, capacity: 10, facilities: ["Ultra-wide Curved Display", "Video Conference Bar", "Acoustic Noise Isolation"] },
  { name: "Voyager Design & UX Lab", floor: 35, capacity: 8, facilities: ["Touchscreen Whiteboard", "AirPlay Screen Cast", "Wireless Microphones"] },
  { name: "Falcon Brainstorming Pod", floor: 20, capacity: 6, facilities: ["Interactive Digital Board", "Webcam & Speakerphone", "Standing Desk Setup"] }
];

tenants.forEach((t) => {
  buildingDefs.forEach((b, bIdx) => {
    const bId = `bld-${t.slug}-${bIdx + 1}`;
    buildings.push({
      id: bId,
      tenantId: t.id,
      name: b.name,
      address: b.address,
      floors: b.floors,
      status: "ACTIVE"
    });

    roomTemplate.forEach((r, rIdx) => {
      rooms.push({
        id: `room-${t.slug}-${bIdx + 1}-${rIdx + 1}`,
        tenantId: t.id,
        buildingId: bId,
        buildingName: b.name,
        floor: r.floor,
        name: `${r.name} (${b.name.split(' ')[0]})`,
        capacity: r.capacity,
        facilities: r.facilities,
        status: "ACTIVE"
      });
    });
  });
});

// 9. RESERVATIONS
const reservations = [
  {
    id: "res-ac-1",
    tenantId: "tenant-1787291784650",
    roomId: "room-auto-computation-1-1",
    roomName: "Apollo Executive Boardroom (One)",
    reservedById: "emp-ac-1",
    reservedByName: "David Miller",
    title: "Q3 Enterprise Architecture & Cloud Scale Review",
    startAt: "2026-08-25T14:00:00.000Z",
    endAt: "2026-08-25T16:00:00.000Z",
    status: "CONFIRMED"
  },
  {
    id: "res-ac-2",
    tenantId: "tenant-1787291784650",
    roomId: "room-auto-computation-1-2",
    roomName: "Discovery Strategic Room (One)",
    reservedById: "emp-ac-2",
    reservedByName: "Sarah Jenkins",
    title: "All-Hands Culture & Q3 Benefits Townhall Prep",
    startAt: "2026-08-26T10:00:00.000Z",
    endAt: "2026-08-26T11:30:00.000Z",
    status: "CONFIRMED"
  },
  {
    id: "res-apex-1",
    tenantId: "tenant-apex-101",
    roomId: "room-apex-cloud-2-1",
    roomName: "Apollo Executive Boardroom (Salesforce)",
    reservedById: "emp-apex-1",
    reservedByName: "Marcus Vance",
    title: "Silicon Valley AI LLM Strategy & Investor Sync",
    startAt: "2026-08-28T15:00:00.000Z",
    endAt: "2026-08-28T17:00:00.000Z",
    status: "CONFIRMED"
  }
];

// 10. LEAVE TYPES
const leaveTypes = [];
const leaveTypeDefs = [
  { name: "Paid Time Off (PTO / Vacation)", code: "PTO", category: "PAID", desc: "Annual flexible vacation and personal time off.", annual: 20, monthly: 1.67, maxConsecutive: 15, carryForward: 5 },
  { name: "Sick & Medical Leave", code: "SICK", category: "SICK", desc: "For personal illness, medical appointments, and immediate care.", annual: 10, monthly: 0.83, maxConsecutive: 5, carryForward: 0 },
  { name: "Parental & Bonding Leave", code: "PARENTAL", category: "PARENTAL", desc: "Fully paid parental leave for newborn birth, adoption, or foster placement.", annual: 60, monthly: 5.0, maxConsecutive: 60, carryForward: 0 },
  { name: "Floating & Cultural Holiday", code: "FLOAT", category: "CASUAL", desc: "Personal floating days for cultural, religious, or birthday celebrations.", annual: 3, monthly: 0.25, maxConsecutive: 2, carryForward: 0 },
  { name: "Bereavement & Compassion Leave", code: "BEREAVE", category: "PAID", desc: "Paid compassionate leave for the loss of an immediate family member.", annual: 5, monthly: 0, maxConsecutive: 5, carryForward: 0 },
  { name: "Jury Duty & Civic Service", code: "JURY", category: "PAID", desc: "Paid leave to fulfill mandatory US civic jury duty summons.", annual: 10, monthly: 0, maxConsecutive: 10, carryForward: 0 }
];

tenants.forEach((t) => {
  leaveTypeDefs.forEach((lt, idx) => {
    leaveTypes.push({
      id: `lt-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      name: lt.name,
      code: lt.code,
      category: lt.category,
      description: lt.desc,
      requiresDoc: lt.code === "SICK" || lt.code === "JURY",
      status: "ACTIVE",
      annualAllowance: lt.annual,
      monthlyCredit: lt.monthly,
      maxConsecutiveDays: lt.maxConsecutive,
      carryForwardLimit: lt.carryForward
    });
  });
});

// 11. LEAVE REQUESTS
const leaveRequests = [
  {
    id: "lr-ac-101",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-3",
    employeeName: "Michael Chang",
    leaveTypeId: "lt-auto-computation-1",
    leaveTypeName: "Paid Time Off (PTO / Vacation)",
    startDate: "2026-09-01",
    endDate: "2026-09-05",
    requestedDays: 5,
    reason: "Late summer vacation with family in Lake Tahoe.",
    status: "APPROVED",
    appliedDate: "2026-08-10"
  },
  {
    id: "lr-ac-102",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-4",
    employeeName: "Emily Watson",
    leaveTypeId: "lt-auto-computation-2",
    leaveTypeName: "Sick & Medical Leave",
    startDate: "2026-08-18",
    endDate: "2026-08-19",
    requestedDays: 2,
    reason: "Dental procedure recovery and doctor advised rest.",
    status: "APPROVED",
    appliedDate: "2026-08-15"
  },
  {
    id: "lr-ac-103",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-6",
    employeeName: "Jessica Martinez",
    leaveTypeId: "lt-auto-computation-4",
    leaveTypeName: "Floating & Cultural Holiday",
    startDate: "2026-09-15",
    endDate: "2026-09-15",
    requestedDays: 1,
    reason: "Celebrating personal birthday and family event.",
    status: "PENDING",
    appliedDate: "2026-08-20"
  },
  {
    id: "lr-apex-201",
    tenantId: "tenant-apex-101",
    employeeId: "emp-apex-2",
    employeeName: "Elena Rostova",
    leaveTypeId: "lt-apex-cloud-1",
    leaveTypeName: "Paid Time Off (PTO / Vacation)",
    startDate: "2026-09-10",
    endDate: "2026-09-18",
    requestedDays: 7,
    reason: "Attending international AI research symposium and personal trip.",
    status: "APPROVED",
    appliedDate: "2026-08-12"
  }
];

// 12. HOLIDAYS (US Federal & Corporate Holidays)
const holidays = [];
const holidayList = [
  { name: "New Year's Day", date: "2026-01-01", kind: "COMMON" },
  { name: "Martin Luther King Jr. Day", date: "2026-01-19", kind: "COMMON" },
  { name: "Presidents' Day (Washington's Birthday)", date: "2026-02-16", kind: "COMMON" },
  { name: "Memorial Day", date: "2026-05-25", kind: "COMMON" },
  { name: "Juneteenth National Independence Day", date: "2026-06-19", kind: "COMMON" },
  { name: "Independence Day (Observed)", date: "2026-07-03", kind: "COMMON" },
  { name: "Labor Day", date: "2026-09-07", kind: "COMMON" },
  { name: "Indigenous Peoples' / Columbus Day", date: "2026-10-12", kind: "FLEXIBLE" },
  { name: "Veterans Day", date: "2026-11-11", kind: "COMMON" },
  { name: "Thanksgiving Day", date: "2026-11-26", kind: "COMMON" },
  { name: "Day After Thanksgiving (Black Friday)", date: "2026-11-27", kind: "COMMON" },
  { name: "Christmas Eve (Half Day)", date: "2026-12-24", kind: "FLEXIBLE" },
  { name: "Christmas Day", date: "2026-12-25", kind: "COMMON" },
  { name: "New Year's Eve (Company Floating)", date: "2026-12-31", kind: "FLEXIBLE" }
];

tenants.forEach((t) => {
  holidayList.forEach((h, idx) => {
    holidays.push({
      id: `hol-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      regionId: `reg-${t.slug}-1`,
      name: h.name,
      date: h.date,
      kind: h.kind,
      status: "ACTIVE"
    });
  });
});

// 13. ATTENDANCE & 14. OVERTIME
const attendance = [
  {
    id: "att-ac-1",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-1",
    employeeName: "David Miller",
    date: "2026-08-21",
    clockInTime: "08:55 AM",
    clockOutTime: "05:15 PM",
    totalMinutes: 500,
    status: "PRESENT"
  },
  {
    id: "att-ac-2",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-2",
    employeeName: "Sarah Jenkins",
    date: "2026-08-21",
    clockInTime: "09:02 AM",
    clockOutTime: "05:30 PM",
    totalMinutes: 508,
    status: "PRESENT"
  },
  {
    id: "att-ac-3",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-3",
    employeeName: "Michael Chang",
    date: "2026-08-21",
    clockInTime: "09:10 AM",
    clockOutTime: "06:00 PM",
    totalMinutes: 530,
    status: "PRESENT"
  },
  {
    id: "att-ac-4",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-4",
    employeeName: "Emily Watson",
    date: "2026-08-21",
    clockInTime: "08:45 AM",
    clockOutTime: "05:00 PM",
    totalMinutes: 495,
    status: "PRESENT"
  },
  {
    id: "att-ac-5",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-5",
    employeeName: "Robert Davis",
    date: "2026-08-21",
    clockInTime: "09:00 AM",
    clockOutTime: "05:05 PM",
    totalMinutes: 485,
    status: "PRESENT"
  }
];

const overtime = [
  {
    id: "ot-ac-1",
    tenantId: "tenant-1787291784650",
    employeeId: "emp-ac-3",
    employeeName: "Michael Chang",
    date: "2026-08-20",
    requestedMinutes: 120,
    reason: "Critical database migration deployment during maintenance window.",
    status: "APPROVED"
  }
];

// 15. DOCUMENTS
const documents = [];
const docTemplate = [
  { name: "US Employee Handbook 2026", category: "EMPLOYMENT", size: "2.4 MB", sensitive: false },
  { name: "Mutual Non-Disclosure Agreement (Standard NDA)", category: "OFFER", size: "340 KB", sensitive: true },
  { name: "401(k) Retirement Savings & Match Policy", category: "TAX", size: "1.1 MB", sensitive: false },
  { name: "Corporate Code of Ethical Business Conduct", category: "EMPLOYMENT", size: "1.8 MB", sensitive: false },
  { name: "Remote Work & Cybersecurity Compliance Standard", category: "OTHER", size: "980 KB", sensitive: true }
];

tenants.forEach((t) => {
  docTemplate.forEach((d, idx) => {
    documents.push({
      id: `doc-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      name: `${d.name} - ${t.name}`,
      category: d.category,
      status: "CLEAN",
      ownerType: "TENANT",
      ownerId: t.id,
      version: 1,
      fileSize: d.size,
      mimeType: "application/pdf",
      updatedAt: "2026-01-20T10:00:00.000Z",
      isSensitive: d.sensitive
    });
  });
});

// 16. KB ARTICLES
const kbArticles = [];
const kbDefs = [
  {
    title: "2026 US Benefits Enrollment & Healthcare Choices",
    cat: "Benefits & Perks",
    tags: ["Health Insurance", "Dental PPO", "Vision", "HSA/FSA", "Open Enrollment"],
    content: "Overview of comprehensive medical, dental, and vision PPO/HDHP plans with employer HSA contribution."
  },
  {
    title: "Understanding 401(k) Employer Match & Vesting Schedule",
    cat: "Retirement & Finance",
    tags: ["401k", "Retirement", "Employer Match", "Vesting", "Fidelity"],
    content: "Company matches 100% of employee contributions up to 4% of eligible base salary with immediate vesting."
  },
  {
    title: "PTO Accrual, Carry-Forward & Leave Policy",
    cat: "Time Off & Leave",
    tags: ["PTO", "Vacation", "Sick Leave", "Carry Forward"],
    content: "Details on annual leave allowances, monthly accrual rates, and up to 5 days rollover per calendar year."
  },
  {
    title: "Business Expense Reporting & Travel Reimbursement",
    cat: "Finance & Operations",
    tags: ["Expensify", "Travel", "Meals", "Per Diem", "Reimbursement"],
    content: "Guidelines for corporate expense claims, client dinners, flights, and software tool purchases."
  },
  {
    title: "Information Security: Hardware Encryption & 2FA Enforcements",
    cat: "IT & Security",
    tags: ["Cybersecurity", "1Password", "2FA", "FileVault", "SOC2"],
    content: "Mandatory security standards: FileVault disk encryption, password managers, and multi-factor authentication."
  }
];

tenants.forEach((t) => {
  kbDefs.forEach((k, idx) => {
    kbArticles.push({
      id: `kb-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      title: k.title,
      categoryId: `cat-${idx + 1}`,
      categoryName: k.cat,
      content: k.content,
      tags: k.tags,
      status: "PUBLISHED",
      updatedAt: "2026-08-15T14:30:00.000Z",
      targetDepartmentId: null
    });
  });
});

// 17. ANNOUNCEMENTS
const announcements = [];
const announceDefs = [
  {
    title: "🎉 Annual Company Summit 2026 in Austin, Texas",
    content: "We are thrilled to announce our 2026 Annual All-Hands Company Summit taking place in Austin, TX from October 14–17. Travel accommodations and flight booking details will be sent by People Ops next week!",
    priority: "HIGH"
  },
  {
    title: "📈 Q2 2026 Performance Highlights & Financial Milestones",
    content: "Thanks to our team's exceptional dedication, we exceeded our Q2 enterprise expansion targets by 134%! Annual profit-sharing bonus allocations will be reflected in the next payroll cycle.",
    priority: "MEDIUM"
  },
  {
    title: "🧘 Health, Mental Wellness & Home Ergonomics Stipend Launch",
    content: "Effective immediately, every full-time employee is eligible for an annual $1,200 Wellness & Home Office Ergonomics reimbursement via the benefits portal.",
    priority: "MEDIUM"
  }
];

tenants.forEach((t) => {
  announceDefs.forEach((a, idx) => {
    announcements.push({
      id: `ann-${t.slug}-${idx + 1}`,
      tenantId: t.id,
      title: a.title,
      content: a.content,
      priority: a.priority,
      publishAt: "2026-08-18T09:00:00.000Z",
      expiresAt: "2026-11-30T23:59:59.000Z",
      target: "TENANT_WIDE",
      readByIds: []
    });
  });
});

// 18. TICKETS
const tickets = [
  {
    id: "tkt-ac-101",
    tenantId: "tenant-1787291784650",
    ticketNumber: "TKT-4921",
    subject: "MacBook Pro M3 Max Engineering Hardware Upgrade",
    description: "Requesting upgraded 64GB Unified RAM MacBook for local Docker and Kubernetes workload development.",
    category: "IT Equipment",
    departmentId: "dept-auto-computation-9",
    departmentName: "DevOps & Information Security",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdById: "emp-ac-3",
    createdByName: "Michael Chang",
    assigneeName: "IT Provisioning Team",
    createdAt: "2026-08-19T11:20:00.000Z",
    comments: [
      {
        id: "comm-1",
        authorName: "IT Provisioning Team",
        authorRole: "IT Specialist",
        content: "Approved by engineering manager. Laptop order placed with Apple Enterprise. Tracking ETA: Tuesday.",
        createdAt: "2026-08-19T14:00:00.000Z"
      }
    ]
  },
  {
    id: "tkt-ac-102",
    tenantId: "tenant-1787291784650",
    ticketNumber: "TKT-4922",
    subject: "Employment & Salary Verification Letter for Mortgage",
    description: "Need an official signed letter from HR verifying employment and annual compensation for home purchase application.",
    category: "Human Resources",
    departmentId: "dept-auto-computation-7",
    departmentName: "People Operations & HR",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdById: "emp-ac-4",
    createdByName: "Emily Watson",
    assigneeName: "Sarah Jenkins",
    createdAt: "2026-08-17T09:15:00.000Z",
    comments: [
      {
        id: "comm-2",
        authorName: "Sarah Jenkins",
        authorRole: "HR Director",
        content: "Signed employment verification letter has been generated and uploaded to your confidential Document Vault.",
        createdAt: "2026-08-17T11:30:00.000Z"
      }
    ]
  }
];

// 19. ONBOARDING CASES
const onboardingCases = [
  {
    id: "onb-ac-901",
    tenantId: "tenant-1787291784650",
    userId: "user-emp-ac-6",
    employeeId: "EMP-1006",
    candidateName: "Jessica Martinez",
    email: "jessica.martinez@autocomputation.com",
    phone: "+1 (206) 555-0136",
    address: "1918 8th Ave, Seattle, WA 98101",
    emergencyContact: "Carlos Martinez (+1 206-555-0644)",
    funFact: "Amateur marathon runner and coffee roaster.",
    departmentId: "dept-auto-computation-9",
    departmentName: "DevOps & Information Security",
    designationId: "desig-auto-computation-16",
    designationName: "Lead Cloud Security & DevOps Architect",
    managerId: "emp-ac-1",
    managerName: "David Miller",
    joiningDate: "2024-08-01",
    regionName: "Seattle Engineering Hub",
    personalDetailsCompleted: true,
    offerSignedUploaded: true,
    offerSignedFileName: "Signed_Offer_Letter_Jessica_Martinez.pdf",
    offerSignedAt: "2024-07-20T16:00:00.000Z",
    requiredDocsUploaded: true,
    uploadedDocs: [
      { id: "ud-1", title: "US Passport / Identification", fileName: "Passport_Scan_JM.pdf", fileSize: "1.4 MB", uploadedAt: "2024-07-22T10:00:00.000Z" },
      { id: "ud-2", title: "Form W-4 Withholding Certificate", fileName: "Form_W4_2024_Signed.pdf", fileSize: "420 KB", uploadedAt: "2024-07-22T10:15:00.000Z" },
      { id: "ud-3", title: "Voided Check for Direct Deposit", fileName: "Direct_Deposit_VoidedCheck.pdf", fileSize: "310 KB", uploadedAt: "2024-07-22T10:20:00.000Z" }
    ],
    acknowledgementSigned: true,
    acknowledgementName: "Jessica Martinez",
    acknowledgementPlace: "Seattle, WA",
    acknowledgementDate: "2024-07-22",
    status: "APPROVED",
    submittedAt: "2024-07-22T10:30:00.000Z",
    approvedAt: "2024-07-23T09:00:00.000Z",
    approvedBy: "Sarah Jenkins",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "onb-ac-902",
    tenantId: "tenant-1787291784650",
    userId: "user-newhire-ac-2",
    candidateName: "Samantha Hayes",
    email: "samantha.hayes@autocomputation.com",
    phone: "+1 (415) 555-0819",
    address: "750 Bush St, San Francisco, CA 94108",
    emergencyContact: "Gregory Hayes (+1 415-555-0991)",
    funFact: "Published Sci-Fi author and classical pianist.",
    departmentId: "dept-auto-computation-3",
    departmentName: "Artificial Intelligence & Data Science",
    designationId: "desig-auto-computation-6",
    designationName: "Lead AI/ML Research Scientist",
    managerId: "emp-ac-1",
    managerName: "David Miller",
    joiningDate: "2026-09-01",
    regionName: "Silicon Valley Tech Center (San Francisco)",
    personalDetailsCompleted: true,
    offerSignedUploaded: true,
    offerSignedFileName: "Offer_Letter_Samantha_Hayes_Signed.pdf",
    offerSignedAt: "2026-08-18T14:30:00.000Z",
    requiredDocsUploaded: true,
    uploadedDocs: [
      { id: "ud-4", title: "US Driver License / ID", fileName: "CA_Driver_License.pdf", fileSize: "1.2 MB", uploadedAt: "2026-08-19T11:00:00.000Z" },
      { id: "ud-5", title: "Form W-4 & I-9 Verification", fileName: "W4_I9_Signed.pdf", fileSize: "890 KB", uploadedAt: "2026-08-19T11:30:00.000Z" }
    ],
    acknowledgementSigned: true,
    acknowledgementName: "Samantha Hayes",
    acknowledgementPlace: "San Francisco, CA",
    acknowledgementDate: "2026-08-19",
    status: "SUBMITTED_FOR_REVIEW",
    submittedAt: "2026-08-19T12:00:00.000Z",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

// 20. AUDIT LOGS
const auditLogs = [
  {
    id: "aud-001",
    tenantId: "platform",
    actorId: "user-superadmin",
    actorName: "Melenie (Super Admin)",
    action: "SYSTEM_INITIALIZED_AMERICAN_DATA",
    resourceType: "PLATFORM",
    resourceId: "platform-master",
    timestamp: "2026-08-21T07:00:00.000Z",
    requestId: "req-init-2026"
  },
  {
    id: "aud-002",
    tenantId: "tenant-1787291784650",
    actorId: "user-admin-tenant-1787291784650",
    actorName: "Auto Computation Admin",
    action: "TENANT_SECURITY_POLICY_CONFIGURED",
    resourceType: "TENANT",
    resourceId: "tenant-1787291784650",
    timestamp: "2026-08-21T07:15:00.000Z",
    requestId: "req-sec-101"
  }
];

// Save all to JSON files
const fileMap = {
  'tenants.json': tenants,
  'users.json': users,
  'regions.json': regions,
  'departments.json': departments,
  'designations.json': designations,
  'employees.json': employees,
  'buildings.json': buildings,
  'rooms.json': rooms,
  'reservations.json': reservations,
  'leave-types.json': leaveTypes,
  'leave-requests.json': leaveRequests,
  'holidays.json': holidays,
  'attendance.json': attendance,
  'overtime.json': overtime,
  'documents.json': documents,
  'kb-articles.json': kbArticles,
  'announcements.json': announcements,
  'tickets.json': tickets,
  'onboarding-cases.json': onboardingCases,
  'audit-logs.json': auditLogs
};

for (const [filename, content] of Object.entries(fileMap)) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`Saved ${filename} (${content.length} records)`);
}

console.log('All American enterprise datasets generated successfully!');
