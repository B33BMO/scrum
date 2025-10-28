// components/TicketCard.tsx
import { useState } from 'react';
import { MoreVertical, Calendar, User, AlertTriangle } from 'lucide-react';
import type { AteraTicket } from '@/types/ticket';

interface TicketCardProps {
  ticket: AteraTicket;
  onMove: (ticketId: number, newStatus: string) => void;
  availableStatuses: string[];
}

export function TicketCard({ ticket, onMove }: TicketCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
const handleDragStart = (e: React.DragEvent) => {
  e.dataTransfer.setData('application/json', JSON.stringify({
    ticketId: ticket.ticketID
  }));
};
  const availableActions = [
    { label: 'Start Progress', status: 'InProgress' },
    { label: 'Mark Resolved', status: 'Resolved' },
    { label: 'Re-open', status: 'New' },
    { label: 'Put on Hold', status: 'Waiting' },
  ].filter(action => action.status !== ticket.status);

  return (
    <div className="group relative">
        <div 
  className="group relative"
  draggable
  onDragStart={handleDragStart}
></div>
      <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all duration-200">
        {/* Ticket Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">
              #{ticket.ticketID} - {ticket.title}
            </h3>
            
            {ticket.priority && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setShowActions(!showActions)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Ticket Description */}
        {ticket.description && (
          <p className="text-slate-600 text-sm mb-3 line-clamp-3">
            {ticket.description}
          </p>
        )}

        {/* Ticket Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(ticket.createdDate)}
            </div>
            
            {ticket.customerName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {ticket.customerName}
              </div>
            )}
          </div>
          
          <span className={`px-2 py-1 rounded ${
            ticket.status === 'New' ? 'bg-blue-100 text-blue-800' :
            ticket.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket.status}
          </span>
        </div>

        {/* Action Menu */}
        {showActions && (
          <div className="absolute top-12 right-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
            {availableActions.map(action => (
              <button
                key={action.status}
                onClick={() => {
                  onMove(ticket.ticketID, action.status);
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
