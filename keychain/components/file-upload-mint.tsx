import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadType {
  json: Record<string, unknown>;
}

export function FileUpload({ json }: FileUploadType) {
    console.log(json);
  return (
    <div className="file-upload-container">
      {/* File input field */}
      <Label>Upload your song here</Label>
      <Input className="cursor-pointer mt-2" id="file-upload" type="file" />
    </div>
  );
}
