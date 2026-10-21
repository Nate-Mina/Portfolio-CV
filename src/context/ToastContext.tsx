import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'google-form';

export interface ToastDetail {
  label: string;
  value: string;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  details?: ToastDetail[];
  action?: ToastAction;
  duration?: number; // in milliseconds (default 6500)
}

export interface GoogleFormSubmissionData {
  name: string;
  email: string;
  phone: string;
  remoteOnly: boolean;
  category: string;
  details?: string;
  taskCreated?: boolean;
  onViewTasks?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'timestamp'> & { duration?: number }) => string;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message: string, action?: ToastAction) => string;
  showInfo: (title: string, message: string, action?: ToastAction) => string;
  showWarning: (title: string, message: string, action?: ToastAction) => string;
  showError: (title: string, message: string, action?: ToastAction) => string;
  showGoogleFormReceived: (data: GoogleFormSubmissionData) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id' | 'timestamp'> & { duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newToast: ToastItem = {
        ...toast,
        id,
        timestamp: timeStr,
        duration: toast.duration ?? 6500,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep up to 5 concurrent toasts
      return id;
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string, action?: ToastAction) => {
      return addToast({ type: 'success', title, message, action });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, action?: ToastAction) => {
      return addToast({ type: 'info', title, message, action });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, action?: ToastAction) => {
      return addToast({ type: 'warning', title, message, action });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message: string, action?: ToastAction) => {
      return addToast({ type: 'error', title, message, action, duration: 8000 });
    },
    [addToast]
  );

  const showGoogleFormReceived = useCallback(
    (data: GoogleFormSubmissionData) => {
      const categoryLabels: Record<string, string> = {
        build: 'Custom PC Build',
        repair: 'Hardware Repair',
        it: 'Managed IT Support',
        data: 'Data Recovery',
      };

      const categoryName = categoryLabels[data.category] || data.category.toUpperCase();

      const detailsList: ToastDetail[] = [
        { label: 'Client', value: data.name },
        { label: 'Contact', value: data.email },
        { label: 'Phone', value: data.phone },
        { label: 'Remote Only', value: data.remoteOnly ? 'Yes (Remote Diagnostics)' : 'No (On-Site / Drop-off)' },
        { label: 'Service', value: categoryName },
      ];

      return addToast({
        type: 'google-form',
        title: 'Service Request Received & Confirmed!',
        message: `Thank you, ${data.name}! Your Google Form service request has been received. Nate Mina at Pure Computers has been notified via email (${data.email}) and a follow-up task has been logged.`,
        duration: 8500,
        details: detailsList,
        action: data.taskCreated && data.onViewTasks
          ? {
              label: 'View in Google Tasks',
              onClick: data.onViewTasks,
              primary: true,
            }
          : undefined,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showInfo,
        showWarning,
        showError,
        showGoogleFormReceived,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
