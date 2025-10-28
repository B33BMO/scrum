// types/ticket.ts
export interface AteraTicket {
  ticketID: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  createdDate: string;
  customerName?: string;
  assignedTo?: string;
  customerID?: number; // Added for filtering
}

export interface ColumnConfig {
  id: string;
  title: string;
  statuses: string[]; // Atera status values that belong here
  color: string;
}

export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed' | 'Waiting' | 'Open';
