"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import FormButton from "@/components/form/form-button";
import { scanReceiptAction } from "@/actions/receipt-actions";
import { useToast } from "@/hooks/use-toast";

type UploadFormProps = {
  onScanResult: (results: any) => void;
};

export default function UploadForm({ onScanResult }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    onScanResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      console.error("No file selected");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await scanReceiptAction(formData);
      if (response.error) {
        toast({
          variant: "destructive",
          description: response.error,
        });
      } else if (response.success) {
        onScanResult(response.data);
      }
    } catch (error) {
      toast({
        description: "Unable to process receipt",
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-40 h-40 mb-2 overflow-hidden rounded-md border">
              <img
                src={URL.createObjectURL(file)}
                alt="Receipt preview"
                className="object-cover w-full h-full"
                onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
              />
            </div>
            <span className="text-sm font-medium">{file.name}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFile(null)}
            >
              Change File
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("receipt")?.click()}
            >
              Browse Files
            </Button>
          </>
        )}
        <input
          id="receipt"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <FormButton
        isSubmitting={isLoading}
        disabled={!file}
        pendingText="Processing..."
        defaultText="Scan Receipt"
        className="w-full"
      />
    </form>
  );
}
