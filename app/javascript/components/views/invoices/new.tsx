import ReactDOM from "react-dom"
import React, { useCallback, useEffect, useState, ChangeEvent, useMemo } from "react"
import { DateTime } from "luxon"
import Joyride, { Placement } from "react-joyride"
import CurrencyInput from "react-currency-input-field"
import TrackerMaskInput from "components/TrackearMaskInput"
import TrackearDateRangePicker from "components/TrackearDateRangePicker"
import TrackearButton from "components/TrackearButton"
import TrackearFetching from "components/TrackearFetching"
import TrackearModal from "components/TrackearModal"
import ClientForm from "../clients/ClientForm"
import { Client, getAllClients } from "components/service/Client"
import { Project, getAllProjects } from "components/service/Project"
import { calculateTotalFromEntries, Entry } from "components/service/Entry"
import { Track, calculateTrackAmount, hoursFromTrack, formatQtyTrack, setHoursAndMinutesFromTrack } from "components/service/Track"
import TrackearSelectInput, { SelectOption } from "components/TrackearSelectInput"
import TrackearTable, { TableColumn, TableRow } from "components/TrackearTable"

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

type ProjectSelectProps = {
  /*
   * Selected project id.
   */
  project: string,

  onSelectProject: (project: string) => void,
}

function ProjectSelect(props: ProjectSelectProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchProjects = useCallback(async () => {
    setLoading(true)

    try {
      const projects = await getAllProjects()
      setProjects(projects)
    } catch (e) {
      setError("Hubo un problema al obtener los proyectos.")
    }

    setLoading(false)
  }, [setLoading, setProjects, setError])

  const onSelectProject = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    props.onSelectProject(e.target.value)
  }, [props])

  const projectOptions: SelectOption[] = useMemo(() => {
    return projects.map((project) => ({
      id: project.id,
      label: project.name,
      value: project.id,
    }))
  }, [projects])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <TrackearFetching loading={loading} error={error}>
      <TrackearSelectInput
        options={projectOptions}
        value={props.project}
        onChange={onSelectProject}
      />
      <div className="ml-6 project_select" />
    </TrackearFetching>
  )
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

  onUpdateClient: () => void,

  onSelectClient: (client: Client) => void,

  disabled: boolean,
}

function ClientSelect(props: ClientSelectProps) {
  const { client, clients, onUpdateClient } = props

  const onSelectClient = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value
    const selectedClient = clients.find((client) => String(client.id) === selectedClientId)

    if (!selectedClient) {
      return
    }

    props.onSelectClient(selectedClient)
  }, [props, clients])

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
        disabled={props.disabled}
        value={client ? String(client.id) : undefined}
        onChange={onSelectClient}
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
   * Map of removed/discarded entries
   * by entry id.
   */
  removedTracks: Map<number, boolean>,
}

