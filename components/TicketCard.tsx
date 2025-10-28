// components/TicketCard.tsx
import { useState } from 'react';
import { MoreVertical, Calendar, User, AlertTriangle } from 'lucide-react';
import type { AteraTicket } from '@/types/ticket';

interface TicketCardProps {
  ticket: AteraTicket;
  onMove: (ticketId: number, newStatus: string) => void;
  availableStatuses: string[];
  darkMode: boolean;
}

export function TicketCard({ ticket, onMove, darkMode }: TicketCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = (priority?: string) => {
    const baseColors = {
      high: darkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-300 text-red-800',
      medium: darkMode ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' : 'bg-yellow-100 border-yellow-300 text-yellow-800',
      low: darkMode ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-100 border-green-300 text-green-800',
      default: darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
    };

    switch (priority?.toLowerCase()) {
      case 'high': return baseColors.high;
      case 'medium': return baseColors.medium;
      case 'low': return baseColors.low;
      default: return baseColors.default;
    }
  };

  const getStatusColor = (status: string) => {
    const baseColors = {
      new: darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      inprogress: darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      default: darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
    };

    switch (status.toLowerCase()) {
      case 'new': return baseColors.new;
      case 'inprogress': return baseColors.inprogress;
      default: return baseColors.default;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const availableActions = [
    { label: 'Start Progress', status: 'InProgress' },
    { label: 'Mark Resolved', status: 'Resolved' },
    { label: 'Re-open', status: 'New' },
    { label: 'Put on Hold', status: 'Waiting' },
  ].filter(action => action.status !== ticket.status);

  return (
    <div className="group relative">
      <div className={`rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
        darkMode 
          ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}>
        {/* Ticket Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-semibold line-clamp-2 mb-1 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
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
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
              darkMode ? 'hover:bg-slate-500' : 'hover:bg-slate-100'
            }`}
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Ticket Description */}
        {ticket.description && (
          <p className={`text-sm mb-3 line-clamp-3 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {ticket.description}
          </p>
        )}

        {/* Ticket Metadata */}
        <div className={`flex items-center justify-between text-xs ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
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
          
          <span className={`px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        {/* Action Menu */}
        {showActions && (
          <div className={`absolute top-12 right-2 rounded-lg shadow-lg z-10 min-w-32 border ${
            darkMode 
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-white border-slate-200'
          }`}>
            {availableActions.map(action => (
              <button
                key={action.status}
                onClick={() => {
                  onMove(ticket.ticketID, action.status);
                  setShowActions(false);
                }}
                className={`w-full text-left px-3 py-2 first:rounded-t-lg last:rounded-b-lg text-sm ${
                  darkMode 
                    ? 'hover:bg-slate-600 text-white' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
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
