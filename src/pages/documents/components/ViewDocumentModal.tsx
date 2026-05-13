import { Download, FileText, Image as ImageIcon, FileType2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import Modal from "../../../components/ui/Modal";
import {
  CATEGORY_LABEL,
  formatBytes,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL,
  TYPE_TONE,
  type DocumentItem,
} from "../documentsData";

const TYPE_ICON = {
  pdf: FileText,
  docx: FileType2,
  image: ImageIcon,
} as const;

type Props = {
  document: DocumentItem | null;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
};

const ViewDocumentModal = ({ document, onClose, onDownload }: Props) => {
  if (!document) return null;
  const Icon = TYPE_ICON[document.type];

  return (
    <Modal
      open={!!document}
      onClose={onClose}
      title={document.name}
      description={`${TYPE_LABEL[document.type]} · ${formatBytes(document.size)}`}
      icon={Icon}
      iconTone={TYPE_TONE[document.type]}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
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
        <div className="bg-line-soft border border-line rounded-card h-72 flex flex-col items-center justify-center text-muted">
          <Icon className="w-12 h-12" strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-medium text-ink">
            Document Preview
          </p>
          <p className="text-[11px] text-muted-2 mt-0.5">
            Preview unavailable in dummy mode — download to view the file.
          </p>
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Status", value: STATUS_LABEL[document.status], tone: STATUS_TONE[document.status] },
            { label: "Category", value: CATEGORY_LABEL[document.category] },
            { label: "Type", value: TYPE_LABEL[document.type] },
            { label: "Uploaded By", value: document.uploadedBy },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                {item.label}
              </dt>
              <dd className="mt-1">
                {item.tone ? (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]",
                      item.tone,
                    )}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-ink">
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
