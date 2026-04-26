import { useState, useCallback } from "react";

export interface ToastState {
  show: boolean;
  message: string;
  ok: boolean;
}

/**
 * Custom hook for managing toast notifications.
 * 
 * @returns {{ toast: ToastState, showToast: (message: string, ok?: boolean) => void }}
 */
export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", ok: true });

  /**
   * Displays a toast notification.
   * 
   * @param {string} message - The message to display.
   * @param {boolean} ok - True for success, false for error.
   */
  const showToast = useCallback((message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  }, []);

  return { toast, showToast };
};
