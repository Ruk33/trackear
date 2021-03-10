import React, { memo, useMemo } from "react"

export type SelectValue = string | number | readonly string[] | undefined

export type SelectOption = {
  id: string,
  label: string,
  value: SelectValue,
}

type Props = {
  disabled?: boolean,
  placeholder?: string,
  options?: SelectOption[],
  value?: SelectValue,
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void,
}

function TrackearSelectInput(props: Props) {
  const { placeholder, disabled, options, value, onChange } = props

  const builtOptions = useMemo(() => {
    if (!options) {
      return []
    }

    return options.map((option) => (
      <option key={option.id} value={option.id}>
        {option.label}
      </option>
    ))
  }, [options])

  return (
    <select
      disabled={disabled}
      value={value}
      onChange={onChange}
      className="p-3 rounded shadow bg-white cursor-pointer focus:ring-2 focus:ring-blue-600"
    >
      <option value="" selected disabled>{placeholder || "Seleccionar"}</option>
      {builtOptions}
    </select>
  )
}

export default memo(TrackearSelectInput)
