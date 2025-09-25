"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

// Types
export type NotificationType = "success" | "error" | "warning" | "info" | "loading";
export type NotificationPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 = không tự động đóng
  position?: NotificationPosition;
  showCloseButton?: boolean;
  showIcon?: boolean;
  actions?: NotificationAction[];
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export interface NotificationPopupProps {
  notification: Notification | null;
  onClose: () => void;
}

// Context
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, "id">) => string;
  hideNotification: (id: string) => void;
  hideAllNotifications: () => void;
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string;
  showError: (title: string, message?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string;
  showLoading: (title: string, message?: string, options?: Partial<Notification>) => string;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook để sử dụng notification context
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000, // 5 seconds default
      position: "top-right",
      showCloseButton: true,
      showIcon: true,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto hide notification
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const hideAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return showNotification({
      type: "success",
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return showNotification({
      type: "error",
      title,
      message,
      duration: 0, // Error notifications don't auto-hide
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return showNotification({
      type: "warning",
      title,
      message,
      duration: 7000, // Warning notifications stay longer
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return showNotification({
      type: "info",
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showLoading = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return showNotification({
      type: "loading",
      title,
      message,
      duration: 0, // Loading notifications don't auto-hide
      showCloseButton: false,
      ...options,
    });
  }, [showNotification]);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    return showNotification({
      type: "warning",
      title,
      message,
      duration: 0,
      showCloseButton: false,
      actions: [
        {
          label: "Hủy",
          action: () => {
            hideNotification(showNotification({ type: "warning", title, message }));
            onCancel?.();
          },
          variant: "bordered",
          color: "default",
        },
        {
          label: "Xác nhận",
          action: () => {
            hideNotification(showNotification({ type: "warning", title, message }));
            onConfirm();
          },
          variant: "solid",
          color: "danger",
        },
      ],
    });
  }, [showNotification, hideNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    hideAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showConfirm,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer notifications={notifications} onClose={hideNotification} />
    </NotificationContext.Provider>
  );
}

// Notification container component
function NotificationContainer({ notifications, onClose }: { notifications: Notification[], onClose: (id: string) => void }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {notifications.map(notification => (
        <NotificationPopup
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
}

// Main notification popup component
export function NotificationPopup({ notification, onClose }: NotificationPopupProps) {
  if (!notification) return null;

  const {
    type,
    title,
    message,
    position = "top-right",
    showCloseButton = true,
    showIcon = true,
    actions = [],
  } = notification;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "lucide:check-circle";
      case "error":
        return "lucide:x-circle";
      case "warning":
        return "lucide:alert-triangle";
      case "info":
        return "lucide:info";
      case "loading":
        return "lucide:loader-2";
      default:
        return "lucide:bell";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "loading":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  return (
    <div
      className={cn(
        "fixed pointer-events-auto max-w-sm w-full mx-4",
        getPositionClasses()
      )}
    >
      <div
        className={cn(
          "p-4 rounded-lg border shadow-lg backdrop-blur-sm",
          getColor()
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          {showIcon && (
            <div className="flex-shrink-0 mt-0.5">
              <Icon
                icon={getIcon()}
                className={cn(
                  "w-5 h-5",
                  type === "loading" && "animate-spin"
                )}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            {message && (
              <p className="text-sm opacity-90 leading-relaxed">{message}</p>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || "solid"}
                    color={action.color || "primary"}
                    onPress={action.action}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal notification component (for important notifications)
export function NotificationModal({ 
  isOpen, 
  onClose, 
  type = "info", 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  showCancel = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  type?: NotificationType;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "lucide:check-circle";
      case "error":
        return "lucide:x-circle";
      case "warning":
        return "lucide:alert-triangle";
      case "info":
        return "lucide:info";
      case "loading":
        return "lucide:loader-2";
      default:
        return "lucide:bell";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      case "loading":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Icon
              icon={getIcon()}
              className={cn("w-6 h-6", getColor(), type === "loading" && "animate-spin")}
            />
            <span className="text-lg font-semibold">{title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {message && <p className="text-gray-600">{message}</p>}
        </ModalBody>
        <ModalFooter>
          {showCancel && (
            <Button variant="bordered" onPress={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button
            color={type === "error" ? "danger" : "primary"}
            onPress={handleConfirm}
            isLoading={type === "loading"}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Utility functions
export const notificationUtils = {
  /**
   * Tạo notification từ API error
   */
  createErrorFromApi: (error: any): Omit<Notification, "id"> => {
    const message = error?.message || error?.error || "Đã xảy ra lỗi không xác định";
    return {
      type: "error",
      title: "Lỗi",
      message,
      duration: 0,
    };
  },

  /**
   * Tạo notification từ API success
   */
  createSuccessFromApi: (message: string): Omit<Notification, "id"> => {
    return {
      type: "success",
      title: "Thành công",
      message,
    };
  },

  /**
   * Tạo confirmation notification
   */
  createConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): Omit<Notification, "id"> => {
    return {
      type: "warning",
      title,
      message,
      duration: 0,
      showCloseButton: false,
      actions: [
        {
          label: "Hủy",
          action: onCancel || (() => {}),
          variant: "bordered",
          color: "default",
        },
        {
          label: "Xác nhận",
          action: onConfirm,
          variant: "solid",
          color: "danger",
        },
      ],
    };
  },
};
