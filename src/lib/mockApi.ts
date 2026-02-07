// Mock API services for Yellow Bank Agent
// Simulates backend APIs with realistic data

const VALID_OTPS = [1234, 5678, 7889, 1209] as const;

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---- triggerOTP ----
export async function triggerOTP(phone: string, dob: string): Promise<{ success: boolean; otp?: number; error?: string }> {
  await delay(800);
  
  // Validate phone (10 digits)
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    return { success: false, error: "Invalid phone number. Please provide a valid 10-digit number." };
  }
  
  // Validate DOB
  if (!dob || dob.trim().length < 6) {
    return { success: false, error: "Invalid date of birth." };
  }
  
  const otp = VALID_OTPS[Math.floor(Math.random() * VALID_OTPS.length)];
  return { success: true, otp };
}

// ---- Raw Loan Accounts (15+ fields, simulating massive JSON) ----
interface RawLoanAccount {
  loan_account_id: string;
  type_of_loan: string;
  tenure_months: number;
  internal_bank_code: string;
  audit_date: string;
  branch_code: string;
  product_code: string;
  scheme_code: string;
  disbursement_date: string;
  maturity_date: string;
  processing_fee: number;
  insurance_premium: number;
  emi_amount: number;
  overdue_amount: number;
  last_payment_date: string;
  next_payment_date: string;
  payment_mode: string;
  collateral_type: string;
  collateral_value: number;
  risk_category: string;
  npa_status: string;
  cibil_score_at_origination: number;
}

// Full raw data (token-heavy)
const RAW_LOAN_ACCOUNTS: RawLoanAccount[] = [
  {
    loan_account_id: "LA-20230415-001",
    type_of_loan: "Home Loan",
    tenure_months: 240,
    internal_bank_code: "HL-PREM-2023-Q2",
    audit_date: "2024-12-15T10:30:00Z",
    branch_code: "BR-MUM-042",
    product_code: "PROD-HL-001",
    scheme_code: "SCH-HL-FLOAT-2023",
    disbursement_date: "2023-04-15",
    maturity_date: "2043-04-15",
    processing_fee: 15000,
    insurance_premium: 45000,
    emi_amount: 52340,
    overdue_amount: 0,
    last_payment_date: "2025-01-05",
    next_payment_date: "2025-02-05",
    payment_mode: "AUTO_DEBIT",
    collateral_type: "RESIDENTIAL_PROPERTY",
    collateral_value: 8500000,
    risk_category: "LOW",
    npa_status: "STANDARD",
    cibil_score_at_origination: 782,
  },
  {
    loan_account_id: "LA-20240110-002",
    type_of_loan: "Personal Loan",
    tenure_months: 36,
    internal_bank_code: "PL-STD-2024-Q1",
    audit_date: "2024-11-20T14:00:00Z",
    branch_code: "BR-DEL-018",
    product_code: "PROD-PL-003",
    scheme_code: "SCH-PL-FIXED-2024",
    disbursement_date: "2024-01-10",
    maturity_date: "2027-01-10",
    processing_fee: 5000,
    insurance_premium: 8000,
    emi_amount: 18750,
    overdue_amount: 0,
    last_payment_date: "2025-01-10",
    next_payment_date: "2025-02-10",
    payment_mode: "NACH",
    collateral_type: "NONE",
    collateral_value: 0,
    risk_category: "MEDIUM",
    npa_status: "STANDARD",
    cibil_score_at_origination: 745,
  },
  {
    loan_account_id: "LA-20220830-003",
    type_of_loan: "Car Loan",
    tenure_months: 60,
    internal_bank_code: "CL-AUTO-2022-Q3",
    audit_date: "2024-10-01T09:15:00Z",
    branch_code: "BR-BLR-007",
    product_code: "PROD-CL-002",
    scheme_code: "SCH-CL-FIXED-2022",
    disbursement_date: "2022-08-30",
    maturity_date: "2027-08-30",
    processing_fee: 8000,
    insurance_premium: 22000,
    emi_amount: 14200,
    overdue_amount: 14200,
    last_payment_date: "2024-12-30",
    next_payment_date: "2025-01-30",
    payment_mode: "ECS",
    collateral_type: "VEHICLE",
    collateral_value: 650000,
    risk_category: "MEDIUM",
    npa_status: "STANDARD",
    cibil_score_at_origination: 710,
  },
];

// TOKEN OPTIMIZATION: Projection / Middle-man filter
// Only extract the fields needed for the DRM card display
export interface ProjectedLoanAccount {
  loan_account_id: string;
  type_of_loan: string;
  tenure_months: number;
}

export async function getLoanAccounts(_phone: string): Promise<{ success: boolean; accounts?: ProjectedLoanAccount[]; rawFieldCount?: number; projectedFieldCount?: number; error?: string }> {
  await delay(1000);
  
  // Simulate occasional API failure (10% chance)
  if (Math.random() < 0.1) {
    return { success: false, error: "Unable to fetch loan accounts. Please try again." };
  }
  
  // PROJECTION: Filter massive raw data to only needed fields
  const projected: ProjectedLoanAccount[] = RAW_LOAN_ACCOUNTS.map(acc => ({
    loan_account_id: acc.loan_account_id,
    type_of_loan: acc.type_of_loan,
    tenure_months: acc.tenure_months,
  }));
  
  return {
    success: true,
    accounts: projected,
    rawFieldCount: Object.keys(RAW_LOAN_ACCOUNTS[0]).length,
    projectedFieldCount: Object.keys(projected[0]).length,
  };
}

// ---- Loan Details ----
export interface LoanDetails {
  loan_account_id: string;
  type_of_loan: string;
  tenure_months: number;
  interest_rate: number;
  principal_pending: number;
  interest_pending: number;
  nominee: string;
  emi_amount: number;
  next_payment_date: string;
}

export async function getLoanDetails(accountId: string): Promise<{ success: boolean; details?: LoanDetails; error?: string }> {
  await delay(900);
  
  const detailsMap: Record<string, LoanDetails> = {
    "LA-20230415-001": {
      loan_account_id: "LA-20230415-001",
      type_of_loan: "Home Loan",
      tenure_months: 240,
      interest_rate: 8.5,
      principal_pending: 4850000,
      interest_pending: 320000,
      nominee: "Priya Sharma",
      emi_amount: 52340,
      next_payment_date: "2025-02-05",
    },
    "LA-20240110-002": {
      loan_account_id: "LA-20240110-002",
      type_of_loan: "Personal Loan",
      tenure_months: 36,
      interest_rate: 12.5,
      principal_pending: 425000,
      interest_pending: 38000,
      nominee: "Rahul Kumar",
      emi_amount: 18750,
      next_payment_date: "2025-02-10",
    },
    "LA-20220830-003": {
      loan_account_id: "LA-20220830-003",
      type_of_loan: "Car Loan",
      tenure_months: 60,
      interest_rate: 9.25,
      principal_pending: 280000,
      interest_pending: 18500,
      nominee: "Anita Desai",
      emi_amount: 14200,
      next_payment_date: "2025-01-30",
    },
  };
  
  const details = detailsMap[accountId];
  if (!details) {
    return { success: false, error: "Loan account not found." };
  }
  
  return { success: true, details };
}
