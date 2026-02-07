import { LoanDetails } from "@/lib/mockApi";
import { formatCurrency } from "@/lib/agentEngine";
import { Calendar, Percent, IndianRupee, User, Clock, CreditCard } from "lucide-react";

interface LoanDetailsCardProps {
  details: LoanDetails;
  onRateChat: () => void;
}

export function LoanDetailsCard({ details, onRateChat }: LoanDetailsCardProps) {
  const rows = [
    { icon: <CreditCard className="w-4 h-4" />, label: "Account ID", value: details.loan_account_id },
    { icon: <Clock className="w-4 h-4" />, label: "Tenure", value: `${details.tenure_months} months` },
    { icon: <Percent className="w-4 h-4" />, label: "Interest Rate", value: `${details.interest_rate}%` },
    { icon: <IndianRupee className="w-4 h-4" />, label: "Principal Pending", value: formatCurrency(details.principal_pending) },
    { icon: <IndianRupee className="w-4 h-4" />, label: "Interest Pending", value: formatCurrency(details.interest_pending) },
    { icon: <IndianRupee className="w-4 h-4" />, label: "EMI Amount", value: formatCurrency(details.emi_amount) },
    { icon: <Calendar className="w-4 h-4" />, label: "Next Payment", value: details.next_payment_date },
    { icon: <User className="w-4 h-4" />, label: "Nominee", value: details.nominee },
  ];

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-primary px-4 py-3">
          <p className="font-display font-bold text-primary-foreground text-sm">
            {details.type_of_loan} Details
          </p>
        </div>
        <div className="divide-y divide-border">
          {rows.map(row => (
            <div key={row.label} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-accent">{row.icon}</span>
              <span className="text-xs text-muted-foreground flex-1">{row.label}</span>
              <span className="text-xs font-semibold text-card-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRateChat}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-all hover:opacity-90"
        >
          ⭐ Rate our chat
        </button>
      </div>
    </div>
  );
}
