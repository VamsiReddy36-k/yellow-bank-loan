import { ProjectedLoanAccount } from "@/lib/mockApi";
import { Home, Car, Wallet, ChevronRight } from "lucide-react";

interface LoanCardProps {
  account: ProjectedLoanAccount;
  onSelect: (id: string) => void;
}

const loanIcons: Record<string, React.ReactNode> = {
  "Home Loan": <Home className="w-6 h-6" />,
  "Car Loan": <Car className="w-6 h-6" />,
  "Personal Loan": <Wallet className="w-6 h-6" />,
};

export function LoanCard({ account, onSelect }: LoanCardProps) {
  return (
    <button
      onClick={() => onSelect(account.loan_account_id)}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-accent hover:shadow-md hover:shadow-accent/10"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {loanIcons[account.type_of_loan] || <Wallet className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-card-foreground text-sm">
            {account.type_of_loan}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {account.loan_account_id}
          </p>
          <p className="text-xs text-muted-foreground">
            Tenure: {account.tenure_months} months
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
    </button>
  );
}

interface LoanCardsListProps {
  accounts: ProjectedLoanAccount[];
  onSelect: (id: string) => void;
  tokenInfo?: { rawFields: number; projectedFields: number };
}

export function LoanCardsList({ accounts, onSelect, tokenInfo }: LoanCardsListProps) {
  return (
    <div className="space-y-2 w-full max-w-sm">
      <p className="text-xs font-medium text-agent-bubble-foreground/80 mb-2">
        Select a loan account:
      </p>
      {accounts.map(acc => (
        <LoanCard key={acc.loan_account_id} account={acc} onSelect={onSelect} />
      ))}
      {tokenInfo && (
        <div className="mt-3 rounded-lg bg-muted/50 border border-border p-2.5 text-[10px] text-muted-foreground">
          <p className="font-semibold text-xs mb-1">🔧 Token Optimization</p>
          <p>Raw API fields per account: <strong>{tokenInfo.rawFields}</strong></p>
          <p>Projected fields sent to LLM: <strong>{tokenInfo.projectedFields}</strong></p>
          <p>Fields filtered out: <strong>{tokenInfo.rawFields - tokenInfo.projectedFields}</strong> ({Math.round((1 - tokenInfo.projectedFields / tokenInfo.rawFields) * 100)}% reduction)</p>
        </div>
      )}
    </div>
  );
}
