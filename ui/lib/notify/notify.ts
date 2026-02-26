import { toast } from "sonner";

type NotifyKind = "success" | "error" | "warning" | "info";

type NotifyAction = {
  label: string;
  onClick: () => void;
};

type NotifyInput = {
  title: string;
  description?: string;
  action?: NotifyAction; // ✅ nuevo
};

const kindClass: Record<NotifyKind, string> = {
  success: "border-green-500/40 bg-green-50 text-green-950",
  error: "border-red-500/40 bg-red-50 text-red-950",
  warning: "border-yellow-500/40 bg-yellow-50 text-yellow-950",
  info: "border-blue-500/40 bg-blue-50 text-blue-950",
};

const descClass: Record<NotifyKind, string> = {
  success: "text-green-900/80",
  error: "text-red-900/80",
  warning: "text-yellow-900/80",
  info: "text-blue-900/80",
};

export const notify = {
  success: ({ title, description, action }: NotifyInput) =>
    toast.success(title, {
      description,
      action,
      className: kindClass.success,
      descriptionClassName: descClass.success,
    }),

  error: ({ title, description, action }: NotifyInput) =>
    toast.error(title, {
      description,
      action,
      className: kindClass.error,
      descriptionClassName: descClass.error,
    }),

  warning: ({ title, description, action }: NotifyInput) =>
    toast.warning(title, {
      description,
      action,
      className: kindClass.warning,
      descriptionClassName: descClass.warning,
    }),

  info: ({ title, description, action }: NotifyInput) =>
    toast(title, {
      description,
      action,
      className: kindClass.info,
      descriptionClassName: descClass.info,
    }),
};