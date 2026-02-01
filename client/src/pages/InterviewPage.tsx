import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useInterview, useNextStep, useCompleteInterview } from "@/hooks/use-interviews";
import { Bot, Send, StopCircle, FileText, Briefcase, ChevronLeft, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ChatBubble from "@/components/chat-bubble";
import { useToast } from "@/hooks/use-toast";

export default function InterviewPage() {
  const [match, params] = useRoute("/interview/:id");
  const [_, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data, isLoading, error } = useInterview(id);
  const nextStep = useNextStep();
  const completeInterview = useCompleteInterview();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.messages, nextStep.isPending]);

  // Initial load logic: If no messages, trigger empty nextStep to start conversation
  useEffect(() => {
    if (data && data.messages.length === 0 && !nextStep.isPending && !isLoading) {
       nextStep.mutate({ id });
    }
  }, [data, id, isLoading]);

  const handleSubmit = () => {
    if (!input.trim() || nextStep.isPending) return;
    
    // Optimistic UI update could go here, but we'll rely on fast cache invalidation for simplicity in this generated code
    nextStep.mutate({ id, userResponse: input }, {
        onSuccess: () => setInput(""),
        onError: () => toast({ variant: "destructive", title: "Failed to send message" })
    });
  };

  const handleComplete = () => {
    if (confirm("Are you sure you want to end the interview? You'll receive your final report.")) {
      completeInterview.mutate(id, {
        onSuccess: () => setLocation(`/report/${id}`)
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading interview context...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-destructive">Error loading interview</h2>
            <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
    );
  }

  const { interview, messages } = data;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-80 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> 
            AI Interviewer
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Session ID: #{interview.id}</p>
        </div>
        
        <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <User className="w-3 h-3" /> Candidate
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg text-sm font-medium">
                        {interview.candidateName}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                         <Briefcase className="w-3 h-3" /> Target Role
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg text-xs leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                        {interview.jobDescription}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Resume Context
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg text-xs leading-relaxed max-h-40 overflow-y-auto scrollbar-thin text-muted-foreground">
                        {interview.resumeText.slice(0, 300)}...
                    </div>
                </div>
            </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
            <Button 
                variant="destructive" 
                className="w-full justify-start gap-2"
                onClick={handleComplete}
            >
                <StopCircle className="w-4 h-4" /> End Session & Get Report
            </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Mobile Sidebar Trigger */}
        <div className="lg:hidden p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur z-10 sticky top-0">
             <div className="flex items-center gap-2 font-bold">
                <Bot className="w-5 h-5 text-primary" /> AI Interviewer
             </div>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon"><FileText className="w-5 h-5" /></Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Interview Context</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Job Description</h4>
                            <p className="text-sm text-muted-foreground">{interview.jobDescription}</p>
                        </div>
                        <Button variant="destructive" className="w-full mt-8" onClick={handleComplete}>End Interview</Button>
                    </div>
                </SheetContent>
             </Sheet>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-8 scroll-smooth" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {nextStep.isPending && (
              <ChatBubble 
                message={{ 
                  id: -1, 
                  role: "assistant", 
                  content: "", 
                  type: "answer", 
                  interviewId: id, 
                  createdAt: new Date(), 
                  analysis: null 
                }} 
                isTyping 
              />
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-background border-t border-border">
            <div className="max-w-4xl mx-auto relative flex gap-4 items-end">
                <div className="flex-1 bg-muted/30 rounded-2xl border border-input focus-within:ring-2 focus-within:ring-ring transition-all">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer here..."
                        className="min-h-[60px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none py-4 px-4 shadow-none"
                    />
                </div>
                <Button 
                    size="icon" 
                    className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={handleSubmit}
                    disabled={!input.trim() || nextStep.isPending}
                >
                    <Send className="w-6 h-6" />
                </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
                Press Enter to send, Shift + Enter for new line.
            </p>
        </div>
      </div>
    </div>
  );
}
