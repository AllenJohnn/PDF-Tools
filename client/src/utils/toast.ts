import toast from "react-hot-toast";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const updateToast = (toastId: string, message: string, type: "success" | "error" = "success") => {
  toast.dismiss(toastId);
  if (type === "success") {
    toast.success(message);
  } else {
    toast.error(message);
  }
};
