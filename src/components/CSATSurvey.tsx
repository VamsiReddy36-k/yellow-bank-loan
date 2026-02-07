interface CSATSurveyProps {
  stage: "rating" | "feedback" | "done";
  onRate: (rating: string) => void;
  onFeedback: (feedback: string) => void;
}

const ratings = [
  { label: "Good", emoji: "😊", value: "good" },
  { label: "Average", emoji: "😐", value: "average" },
  { label: "Bad", emoji: "😞", value: "bad" },
];

export function CSATRatingButtons({ onRate }: { onRate: (v: string) => void }) {
  return (
    <div className="space-y-2 max-w-sm">
      <p className="text-xs text-agent-bubble-foreground/80 mb-2">How was your experience?</p>
      <div className="flex gap-2">
        {ratings.map(r => (
          <button
            key={r.value}
            onClick={() => onRate(r.value)}
            className="flex-1 rounded-xl border border-border bg-card px-3 py-3 text-center transition-all hover:border-accent hover:shadow-sm"
          >
            <span className="text-2xl block mb-1">{r.emoji}</span>
            <span className="text-xs font-medium text-card-foreground">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CSATFeedbackPrompt() {
  return (
    <p className="text-xs text-agent-bubble-foreground/80">
      Thank you! Would you like to share any additional feedback? Type your feedback or say "no thanks" to finish.
    </p>
  );
}

export function CSATComplete() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 max-w-sm text-center">
      <span className="text-3xl block mb-2">🎉</span>
      <p className="font-display font-semibold text-card-foreground text-sm">Thank you for your feedback!</p>
      <p className="text-xs text-muted-foreground mt-1">We appreciate your time. Have a great day!</p>
    </div>
  );
}
