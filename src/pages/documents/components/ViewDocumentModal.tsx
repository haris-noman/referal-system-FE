import {
  Download,
  FileText,
  Image as ImageIcon,
  FileType2,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import Modal from "../../../components/ui/Modal";
import {
  CATEGORY_LABEL,
  formatBytes,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_ICON_KIND,
  TYPE_LABEL,
  TYPE_TONE,
  type DocumentItem,
  type IconKind,
} from "../documentsData";

const TYPE_ICON: Record<IconKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  pdf: FileText,
  docx: FileType2,
  image: ImageIcon,
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

type Props = {
  document: DocumentItem | null;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
};

const ViewDocumentModal = ({ document, onClose, onDownload }: Props) => {
  if (!document) return null;
  const iconKind = TYPE_ICON_KIND[document.type];
  const Icon = TYPE_ICON[iconKind];
  const isImage = iconKind === "image";

  return (
    <Modal
      open={!!document}
      onClose={onClose}
      title={document.name}
      description={`${TYPE_LABEL[document.type]}${document.size ? ` · ${formatBytes(document.size)}` : ""}`}
      icon={Icon}
      iconTone={TYPE_TONE[document.type]}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          {document.fileUrl && (
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              Open
            </a>
          )}
          <button
            onClick={() => onDownload(document)}
            className="btn-primary"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Download
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="bg-line-soft border border-line rounded-card h-72 flex items-center justify-center overflow-hidden">
          {isImage && document.fileUrl ? (
            <img
              src={document.fileUrl}
              alt={document.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-muted">
              <Icon className="w-12 h-12" strokeWidth={1.5} />
              <p className="mt-3 text-[13px] font-medium text-ink">
                Document Preview
              </p>
              <p className="text-[11px] text-muted-2 mt-0.5">
                Open or download to view the full file.
              </p>
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Status",
              value: STATUS_LABEL[document.status],
              tone: STATUS_TONE[document.status],
            },
            { label: "Category", value: CATEGORY_LABEL[document.category] },
            { label: "Type", value: TYPE_LABEL[document.type] },
            { label: "Uploaded By", value: document.uploadedBy },
            { label: "Uploaded", value: formatDateTime(document.uploadedAt) },
            { label: "Reviewed By", value: document.reviewedBy ?? "—" },
            { label: "Reviewed", value: formatDateTime(document.reviewedAt) },
            ...(document.size !== undefined
              ? [{ label: "Size", value: formatBytes(document.size) }]
              : []),
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                {item.label}
              </dt>
              <dd className="mt-1">
                {"tone" in item ? (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]",
                      item.tone,
                    )}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-ink break-words">
                    {item.value}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {document.rejectionReason && (
          <div className="rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            <p className="font-semibold mb-1">Rejection Reason</p>
            <p>{document.rejectionReason}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewDocumentModal;