function EntryRow(props: EntryRowProps) {
  const { entry, onRemove, onRestore, onUpdate, removedTracks } = props
  const { user, tracks } = entry

  const onUpdateDescription = useCallback((e: ChangeEvent<HTMLTextAreaElement>, track: Track) => {
    onUpdate({
      ...track,
      description: e.target.value
    })
  }, [onUpdate])

  const onUpdateQty = useCallback((e: ChangeEvent<HTMLInputElement>, track: Track) => {
    const [hours, minutes] = e.target.value.split(":")
    const updatedTrack = { ...track }

    setHoursAndMinutesFromTrack(
      updatedTrack,
      Number(hours) || 0,
      Number(minutes) || 0,
    )

    onUpdate(updatedTrack)
  }, [onUpdate])

  const onUpdateRate = useCallback((value: string | undefined, track: Track) => {
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
              className={`border p-2 w-full ${removedTracks.get(track.id) && "opacity-50"}`}
              value={track.description}
              onChange={(e) => onUpdateDescription(e, track)}
              rows={1}
            />
          </td>
          <td className="text-right p-2">
            <TrackerMaskInput
              className={`border p-2 w-full text-right ${removedTracks.get(track.id) && "opacity-50"}`}
              maskChar="0"
              mask="00:00"
              value={formatQtyTrack(track)}
              onChange={(e) => onUpdateQty(e, track)}
            />
          </td>
          <td className="text-right p-2">
            <CurrencyInput
              className={`border p-2 w-full text-right ${removedTracks.get(track.id) && "opacity-50"}`}
              value={track.project_rate}
              onValueChange={(value) => onUpdateRate(value, track)}
              intlConfig={intlConfig}
              placeholder="$00.00"
            />
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

type SelectEntriesProps = {
  start: Date | undefined,
  end: Date | undefined,
  onChangeStart: (date: Date | null) => void,
  onChangeEnd: (date: Date | null) => void,
  disabled: boolean,
}

function SelectDates(props: SelectEntriesProps) {
  return (
    <div className="flex items-center">
      <TrackearDateRangePicker
        start={props.start || null}
        end={props.end || null}
        onChangeStart={props.onChangeStart}
        onChangeEnd={props.onChangeEnd}
        disabled={props.disabled}
      />
      <div className="ml-6 date_select" />
    </div>
  )
}

type EntriesProps = {
  start: Date | undefined,
  end: Date | undefined,
  entries: Entry[],
  onUpdateEntries: (entries: Entry[]) => void,
  removedTracks: Map<number, boolean>,
  onRemoveTrack: (track: Track) => void,
  onRestoreTrack: (track: Track) => void,
}

function Entries(props: EntriesProps) {
  const {
    start,
    end,
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
  }, [onUpdateEntries, entries])

  const total = useMemo(
    () => calculateTotalFromEntries(entries, removedTracks),
    [entries, removedTracks]
  )

  if (!start || !end) {
    return <div />
  }

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
            onUpdate={handleUpdate}
            removedTracks={removedTracks}
          />
        ))}
        <tr>
          <td colSpan={3}></td>
          <td className="text-right p-2 py-4 text-2xl">Total: ${total}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  )
}

type InvoiceFormProps = {
  project: string,
  onSetProject: (project: string) => void,

  onUpdateClient: () => void,
  client: undefined | Client,
  clients: Client[],
  fetchingClients: boolean,
  errorFetchingClients: string,
  onSetClient: (client: Client) => void,

  startDate: Date | undefined,
  onSetStartDate: (date: Date | null) => void,

  endDate: Date | undefined,
  onSetEndDate: (date: Date | null) => void,

  entries: Entry[],
  onSetEntries: (entries: Entry[]) => void,

  removedTracks: Map<number, boolean>,
  onRemoveTrack: (track: Track) => void,
  onRestoreTrack: (track: Track) => void,

  onPreviewInvoice: () => void,
}

