import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useThemeStore } from '@/store/useThemeStore';

export function ToastContainer() {
  const { theme } = useThemeStore();
  return <Toaster theme={theme as any} />;
}

export default ToastContainer;
