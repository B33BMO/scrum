// components/Droppable.tsx
'use client';

import { useState } from 'react';

interface DroppableProps {
  children: React.ReactNode;
  droppableId: string;
  onDrop?: (ticketId: number, newStatus: string) => void;
}

export function Droppable({ children, droppableId, onDrop }: DroppableProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const ticketData = e.dataTransfer.getData('application/json');
    if (ticketData && onDrop) {
      const { ticketId } = JSON.parse(ticketData);
      onDrop(ticketId, droppableId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-200 ${
        isOver ? 'bg-blue-50 border-blue-200 scale-105' : ''
      }`}
    >
      {children}
    </div>
  );
}
