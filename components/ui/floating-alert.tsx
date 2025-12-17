// components/ui/FloatingAlert.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
// Eğer 'cn' util dosyanız varsa, import edin. Yoksa bu satırı silin.
import { cn } from '@/lib/utils'; 

interface FloatingAlertProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number; // Time in milliseconds before the alert disappears (default 4000)
  onClose: () => void;
}

const FloatingAlert: React.FC<FloatingAlertProps> = ({ 
    type, 
    title, 
    message, 
    duration = 4000, 
    onClose 
}) => {
  
  // Alert'i göstermek için state (initial render'da görünmeli)
  const [isVisible, setIsVisible] = useState(true);

  // Otomatik kapanma zamanlayıcısı
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose(); // Kapanma işlemi bittiğinde parent component'i bilgilendir
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, isVisible]);

  if (!isVisible) return null;

  // Tipine göre stil ve ikon belirleme
  const baseClasses = "fixed bottom-4 right-4 z-[100] w-full max-w-sm border shadow-lg transition-transform duration-300 translate-x-0";
  let icon, colorClasses;

  switch (type) {
    case 'success':
      icon = <CheckCircle className="h-4 w-4 text-green-600" />;
      colorClasses = "bg-green-50 border-green-200 text-green-800";
      break;
    case 'error':
      icon = <XCircle className="h-4 w-4 text-red-600" />;
      colorClasses = "bg-red-50 border-red-200 text-red-800";
      break;
    case 'info':
    default:
      icon = <AlertTriangle className="h-4 w-4 text-blue-600" />;
      colorClasses = "bg-blue-50 border-blue-200 text-blue-800";
      break;
  }

  return (
    <div className={cn(baseClasses, colorClasses)}>
      <Alert className="flex items-start">
        <div className="flex-shrink-0 mt-0.5 mr-3">{icon}</div>
        <div className="flex-grow">
          <AlertTitle className="font-semibold text-base">{title}</AlertTitle>
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default FloatingAlert;