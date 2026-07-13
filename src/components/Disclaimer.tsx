"use client";

import { useEffect, useId, useRef, useState } from "react";

const DISCLAIMER_TEXT =
  "This website is created as a parody and for entertainment purposes only. GradRight does not intend or provide any counter productive advice for users and customers.";

export default function Disclaimer() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="disclaimer-trigger"
        onClick={() => setOpen(true)}
      >
        Disclaimer
      </button>

      <dialog
        ref={dialogRef}
        className="disclaimer-dialog"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            setOpen(false);
          }
        }}
      >
        <div className="disclaimer-dialog-content">
          <h2 id={titleId} className="disclaimer-dialog-title">
            Disclaimer
          </h2>
          <p className="disclaimer-dialog-body">{DISCLAIMER_TEXT}</p>
          <button
            type="button"
            className="disclaimer-dialog-close"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
