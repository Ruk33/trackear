import ReactDOM from "react-dom"
import React, { useCallback, useEffect, useState, ChangeEvent, useMemo } from "react"
import Joyride, { Placement } from "react-joyride"
import { Popover } from "react-tiny-popover"
import CurrencyInput from "react-currency-input-field"
import { createInvoice, entriesToInvoiceEntries } from "components/service/Invoice"
import { Client } from "components/service/Client"
import { calculateTotalFromEntries, Entry, mergeEntries } from "components/service/Entry"
import { Track, calculateTrackAmount, hoursFromTrack, formatQtyTrack, setHoursAndMinutesFromTrack } from "components/service/Track"
import { useFetchClients } from "components/hook/ClientHook"
import NewClientModal from "components/modal/clients/NewClientModal"
import UpdateClientModal from "components/modal/clients/UpdateClientModal"
import TrackearButton from "components/TrackearButton"
import TrackearFetching from "components/TrackearFetching"
import TrackearSelectInput, { SelectOption } from "components/TrackearSelectInput"
import TrackearTable, { TableColumn } from "components/TrackearTable"
import TrackearToast, { toast } from "components/TrackearToast"
import TrackearQtyInput from "components/TrackearQtyInput"
import ProjectSelect from "components/TrackearProjectSelectInput"
import TrackearEntriesInput from "components/TrackearEntriesInput"

const intlConfig = {
  locale: "en-US",
  currency: "USD",
}

const floaterProps = {
  styles: {
    floater: {
      filter: "drop-shadow(rgba(0, 0, 0, 0.15) 0px 5px 5px)",
    }
  }
}

const tourStyles = {
  options: {
    beaconSize: 26,
    spotlightShadow: "0 0 15px rgba(0, 0, 0, 0.5)"
  }
}

const tourLocale = {
  back: "Atras",
  close: "Cerrar",
  last: "Último",
  next: "Siguiente",
  skip: "Saltar"
}

type ClientSelectProps = {
  /**
   * Loading/fetching clients?
   */
  loading: boolean,

  /**
   * Error while getting the clients.
   */
  error: string,

  clients: Client[],

  client: Client | undefined,

  /**
   * Callback to be executed when the user
   * clicks on update client button
   * to open the update client's modal.
   */
  onUpdateClient: () => void,

  onSelectClient: (client: Client) => void,

  disabled: boolean,
}

function ClientSelect(props: ClientSelectProps) {
  const { client, clients, onUpdateClient, onSelectClient } = props

  const handleSelectClient = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value
    const selectedClient = clients.find((client) => String(client.id) === selectedClientId)

    if (!selectedClient) {
      return
    }

    onSelectClient(selectedClient)
  }, [onSelectClient, clients])

  const clientOptions: SelectOption[] = useMemo(() => {
    return clients.map((client) => ({
      id: String(client.id),
      label: `${client.first_name} ${client.last_name} (${client.email})`,
      value: String(client.id),
    }))
  }, [clients])

  return (
    <TrackearFetching loading={props.loading} error={props.error}>
      <TrackearSelectInput
        placeholder="Seleccionar cliente"
        disabled={props.disabled}
        value={client ? String(client.id) : undefined}
        onChange={handleSelectClient}
        options={clientOptions}
      />
      {client && <button className="text-blue-400 p-2" onClick={onUpdateClient}>Actualizar cliente</button>}
      <div className="ml-6 client_select" />
    </TrackearFetching>
  )
}

type QtyCashAmountProps = {
  track: Track,
  isRemoved: boolean,
}

function QtyCashAmount(props: QtyCashAmountProps) {
  const { track, isRemoved } = props
  const amount = useMemo(() => calculateTrackAmount(track), [track])

  return (
    <div className={`text-right ${isRemoved && "opacity-50"}`}>
      ${amount}
    </div>
  )
}

