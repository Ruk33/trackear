import React, { useCallback, useState } from "react"
import TrackearModal from "components/TrackearModal"
import TrackearButton from "components/TrackearButton"
import CreatedInvoiceIcon from "../../../../assets/images/invoice-created-icon.svg"
import { notifyClient } from "components/service/Invoice"

type Props = {
  isOpen: boolean,
  project: string,
  invoice: string,
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void,
}

function InvoiceCreatedModal({ project, invoice, isOpen, onClose }: Props) {
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)

  const onClickNotifyClient = useCallback(async () => {
    if (!project || !invoice || notified) {
      return
    }

    setNotifying(true)

    try {
      await notifyClient(project, invoice)
      setNotified(true)
    } catch (e) {}

    setNotifying(false)
  }, [project, invoice, notified])

  return (
    <TrackearModal
      isOpen={isOpen}
      onRequestClose={onClose}
    >
      <div className="p-8" style={{ width: "600px" }}>
        <div className="mx-auto" style={{ width: "300px" }}>
          <CreatedInvoiceIcon />
        </div>
        <div className="text-center">
          <h1 className="text-2xl text-pink-500">Listo, ¡ya creaste tu factura!</h1>
          <p className="text-gray-800 text-lg">¿Querés que notifiquemos a tu cliente por email?</p>
          <div className="mt-4 py-2">
            {notified && <div className="p-4 rounded bg-green-200 text-green-800">
              ¡Cliente notificado exitosamente!
            </div>}
            {!notified && <TrackearButton
              className="btn btn-primary"
              loading={notifying}
              onClick={onClickNotifyClient}
            >
              Notificar cliente por email
            </TrackearButton>}
          </div>
          <div className="py-2">
            <a href="/invoices/new" className="btn btn-link">Crear otra factura</a>
          </div>
        </div>
      </div>
    </TrackearModal>
  );
}

export default InvoiceCreatedModal
