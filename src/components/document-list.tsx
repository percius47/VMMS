"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/utils/supabase/client";
import { getFilePreviewType, formatFileSize } from "@/utils/file-preview";

interface Document {
  id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  description: string | null;
  signed_url: string | null;
  created_at: string;
}

export default function DocumentList() {
  const { user } = useAuth();
  const supabase = createClient();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/documents");

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const result = await response.json();
      setDocuments(result.data || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(documentId);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete document");
      }

      // Remove the document from the list
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Error deleting document:", err);
      alert(
        "Failed to delete document: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (docItem: Document) => {
    try {
      // Use Supabase's download method directly
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("vendor-documents")
        .download(docItem.file_name);

      if (error) {
        console.error("Error downloading file:", error);
        alert("Failed to download document: " + error.message);
        return;
      }

      if (!data) {
        alert("Download failed: No data received");
        return;
      }

      // Create a URL for the blob data
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = docItem.original_name;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert(
        "Failed to download document: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string) => {
    const previewType = getFilePreviewType(fileType);

    switch (previewType) {
      case "image":
        return "📷";
      case "pdf":
        return "📄";
      case "word":
        return "📝";
      default:
        return "📁";
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Uploaded Documents
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Uploaded Documents
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Uploaded Documents
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
          uploaded
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No documents
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading a new document.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <li
                key={document.id}
                className="relative col-span-1 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex-1 flex flex-col p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                    <span className="text-2xl">
                      {getFileIcon(document.file_type)}
                    </span>
                  </div>
                  <div className="mt-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.original_name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatFileSize(document.file_size)}
                    </p>
                    {document.description && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(document.created_at)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="flex-1 flex">
                      <button
                        onClick={() => handleDownload(document)}
                        className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-3 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          ></path>
                        </svg>
                        <span className="ml-2">Download</span>
                      </button>
                    </div>
                    <div className="flex-1 flex">
                      <button
                        onClick={() => handleDelete(document.id)}
                        disabled={deletingId === document.id}
                        className="relative w-0 flex-1 inline-flex items-center justify-center py-3 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500 disabled:opacity-50"
                      >
                        {deletingId === document.id ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"
                              ></path>
                            </svg>
                            <span className="ml-2">Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
