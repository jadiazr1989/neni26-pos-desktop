import { toast } from "sonner";

type NotifyKind = "success" | "error" | "warning" | "info";

type NotifyInput = {
  title: string;
  description?: string;
};

const kindClass: Record<NotifyKind, string> = {
  success: "border-green-500/40 bg-green-50 text-green-950",
  error: "border-red-500/40 bg-red-50 text-red-950",
  warning: "border-yellow-500/40 bg-yellow-50 text-yellow-950",
  info: "border-blue-500/40 bg-blue-50 text-blue-950",
};

const titleClass: Record<NotifyKind, string> = {
  success: "text-green-950",
  error: "text-red-950",
  warning: "text-yellow-950",
  info: "text-blue-950",
};

const descClass: Record<NotifyKind, string> = {
  success: "text-green-900/80",
  error: "text-red-900/80",
  warning: "text-yellow-900/80",
  info: "text-blue-900/80",
};

export const notify = {
  success: ({ title, description }: NotifyInput) =>
    toast.success(title, {
      description,
      className: kindClass.success,
      descriptionClassName: descClass.success,
    }),

  error: ({ title, description }: NotifyInput) =>
    toast.error(title, {
      description,
      className: kindClass.error,
      descriptionClassName: descClass.error,
    }),

  warning: ({ title, description }: NotifyInput) =>
    toast.warning(title, {
      description,
      className: kindClass.warning,
      descriptionClassName: descClass.warning,
    }),

  info: ({ title, description }: NotifyInput) =>
    toast(title, {
      description,
      className: kindClass.info,
      descriptionClassName: descClass.info,
    }),
};
