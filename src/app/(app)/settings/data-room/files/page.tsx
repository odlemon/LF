"use client";

import React, { useState, useEffect, useCallback } from "react";
import { dataRoomApi } from "@/lib/api/modules/dataroom.api";
import { FileMetadata, FileStorageStatus } from "@/modules/data-room/types";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  HiDocumentText,
  HiDownload,
  HiTrash,
  HiUpload,
  HiRefresh,
  HiPhotograph,
  HiCode,
  HiDocumentReport,
  HiTable,
  HiPresentationChartBar,
  HiExclamation,
  HiCheckCircle,
  HiCloudUpload,
} from "react-icons/hi";

export default function FileStoragePage() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.listFiles();
      setFiles(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load files.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (uid: string) => {
    setIsDeleting(true);
    try {
      await dataRoomApi.deleteFile(uid);
      toast.success("File deleted successfully.");
      setFiles((prev) => prev.filter((f) => f.uid !== uid));
      setConfirmDeleteUid(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await dataRoomApi.uploadFile(file, undefined, (progress) => {
        setUploadProgress(progress);
      });
      toast.success(`"${file.name}" uploaded successfully.`);
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset the input so the same file can be selected again
      e.target.value = "";
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) return <HiDocumentText className="w-5 h-5 text-rose-500" />;
    if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("csv"))
      return <HiTable className="w-5 h-5 text-emerald-500" />;
    if (contentType.includes("image")) return <HiPhotograph className="w-5 h-5 text-blue-500" />;
    if (contentType.includes("json") || contentType.includes("xml") || contentType.includes("text"))
      return <HiCode className="w-5 h-5 text-indigo-500" />;
    if (contentType.includes("word") || contentType.includes("document"))
      return <HiDocumentReport className="w-5 h-5 text-blue-600" />;
    if (contentType.includes("presentation"))
      return <HiPresentationChartBar className="w-5 h-5 text-orange-500" />;
    return <HiDocumentText className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: FileStorageStatus) => {
    let styles = "";
    switch (status) {
      case "ACTIVE":
        styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "INACTIVE":
        styles = "bg-gray-100 text-gray-500 border-gray-200";
        break;
      case "PENDING":
        styles = "bg-amber-50 text-amber-700 border-amber-200";
        break;
      case "SUSPENDED":
        styles = "bg-rose-50 text-rose-600 border-rose-200";
        break;
      case "DELETED":
        styles = "bg-gray-100 text-gray-400 border-gray-200 line-through";
        break;
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border ${styles}`}>
        {status}
      </span>
    );
  };

  const getContentTypeLabel = (contentType: string) => {
    const map: Record<string, string> = {
      "application/pdf": "PDF",
      "text/csv": "CSV",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
      "application/vnd.ms-excel": "XLS",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/msword": "DOC",
      "application/json": "JSON",
      "text/plain": "TXT",
      "image/png": "PNG",
      "image/jpeg": "JPEG",
      "image/gif": "GIF",
      "image/svg+xml": "SVG",
    };
    return map[contentType] || contentType.split("/").pop()?.toUpperCase() || contentType;
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <HiCloudUpload className="w-7 h-7 text-primary" /> File Storage
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage files stored in your firm&apos;s MinIO object storage. Upload, download, or remove files.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchFiles} disabled={isLoading}>
            <HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="primary"
            loading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <HiUpload className="w-4 h-4" /> Upload File
          </Button>
        </div>
      </div>

      {/* Upload progress bar */}
      {isUploading && (
        <div className="bg-white border border-primary/20 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
              <HiUpload className="w-4 h-4 text-primary animate-bounce" /> Uploading file...
            </span>
            <span className="text-xs font-extrabold text-gray-900">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 shadow-sm shadow-primary/20"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File listing table */}
      <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto rates-scrollable">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-5 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-5 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-5 py-4 text-left font-bold text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-5 py-4 text-right font-bold text-gray-500 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-gray-50/20">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-gray-150 rounded w-5/6 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-rose-600">
                      <HiExclamation className="w-6 h-6" />
                      <span className="text-sm font-bold">{error}</span>
                      <button
                        onClick={fetchFiles}
                        className="text-xs font-bold text-primary hover:underline mt-1 cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <HiCloudUpload className="w-7 h-7 text-gray-300" />
                      </div>
                      <span className="text-sm font-semibold">No files uploaded yet.</span>
                      <span className="text-xs text-gray-400">
                        Click &quot;Upload File&quot; to store a file in object storage.
                      </span>
                      <Button
                        variant="primary"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                      >
                        <HiUpload className="w-4 h-4" /> Upload File
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.uid} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.contentType)}
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-gray-900 font-extrabold truncate max-w-[220px] block"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {file.bucketName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 border border-gray-200/80 rounded bg-gray-50 text-gray-655 font-bold text-[10px] uppercase">
                        {getContentTypeLabel(file.contentType)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatFileSize(file.fileSize)}</td>
                    <td className="px-5 py-4">{getStatusBadge(file.status)}</td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(file.uploadedAt)}</td>
                    <td className="px-5 py-4 text-gray-600">{file.uploadedBy || <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteUid === file.uid ? (
                        <div className="flex gap-1.5 justify-end items-center">
                          <button
                            onClick={() => handleDelete(file.uid)}
                            disabled={isDeleting}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 rounded-full hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                          >
                            {isDeleting ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteUid(null)}
                            className="px-2 py-1 text-[10px] font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end items-center">
                          <a
                            href={dataRoomApi.getDownloadUrl(file.uid)}
                            download={file.fileName}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <HiDownload className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setConfirmDeleteUid(file.uid)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {!isLoading && !error && files.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-[11px] font-semibold text-gray-500">
            <span>{files.length} file{files.length !== 1 ? "s" : ""} stored</span>
            <span className="text-gray-400">
              Total: {formatFileSize(files.reduce((acc, f) => acc + f.fileSize, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
