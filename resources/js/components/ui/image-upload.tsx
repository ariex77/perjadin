import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import InputError from '../input-error';

interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file: File | string | null) => void;
  label?: string;
  placeholder?: React.ReactNode;
  error?: string | null;
  accept?: string;
  disabled?: boolean;
  existingImage?: string | null; // URL gambar yang sudah ada di database
  showPreview?: boolean; // Toggle untuk menampilkan preview
  aspectRatio?: 'video' | 'square' | 'rounded'; // Tambahan: pengaturan rasio
}

export function ImageUpload({
  value,
  onChange,
  label = undefined, // default: tidak ada label
  placeholder,
  error,
  accept = 'image/*',
  disabled = false,
  existingImage = null,
  showPreview = true,
  aspectRatio = undefined, // default
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value && value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [value]);

  // Get the display image (new upload or existing)
  const getDisplayImage = () => {
    if (preview) return preview; // New uploaded image
    if (existingImage) return existingImage.startsWith('http') ? existingImage : `/storage/${existingImage}`; // Existing image
    return null; // No image
  };

  const displayImage = getDisplayImage();

  // Logic untuk menentukan class aspect ratio pada Card
  function getCardClass() {
    let base =
      'border relative p-0 rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center relative outline-none overflow-hidden';
    if (disabled) base += 'opacity-60 cursor-not-allowed ';
    else base += 'hover:border-primary ';
    if (error) base += 'border-dashed border-destructive ';
    else base += 'border-dashed border-muted-foreground ';
    // Aspect ratio & size
    if (aspectRatio === 'video') base += 'aspect-video w-full max-w-lg ';
    else if (aspectRatio === 'square') base += 'aspect-square w-48 ';
    else if (aspectRatio === 'rounded') base += 'aspect-square w-32 rounded-full ';
    return base.trim();
  }

  function getImageClass() {
    // Jika square, pastikan gambar square dan crop
    if (aspectRatio === 'square') return 'w-full h-full object-cover aspect-square rounded-md';
    if (aspectRatio === 'rounded') return 'w-full h-full object-cover aspect-square rounded-full';
    if (aspectRatio === 'video') return 'w-full h-full object-cover aspect-video rounded-md';
    return 'w-full h-full object-cover rounded-md';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!disabled) onChange(null);
  }

  return (
    <div>
      {label && <Label>{label}</Label>}
      <Card
        className={getCardClass()}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        tabIndex={0}
        role="button"
        aria-disabled={disabled}
      >
        {displayImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <img src={displayImage} alt="Preview" className={getImageClass()} />
            {preview && (
              <Button type="button" variant="destructive" size="xs" className="text-xs absolute right-1 top-1" onClick={handleRemove} disabled={disabled}> <X /> </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs select-none">
              {(placeholder || 'Seret dan letakkan gambar di sini ')}
              <span className="text-primary font-medium underline">Jelajahi</span>
            </span>
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
