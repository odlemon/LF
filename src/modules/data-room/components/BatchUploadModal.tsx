"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { HiDocumentText, HiTrash, HiX, HiPlus } from "react-icons/hi";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<any>;
}

export function BatchUploadModal({ isOpen, onClose, onUpload }: BatchUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [".csv", ".xlsx", ".xls", ".pdf", ".doc", ".docx"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      const validFiles: File[] = [];
      let tempError: string | null = null;

      for (const file of filesArr) {
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          tempError = "Some selected files are of unsupported formats and were skipped.";
          continue;
        }
        if (file.size > 50 * 1024 * 1024) {
          tempError = "Some files exceed the 50MB limit and were skipped.";
          continue;
        }
        validFiles.push(file);
      }

      const totalFiles = [...selectedFiles, ...validFiles];
      if (totalFiles.length > 20) {
        tempError = "Maximum of 20 files can be uploaded in a single batch.";
        setSelectedFiles(totalFiles.slice(0, 20));
      } else {
        setSelectedFiles(totalFiles);
      }

      if (tempError) {
        setError(tempError);
      } else {
        setError(null);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to upload batch of files.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Multiple Files">
      <div className="flex flex-col gap-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200/50 text-red-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold text-ink/40 uppercase tracking-wider">
            <span>Selected Files ({selectedFiles.length} / 20)</span>
            {selectedFiles.length < 20 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline flex items-center gap-1 font-extrabold cursor-pointer"
              >
                <HiPlus className="w-3.5 h-3.5" /> Add Files
              </button>
            )}
          </div>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={allowedExtensions.join(",")}
            className="hidden"
          />

          {selectedFiles.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 bg-field/20 hover:bg-field p-10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center select-none"
            >
              <HiDocumentText className="w-8 h-8 text-ink/40" />
              <span className="text-sm font-bold text-ink/65">Select files to upload...</span>
              <span className="text-xs text-ink/40">CSV, Excel, Word, or PDF up to 50MB</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto rates-scrollable pr-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-field border border-border/40 rounded-xl gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <HiDocumentText className="w-5 h-5 text-ink/40 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-ink line-clamp-1 break-all">
                        {file.name}
                      </span>
                      <span className="text-[10px] font-semibold text-ink/40">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={isUploading}
                    onClick={() => removeFile(idx)}
                    type="button"
                    className="p-1 hover:bg-hover/50 rounded-lg text-ink/40 hover:text-red-500 cursor-pointer disabled:opacity-50"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={selectedFiles.length === 0}
            onClick={handleUploadSubmit}
            loading={isUploading}
          >
            Upload Ingest Queue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
