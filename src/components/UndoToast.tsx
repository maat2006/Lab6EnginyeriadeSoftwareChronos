import { RotateCcw, X } from 'lucide-react';

export type UndoToastState = {
  id: string;
  message: string;
  actionLabel: string;
  secondsLeft: number;
  onUndo: () => void;
};

type UndoToastProps = {
  toast: UndoToastState | null;
  onDismiss: () => void;
};

function UndoToast({ onDismiss, toast }: UndoToastProps) {
  if (!toast) return null;

  return (
    <aside className="undo-toast" role="status" aria-live="polite">
      <div>
        <strong>{toast.message}</strong>
        <span>{toast.secondsLeft}s</span>
      </div>
      <button className="toast-action" type="button" onClick={toast.onUndo}>
        <RotateCcw size={16} aria-hidden="true" />
        {toast.actionLabel}
      </button>
      <button className="toast-close" type="button" onClick={onDismiss} aria-label="Cerrar aviso">
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
}

export default UndoToast;
