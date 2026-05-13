import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  Loader2,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import Modal from "../../../components/ui/Modal";
import {
  ACCEPTED_EXT,
  CATEGORY_LABEL,
  type DocumentCategory,
  detectType,
  formatBytes,
} from "../documentsData";

const ALL_EXT = [
  ...ACCEPTED_EXT.pdf,
  ...ACCEPTED_EXT.docx,
  ...ACCEPTED_EXT.png,
  ...ACCEPTED_EXT.jpg,
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    file: File;
    name: string;
    category: DocumentCategory;
  }) => Promise<void>;
};

const UploadDocumentModal = ({ open, onClose, onSubmit }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("identity_proof");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setName("");
    setCategory("identity_proof");
    setError("");
    setDragOver(false);
    setSubmitting(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [open]);

  const accept = (f: File | null) => {
    if (!f) return;
    if (!detectType(f.name)) {
      setError(`Unsupported file. Allowed: ${ALL_EXT.join(", ")}`);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File must be 20MB or smaller.");
      return;
    }
    setError("");
    setFile(f);
    if (!name.trim()) {
      setName(f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!name.trim()) {
      setError("Please give the document a name.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ file, name: name.trim(), category });
      onClose();
    } catch (err) {
      setError((err as Error)?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload Document"
      description="Add a new file to your document library."
      icon={UploadCloud}
      size="md"
      closable={!submitting}
      footer={
        <>
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-doc-form"
            disabled={submitting || !file}
            className="btn-primary min-w-[140px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" strokeWidth={2} />
                Upload
              </>
            )}
          </button>
        </>
      }
    >
      <form id="upload-doc-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[12px] font-medium text-ink-soft block mb-1.5">
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. Q1 Referral Agreement"
            className="field"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-soft block mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as DocumentCategory)
            }
            className="field"
          >
            {(Object.keys(CATEGORY_LABEL) as DocumentCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[12px] font-medium text-ink-soft block mb-1.5">
            File <span className="text-red-500">*</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept={ALL_EXT.join(",")}
            className="hidden"
            onChange={(e) => accept(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="border border-line rounded-[6px] p-3 flex items-center justify-between gap-3 bg-line-soft/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[6px] bg-white border border-line flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-muted" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="p-1.5 rounded-full text-muted-2 hover:text-ink hover:bg-line-soft transition-colors"
                aria-label="Remove file"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                accept(e.dataTransfer.files?.[0] ?? null);
              }}
              className={cn(
                "w-full border border-dashed rounded-[6px] py-8 flex flex-col items-center justify-center gap-1.5 transition-colors",
                dragOver
                  ? "border-ink bg-line-soft"
                  : "border-line hover:border-ink-soft hover:bg-line-soft/40",
              )}
            >
              <UploadCloud
                className="w-6 h-6 text-muted-2"
                strokeWidth={1.75}
              />
              <p className="text-[13px] font-medium text-ink">
                Click to upload or drag and drop
              </p>
              <p className="text-[11px] text-muted">
                {ALL_EXT.join(", ")} · up to 20MB
              </p>
            </button>
          )}
          {error && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 mt-1.5">
              <AlertCircle className="w-3 h-3" strokeWidth={2} />
              {error}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;
