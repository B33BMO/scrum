// components/Column.tsx
import { Droppable } from './Droppable';
import { TicketCard } from './TicketCard';
import type { AteraTicket, ColumnConfig } from '@/types/ticket';

interface ColumnProps {
  config: ColumnConfig;
  tickets: AteraTicket[];
  onTicketMove: (ticketId: number, newStatus: string) => void;
  allColumns: ColumnConfig[];
}

export function Column({ config, tickets, onTicketMove, allColumns }: ColumnProps) {
  const getStatusIcon = () => {
    switch (config.id) {
      case 'open': return '⏰';
      case 'ongoing': return '🚧';
      case 'resolved': return '✅';
      default: return '📋';
    }
  };

  return (
    <Droppable droppableId={config.id}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
        {/* Column Header */}
        <div className={`p-4 border-b border-slate-200 ${config.color} bg-opacity-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon()}</span>
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">{config.title}</h2>
                <p className="text-slate-600 text-sm">{tickets.length} tickets</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
          </div>
        </div>
        
        {/* Tickets */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Nothing here but sweet, sweet emptiness</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <TicketCard 
                key={ticket.ticketID} 
                ticket={ticket} 
                onMove={onTicketMove}
                availableStatuses={allColumns.flatMap(col => col.statuses)}
              />
            ))
          )}
        </div>
      </div>
    </Droppable>
  );
}
