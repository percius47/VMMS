/**
 * Utility functions for file preview and handling
 */

export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith("image/");
};

export const isPdfFile = (fileType: string): boolean => {
  return fileType === "application/pdf";
};

export const isWordFile = (fileType: string): boolean => {
  return (
    fileType === "application/msword" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
};

export const getFilePreviewType = (
  fileType: string
): "image" | "pdf" | "word" | "other" => {
  if (isImageFile(fileType)) {
    return "image";
  } else if (isPdfFile(fileType)) {
    return "pdf";
  } else if (isWordFile(fileType)) {
    return "word";
  } else {
    return "other";
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
