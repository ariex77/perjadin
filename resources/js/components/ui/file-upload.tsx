import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText, FileImage, File as FileIcon } from 'lucide-react';
import InputError from '../input-error';

interface FileUploadProps {
  value?: File | string | null;
  onChange: (file: File | string | null) => void;
  label?: string;
  placeholder?: React.ReactNode;
  error?: string | null;
  accept?: string;
  disabled?: boolean;
  existingFile?: string | null; // nama/url file dari server
  maxSize?: number; // MB
  showFileInfo?: boolean;
}

export function FileUpload({
  value,
  onChange,
  label,
  placeholder,
  error,
  accept = '.pdf,.jpg,.jpeg,.png',
  disabled = false,
  existingFile = null,
  maxSize = 2,
  showFileInfo = true,
}: FileUploadProps) {
  const [fileInfo, setFileInfo] = React.useState<{ name: string; size: string; type: string } | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isFile = (v: unknown): v is File =>
    typeof v === 'object' && v !== null && v instanceof File;

  // Sinkronkan info file (nama/size/type)
  React.useEffect(() => {
    if (isFile(value)) {
      const sizeInMB = (value.size / (1024 * 1024)).toFixed(2);
      setFileInfo({
        name: value.name,
        size: `${sizeInMB} MB`,
        type: value.type || '',
      });
    } else {
      setFileInfo(null);
    }

    // Reset input ketika value null
    if (value === null && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [value]);

  // Buat & revoke object URL untuk preview gambar
  React.useEffect(() => {
    if (isFile(value) && value.type?.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewUrl(null);
    return () => {};
  }, [value]);

  const getFileIcon = (fileName: string, fileType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if ((fileType && fileType.includes('pdf')) || ext === 'pdf') return <FileIcon className="h-8 w-8 text-red-500" />;
    if ((fileType && fileType.startsWith('image/')) || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '')) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  function getCardClass() {
    let base =
      'border relative p-0 rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center relative outline-none';
    base += disabled ? ' opacity-60 cursor-not-allowed ' : ' hover:border-primary ';
    base += error ? ' border-dashed border-destructive ' : ' border-dashed border-muted-foreground ';
    return base.trim();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File terlalu besar. Maksimal ${maxSize}MB.`);
      return;
    }
    onChange(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File terlalu besar. Maksimal ${maxSize}MB.`);
      return;
    }
    onChange(file);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const hasExisting = !!existingFile;
  const showSelected = !!fileInfo;

  const isExistingImage = hasExisting && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(existingFile || '');

  return (
    <div>
      {label && <Label>{label}</Label>}
      <Card
        className={getCardClass()}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        tabIndex={0}
        role="button"
        aria-disabled={disabled}
      >
        {showSelected || hasExisting ? (
          <div className="w-full relative">
            {showSelected ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-4 p-1 w-4 text-xs absolute top-2 right-2 z-10"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Preview hanya jika ada previewUrl */}
                {previewUrl ? (
                  <div className="w-full relative">
                    <img
                      src={previewUrl}
                      alt={fileInfo?.name || 'preview'}
                      className="w-full aspect-video object-cover rounded-md"
                    />
                    <div className="absolute top-2 left-2 p-1">
                      <div className="flex items-center gap-2">
                        {getFileIcon(fileInfo?.name || '', fileInfo?.type)}
                        <div className="text-left">
                          <p className="text-xs font-medium line-clamp-1">{fileInfo?.name}</p>
                          {showFileInfo && <p className="text-xs opacity-75 line-clamp-1">{fileInfo?.size}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Non-image file: tampilkan ikon & info
                  <div className="flex flex-col items-center gap-2 p-4">
                    {getFileIcon(fileInfo?.name || '', fileInfo?.type)}
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{fileInfo?.name}</p>
                      {showFileInfo && <p className="text-xs text-muted-foreground line-clamp-1">{fileInfo?.size}</p>}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // existingFile (dari server)
              <div>
                {isExistingImage ? (
                  <div className="w-full relative">
                    <img
                      src={existingFile!}
                      alt={existingFile!.split('/').pop() || ''}
                      className="w-full aspect-video object-cover rounded-md"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        {getFileIcon(existingFile || '')}
                        <div className="text-left">
                          <p className="text-xs font-medium line-clamp-1">{existingFile!.split('/').pop() || ''}</p>
                          {showFileInfo && <p className="text-xs opacity-75 line-clamp-1">File yang sudah ada</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4">
                    {getFileIcon(existingFile || '')}
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {existingFile!.split('/').pop() || ''}
                      </p>
                      {showFileInfo && <p className="text-xs text-muted-foreground line-clamp-1">File yang sudah ada</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-center">
              <span className="text-muted-foreground text-sm select-none">
                {placeholder || 'Seret dan letakkan file di sini atau '}
                <span className="text-primary font-medium underline">Jelajahi</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Format: {accept.replace(/\./g, '').toUpperCase()} (Maks. {maxSize}MB)
              </p>
            </div>
          </div>
        )}

        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </Card>
      {error && <InputError message={error} />}
    </div>
  );
}
