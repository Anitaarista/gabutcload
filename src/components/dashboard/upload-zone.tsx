"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

export function UploadZone({ parentId }: { parentId?: string }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("files", file));
    if (parentId) formData.append("parentId", parentId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onloadstart = () => setUploading(true);
    xhr.onloadend = () => {
      setUploading(false);
      setProgress(0);
      router.refresh();
    };
    xhr.send(formData);
  };

  const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true });

  return (
    <div {...getRootProps()} className="rounded-xl border border-dashed border-[#1e293b] bg-[#111827] p-6 text-center">
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-8 w-8 text-[#00e5c3]" />
      <p className="mt-3 text-sm text-[#8892a4]">Drag and drop files or folders here</p>
      <Button className="mt-4" onClick={open}>Upload files</Button>
      {uploading && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-[#1a2332]"><div className="h-2 rounded-full bg-gradient-to-r from-[#00e5c3] to-[#00b4d8]" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-xs text-[#8892a4]">Uploading {progress}%</p>
        </div>
      )}
    </div>
  );
}
