"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, FileUp, MoveLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentVerificationStepProps {
  documentType: string;
  file: File | null;
  isDragging: boolean;
  isLoading: boolean;
  setDocumentType: (value: string) => void;
  setFile: (file: File | null) => void;
  setIsDragging: (value: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
  country: string | undefined;
}

export default function DocumentVerificationStep({
  documentType,
  file,
  isDragging,
  isLoading,
  setDocumentType,
  setFile,
  setIsDragging,
  onSubmit,
  onBack,
  country,
}: DocumentVerificationStepProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxSize = 16 * 1024 * 1024; // 16MB in bytes

      if (file.size > maxSize) {
        toast.error("File size too large. Maximum size allowed is 16MB.");
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png)$/) && file.type !== 'application/pdf') {
        toast.error("Invalid file format. Please upload JPG, PNG, or PDF files only.");
        return;
      }

      setFile(file);
      toast.success("Document uploaded successfully!");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxSize = 16 * 1024 * 1024; // 16MB in bytes

      if (file.size > maxSize) {
        toast.error("File size too large. Maximum size allowed is 16MB.");
        e.target.value = ''; // Clear the input
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png)$/) && file.type !== 'application/pdf') {
        toast.error("Invalid file format. Please upload JPG, PNG, or PDF files only.");
        e.target.value = ''; // Clear the input
        return;
      }

      setFile(file);
      // toast.success("Document uploaded successfully!");
    }
  };

  return (
    <div className="dark:text-[#FFFFFF] text-[#000000]">
      <div className="text-center mb-6">
        <h1 className="text-xl">Upload your Proof of Identity</h1>
        <span className="text-xs">
          Make sure your Name matches your Identity Card
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <Card className="border-0 bg-[#FFFFFF] dark:bg-[#01040D] p-6 dark:text-[#FFFFFF] text-[#000000] flex-1 max-w-md">
          <div className="space-y-6">
            <div className="space-y-2">
              <Select onValueChange={setDocumentType} value={documentType}>
                <SelectTrigger className="border-gray-300 dark:border-[#2a3247] bg-[#FFFFFF] dark:bg-[#01040D] w-full h-12 dark:text-[#FFFFFF] text-[#000000] focus:ring-[#8046c9]">
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent className="border-gray-300 dark:border-[#2a3247] bg-[#FFFFFF] dark:bg-[#01040D] dark:text-[#FFFFFF] text-[#000000]">
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="id_card">{country === "India" ? "PAN Card" : "ID Card"}</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${isDragging
                    ? "border-[#8046c9] bg-[#FFFFFF] dark:bg-[#8046c9]/10"
                    : file
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-gray-300 dark:border-[#2a3247] bg-[#FFFFFF] dark:bg-[#01040D]"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="text-center">
                    <Check className="text-green-400 h-10 w-full mb-4 flex items-center justify-center" />
                    <p className="text-sm dark:text-[#FFFFFF] text-[#000000]">{file.name}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500 cursor-pointer hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileUp className="mb-2 h-6 w-6 text-[#9F8BCF]" />
                    <p className="mb-1 text-sm dark:text-[#FFFFFF] text-[#000000]">
                      Front side of your document
                    </p>
                    <p className="mb-4 text-xs text-zinc-400">
                      Supports: JPG, PNG, PDF (max 16MB)
                    </p>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="rounded-full bg-[#FFFFFF] dark:bg-[#01040D] px-4 py-2 text-sm dark:text-[#FFFFFF] text-[#000000] border border-gray-400 hover:bg-[#FFFFFF] dark:hover:bg-[#01040D]">
                        Choose a File
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col items-center mt-6 gap-4">
        <Button
          className="w-full max-w-md cursor-pointer bg-gradient-to-r from-[#6242a5] to-[#9f8bcf] dark:text-[#FFFFFF] text-[#000000]"
          onClick={onSubmit}
          disabled={isLoading || !file || !documentType}
        >
          {isLoading ? "Verifying..." : "Upload Documents"}
        </Button>
        <Button
          className="bg-[#FFFFFF] dark:bg-[#01040D] dark:text-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF] dark:hover:bg-[#01040D] cursor-pointer underline"
          onClick={onBack}
        >
          <MoveLeft className="h-4 w-4 mr-2" />
          <span>Back</span>
        </Button>
      </div>
    </div>
  );
}
