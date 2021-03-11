import React, { memo } from "react"
import TrackearModal from "components/TrackearModal"
import ClientForm from "components/views/clients/ClientForm"

type Props = {
  isOpen: boolean,
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void,
  onSuccess?: () => void,
}

function NewClientModal({ isOpen, onClose, onSuccess }: Props) {
  return (
    <TrackearModal
      isOpen={isOpen}
      onRequestClose={onClose}
    >
      <div style={{ minWidth: "600px" }}>
        <h1 className="text-2xl my-2">Crear nuevo cliente</h1>
        <ClientForm onSuccess={onSuccess} />
      </div>
    </TrackearModal>
  )
}

export default memo(NewClientModal)
