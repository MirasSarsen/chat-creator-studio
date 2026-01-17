-- supabase/migrations/20260118000000_support_tickets.sql

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'feature_request', 'bug')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_agent TEXT,
  user_id TEXT,
  conversation_id TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket messages table
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_tickets_category ON public.support_tickets(category);
CREATE INDEX idx_tickets_assigned_agent ON public.support_tickets(assigned_agent);
CREATE INDEX idx_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo
CREATE POLICY "Allow public read support_tickets" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert support_tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update support_tickets" ON public.support_tickets FOR UPDATE USING (true);

CREATE POLICY "Allow public read ticket_messages" ON public.ticket_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert ticket_messages" ON public.ticket_messages FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_ticket_updated_at();

-- Create view for ticket statistics
CREATE VIEW public.ticket_statistics AS
SELECT 
  category,
  status,
  priority,
  assigned_agent,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric(10,2) as avg_resolution_hours
FROM public.support_tickets
WHERE resolved_at IS NOT NULL
GROUP BY category, status, priority, assigned_agent;