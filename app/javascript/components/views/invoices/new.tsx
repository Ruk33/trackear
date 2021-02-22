import ReactDOM from "react-dom"
import React, { useCallback, useEffect, useState, ChangeEvent, useMemo } from "react"
import { DateTime } from "luxon"
import Joyride, { Placement, TooltipRenderProps } from "react-joyride"
import CurrencyInput from 'react-currency-input-field'
import TrackerMaskInput from "components/TrackearMaskInput"
import TrackearDateRangePicker from "components/TrackearDateRangePicker"

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

type Project = {
  id: string,
  name: string,
}

type Client = {
  id: string,
  first_name: string,
  last_name: string,
  email: string,
  address: string,
}

type Contract = {
  is_admin: boolean,
}

/**
 * Entry contains all the
 * tracks registered by a
 * user.
 */
type Entry = {
  contract: Contract,
  tracks: Track[],
  user: User,
}

/**
 * Track is the entry of work
 * registered by a user. It
 * contains a from and a to
 * date from where we can
 * calculate it's quantity.
 */
type Track = {
  id: number,
  description: string,
  from: string,
  to: string,
  project_rate: string,
  user_rate: string,
}

type User = {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  picture: string,
}

function hoursFromTrack(track: Track) {
  return DateTime
  .fromISO(track.to)
  .diff(DateTime.fromISO(track.from), "hours")
  .hours
}

function hoursAndMinutesFromTrack(track: Track) {
  return DateTime
  .fromISO(track.to)
  .diff(DateTime.fromISO(track.from), ["hours", "minutes"])
  .toObject()
}

function calculateTrackAmount(track: Track) {
  const hours = hoursFromTrack(track)
  const rate = Number(track.project_rate) || 0
  return Number((rate * hours).toFixed(2))
}

function calculateTotalFromEntries(entries: Entry[], ignoredTracks: Map<number, boolean>) {
  return entries.reduce((entryResult, entry) => {
    return entryResult + entry.tracks.reduce((result, track) => {
      if (ignoredTracks.get(track.id)) {
        return result
      }
      return result + calculateTrackAmount(track)
    }, 0)
  }, 0)
}

type FetchingWrapperProps = {
  /*
   * Shows a loading message if true
   */
  loading: boolean,

  /*
   * If loading isn't true and error is
   * truthy, the error message will be displayed.
   */
  error: string | undefined,

  /*
   * If both, loading and error are falsy,
   * display these React children.
   */
  children: any
}

function FetchingWrapper(props: FetchingWrapperProps) {
  if (props.loading) {
    return (
      <div>
        Cargando...
      </div>
    )
  }

  if (props.error) {
    return (
      <div>
        {props.error}
      </div>
    )
  }

  return props.children
}

type ProjectSelectProps = {
  /*
   * Endpoint to get all the projects
   * of the current user (logged user)
   */
  projectsUri: string,

  /*
   * Selected project id.
   */
  project: string,

  onSelectProject: (project: string) => void,
}

function ProjectSelect(props: ProjectSelectProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchProjects = useCallback(async () => {
    setLoading(false)

    try {
      const rawResult = await fetch(props.projectsUri)
      const jsonResult = await rawResult.json()
      setProjects(jsonResult)
    } catch (e) {
      setError("Hubo un problema al obtener los proyectos.")
    }
  }, [setLoading, setProjects, setError, props])

  const onSelectProject = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    props.onSelectProject(e.target.value)
  }, [props])

  const buildProjectOptions = useCallback((projects: Project[]) => {
    return projects.map((project) => (
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    ))
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <FetchingWrapper loading={loading} error={error}>
      <select
        value={props.project}
        onChange={onSelectProject}
        className="p-2 rounded shadow bg-white"
      >
        <option value="" disabled>Seleccionar proyecto</option>
        {buildProjectOptions(projects)}
      </select>
      <div className="ml-6 project_select" />
    </FetchingWrapper>
  )
}

type ClientSelectProps = {
  /*
   * Endpoint to get all the current user's (logged user)
   * clients.
   */
  clientsUri: string,

  client: Client | undefined,

  onSelectClient: (client: Client) => void,

  disabled: boolean,
}

