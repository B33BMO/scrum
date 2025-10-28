// components/Column.tsx
import { Droppable } from './Droppable';
import { TicketCard } from './TicketCard';
import type { AteraTicket, ColumnConfig } from '@/types/ticket';

interface ColumnProps {
  config: ColumnConfig;
  tickets: AteraTicket[];
  onTicketMove: (ticketId: number, newStatus: string) => void;
  allColumns: ColumnConfig[];
  darkMode: boolean;
}

export function Column({ config, tickets, onTicketMove, allColumns, darkMode }: ColumnProps) {
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
      <div className={`rounded-xl shadow-sm border h-full flex flex-col transition-colors ${
        darkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        {/* Column Header */}
        <div className={`p-4 border-b ${
          darkMode 
            ? `${config.color} bg-opacity-20 border-slate-700` 
            : `${config.color} bg-opacity-10 border-slate-200`
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon()}</span>
              <div>
                <h2 className={`font-semibold text-lg ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {config.title}
                </h2>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  {tickets.length} tickets
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
          </div>
        </div>
        
        {/* Tickets */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
          {tickets.length === 0 ? (
            <div className={`text-center py-8 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <p>Nothing here but sweet, sweet emptiness</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <TicketCard 
                key={ticket.ticketID} 
                ticket={ticket} 
                onMove={onTicketMove}
                availableStatuses={allColumns.flatMap(col => col.statuses)}
                darkMode={darkMode}
              />
            ))
          )}
        </div>
      </div>
    </Droppable>
  );
}
