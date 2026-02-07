import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw } from "lucide-react";
import { MessageBubble, ChatMessage } from "./MessageBubble";
import { LoanCardsList } from "./LoanCards";
import { LoanDetailsCard } from "./LoanDetailsCard";
import { CSATRatingButtons, CSATFeedbackPrompt, CSATComplete } from "./CSATSurvey";
import {
  AgentContext, initialContext,
  detectLoanIntent, detectResetIntent, isNonEnglish,
  extractPhone, extractOtp,
} from "@/lib/agentEngine";
import { triggerOTP, getLoanAccounts, getLoanDetails, ProjectedLoanAccount } from "@/lib/mockApi";

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ctx, setCtx] = useState<AgentContext>({ ...initialContext });
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const addAgent = useCallback((content: string, component?: React.ReactNode) => {
    const msg: ChatMessage = { id: nextId(), role: "agent", content, timestamp: new Date(), component };
    setMessages(prev => [...prev, msg]);
    scrollToBottom();
    return msg;
  }, []);

  const addUser = useCallback((content: string) => {
    const msg: ChatMessage = { id: nextId(), role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    scrollToBottom();
  }, []);

  const addTyping = useCallback(() => {
    const msg: ChatMessage = { id: "typing", role: "agent", content: "", timestamp: new Date(), typing: true };
    setMessages(prev => [...prev, msg]);
    scrollToBottom();
  }, []);

  const removeTyping = useCallback(() => {
    setMessages(prev => prev.filter(m => m.id !== "typing"));
  }, []);

  // Initial greeting
  useEffect(() => {
    setTimeout(() => {
      addAgent("Welcome to Yellow Bank! 🏦\n\nI'm your banking assistant. How can I help you today?\n\nYou can say things like \"Show my loan details\" to get started.");
    }, 500);
  }, []);

  const processMessage = async (userMessage: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addUser(userMessage);
    setInput("");

    // Language check
    if (isNonEnglish(userMessage)) {
      addTyping();
      await delay(600);
      removeTyping();
      addAgent("I'm sorry, I can only communicate in English. Could you please rephrase your request in English? 🙏");
      setIsProcessing(false);
      return;
    }

    // Reset detection at any point
    if (detectResetIntent(userMessage) && ctx.state !== "awaiting_intent" && ctx.state !== "idle") {
      addTyping();
      await delay(700);
      removeTyping();
      setCtx({ ...initialContext, state: "collecting_phone" });
      addAgent("No problem! I've cleared your previous details. Let's start fresh.\n\nPlease share your registered phone number.");
      setIsProcessing(false);
      return;
    }

    let currentCtx = { ...ctx };

    switch (currentCtx.state) {
      case "awaiting_intent": {
        addTyping();
        await delay(700);
        removeTyping();
        if (detectLoanIntent(userMessage)) {
          currentCtx.state = "collecting_phone";
          addAgent("I'd be happy to help you with your loan details! 📋\n\nFirst, I'll need to verify your identity. Please share your registered phone number.");
        } else {
          addAgent("I can help you check your loan details. Just say \"Show my loan details\" or \"Check loan details\" to get started!");
        }
        break;
      }

      case "collecting_phone": {
        const phone = extractPhone(userMessage);
        addTyping();
        await delay(600);
        removeTyping();
        if (phone) {
          currentCtx.phone = phone;
          currentCtx.state = "collecting_dob";
          addAgent(`Great, phone number noted: ${phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}\n\nNow, please share your Date of Birth (e.g., 15/03/1990).`);
        } else {
          addAgent("I couldn't find a valid 10-digit phone number in your message. Please enter your registered phone number (e.g., 9876543210).");
        }
        break;
      }

      case "collecting_dob": {
        addTyping();
        await delay(600);
        removeTyping();
        if (userMessage.trim().length >= 6) {
          currentCtx.dob = userMessage.trim();
          currentCtx.state = "triggering_otp";
          addAgent("Thank you! Sending OTP to your registered number... ⏳");

          // Trigger OTP
          addTyping();
          const result = await triggerOTP(currentCtx.phone, currentCtx.dob);
          removeTyping();

          if (result.success && result.otp) {
            currentCtx.otp = result.otp;
            currentCtx.state = "awaiting_otp";
            addAgent(`OTP has been sent to your registered number.\n\n🔐 [Mock OTP: ${result.otp}]\n\nPlease enter the OTP to proceed.`);
          } else {
            currentCtx.state = "collecting_phone";
            currentCtx.phone = "";
            currentCtx.dob = "";
            addAgent(`❌ ${result.error || "Failed to send OTP."}\n\nLet's try again. Please share your registered phone number.`);
          }
        } else {
          addAgent("That doesn't look like a valid date of birth. Please enter it in a format like DD/MM/YYYY.");
        }
        break;
      }

      case "awaiting_otp": {
        const otpStr = extractOtp(userMessage);
        addTyping();
        await delay(600);
        removeTyping();

        if (otpStr && parseInt(otpStr) === currentCtx.otp) {
          currentCtx.state = "fetching_loans";
          addAgent("✅ OTP verified successfully! Fetching your loan accounts...");

          addTyping();
          const result = await getLoanAccounts(currentCtx.phone);
          removeTyping();

          if (result.success && result.accounts) {
            currentCtx.state = "displaying_loans";
            addAgent(
              "Here are your loan accounts. Please select one to view details:",
              <LoanCardsList
                accounts={result.accounts}
                onSelect={(id) => handleLoanSelect(id)}
                tokenInfo={result.rawFieldCount && result.projectedFieldCount ? {
                  rawFields: result.rawFieldCount,
                  projectedFields: result.projectedFieldCount,
                } : undefined}
              />
            );
          } else {
            currentCtx.state = "awaiting_intent";
            addAgent(`❌ ${result.error || "Failed to fetch loan accounts."}\n\nPlease try again by saying "Check my loan details".`);
          }
        } else if (otpStr) {
          currentCtx.retryCount++;
          if (currentCtx.retryCount >= 3) {
            currentCtx = { ...initialContext };
            addAgent("❌ Maximum OTP attempts reached. For security, please start over.\n\nSay \"Check my loan details\" to try again.");
          } else {
            addAgent(`❌ Incorrect OTP. You have ${3 - currentCtx.retryCount} attempt(s) remaining.\n\nPlease enter the correct OTP.`);
          }
        } else {
          addAgent("Please enter the 4-digit OTP sent to your phone.");
        }
        break;
      }

      case "displaying_loans": {
        addTyping();
        await delay(500);
        removeTyping();
        addAgent("Please select a loan account from the cards above by clicking on it.");
        break;
      }

      case "displaying_details": {
        addTyping();
        await delay(500);
        removeTyping();
        if (detectLoanIntent(userMessage)) {
          currentCtx.state = "displaying_loans";
          const result = await getLoanAccounts(currentCtx.phone);
          if (result.success && result.accounts) {
            addAgent(
              "Here are your loan accounts again:",
              <LoanCardsList accounts={result.accounts} onSelect={handleLoanSelect} />
            );
          }
        } else {
          addAgent("Your loan details are shown above. You can click \"Rate our chat\" to share your feedback, or ask me anything else!");
        }
        break;
      }

      case "csat_rating": {
        addTyping();
        await delay(500);
        removeTyping();
        addAgent("Please select a rating from the options above.");
        break;
      }

      case "csat_feedback": {
        addTyping();
        await delay(500);
        removeTyping();
        const lower = userMessage.toLowerCase();
        if (lower.includes("no") || lower.includes("skip") || lower.includes("done")) {
          currentCtx.state = "completed";
          addAgent("Thank you for banking with Yellow Bank! Have a wonderful day! 🌟", <CSATComplete />);
        } else {
          currentCtx.csatFeedback = userMessage;
          currentCtx.state = "completed";
          addAgent("Thank you for your valuable feedback! We'll use it to improve our service. 🌟", <CSATComplete />);
        }
        break;
      }

      case "completed": {
        addTyping();
        await delay(500);
        removeTyping();
        if (detectLoanIntent(userMessage)) {
          currentCtx = { ...initialContext, state: "collecting_phone" };
          addAgent("Sure! Let me help you with loan details again.\n\nPlease share your registered phone number.");
        } else {
          addAgent("Thank you for using Yellow Bank! If you need anything else, feel free to ask about your loan details.");
        }
        break;
      }

      default:
        break;
    }

    setCtx(currentCtx);
    setIsProcessing(false);
  };

  const handleLoanSelect = async (loanId: string) => {
    setIsProcessing(true);
    addUser(`Selected loan: ${loanId}`);
    setCtx(prev => ({ ...prev, selectedLoanId: loanId, state: "fetching_details" }));

    addTyping();
    const result = await getLoanDetails(loanId);
    removeTyping();

    if (result.success && result.details) {
      setCtx(prev => ({ ...prev, state: "displaying_details" }));
      addAgent(
        `Here are the details for your ${result.details.type_of_loan}:`,
        <LoanDetailsCard details={result.details} onRateChat={handleRateChat} />
      );
    } else {
      setCtx(prev => ({ ...prev, state: "displaying_loans" }));
      addAgent(`❌ ${result.error || "Failed to fetch details."} Please try selecting again.`);
    }
    setIsProcessing(false);
  };

  const handleRateChat = () => {
    setCtx(prev => ({ ...prev, state: "csat_rating" }));
    addAgent(
      "We'd love to hear your feedback! How would you rate this conversation?",
      <CSATRatingButtons onRate={handleCSATRate} />
    );
  };

  const handleCSATRate = (rating: string) => {
    addUser(`Rating: ${rating === "good" ? "😊 Good" : rating === "average" ? "😐 Average" : "😞 Bad"}`);
    setCtx(prev => ({ ...prev, csatRating: rating, state: "csat_feedback" }));
    setTimeout(() => {
      addAgent(
        "Thank you for your rating! Would you like to share any additional feedback? Type your thoughts or say \"no thanks\" to finish.",
      );
    }, 400);
  };

  const handleReset = () => {
    setMessages([]);
    setCtx({ ...initialContext });
    msgId = 0;
    setTimeout(() => {
      addAgent("Welcome to Yellow Bank! 🏦\n\nI'm your banking assistant. How can I help you today?\n\nYou can say things like \"Show my loan details\" to get started.");
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    processMessage(input.trim());
  };

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
            <span className="font-display font-bold text-accent-foreground text-sm">YB</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-primary-foreground text-sm">Yellow Bank Assistant</h1>
            <p className="text-[10px] text-primary-foreground/60">Always here to help</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isProcessing ? "Please wait..." : "Type your message..."}
            disabled={isProcessing}
            className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