type EntryRowProps = {
  entry: Entry,

  /**
   * Callback to be executed when the
   * entry gets discarded.
   * Discarded means, the entry wont be taken
   * in consideration for final invoice
   * calculations such as subtotal,
   * total, etc.
   */
  onRemove: (track: Track) => void,

  /**
   * Callback to be executed
   * when entry gets restored.
   */
  onRestore: (track: Track) => void,

  /**
   * Callback to be executed when the
   * entry gets updated (description changed,
   * qty changed, etc.)
   */
  onUpdate: (track: Track) => void,

  /**
   * Callback executed when the user
   * wants to update all tracks rate from
   * a user entries
   */
  onUpdateAllTracksRate: (user: number, rate: string) => void,

  /**
   * Map of removed/discarded entries
   * by entry id.
   */
  removedTracks: Map<number, boolean>,
}

function EntryRow(props: EntryRowProps) {
  const [focusedTrack, setFocusedTrack] = useState(-1)
  const { entry, onRemove, onRestore, onUpdate, onUpdateAllTracksRate, removedTracks } = props
  const { user, tracks } = entry

  const onUpdateDescription = useCallback((e: ChangeEvent<HTMLTextAreaElement>, track: Track) => {
    onUpdate({
      ...track,
      description: e.target.value
    })
  }, [onUpdate])

  const onUpdateQty = useCallback((value: string, track: Track) => {
    const [hours, minutes] = value.split(":")
    const updatedTrack = { ...track }

    setHoursAndMinutesFromTrack(
      updatedTrack,
      Number(hours) || 0,
      Number(minutes) || 0,
    )

    onUpdate(updatedTrack)
  }, [onUpdate])

  const loseFocusFromTrack = useCallback(() => {
    setFocusedTrack(-1)
  }, [setFocusedTrack])

  const updateAllTracksRate = useCallback((value: string) => {
    onUpdateAllTracksRate(entry.user.id, value)
    loseFocusFromTrack()
  }, [onUpdateAllTracksRate, loseFocusFromTrack])

  const onUpdateRate = useCallback((value: string | undefined, track: Track) => {
    // For some reason the currency inputs
    // executes the callback even if the
    // user doesn't type anything...
    if (value === track.project_rate) {
      return
    }

    setFocusedTrack(track.id)
    onUpdate({
      ...track,
      project_rate: value || ""
    })
  }, [onUpdate])

  return (
    <>
      <tr>
        <td colSpan={5}>
          <div className="p-2 mt-2 flex items-center">
            <img src={user.picture} className="rounded-full w-8 mr-3" />
            <div>
              <h4 className="font-bold">{user.first_name} {user.last_name}</h4>
              <h5>{user.email}</h5>
            </div>
          </div>
        </td>
      </tr>
      {tracks.map((track) => (
        <tr key={track.id}>
          <td className="p-2">
            <textarea
              className="border p-2 w-full"
              value={track.description}
              onChange={(e) => onUpdateDescription(e, track)}
              rows={1}
              disabled={removedTracks.get(track.id)}
            />
          </td>
          <td className="text-right p-2">
            <TrackearQtyInput
              value={formatQtyTrack(track)}
              onChange={(value) => onUpdateQty(value, track)}
              disabled={removedTracks.get(track.id)}
            />
          </td>
          <td className="text-right p-2">
            <Popover
              isOpen={!!track.project_rate && focusedTrack === track.id}
              positions={['top']}
              padding={10}
              content={(
                <div className="w-64 bg-gray-800 text-white p-6 shadow-md rounded">
                  <p>¿Querés cambiar la tarifa de todos los registros de <span className="text-pink-500">{entry.user.first_name}</span> a <span className="text-pink-500">${track.project_rate}?</span></p>
                  <div className="mt-3 flex justify-center items-center">
                    <button
                      onClick={loseFocusFromTrack}
                      className="btn btn-sm mx-1"
                    >
                      No
                    </button>
                    <button
                      onClick={() => updateAllTracksRate(track.project_rate)}
                      className="btn btn-sm btn-primary mx-1"
                    >
                      Si, actualizar
                    </button>
                  </div>
                </div>
              )}
            >
              <CurrencyInput
                className="border p-2 w-full text-right"
                value={track.project_rate}
                onValueChange={(value) => onUpdateRate(value, track)}
                intlConfig={intlConfig}
                placeholder="$00.00"
                disabled={removedTracks.get(track.id)}
              />
            </Popover>
          </td>
          <td className="text-right p-2">
            <QtyCashAmount
              isRemoved={!!removedTracks.get(track.id)}
              track={track}
            />
          </td>
          <td className="text-center p-2">
            {!removedTracks.get(track.id) && <button
              type="button"
              className="rounded shadow px-4 py-2 text-red-500"
              onClick={() => onRemove(track)}
            >
              Remover
            </button>}
            {removedTracks.get(track.id) && <button
              type="button"
              className="rounded shadow px-4 py-2 text-blue-500"
              onClick={() => onRestore(track)}
            >
              Restaurar
            </button>}
          </td>
        </tr>
      ))}
    </>
  )
}

