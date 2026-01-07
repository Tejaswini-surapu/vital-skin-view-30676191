import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  isLoading?: boolean;
}

const ImageUploader = ({ onImageSelect, isLoading = false }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert("Please upload a valid image file (JPG, JPEG, or PNG)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (selectedFile && preview) {
      onImageSelect(selectedFile, preview);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : preview
            ? "border-success bg-success/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
            {!isLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              {isDragging ? (
                <ImageIcon className="h-10 w-10 text-primary" />
              ) : (
                <Upload className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isDragging ? "Drop your image here" : "Upload skin image"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: JPG, JPEG, PNG
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {preview && (
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-6 text-lg font-semibold medical-gradient hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Image...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-5 w-5" />
              Analyze Skin Condition
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;
