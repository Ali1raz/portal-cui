"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import {
  ShowEmptyState,
  ShowErrorState,
  ShowUploadedState,
  ShowUploadingStatus,
} from "./show-state";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useConstructImageUrl } from "@/hooks/use-construct-url";

type FileState = {
  id: string | null;
  file: File | null;
  isUploading: boolean;
  isDeleting: boolean;
  progress: number;
  error: boolean;
  key?: string;
  objectUrl?: string;
  fileType: "image";
};

interface iAppProps {
  value?: string;
  onChange?: (value: string) => void;
  fileTypeAccepted: "image";
}

export default function Uploader({
  value,
  onChange,
  fileTypeAccepted,
}: iAppProps) {
  const imageUrl = useConstructImageUrl(value || "");

  const [fileState, setFileState] = useState<FileState>({
    id: null,
    file: null,
    isUploading: false,
    isDeleting: false,
    progress: 0,
    error: false,
    fileType: fileTypeAccepted,
    key: value,
    objectUrl: value ? imageUrl : undefined,
  });

  const uploadFile = useCallback(
    async (file: File) => {
      // console.log("uploaded file:", file);
      setFileState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
      }));
      try {
        // get presigned url
        const preSignedResponse = await fetch("/api/s3/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            isImage: fileTypeAccepted === "image" ? true : false,
          }),
        });
        if (!preSignedResponse.ok) {
          toast.error("Failed to get presigned URL");
          setFileState((prev) => ({
            ...prev,
            error: true,
            isUploading: false,
            progress: 0,
          }));
          return;
        }
        const { preSignedUrl, key } = await preSignedResponse.json();
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setFileState((prev) => ({
                ...prev,
                progress: Math.round(percentComplete),
              }));
            }
          };
          xhr.onload = () => {
            // console.log("Upload complete:", xhr.status);
            // console.log("Response text:", xhr.responseText);
            if (xhr.status === 200 || xhr.status === 204) {
              setFileState((prev) => ({
                ...prev,
                progress: 100,
                isUploading: false,
                error: false,
                key,
              }));
              onChange?.(key);
              toast.success("File uploaded successfully");
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };
          xhr.onerror = () => {
            // console.log(xhr.responseText, xhr.status);
            toast.error("Upload failed");
            reject(new Error("Upload failed"));
          };
          xhr.open("PUT", preSignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch {
        toast.error("Something went wrong");
        setFileState((prev) => ({
          ...prev,
          error: true,
          isUploading: false,
          progress: 0,
        }));
      }
    },
    [fileTypeAccepted, onChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (fileState.objectUrl || !fileState.objectUrl?.startsWith("http")) {
          // cleanup memory
          URL.revokeObjectURL(fileState.objectUrl!);
        }

        setFileState({
          id: uuidv4(),
          file: file,
          isUploading: false,
          isDeleting: false,
          progress: 0,
          error: false,
          objectUrl: URL.createObjectURL(file),
          fileType: fileTypeAccepted,
        });

        uploadFile(file);
      }
    },
    [fileState.objectUrl, uploadFile, fileTypeAccepted]
  );

  async function handleDelete() {
    if (fileState.isDeleting || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: fileState.key,
        }),
      });

      if (!response.ok) {
        toast.error("Could not delete the file");

        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));

        return;
      }

      if (fileState.objectUrl || !fileState.objectUrl?.startsWith("http")) {
        // cleanup memory
        URL.revokeObjectURL(fileState.objectUrl!);
      }

      onChange?.("");

      setFileState(() => ({
        file: null,
        progress: 0,
        error: false,
        objectUrl: undefined,
        isUploading: false,
        fileType: fileTypeAccepted,
        id: null,
        isDeleting: false,
      }));

      toast.success("file deleted");
    } catch {
      toast.error("Error deleting file");

      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  }

  function dropRejection(rejectedFiles: FileRejection[]) {
    const firstRejection = rejectedFiles[0];
    if (!firstRejection) return;

    firstRejection.errors.forEach((error) => {
      switch (error.code) {
        case "too-many-files":
          toast.error("Error: Too many files, only one file is allowed.");
          break;
        case "file-too-large":
          toast.error("File size too large.");
          break;
        case "file-invalid-type":
          toast.error("This file type is not valid.");
          break;
        default:
          toast.error(error.message);
          break;
      }
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 1024 * 1024 * 5, // 5MB for image
    maxFiles: 1,
    multiple: false,
    onDropRejected: dropRejection,
    disabled: fileState.isUploading || !!fileState.objectUrl,
  });

  function renderContent() {
    if (fileState.isUploading) {
      return (
        <ShowUploadingStatus
          file={fileState.file as File}
          progress={fileState.progress}
        />
      );
    }
    if (fileState.error) {
      return <ShowErrorState />;
    }

    if (fileState.objectUrl) {
      return (
        <ShowUploadedState
          fileType={fileState.fileType}
          isDeleting={fileState.isDeleting}
          handleDelete={handleDelete}
          objectUrl={fileState.objectUrl}
        />
      );
    }
    return <ShowEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    return () => {
      if (fileState.objectUrl || !fileState.objectUrl?.startsWith("http")) {
        // cleanup memory
        URL.revokeObjectURL(fileState.objectUrl!);
      }
    };
  }, [fileState.objectUrl]);

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative w-full border-2 border-dashed h-48 transition-colors duration-100 ease-in-out",
        isDragActive
          ? "border-primary bg-primary/30 border-solid"
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center p-2 h-full w-full">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