type ImportEntriesProps = {
  project: string,
  onLoadEntries: (entries: Entry[]) => void
}

function ImportEntries({ project, onLoadEntries }: ImportEntriesProps) {
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)

  const resetInput = useCallback((entries: Entry[]) => {
    onLoadEntries(entries)
    setStart(null)
    setEnd(null)
  }, [setStart, setEnd, onLoadEntries])

  return (
    <div className="flex justify-center p-4 border">
      <div className="text-center">
        <div>Importar registros de trabajo</div>
        <div className="flex items-center">
          <TrackearEntriesInput
            project={project}
            start={start}
            end={end}
            onSetStart={setStart}
            onSetEnd={setEnd}
            onLoadEntries={resetInput}
          />
          <div className="date_select ml-6" />
        </div>
      </div>
    </div>
  )
}

type EntriesProps = {
  entries: Entry[],
  onUpdateEntries: (entries: Entry[]) => void,
  removedTracks: Map<number, boolean>,
  onRemoveTrack: (track: Track) => void,
  onRestoreTrack: (track: Track) => void,
}

function Entries(props: EntriesProps) {
  const {
    entries,
    onUpdateEntries,
    removedTracks,
    onRemoveTrack,
    onRestoreTrack,
  } = props

  const handleUpdate = useCallback((newTrack: Track) => {
    const updated = entries.map((entry) => {
      const tracks = entry.tracks.map((track) => {
        if (track.id === newTrack.id) {
          return newTrack
        }
        return track
      })
      return { ...entry, tracks }
    })

    onUpdateEntries(updated)
  }, [entries, onUpdateEntries])

  const updateAllTracksRate = useCallback((fromUser: number, rate: string) => {
    const updated = entries.map((entry) => {
      if (entry.user.id !== fromUser) {
        return entry
      }

      const tracksWithUpdatedRate = entry.tracks.map((track) => ({
        ...track,
        project_rate: rate
      }))

      return {
        ...entry,
        tracks: tracksWithUpdatedRate,
      }
    })

    onUpdateEntries(updated)
  }, [entries, onUpdateEntries])

  const total = useMemo(
    () => calculateTotalFromEntries(entries, removedTracks),
    [entries, removedTracks]
  )

  return (
    <table className="w-full border table-fixed">
      <thead className="border">
        <tr>
          <th className="p-2 py-4 bg-gray-100 w-1/2 text-left border">Descripción</th>
          <th className="p-2 py-4 bg-gray-100 w-1/8 text-right border">Tiempo registrado</th>
          <th className="p-2 py-4 bg-gray-100 w-1/8 text-right border">Tarifa</th>
          <th className="p-2 py-4 bg-gray-100 w-1/8 text-right border">Total</th>
          <th className="p-2 py-4 bg-gray-100 w-1/8 text-center border">-</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <EntryRow
            key={entry.user.id}
            entry={entry}
            onRemove={onRemoveTrack}
            onRestore={onRestoreTrack}
            onUpdateAllTracksRate={updateAllTracksRate}
            onUpdate={handleUpdate}
            removedTracks={removedTracks}
          />
        ))}
        <tr>
          <td colSpan={3}></td>
          <td className="text-right p-2 py-4 text-2xl">Total: ${total.toFixed(2)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  )
}