function ClientSelect(props: ClientSelectProps) {
  const { client, clientsUri } = props
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchClients = useCallback(async () => {
    setLoading(false)

    try {
      const rawResult = await fetch(clientsUri)
      const jsonResult = await rawResult.json()

      setClients(jsonResult)
    } catch (e) {
      setError("Hubo un problema al obtener los clientes.")
    }
  }, [setLoading, setClients, setError, clientsUri])

  const onSelectClient = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value
    const selectedClient = clients.find((client) => String(client.id) === selectedClientId)

    if (!selectedClient) {
      return
    }

    props.onSelectClient(selectedClient)
  }, [props, clients])

  const buildClientOptions = useCallback((clients: Client[]) => {
    return clients.map((client) => (
      <option key={client.id} value={client.id}>
        {client.first_name} {client.last_name} ({client.email})
      </option>
    ))
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return (
    <FetchingWrapper loading={loading} error={error}>
      <select
        disabled={props.disabled}
        value={client ? client.id : undefined}
        onChange={onSelectClient}
        className="p-2 rounded shadow bg-white"
      >
        <option value="">Seleccionar cliente</option>
        {buildClientOptions(clients)}
      </select>
      <div className="ml-6 client_select" />
    </FetchingWrapper>
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

  const getQty = useCallback((track: Track) => {
    const diff = hoursAndMinutesFromTrack(track)
    const safeHours = Number(diff.hours) || 0
    const safeMinutes = Number(diff.minutes) || 0
    const hours = safeHours < 10 ? `0${safeHours}` : `${safeHours}`
    const ceilMinutes = Math.ceil(safeMinutes)
    const minutes = ceilMinutes < 10 ? `0${ceilMinutes}` : `${ceilMinutes}`

    return `${hours}:${minutes}`
  }, [])

  const onUpdateDescription = useCallback((e: ChangeEvent<HTMLTextAreaElement>, track: Track) => {
    onUpdate({
      ...track,
      description: e.target.value
    })
  }, [onUpdate])

  const onUpdateQty = useCallback((e: ChangeEvent<HTMLInputElement>, track: Track) => {
    const [hours, minutes] = e.target.value.split(":")
    const newDate =
      DateTime
      .fromISO(track.from)
      .plus({
        hours: Number(hours) || 0,
        minutes: Number(minutes) || 0
      })
      .toISO()

    onUpdate({
      ...track,
      to: newDate
    })
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
              value={getQty(track)}
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

  client: undefined | Client,
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
    client,
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
          projectsUri="/projects.json"
          project={project}
          onSelectProject={onSetProject}
        />
      </div>
      <div className="flex items-center mb-2">
        <div className="font-bold w-48">Cliente</div>
        <ClientSelect
          clientsUri="/clients.json"
          client={client}
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
      <FetchingWrapper
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
      </FetchingWrapper>
      {entries.length > 0 && <div className="text-center">
        <button
          type="button"
          className="my-4 btn btn-primary mx-auto"
          onClick={props.onPreviewInvoice}
        >
          Ver factura como cliente
        </button>
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
  const { removedTracks, onClosePreview, client } = props

  const buildRow = useCallback((entry: Entry) => {
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
      <table className="w-full border">
        <thead>
          <tr>
            <th className="py-4 px-2 bg-gray-100 border text-left">Description</th>
            <th className="py-4 px-2 bg-gray-100 border text-right">Qty</th>
            <th className="py-4 px-2 bg-gray-100 border text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.entries.map(buildRow)}
        </tbody>
      </table>
      <div className="text-center mt-2">
        <button
          className="btn btn-primary"
          type="button"
          onClick={onClosePreview}
        >
          Editar
        </button>
      </div>
    </>
  )
}

type InvoicesNewProps = {
  onProjectSelected: () => void,
  onClientSelected: () => void,
  onSelectDates: () => void,
}

function InvoicesNew(props: InvoicesNewProps) {
  const { onProjectSelected, onClientSelected, onSelectDates } = props
  const [project, setProject] = useState("")
  const [client, setClient] = useState<Client | undefined>(undefined)
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
          client={client}
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

function Tooltip(props: TooltipRenderProps) {
  return <div>Something</div>
}

function TourInvoicesNew() {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState<number | undefined>(0)
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
              ¿Necesitas crear un nuevo cliente? <a href="/clients/new" className="btn btn-primary btn-sm">Crear nuevo cliente</a>
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

  const showClientTooltip = useCallback(() => {
    setStepIndex(1)
  }, [setStepIndex])

  const showDateTooltip = useCallback(() => {
    setStepIndex(2)
  }, [setStepIndex])

  const hideTips = useCallback(() => {
    setRun(false)
  }, [setRun])

  useEffect(() => {
    setRun(true)
  }, [])

  return (
    <div>
      <Joyride
        run={run}
        hideBackButton={true}
        disableOverlay={true}
        stepIndex={stepIndex}
        steps={steps}
        spotlightPadding={0}
        floaterProps={floaterProps}
        styles={tourStyles}
      />
      <InvoicesNew
        onProjectSelected={showClientTooltip}
        onClientSelected={showDateTooltip}
        onSelectDates={hideTips}
      />
    </div>
  )
}

ReactDOM.render(<TourInvoicesNew />, document.getElementById("invoices"))

