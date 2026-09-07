"use client";

import React, { useState, useRef } from "react";
import { HiCloudUpload, HiDocumentText, HiTrash, HiCheckCircle } from "react-icons/hi";
import { Button } from "@/components/ui/Button";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<any>;
  isUploading: boolean;
  progress: number;
}

export function UploadZone({ onUpload, isUploading, progress }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [".csv", ".xlsx", ".xls", ".pdf", ".doc", ".docx"];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSuccess(false);
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setError(`Unsupported file type. Please upload a CSV, Excel, Word, or PDF document.`);
      setSelectedFile(null);
      return;
    }
    
    // Max size: 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setError(null);
    try {
      await onUpload(selectedFile);
      setSuccess(true);
      setSelectedFile(null);
      // Automatically clear success banner after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : triggerFileSelect}
        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer select-none ${
          dragActive
            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
            : selectedFile
            ? "border-gray-300 bg-field/50 cursor-default"
            : "border-border bg-field/30 hover:bg-field hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedExtensions.join(",")}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-primary/5 border border-primary/10 text-primary rounded-2xl">
              <HiDocumentText className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="flex flex-col items-center text-center gap-1 w-full">
              <span className="text-sm font-bold text-ink line-clamp-1 break-all px-4">
                {selectedFile.name}
              </span>
              <span className="text-xs font-semibold text-ink/40">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>

            {isUploading ? (
              <div className="w-full flex flex-col gap-2 p-2">
                <div className="h-2 w-full bg-canvas rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 shadow-sm shadow-primary/20"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-ink/40 uppercase">
                  <span>Uploading file...</span>
                  <span className="text-ink font-extrabold">{progress}%</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center pt-2">
                <Button variant="secondary" onClick={() => setSelectedFile(null)} className="!px-3.5 !py-1.5 shrink-0">
                  <HiTrash className="w-4 h-4 text-rose-500" />
                  Clear File
                </Button>
                <Button variant="primary" onClick={handleStartUpload} className="shadow-md shadow-primary/25 !px-5 !py-2 shrink-0">
                  Upload & Ingest
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-4 bg-canvas border border-border/50 text-ink/40 rounded-2xl group-hover:text-primary transition-colors">
              <HiCloudUpload className="w-10 h-10" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink/90">
                Drag and drop your file here, or <span className="text-primary hover:underline font-extrabold">browse files</span>
              </span>
              <span className="text-xs font-semibold text-ink/40">
                Supports CSV, Excel (XLSX, XLS), PDF, and Word (DOCX, DOC) up to 50MB
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200/50 text-rose-700 text-xs font-bold rounded-2xl animate-fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-hover border border-border/50 text-ink text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <HiCheckCircle className="w-5 h-5 text-ink/55 shrink-0" />
          File uploaded successfully! Processing will begin in the background.
        </div>
      )}
    </div>
  );
}