type InvoiceFormProps = {
  /**
   * Selected project id
   */
  project: string,
  onProjectsLoaded: () => void,
  /**
   * Callback to be executed when
   * a project is selected
   */
  onSetProject: (project: string) => void,

  /**
   * Callback to be executed when the user
   * clicks on update client button.
   */
  onUpdateClient: () => void,

  /**
   * Selected client
   */
  client: undefined | Client,
  clients: Client[],
  fetchingClients: boolean,
  errorFetchingClients: string,
  /**
   * Callback to be executed when a client is selected
   */
  onSetClient: (client: Client) => void,

  entries: Entry[],
  /**
   * Callback to be executed when the user
   * imports entries fetched from selecting
   * start date and end date.
   */
  onImportEntries: (entries: Entry[]) => void,
  /**
   * Callback to be executed when the user
   * updates an entry (changes rate, qty, etc.)
   */
  onUpdateEntries: (entries: Entry[]) => void,
  /**
   * Map containing all removed tracks by id
   */
  removedTracks: Map<number, boolean>,
  /**
   * Callback to be executed when a track is "removed"
   */
  onRemoveTrack: (track: Track) => void,
  /**
   * Callback to be executed when a track gets restored
   */
  onRestoreTrack: (track: Track) => void,
  /**
   * Callback to be executed when clicking on preview button
   */
  onPreviewInvoice: () => void,
}

function InvoiceForm(props: InvoiceFormProps) {
  const {
    project,
    onProjectsLoaded,
    onSetProject,
    onUpdateClient,
    client,
    clients,
    fetchingClients,
    errorFetchingClients,
    onSetClient,
    entries,
    onImportEntries,
    onUpdateEntries,
    removedTracks,
    onRemoveTrack,
    onRestoreTrack,
  } = props

  return (
    <>
      <div className="flex items-center mb-2">
        <div className="font-bold w-48">Proyecto</div>
        <ProjectSelect
          project={project}
          onSelectProject={onSetProject}
          onProjectsLoaded={onProjectsLoaded}
        />
        <div className="ml-6 project_select" />
      </div>
      <div className="flex items-center mb-2">
        <div className="font-bold w-48">Cliente</div>
        <ClientSelect
          onUpdateClient={onUpdateClient}
          client={client}
          clients={clients}
          loading={fetchingClients}
          error={errorFetchingClients}
          onSelectClient={onSetClient}
          disabled={!project}
        />
      </div>
      <ImportEntries
        project={project}
        onLoadEntries={onImportEntries}
      />
      <Entries
        entries={entries}
        onUpdateEntries={onUpdateEntries}
        removedTracks={removedTracks}
        onRemoveTrack={onRemoveTrack}
        onRestoreTrack={onRestoreTrack}
      />
      {entries.length > 0 && <div className="text-center">
        <TrackearButton
          type="button"
          className="my-4 btn btn-primary mx-auto"
          onClick={props.onPreviewInvoice}
          icon={<svg className="w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>}
        >
          Ver factura como cliente
        </TrackearButton>
      </div>}
    </>
  )
}

type PreviewInvoiceProps = {
  entries: Entry[],
  removedTracks: Map<number, boolean>,
  onClosePreview: () => void,
  client: Client | undefined,
  onCreateInvoice: () => void,
}

function PreviewInvoice(props: PreviewInvoiceProps) {
  const {
    entries,
    removedTracks,
    onClosePreview,
    client,
    onCreateInvoice,
  } = props

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        id: "description",
        component: "Description",
        props: { className: "p-2 bg-gray-100 border text-left" },
      },
      {
        id: "qty",
        component: "Qty",
        props: { className: "p-2 bg-gray-100 border text-right" },
      },
      {
        id: "amount",
        component: "Total",
        props: { className: "p-2 bg-gray-100 border text-right" },
      },
    ]
  }, [])

  const total = useMemo(
    () => calculateTotalFromEntries(entries, removedTracks),
    [entries, removedTracks]
  )

  const buildRows = useCallback((entry: Entry) => {
    const tracks = entry.tracks.filter((track) => !removedTracks.get(track.id))
    return tracks.map((track) => (
      <tr key={track.id}>
        <td className="text-left p-2">{track.description}</td>
        <td className="text-right p-2">{hoursFromTrack(track).toFixed(2)}</td>
        <td className="text-right p-2">${calculateTrackAmount(track)}</td>
      </tr>
    ))
  }, [removedTracks])

  return (
    <>
      <h1 className="text-2xl">Invoice</h1>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="text-left">
          <h2 className="font-bold">Bill to</h2>
          <p>Name: {client && `${client.first_name} ${client.last_name}`}</p>
          <p>Address: {client && client.address}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold">Company name</h2>
          <p>Address: HARDCODED - Street</p>
        </div>
      </div>

      <TrackearTable columns={columns}>
        {entries.map(buildRows)}
        <tr>
          <td colSpan={2}></td>
          <td className="text-right p-2 py-4 text-2xl">Total: ${total.toFixed(2)}</td>
        </tr>
      </TrackearTable>

      <div className="text-center mt-2">
        <TrackearButton
          className="btn btn-secondary mr-2"
          type="button"
          onClick={onClosePreview}
        >
          Continuar editando
        </TrackearButton>
        <TrackearButton
          className="btn btn-primary"
          onClick={onCreateInvoice}
        >
          Finalizar
        </TrackearButton>
      </div>
    </>
  )
}