function InvoiceForm(props: InvoiceFormProps) {
  const {
    project,
    onSetProject,

    onUpdateClient,
    client,
    clients,
    fetchingClients,
    errorFetchingClients,
    onSetClient,

    startDate,
    onSetStartDate,

    endDate,
    onSetEndDate,

    entries,
    onSetEntries,

    removedTracks,
    onRemoveTrack,
    onRestoreTrack,
  } = props
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /*
   * Return endpoint to get all
   * activity track from project id.
   */
  const entriesUri = useMemo(() => {
    return `/projects/${project}/status_period.json`
  }, [project])

  const fetchEntries = useCallback(async () => {
    if (!project || !startDate || !endDate) {
      return
    }

    const formattedStart = DateTime.fromJSDate(startDate).toISODate()
    const formattedEnd = DateTime.fromJSDate(endDate).toISODate()

    setLoading(false)

    try {
      const rawResult = await fetch(`${entriesUri}?start_date=${formattedStart}&end_date=${formattedEnd}`)
      const jsonResult = await rawResult.json()
      onSetEntries(jsonResult)
    } catch (e) {
      setError("Hubo un problema al obtener los clientes.")
    }
  }, [entriesUri, project, startDate, endDate, onSetEntries])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return (
    <>
      <div className="flex items-center mb-2">
        <div className="font-bold w-48">Proyecto</div>
        <ProjectSelect
          project={project}
          onSelectProject={onSetProject}
        />
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
      <div className="flex items-center mb-4">
        <div className="font-bold w-48">Fecha</div>
        <SelectDates
          disabled={!project || !client}
          start={startDate}
          end={endDate}
          onChangeStart={onSetStartDate}
          onChangeEnd={onSetEndDate}
        />
      </div>
      <TrackearFetching
        loading={loading}
        error={error}
      >
        <Entries
          start={startDate}
          end={endDate}
          entries={entries}
          onUpdateEntries={onSetEntries}
          removedTracks={removedTracks}
          onRemoveTrack={onRemoveTrack}
          onRestoreTrack={onRestoreTrack}
        />
      </TrackearFetching>
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
}

function PreviewInvoice(props: PreviewInvoiceProps) {
  const { entries, removedTracks, onClosePreview, client } = props

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        id: "description",
        component: "Descripción",
        props: { className: "py-4 px-2 bg-gray-100 border text-left" },
      },
      {
        id: "qty",
        component: "Cantidad",
        props: { className: "py-4 px-2 bg-gray-100 border text-right" },
      },
      {
        id: "amount",
        component: "Total",
        props: { className: "py-4 px-2 bg-gray-100 border text-right" },
      },
    ]
  }, [])

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
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="text-left">
          <h2 className="font-bold">Bill to</h2>
          <p>Address: {client && client.address}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold">Company name</h2>
          <p>Address: ...</p>
        </div>
      </div>

      <TrackearTable columns={columns}>
        {entries.map(buildRows)}
      </TrackearTable>

      <div className="text-center mt-2">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={onClosePreview}
        >
          Continuar editando
        </button>
      </div>
    </>
  )
}

type InvoicesNewProps = {
  onUpdateClient: () => void,
  client: Client | undefined,
  clients: Client[],
  setClient: (client: Client) => void,
  fetchingClients: boolean,
  errorFetchingClients: string,
  onProjectSelected: () => void,
  onClientSelected: () => void,
  onSelectDates: () => void,
}

function InvoicesNew(props: InvoicesNewProps) {
  const { onUpdateClient, client, clients, setClient, fetchingClients, errorFetchingClients, onProjectSelected, onClientSelected, onSelectDates } = props
  const [project, setProject] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [start, setStart] = useState<Date | null>()
  const [end, setEnd] = useState<Date | null>()
  const [preview, setPreview] = useState(false)
  const [removedTracks, setRemovedTracks] = useState(new Map<number, boolean>())

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

  const onSetEntries = useCallback((entries: Entry[]) => {
    onSelectDates()
    setEntries(entries)
  }, [onSelectDates, setEntries])

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

  return (
    <div className="bg-white p-4 rounded border">
      <div className={`${!preview ? "visible" : "hidden"}`}>
        <InvoiceForm
          project={project}
          onSetProject={setProject}
          onUpdateClient={onUpdateClient}
          client={client}
          clients={clients}
          fetchingClients={fetchingClients}
          errorFetchingClients={errorFetchingClients}
          onSetClient={setClient}
          startDate={start || undefined}
          onSetStartDate={setStart}
          endDate={end || undefined}
          onSetEndDate={setEnd}
          entries={entries}
          onSetEntries={onSetEntries}
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
        />
      </div>
    </div>
  )
}

