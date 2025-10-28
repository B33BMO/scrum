// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Sun, Moon } from 'lucide-react';
import { Column } from '@/components/Column';
import { TicketCard } from '@/components/TicketCard';
import type { AteraTicket, ColumnConfig } from '@/types/ticket';

export default function ScrumBoard() {
  const [tickets, setTickets] = useState<AteraTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showCCITickets, setShowCCITickets] = useState(false);

  // Atera API config
  const API_KEY = process.env.NEXT_PUBLIC_ATERA_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_ATERA_BASE_URL;

  // Column configuration - map Atera statuses to our columns
  const columns: ColumnConfig[] = [
    { 
      id: 'open', 
      title: 'Open', 
      statuses: ['Open', 'New', 'Waiting'],  // Added 'Open' which is what Atera uses
      color: 'bg-blue-500' 
    },
    { 
      id: 'ongoing', 
      title: 'Ongoing', 
      statuses: ['InProgress', 'In Progress'],  // Added variation
      color: 'bg-yellow-500' 
    },
    { 
      id: 'resolved', 
      title: 'Resolved', 
      statuses: ['Resolved', 'Closed', 'Completed'],  // Added more possibilities
      color: 'bg-green-500' 
    },
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchTickets = async () => {
    if (!API_KEY) {
      setError('API key missing - check your .env file, dumbass');
      setLoading(false);
      return;
    }

    console.log('🔍 Starting fetch...');

    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`${BASE_URL}/tickets`, {
        headers: {
          'X-API-KEY': API_KEY,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key invalid - did you actually set it?');
        }
        throw new Error(`Atera said "fuck you": ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API response:', data);
      
      if (data.items) {
        console.log(`🎯 Found ${data.items.length} tickets`);
        
        const mappedTickets: AteraTicket[] = data.items.map((item: any) => ({
          ticketID: item.TicketID || item.ticketID,
          title: item.TicketTitle || item.title,
          description: item.TicketDescription || item.description || '',
          status: item.TicketStatus || item.status,
          priority: item.TicketPriority || item.priority,
          createdDate: item.CreatedDate || item.createdDate || new Date().toISOString(),
          customerName: item.EndUserEmail || item.customerName || 'Unknown Customer',
          assignedTo: item.AssignedTo || item.assignedTo || '',
          customerID: item.EndUserID || item.customerID, // Added customerID for filtering
        }));
        
        // FILTER OUT CCI TICKETS (Customer ID 36) with toggle option
        const filteredTickets = showCCITickets 
          ? mappedTickets // Show all tickets including CCI
          : mappedTickets.filter(ticket => ticket.customerID !== 36); // Filter out CCI
        
        console.log('✅ Total tickets before filter:', mappedTickets.length);
        console.log('✅ Tickets after filtering:', filteredTickets.length);
        console.log('📊 CCI tickets included:', showCCITickets);
        console.log('📊 Unique statuses in response:', [...new Set(mappedTickets.map(t => t.status))]);
        
        setTickets(filteredTickets);
      } else {
        console.log('❌ No "items" property found in response');
        setTickets([]);
      }
    } catch (err) {
      console.error('💥 Fetch failed spectacularly:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      // Atera might expect "TicketStatus" instead of "status"
      const response = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'X-API-KEY': API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          TicketStatus: newStatus,
          status: newStatus // Send both to cover our bases
        }),
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
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    fetchTickets();
  }, []);

  // Refetch when CCI toggle changes
  useEffect(() => {
    if (!loading) {
      fetchTickets();
    }
  }, [showCCITickets]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        darkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-4 ${
            darkMode ? 'text-blue-400' : 'text-blue-500'
          }`} />
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
            Loading tickets... because waiting is half the fun
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors p-6 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Atera Scrum Board
            </h1>
            <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
              {tickets.length} tickets waiting for attention {showCCITickets ? '(including CCI)' : '(CCI filtered out)'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* CCI Toggle */}
            <button
              onClick={() => setShowCCITickets(!showCCITickets)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                showCCITickets
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : darkMode
                  ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {showCCITickets ? '✅' : '🚫'} CCI Tickets
            </button>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg border transition-all ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-yellow-300 hover:bg-slate-600' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              } hover:shadow-sm`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Refresh button */}
            <button
              onClick={fetchTickets}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                darkMode
                  ? 'bg-slate-700 border border-slate-600 text-white hover:bg-slate-600'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className={`mt-4 flex items-center gap-2 rounded-lg p-4 ${
            darkMode 
              ? 'bg-red-900/20 border border-red-800 text-red-200' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-sm opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
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
                darkMode={darkMode}
              />
            );
          })}
        </div>

        {tickets.length === 0 && !error && (
          <div className={`text-center py-12 rounded-lg ${
            darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${
              darkMode ? 'text-slate-600' : 'text-slate-300'
            }`} />
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
              {loading ? 'Loading...' : 'No tickets found. Enjoy the peace while it lasts.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className={`text-center text-sm ${
          darkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Built with Next.js, Tailwind v4, and probably too much caffeine
          {showCCITickets ? ' | CCI tickets visible' : ' | CCI tickets filtered out'}
        </p>
      </div>
    </div>
  );
}