type InvoicesNewProps = {
  showCreateClientModal: boolean,
  onCloseCreateClientModal: () => void,
  onProjectsLoaded: () => void,
  onProjectSelected: () => void,
  onClientSelected: () => void,
  onImportEntries: () => void,
}

function InvoicesNew(props: InvoicesNewProps) {
  const {
    showCreateClientModal,
    onCloseCreateClientModal,
    onProjectsLoaded,
    onProjectSelected,
    onClientSelected,
    onImportEntries,
  } = props

  const [persisted, setPersisted] = useState(false)
  const [showUpdateClientModal, setShowUpdateClientModal] = useState(false)
  const [project, setProject] = useState("")
  const [client, setClient] = useState<Client | undefined>(undefined)
  const [entries, setEntries] = useState<Entry[]>([])
  const [removedTracks, setRemovedTracks] = useState(new Map<number, boolean>())
  const [preview, setPreview] = useState(false)
  const { clients, fetchClients, error: clientsError, fetching: fetchingClients } = useFetchClients()

  const onPreview = useCallback(() => {
    setPreview(true)
  }, [setPreview])

  const onClosePreview = useCallback(() => {
    setPreview(false)
  }, [setPreview])

  const removeTrack = useCallback((track: Track) => {
    setRemovedTracks(new Map(removedTracks).set(track.id, true))
  }, [setRemovedTracks, removedTracks])

  const restoreTrack = useCallback((track: Track) => {
    setRemovedTracks(new Map(removedTracks).set(track.id, false))
  }, [setRemovedTracks, removedTracks])

  const onAddEntries = useCallback(async (importedEntries: Entry[]) => {
    const merged = mergeEntries(entries, importedEntries)

    setEntries(merged)
    onImportEntries()

    try {
      if (persisted) {

        return
      }

      const response = await createInvoice({
        project,
        client: client ? String(client.id) : "",
        entries: entriesToInvoiceEntries(merged),
      })
      setPersisted(true)
      toast("Vamos a ir guardando tu factura para que no pierdas ningún cambio.")
    } catch (e) {}
  }, [persisted, setPersisted, entries, setEntries, onImportEntries, project, client])

  const onUpdateEntries = useCallback((entries: Entry[]) => {
    setEntries(entries)
  }, [setEntries])

  const closeAndSelectCreatedClient = useCallback(async () => {
    try {
      const clients = await fetchClients()
      setClient(clients[clients.length - 1])
    } catch (e) {}

    onCloseCreateClientModal()
  }, [fetchClients, setClient, onCloseCreateClientModal])

  const openUpdateClientModal = useCallback(() => {
    setShowUpdateClientModal(true)
  }, [setShowUpdateClientModal])

  const closeUpdateClientModal = useCallback(() => {
    setShowUpdateClientModal(false)
  }, [setShowUpdateClientModal])

  const closeUpdateModalAndRefetchClients = useCallback(() => {
    fetchClients()
    closeUpdateClientModal()
  }, [closeUpdateClientModal])

  const onCreateInvoice = useCallback(() => {

  }, [])

  useEffect(() => {
    if (!project) {
      return
    }

    onProjectSelected()
  }, [project, onProjectSelected])

  useEffect(() => {
    if (!client) {
      return
    }

    onClientSelected()
  }, [client, onClientSelected])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return (
    <div className="bg-white p-4 rounded border">
      <NewClientModal
        isOpen={showCreateClientModal}
        onClose={onCloseCreateClientModal}
        onSuccess={closeAndSelectCreatedClient}
      />
      <UpdateClientModal
        isOpen={showUpdateClientModal}
        onClose={closeUpdateClientModal}
        onSuccess={closeUpdateModalAndRefetchClients}
        client={client}
      />
      <div className={`${!preview ? "visible" : "hidden"}`}>
        <InvoiceForm
          project={project}
          onProjectsLoaded={onProjectsLoaded}
          onSetProject={setProject}
          onUpdateClient={openUpdateClientModal}
          client={client}
          clients={clients}
          fetchingClients={fetchingClients}
          errorFetchingClients={clientsError}
          onSetClient={setClient}
          entries={entries}
          onImportEntries={onAddEntries}
          onUpdateEntries={onUpdateEntries}
          onPreviewInvoice={onPreview}
          removedTracks={removedTracks}
          onRemoveTrack={removeTrack}
          onRestoreTrack={restoreTrack}
        />
      </div>
      <div className={`${preview ? "visible" : "hidden"}`}>
        <PreviewInvoice
          client={client}
          entries={entries}
          removedTracks={removedTracks}
          onClosePreview={onClosePreview}
          onCreateInvoice={onCreateInvoice}
        />
      </div>
    </div>
  )
}