function TourInvoicesNew() {
  const [updatingClient, setUpdatingClient] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [client, setClient] = useState<Client | undefined>(undefined)
  const [clients, setClients] = useState<Client[]>([])
  const [fetchingClients, setFetchingClients] = useState(false)
  const [errorFetchingClients, setErrorFetchingClients] = useState("")
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState<number | undefined>(0)

  const fetchClients = useCallback(async (selectLast) => {
    setFetchingClients(true)

    try {
      const result = await getAllClients()
      setClients(result)

      if (selectLast) {
        setClient(result[result.length - 1])
      }
    } catch (e) {
      setErrorFetchingClients("Hubo un error al obtener tus clientes. Por favor, intentalo mas tarde.")
    }

    setFetchingClients(false)
  }, [setFetchingClients, setClients, setClient, setErrorFetchingClients])

  const showClientTooltip = useCallback(() => {
    setStepIndex(1)
  }, [setStepIndex])

  const showDateTooltip = useCallback(() => {
    setStepIndex(2)
  }, [setStepIndex])

  const hideTips = useCallback(() => {
    setRun(false)
  }, [setRun])

  const openClientForm = useCallback(() => {
    setCreatingClient(true)
    setRun(false)
  }, [setCreatingClient])

  const closeClientForm = useCallback(() => {
    setCreatingClient(false)
    setRun(true)
  }, [setCreatingClient])

  const steps = useMemo(() => {
    const placement: Placement = "right"
    return [
      {
        target: ".project_select",
        content: <div className="text-left">Seleccioná el proyecto para el que querés hacer la factura.</div>,
        placement: placement
      },
      {
        target: ".client_select",
        content: (
          <div className="text-left">
            <p className="py-2">
              Seleccioná el cliente al cual le vas a generar la factura.
            </p>
            <p className="py-2">
              ¿Necesitas crear un nuevo cliente? <button type="button" onClick={openClientForm} className="btn btn-primary btn-sm">Crear nuevo cliente</button>
            </p>
          </div>
        ),
        placement: placement
      },
      {
        target: ".date_select",
        content: <div className="text-left">Seleccioná el período para cargar los registros de tiempo.</div>,
        placement: placement
      }
    ]
  }, [])

  const closeAndSelectCreatedClient = useCallback(() => {
    closeClientForm()
    fetchClients(true)
  }, [closeClientForm, fetchClients])

  const onUpdateClient = useCallback(() => {
    setUpdatingClient(true)
  }, [setUpdatingClient])

  const closeUpdateClient = useCallback(() => {
    setUpdatingClient(false)
  }, [setUpdatingClient])

  const closeAndRefetchClients = useCallback(() => {
    closeUpdateClient()
    fetchClients(false)
  }, [closeUpdateClient, fetchClients])

  const clientAsForm = useMemo(() => {
    if (!client) {
      return undefined
    }

    const selectedClient = clients.find((c) => c.id === client.id)

    if (!selectedClient) {
      return undefined;
    }

    return {
      firstName: selectedClient.first_name,
      lastName: selectedClient.last_name,
      email: selectedClient.email,
      address: selectedClient.address
    }
  }, [clients, client])

  useEffect(() => {
    fetchClients(false)
    setRun(true)
  }, [])

  return (
    <div>
      <TrackearModal
        isOpen={creatingClient}
        onRequestClose={closeClientForm}
      >
        <div style={{ minWidth: "600px" }}>
          <h1 className="font-bold text-lg mb-2">Crear nuevo cliente</h1>
          <ClientForm onSuccess={closeAndSelectCreatedClient} />
        </div>
      </TrackearModal>

      <TrackearModal
        isOpen={updatingClient}
        onRequestClose={closeUpdateClient}
      >
        <div style={{ minWidth: "600px" }}>
          <h1 className="font-bold text-lg mb-2">Actualizar cliente</h1>
          <ClientForm
            id={client ? String(client.id) : undefined}
            client={clientAsForm}
            onSuccess={closeAndRefetchClients}
          />
        </div>
      </TrackearModal>
      <Joyride
        run={run}
        hideBackButton={true}
        disableOverlay={true}
        stepIndex={stepIndex}
        steps={steps}
        spotlightPadding={0}
        floaterProps={floaterProps}
        styles={tourStyles}
        locale={tourLocale}
      />
      <InvoicesNew
        onUpdateClient={onUpdateClient}
        client={client}
        clients={clients}
        setClient={setClient}
        fetchingClients={fetchingClients}
        errorFetchingClients={errorFetchingClients}
        onProjectSelected={showClientTooltip}
        onClientSelected={showDateTooltip}
        onSelectDates={hideTips}
      />
    </div>
  )
}

ReactDOM.render(<TourInvoicesNew />, document.getElementById("invoices"))

