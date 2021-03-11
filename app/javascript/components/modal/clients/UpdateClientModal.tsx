import React, { memo, useMemo } from "react"
import { Client } from "components/service/Client"
import TrackearModal from "components/TrackearModal"
import ClientForm from "components/views/clients/ClientForm"

type Props = {
  isOpen: boolean,
  client?: Client,
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void,
  onSuccess?: () => void,
}

function UpdateClientModal({ isOpen, client, onClose, onSuccess }: Props) {
  const clientAsForm = useMemo(() => {
    if (!client) {
      return undefined
    }

    return {
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      address: client.address
    }
  }, [client])

  return (
    <TrackearModal
      isOpen={isOpen}
      onRequestClose={onClose}
    >
      <div style={{ minWidth: "600px" }}>
        <h1 className="text-2xl my-2">Actualizar cliente</h1>
        <ClientForm
          id={client ? String(client.id) : undefined}
          client={clientAsForm}
          onSuccess={onSuccess}
        />
      </div>
    </TrackearModal>
  )
}

export default memo(UpdateClientModal)