function TourInvoicesNew() {
  const [showCreateClientModal, setShowCreateClientModal] = useState(false)
  const [tourVisible, setTourVisible] = useState(false)
  const [tourStep, setTourStep] = useState<number | undefined>(0)

  const showClientTip = useCallback(() => {
    setTourStep(1)
  }, [setTourStep])

  const showDateTip = useCallback(() => {
    setTourStep(2)
  }, [setTourStep])

  const showTour = useCallback(() => {
    setTourVisible(true)
  }, [setTourVisible])

  const hideTour = useCallback(() => {
    setTourVisible(false)
  }, [setTourVisible])

  const openCreateClientModal = useCallback(() => {
    setShowCreateClientModal(true)
    hideTour()
  }, [setShowCreateClientModal, hideTour])

  const closeCreateClientModal = useCallback(() => {
    setShowCreateClientModal(false)
    showTour()
  }, [showTour, setShowCreateClientModal])

  const steps = useMemo(() => {
    const placement: Placement = "right"
    return [
      {
        target: ".project_select",
        content: <div className="text-left">Seleccioná el proyecto para el que querés hacer la factura.</div>,
        placement: placement,
      },
      {
        target: ".client_select",
        content: (
          <div className="text-left">
            <p className="py-2">
              Seleccioná el cliente al cual le vas a generar la factura.
            </p>
            <p className="py-2">
              ¿Necesitas crear un nuevo cliente? <button type="button" onClick={openCreateClientModal} className="btn btn-primary btn-sm">Crear nuevo cliente</button>
            </p>
          </div>
        ),
        placement: placement
      },
      {
        target: ".date_select",
        content: <div className="text-left">Importá los registros de tiempo registrados en un período de tiempo.</div>,
        placement: placement
      }
    ]
  }, [])

  return (
    <div>
      <Joyride
        run={tourVisible}
        hideBackButton={true}
        disableOverlay={true}
        stepIndex={tourStep}
        steps={steps}
        floaterProps={floaterProps}
        styles={tourStyles}
        locale={tourLocale}
      />
      <InvoicesNew
        showCreateClientModal={showCreateClientModal}
        onCloseCreateClientModal={closeCreateClientModal}
        onProjectsLoaded={showTour}
        onProjectSelected={showClientTip}
        onClientSelected={showDateTip}
        onImportEntries={hideTour}
      />
      <TrackearToast />
    </div>
  )
}

ReactDOM.render(<TourInvoicesNew />, document.getElementById("invoices"))
