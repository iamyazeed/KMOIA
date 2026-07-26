"use client";

import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";

export function DemoModal() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="secondary">Open modal</Button>
      </ModalTrigger>
      <ModalContent
        title="Sponsor a Student"
        description="A preview of the overlay chrome the donation modal will use in Phase 5."
        footer={<Button size="sm">Primary action</Button>}
      >
        <p className="text-muted">
          Glassmorphism is applied to the modal frame only. Content that must
          stay legible — most importantly the donation QR code — will sit on a
          solid plate inside this frame.
        </p>
      </ModalContent>
    </Modal>
  );
}
