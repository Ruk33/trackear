import ReactDOM from "react-dom"
import React, { useCallback, useEffect, useState, ChangeEvent, useMemo } from "react"
import Joyride, { Placement } from "react-joyride"
import { Popover } from "react-tiny-popover"
import CurrencyInput from "react-currency-input-field"
import { calculateTotalFromEntries, calculateEntryAmount, createInvoice, formatQtyEntry, InvoiceEntry, setHoursAndMinutesFromEntry, hoursFromEntry, mergeEntriesToInvoiceEntries, updateInvoice, entriesFromInvoiceResponse, makeInvoiceVisible } from "components/service/Invoice"
import { Client } from "components/service/Client"
import { User } from "components/service/User"
import { Entry } from "components/service/Entry"
import { useFetchClients } from "components/hook/ClientHook"
import { useFetchCurrentUser } from "components/hook/UserHook"
import NewClientModal from "components/modal/clients/NewClientModal"
import UpdateClientModal from "components/modal/clients/UpdateClientModal"
import TrackearButton from "components/TrackearButton"
import TrackearFetching from "components/TrackearFetching"
import TrackearSelectInput, { SelectOption } from "components/TrackearSelectInput"
import ShowInvoice from "components/views/invoices/show"
import TrackearToast, { toast } from "components/TrackearToast"
import TrackearQtyInput from "components/TrackearQtyInput"
import ProjectSelect from "components/TrackearProjectSelectInput"
import TrackearEntriesInput from "components/TrackearEntriesInput"
import TrackearDateRangePicker from "components/TrackearDateRangePicker"
import InvoiceCreatedModal from "components/modal/invoices/InvoiceCreatedModal"
import NoTracksIcon from "../../../../assets/images/empty-invoice-tracks-icon.svg"

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
      {client && <button className="text-blue-400 ml-2 p-2" onClick={onUpdateClient}>Actualizar datos del cliente</button>}
      <div className="ml-6 client_select" />
    </TrackearFetching>
  )
}

type QtyCashAmountProps = {
  entry: InvoiceEntry,
  isRemoved: boolean,
}

function QtyCashAmount(props: QtyCashAmountProps) {
  const { entry, isRemoved } = props
  const amount = useMemo(() => calculateEntryAmount(entry), [entry])

  return (
    <div className={`text-right ${isRemoved && "opacity-50"}`}>
      ${amount}
    </div>
  )
}

type EntryRowProps = {
  /**
   * Author of tracks
   */
  user: User,

  entries: InvoiceEntry[],

  /**
   * Callback to be executed when the
   * entry gets discarded.
   * Discarded means, the entry wont be taken
   * in consideration for final invoice
   * calculations such as subtotal,
   * total, etc.
   */
  onRemove: (entry: InvoiceEntry) => void,

  /**
   * Callback to be executed
   * when entry gets restored.
   */
  onRestore: (entry: InvoiceEntry) => void,

  /**
   * Callback to be executed when the
   * entry gets updated (description changed,
   * qty changed, etc.)
   */
  onUpdate: (entry: InvoiceEntry) => void,

  /**
   * Callback executed when the user
   * wants to update all tracks rate from
   * a user entries
   */
  onUpdateAllTracksRate: (user: string, rate: string) => void,
}

