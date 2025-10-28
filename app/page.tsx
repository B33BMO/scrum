// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Column } from '@/components/Column';
import { TicketCard } from '@/components/TicketCard';
import type { AteraTicket, ColumnConfig } from '@/types/ticket';

export default function ScrumBoard() {
  const [tickets, setTickets] = useState<AteraTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Atera API config
  const API_KEY = process.env.NEXT_PUBLIC_ATERA_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_ATERA_BASE_URL;

  // Column configuration - map Atera statuses to our columns
  const columns: ColumnConfig[] = [
    { 
      id: 'open', 
      title: 'Open', 
      statuses: ['New', 'Waiting'], 
      color: 'bg-blue-500' 
    },
    { 
      id: 'ongoing', 
      title: 'Ongoing', 
      statuses: ['InProgress'], 
      color: 'bg-yellow-500' 
    },
    { 
      id: 'resolved', 
      title: 'Resolved', 
      statuses: ['Resolved', 'Closed'], 
      color: 'bg-green-500' 
    },
  ];

  const fetchTickets = async () => {
    if (!API_KEY) {
      setError('API key missing - check your .env file, dumbass');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
          'X-API-KEY': API_KEY,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key invalid - did you actually set it?');
        }
        throw new Error(`Atera said "fuck you": ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTickets(data.items || []);
    } catch (err) {
      console.error('Fetch failed spectacularly:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'X-API-KEY': API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket - Atera being difficult');
      }

      // Refresh tickets after update
      await fetchTickets();
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update ticket status');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading tickets... because waiting is half the fun</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Atera Scrum Board
            </h1>
            <p className="text-slate-600">
              {tickets.length} tickets waiting to ruin your day
            </p>
          </div>
          
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Board */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => {
            const columnTickets = tickets.filter(ticket => 
              column.statuses.includes(ticket.status)
            );
            
            return (
              <Column 
                key={column.id}
                config={column}
                tickets={columnTickets}
                onTicketMove={updateTicketStatus}
                allColumns={columns}
              />
            );
          })}
        </div>

        {tickets.length === 0 && !error && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No tickets found. Either you're amazing at your job or the API is lying.</p>
          </div>
        )}
      </div>
    </div>
  );
}
