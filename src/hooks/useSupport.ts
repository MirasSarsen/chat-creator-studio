// src/hooks/useSupport.ts
import { useState, useCallback } from "react";
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from "@/types/support";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SUPPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-router`;

export function useSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Auto-categorize and route ticket
  const createTicket = useCallback(
    async (title: string, description: string): Promise<Ticket> => {
      setIsLoading(true);
      try {
        // Call AI to categorize and prioritize
        const response = await fetch(SUPPORT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "create_ticket",
            title,
            description,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create ticket");
        }

        const result = await response.json();
        const ticket: Ticket = result.ticket;

        setTickets((prev) => [ticket, ...prev]);

        toast({
          title: "Ticket Created",
          description: `Assigned to ${ticket.assignedAgent} with ${ticket.priority} priority`,
        });

        return ticket;
      } catch (error) {
        console.error("Create ticket error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create support ticket",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Update ticket status
  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      try {
        const { error } = await supabase
          .from("support_tickets")
          .update({ 
            status,
            updated_at: new Date().toISOString(),
            resolved_at: status === "resolved" ? new Date().toISOString() : undefined
          })
          .eq("id", ticketId);

        if (error) throw error;

        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
        );

        toast({
          title: "Status Updated",
          description: `Ticket marked as ${status}`,
        });
      } catch (error) {
        console.error("Update status error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update ticket status",
        });
      }
    },
    [toast]
  );

  // Load tickets
  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      console.error("Load tickets error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tickets",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Route ticket to best agent
  const routeTicket = useCallback(
    async (ticketId: string): Promise<string> => {
      try {
        const response = await fetch(SUPPORT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "route_ticket",
            ticketId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to route ticket");
        }

        const result = await response.json();
        return result.assignedAgent;
      } catch (error) {
        console.error("Route ticket error:", error);
        throw error;
      }
    },
    []
  );

  return {
    tickets,
    isLoading,
    createTicket,
    updateTicketStatus,
    loadTickets,
    routeTicket,
  };
}