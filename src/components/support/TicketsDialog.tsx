// src/components/support/TicketsDialog.tsx
import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket as TicketType, TicketStatus } from "@/types/support";
import { formatDistanceToNow } from "date-fns";

interface TicketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tickets: TicketType[];
  onLoadTickets: () => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
}

const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  waiting: Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const statusColors = {
  open: "text-red-400",
  in_progress: "text-blue-400",
  waiting: "text-yellow-400",
  resolved: "text-green-400",
  closed: "text-gray-400",
};

const priorityColors = {
  low: "bg-gray-500/20 text-gray-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-orange-500/20 text-orange-300",
  urgent: "bg-red-500/20 text-red-300",
};

export function TicketsDialog({
  open,
  onOpenChange,
  tickets,
  onLoadTickets,
  onUpdateStatus,
}: TicketsDialogProps) {
  useEffect(() => {
    if (open) {
      onLoadTickets();
    }
  }, [open, onLoadTickets]);

  const openTickets = tickets.filter(t => 
    t.status === "open" || t.status === "in_progress"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets
          </DialogTitle>
          <DialogDescription>
            Manage and track your support requests
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tickets.length} Total</Badge>
            <Badge variant="destructive">{openTickets.length} Open</Badge>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No support tickets yet</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status];
                
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-4 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{ticket.title}</h4>
                          <StatusIcon className={`h-4 w-4 ${statusColors[ticket.status]}`} />
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${priorityColors[ticket.priority]}`}
                          >
                            {ticket.priority}
                          </Badge>
                          
                          <Badge variant="outline" className="text-[10px]">
                            {ticket.category}
                          </Badge>
                          
                          {ticket.assignedAgent && (
                            <Badge variant="secondary" className="text-[10px]">
                              {ticket.assignedAgent}
                            </Badge>
                          )}
                          
                          {ticket.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {ticket.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onUpdateStatus(ticket.id, "in_progress")}
                          >
                            Start
                          </Button>
                        )}
                        
                        {ticket.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onUpdateStatus(ticket.id, "resolved")}
                          >
                            Resolve
                          </Button>
                        )}
                        
                        {ticket.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => onUpdateStatus(ticket.id, "closed")}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}