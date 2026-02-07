import { ChatWindow } from "@/components/ChatWindow";
import { Shield, Zap, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - Info */}
      <div className="hidden lg:flex flex-col justify-center w-[420px] px-10 py-12 bg-primary">
        <div className="space-y-8">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6">
              <span className="font-display font-bold text-accent-foreground text-xl">YB</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-primary-foreground leading-tight">
              Yellow Bank
              <br />
              <span className="text-accent">AI Agent</span>
            </h1>
            <p className="mt-3 text-sm text-primary-foreground/60 leading-relaxed">
              Experience secure, intelligent banking with our conversational AI assistant. Check loan details, verify identity, and more — all through natural conversation.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <Shield className="w-4 h-4" />, title: "OTP Verification", desc: "Multi-step authentication for security" },
              { icon: <Zap className="w-4 h-4" />, title: "Token Optimized", desc: "Efficient data projection reduces LLM costs" },
              { icon: <Globe className="w-4 h-4" />, title: "English Only", desc: "Restricted to English for consistent service" },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">{f.title}</p>
                  <p className="text-xs text-primary-foreground/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4">
            <p className="text-xs text-primary-foreground/40 font-mono">
              Try saying: <span className="text-accent">"I want to check my loan details"</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Chat */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div className="flex-1 flex flex-col rounded-none lg:rounded-2xl lg:m-4 lg:border lg:border-border overflow-hidden shadow-xl">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default Index;