function EntryRow(props: EntryRowProps) {
  const [focusedEntry, setFocusedEntry] = useState<number | undefined>(undefined)
  const { user, entries, onRemove, onRestore, onUpdate, onUpdateAllTracksRate } = props

  const onUpdateDescription = useCallback((e: ChangeEvent<HTMLTextAreaElement>, entry: InvoiceEntry) => {
    onUpdate({
      ...entry,
      description: e.target.value
    })
  }, [onUpdate])

  const onUpdateQty = useCallback((value: string, entry: InvoiceEntry) => {
    const [hours, minutes] = value.split(":")
    const updatedEntry = setHoursAndMinutesFromEntry(
      entry,
      Number(hours) || 0,
      Number(minutes) || 0,
    )

    onUpdate(updatedEntry)
  }, [onUpdate])

  const loseFocusFromTrack = useCallback(() => {
    setFocusedEntry(undefined)
  }, [setFocusedEntry])

  const updateAllTracksRate = useCallback((value: string) => {
    onUpdateAllTracksRate(String(user.id), value)
    loseFocusFromTrack()
  }, [user, onUpdateAllTracksRate, loseFocusFromTrack])

  const onUpdateRate = useCallback((value: string | undefined, entry: InvoiceEntry) => {
    // For some reason the currency inputs
    // executes the callback even if the
    // user doesn't type anything...
    if (value === entry.rate) {
      return
    }

    setFocusedEntry(entry.id)
    onUpdate({
      ...entry,
      rate: value || ""
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
      {entries.map((entry) => (
        <tr key={entry.id}>
          <td className="p-2">
            <textarea
              className="border p-2 w-full"
              value={entry.description}
              onChange={(e) => onUpdateDescription(e, entry)}
              rows={1}
              disabled={entry.destroyed}
            />
          </td>
          <td className="text-right p-2">
            <TrackearQtyInput
              value={formatQtyEntry(entry)}
              onChange={(value) => onUpdateQty(value, entry)}
              disabled={entry.destroyed}
            />
          </td>
          <td className="text-right p-2">
            <Popover
              isOpen={!!entry.rate && focusedEntry === entry.id}
              positions={['top']}
              padding={10}
              content={(
                <div className="w-64 bg-gray-800 text-white p-6 shadow-md rounded">
                  <p>¿Querés cambiar la tarifa de todos los registros de <span className="text-pink-500">{user.first_name}</span> a <span className="text-pink-500">${entry.rate}?</span></p>
                  <div className="mt-3 flex justify-center items-center">
                    <button
                      onClick={loseFocusFromTrack}
                      className="btn btn-sm mx-1"
                    >
                      No
                    </button>
                    <button
                      onClick={() => updateAllTracksRate(entry.rate)}
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
                value={entry.rate}
                onValueChange={(value) => onUpdateRate(value, entry)}
                intlConfig={intlConfig}
                placeholder="$00.00"
                disabled={entry.destroyed}
              />
            </Popover>
          </td>
          <td className="text-right p-2">
            <QtyCashAmount
              isRemoved={!!entry.destroyed}
              entry={entry}
            />
          </td>
          <td className="text-center p-2">
            {!entry.destroyed && <button
              type="button"
              className="rounded shadow px-4 py-2 text-red-500"
              onClick={() => onRemove(entry)}
            >
              Remover
            </button>}
            {entry.destroyed && <button
              type="button"
              className="rounded shadow px-4 py-2 text-blue-500"
              onClick={() => onRestore(entry)}
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
  onLoadEntries: (entries: Entry[]) => void,
  invoiceFrom: Date | null,
  invoiceTo: Date | null,
}

function ImportEntries({ project, onLoadEntries, invoiceFrom, invoiceTo }: ImportEntriesProps) {
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)

  const resetInput = useCallback((entries: Entry[]) => {
    onLoadEntries(entries)
    setStart(null)
    setEnd(null)
  }, [setStart, setEnd, onLoadEntries])

  return (
    <div className="bg-gray-200 flex justify-center p-4">
      <div className="text-center">
        <h4 className="font-bold">Importar registros de trabajo</h4>
        <div className="flex items-center">
          <TrackearEntriesInput
            project={project}
            start={start}
            end={end}
            onSetStart={setStart}
            onSetEnd={setEnd}
            onLoadEntries={resetInput}
            disabled={!invoiceFrom || !invoiceTo}
          />
          <div className="date_select ml-6" />
        </div>
      </div>
    </div>
  )
}

type EntriesProps = {
  user: User,
  entries: InvoiceEntry[],
  onUpdateEntries: (entries: InvoiceEntry[]) => void,
  onRemoveTrack: (entry: InvoiceEntry) => void,
  onRestoreTrack: (entry: InvoiceEntry) => void,
}

function Entries(props: EntriesProps) {
  const {
    user,
    entries,
    onUpdateEntries,
    onRemoveTrack,
    onRestoreTrack,
  } = props

  const handleUpdate = useCallback((updatedEntry: InvoiceEntry) => {
    const updated = entries.map((entry) => {
      if (entry.id === updatedEntry.id) {
        return updatedEntry
      }
      return entry
    })

    onUpdateEntries(updated)
  }, [entries, onUpdateEntries])

  const updateAllTracksRate = useCallback((fromUser: string, rate: string) => {
    const updated = entries.map((entry) => ({
      ...entry,
      rate,
    }))

    onUpdateEntries(updated)
  }, [entries, onUpdateEntries])

  const total = useMemo(
    () => calculateTotalFromEntries(entries),
    [entries]
  )

  return (
    <table className="w-full border table-fixed">
      <thead>
        <tr>
          <th className="p-2 text-white bg-gray-900 w-1/2 text-left">Descripción</th>
          <th className="p-2 text-white bg-gray-900 w-1/8 text-right">Tiempo registrado</th>
          <th className="p-2 text-white bg-gray-900 w-1/8 text-right">Tarifa</th>
          <th className="p-2 text-white bg-gray-900 w-1/8 text-right">Total</th>
          <th className="p-2 text-white bg-gray-900 w-1/8 text-center">-</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 && <tr>
          <td colSpan={5}>
            <div className="text-gray-500 p-6 mx-auto flex items-center" style={{ width: "1000px" }}>
              <div className="mr-8" style={{width: "300px"}}>
                <NoTracksIcon />
              </div>
              <div style={{ width: "500px" }}>
                <h3 className="text-3xl text-pink-400">
                  Sin registros importados.
                </h3>
                <p className="text-xl">
                  Una vez que seleccciones el proyecto, el cliente y el período de facturación, vas a poder importar los registros de actividad desde "Importar registros de trabajo".
                </p>
              </div>
            </div>
          </td>
        </tr>}
        {/* We should be passing the entries by user */}
        <EntryRow
          user={user}
          entries={entries}
          onRemove={onRemoveTrack}
          onRestore={onRestoreTrack}
          onUpdateAllTracksRate={updateAllTracksRate}
          onUpdate={handleUpdate}
        />
        {entries.length > 0 && <tr>
          <td colSpan={3}></td>
          <td className="text-right p-2 py-4 text-2xl">Total: ${total.toFixed(2)}</td>
          <td></td>
        </tr>}
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

  from: Date | null,
  onSetFrom: (value: Date | null) => void,
  to: Date | null,
  onSetTo: (value: Date | null) => void,

  entries: InvoiceEntry[],
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
  onUpdateEntries: (entries: InvoiceEntry[]) => void,
  /**
   * Callback to be executed when a track is "removed"
   */
  onRemoveTrack: (entry: InvoiceEntry) => void,
  /**
   * Callback to be executed when a track gets restored
   */
  onRestoreTrack: (entry: InvoiceEntry) => void,
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
    from,
    to,
    onSetFrom,
    onSetTo,
    entries,
    onImportEntries,
    onUpdateEntries,
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
      <div className="flex items-center mb-6">
        <div className="font-bold w-48">Período de facturación</div>
        <TrackearDateRangePicker
          start={from}
          end={to}
          onChangeStart={onSetFrom}
          onChangeEnd={onSetTo}
        />
        <div className="ml-6 period_select" />
      </div>
      <ImportEntries
        project={project}
        onLoadEntries={onImportEntries}
        invoiceFrom={from}
        invoiceTo={to}
      />
      <Entries
        user={{}}
        entries={entries}
        onUpdateEntries={onUpdateEntries}
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

type InvoicesNewProps = {
  showCreateClientModal: boolean,
  onCloseCreateClientModal: () => void,
  onProjectsLoaded: () => void,
  onProjectSelected: () => void,
  onClientSelected: () => void,
  onPeriodSelected: () => void,
  onImportEntries: () => void,
}

function InvoicesNew(props: InvoicesNewProps) {
  const {
    showCreateClientModal,
    onCloseCreateClientModal,
    onProjectsLoaded,
    onProjectSelected,
    onClientSelected,
    onPeriodSelected,
    onImportEntries,
  } = props

  const [finishingInvoice, setFinishingInvoice] = useState(false)
  const [finished, setFinished] = useState(false)
  const [invoiceId, setInvoiceId] = useState<number | undefined>(undefined)
  const [showUpdateClientModal, setShowUpdateClientModal] = useState(false)
  const [project, setProject] = useState("")
  const [client, setClient] = useState<Client | undefined>(undefined)
  const [from, setFrom] = useState<Date | null>(null)
  const [to, setTo] = useState<Date | null>(null)
  const [entries, setEntries] = useState<InvoiceEntry[]>([])
  const [preview, setPreview] = useState(false)
  const { user, fetchUser } = useFetchCurrentUser()
  const { clients, fetchClients, error: clientsError, fetching: fetchingClients } = useFetchClients()

  const onPreview = useCallback(() => {
    setPreview(true)
  }, [setPreview])

  const onClosePreview = useCallback(() => {
    setPreview(false)
  }, [setPreview])

  const removeTrack = useCallback((removedEntry: InvoiceEntry) => {
    const updated = entries.map((entry) => ({
      ...entry,
      destroyed: entry.id === removedEntry.id ? true : entry.destroyed,
    }))
    setEntries(updated)
  }, [entries, setEntries])

  const restoreTrack = useCallback((restoredEntry: InvoiceEntry) => {
    const updated = entries.map((entry) => ({
      ...entry,
      destroyed: entry.id === restoredEntry.id ? false : entry.destroyed,
    }))
    setEntries(updated)
  }, [entries, setEntries])

  const onAddEntries = useCallback(async (importedEntries: Entry[]) => {
    const merged = mergeEntriesToInvoiceEntries(entries, importedEntries)

    if (merged.length === 0) {
      toast("No se encontraron registros de trabajo en ese período.")
      return
    }

    try {
      if (invoiceId) {
        const updatedInvoice = await updateInvoice({
          id: invoiceId,
          project,
          client: client ? String(client.id) : "",
          from,
          to,
          entries: merged,
        })
        setEntries(entriesFromInvoiceResponse(updatedInvoice))
        return
      }

      const createdInvoice = await createInvoice({
        project,
        client: client ? String(client.id) : "",
        from,
        to,
        entries: merged,
      })

      setInvoiceId(createdInvoice.invoice.id)
      setEntries(entriesFromInvoiceResponse(createdInvoice))

      window.history.pushState({}, "", `/invoices/${createdInvoice.invoice.id}/edit`)
      toast("Vamos a ir guardando tu factura para que no pierdas ningún cambio 👍")
    } catch (e) {}

    onImportEntries()
  }, [invoiceId, setInvoiceId, entries, setEntries, onImportEntries, project, client, from, to])

  const onUpdateEntries = useCallback((entries: InvoiceEntry[]) => {
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

  const onClickFinish = useCallback(async () => {
    if (!invoiceId) {
      return
    }

    setFinishingInvoice(true)

    try {
      await makeInvoiceVisible(invoiceId)
      setFinished(true)
    } catch (e) {}

    setFinishingInvoice(false)
  }, [setFinishingInvoice, invoiceId, setFinished])

  const redirectToInvoice = useCallback(() => {
    window.location.href = `/projects/${project}/invoices/${invoiceId}`;
  }, [project, invoiceId])

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
    if (!from || !to) {
      return
    }

    onPeriodSelected()
  }, [from, to, onPeriodSelected])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (!invoiceId) {
      return
    }

    updateInvoice({
      id: invoiceId,
      project,
      client: client ? String(client.id) : "",
      from,
      to,
      entries: entries,
    })
  }, [invoiceId, project, client, from, to, entries])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <>
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
      <InvoiceCreatedModal
        isOpen={finished}
        onClose={redirectToInvoice}
        invoice={String(invoiceId)}
        project={project}
      />
      <div className={`${!preview ? "visible" : "hidden"}`}>
        <h1 className="text-4xl my-2">Crear factura</h1>
        <div className="bg-white p-4 rounded border">
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
            from={from}
            onSetFrom={setFrom}
            to={to}
            onSetTo={setTo}
            entries={entries}
            onImportEntries={onAddEntries}
            onUpdateEntries={onUpdateEntries}
            onPreviewInvoice={onPreview}
            onRemoveTrack={removeTrack}
            onRestoreTrack={restoreTrack}
          />
        </div>
      </div>
      <div className={`${preview ? "visible" : "hidden"}`}>
        <ShowInvoice
          client={client}
          entries={entries}
          companyName={user ? user.company_name : ""}
          companyEmail={user ? user.company_email : ""}
          companyAddress={user ? user.company_address : ""}
          companyLogo=""
        />
        <div className="text-center mt-2">
          {!finished && <TrackearButton
            className="btn btn-secondary mr-2"
            type="button"
            onClick={onClosePreview}
          >
            Continuar editando
          </TrackearButton>}
          {!finished && <TrackearButton
            className="btn btn-primary"
            onClick={onClickFinish}
            loading={finishingInvoice}
          >
            Finalizar
          </TrackearButton>}
        </div>
      </div>
    </>
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

  const showImportEntriesTip = useCallback(() => {
    setTourStep(3)
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
        placement: placement,
      },
      {
        target: ".period_select",
        content: <div className="text-left">Seleccioná el período de facturación.</div>,
        placement: placement,
      },
      {
        target: ".date_select",
        content: <div className="text-left">Importá los registros de tiempo registrados en un período de tiempo.</div>,
        placement: placement,
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
        onPeriodSelected={showImportEntriesTip}
        onImportEntries={hideTour}
      />
      <TrackearToast />
    </div>
  )
}

ReactDOM.render(<TourInvoicesNew />, document.getElementById("invoices"))
