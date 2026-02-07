// Agent conversation state machine for Yellow Bank

export type AgentState =
  | "idle"
  | "awaiting_intent"
  | "collecting_phone"
  | "collecting_dob"
  | "triggering_otp"
  | "awaiting_otp"
  | "verifying_otp"
  | "fetching_loans"
  | "displaying_loans"
  | "fetching_details"
  | "displaying_details"
  | "csat_rating"
  | "csat_feedback"
  | "completed";

export interface AgentContext {
  state: AgentState;
  phone: string;
  dob: string;
  otp: number | null;
  userOtp: string;
  selectedLoanId: string;
  csatRating: string;
  csatFeedback: string;
  retryCount: number;
}

export const initialContext: AgentContext = {
  state: "awaiting_intent",
  phone: "",
  dob: "",
  otp: null,
  userOtp: "",
  selectedLoanId: "",
  csatRating: "",
  csatFeedback: "",
  retryCount: 0,
};

// Detect if the user wants to check loan details
export function detectLoanIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const keywords = ["loan", "check loan", "loan details", "show loan", "view loan", "my loan", "loan account", "loan info"];
  return keywords.some(k => lower.includes(k));
}

// Detect if user wants to reset/change number
export function detectResetIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const patterns = [
    "old number", "wrong number", "different number", "change number",
    "not my number", "update number", "new number", "that's my old",
    "wait", "actually", "different phone",
  ];
  return patterns.some(p => lower.includes(p));
}

// Detect non-English text (basic heuristic)
export function isNonEnglish(message: string): boolean {
  // Check for non-ASCII characters that suggest non-English
  const nonLatinRatio = (message.match(/[^\x00-\x7F]/g) || []).length / message.length;
  return nonLatinRatio > 0.3 && message.length > 3;
}

// Extract 10-digit phone number from message
export function extractPhone(message: string): string | null {
  const cleaned = message.replace(/[\s\-\(\)\+]/g, '');
  const match = cleaned.match(/\d{10,12}/);
  if (match) {
    const digits = match[0];
    return digits.slice(-10); // Take last 10 digits
  }
  return null;
}

// Extract OTP (4 digits) from message
export function extractOtp(message: string): string | null {
  const match = message.match(/\b\d{4}\b/);
  return match ? match[0] : null;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
