-- Create table for agent feedback and improvements
CREATE TABLE public.agent_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  original_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for agent prompt improvements
CREATE TABLE public.agent_improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  improved_prompt TEXT NOT NULL,
  improvement_reason TEXT,
  avg_rating_before DECIMAL(3,2),
  feedback_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for conversation history (for learning)
CREATE TABLE public.conversation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  model_used TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo (can be restricted later)
CREATE POLICY "Allow public read agent_feedback" ON public.agent_feedback FOR SELECT USING (true);
CREATE POLICY "Allow public insert agent_feedback" ON public.agent_feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read agent_improvements" ON public.agent_improvements FOR SELECT USING (true);
CREATE POLICY "Allow public insert agent_improvements" ON public.agent_improvements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update agent_improvements" ON public.agent_improvements FOR UPDATE USING (true);

CREATE POLICY "Allow public read conversation_logs" ON public.conversation_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert conversation_logs" ON public.conversation_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update conversation_logs" ON public.conversation_logs FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_improvements_updated_at
BEFORE UPDATE ON public.agent_improvements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();