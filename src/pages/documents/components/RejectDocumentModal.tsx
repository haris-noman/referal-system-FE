import { useEffect, useState } from "react";
import { XCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import Modal from "../../../components/ui/Modal";
import type { DocumentItem } from "../documentsData";

type Props = {
  document: DocumentItem | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
};

const RejectDocumentModal = ({ document, onClose, onConfirm }: Props) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setReason("");
      setError("");
      setSubmitting(false);
    }
  }, [document]);

  if (!document) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError("Please provide a brief reason (at least 3 characters).");
      return;
    }
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
  };

  return (
    <Modal
      open={!!document}
      onClose={() => !submitting && onClose()}
      title="Reject Document"
      description={document.name}
      icon={XCircle}
      iconTone="bg-red-50 text-red-600"
      size="md"
      closable={!submitting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="reject-doc-form"
            disabled={submitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-70 disabled:pointer-events-none min-w-[150px]",
              "bg-red-600 hover:bg-red-700 text-white",
            )}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirm Rejection"
            )}
          </button>
        </>
      }
    >
      <form id="reject-doc-form" onSubmit={submit} className="space-y-3">
        <label className="text-[12px] font-medium text-ink-soft block">
          Reason for Rejection <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          className={cn("field resize-none", error && "border-red-500")}
          maxLength={500}
          placeholder="Explain what needs to be corrected so the uploader can re-submit."
        />
        <div className="flex items-center justify-between text-[11px]">
          {error ? (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-3 h-3" strokeWidth={2} />
              {error}
            </span>
          ) : (
            <span className="text-muted">
              The uploader will see this reason on their dashboard.
            </span>
          )}
          <span className="text-muted-2">{reason.length}/500</span>
        </div>
      </form>
    </Modal>
  );
};

export default RejectDocumentModal;
