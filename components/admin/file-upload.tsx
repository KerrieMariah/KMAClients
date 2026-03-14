"use client"

import { useState, useRef } from "react"
import { Upload, Link as LinkIcon, Loader2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FileUpload({
  label,
  value,
  onChange,
  bucket = "project-images",
  accept,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  bucket?: string
  accept?: string
}) {
  const [mode, setMode] = useState<"url" | "upload">(value ? "url" : "url")
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Upload failed")
      }

      const data = await res.json()
      onChange(data.url)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2000)
    } catch (e) {
      console.error("Upload error:", e)
      alert(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              mode === "url"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="mr-1 inline-block size-3" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              mode === "upload"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="mr-1 inline-block size-3" />
            Upload
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={value}
                alt="Preview"
                className="h-32 w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1 text-background hover:bg-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="mr-2 size-4 text-success" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Choose File
              </>
            )}
          </Button>
          {value && (
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={value}
                alt="Preview"
                className="h-32 w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1 text-background hover:bg-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
