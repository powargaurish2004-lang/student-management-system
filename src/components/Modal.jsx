import { useEffect } from "react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
}) {
  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  // Conditional rendering
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >

      <div
        className="modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-header">

          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        <div className="modal-body">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Modal;