import { cn } from "@/lib/utils";
import { CloudUpload, ImageIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

interface IShowState {
  isDragActive: boolean;
}

export function ShowEmptyState({ isDragActive }: IShowState) {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center mx-auto">
        <CloudUpload
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary"
          )}
        />
      </div>
      <p className="text-foreground">
        Drag your file here or{" "}
        <span className="text-primary font-bold cursor-pointer">
          click to upload
        </span>
      </p>

      <Button type="button" className="mt-4">
        Select File
      </Button>
    </div>
  );
}

export function ShowErrorState() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center size-12 mx-auto rounded-full bg-destructive/20 mb-4">
        <ImageIcon className="size-6 mx-auto" />
      </div>

      <p className="text-base font-semibold">Upload Failed</p>
      <p className="text-xs">Something went wrong</p>
      <Button type="button" className="mt-4">
        Click or drag file to retry
      </Button>
    </div>
  );
}

export function ShowUploadedState({
  objectUrl,
  isDeleting,
  handleDelete,
  fileType,
}: {
  objectUrl: string;
  isDeleting: boolean;
  fileType: "image" | "video";
  handleDelete: () => void;
}) {
  return (
    <div className="relative group flex items-center justify-center w-full h-40">
      <Button
        onClick={handleDelete}
        type="button"
        className={cn("absolute top-2 right-2 z-10")}
        variant="destructive"
        size="sm"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
      </Button>
      {fileType === "video" ? (
        <video src={objectUrl} controls className="rounded-md h-full w-full" />
      ) : (
        <Image
          fill
          className="object-contain p-2"
          src={objectUrl}
          alt="Uploaded file"
        />
      )}
    </div>
  );
}

export function ShowUploadingStatus({
  file,
  progress,
}: {
  file: File;
  progress: number;
}) {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <p className="">{progress}%</p>
      <p className="mt-2 text-sm text-foreground font-medium">Uploading...</p>
      <p className="truncate text-muted-foreground mt-1 max-w-xs">
        {file.name}
      </p>
    </div>
  );
}
