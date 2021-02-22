import React from "react"
import { es } from "date-fns/locale"
import { DateRangePicker } from
"react-nice-dates"

require("../../../node_modules/react-nice-dates/build/style.css")

type MaybeDate = Date | null;

type Props = {
  start: MaybeDate,
  end: MaybeDate,
  onChangeStart: (date: MaybeDate) => void,
  onChangeEnd: (date: MaybeDate) => void,
}

export default function TrackearDateRangePicker(props: Props) {
  return (
    <DateRangePicker
      startDate={props.start || undefined}
      endDate={props.end || undefined}
      onStartDateChange={props.onChangeStart}
      onEndDateChange={props.onChangeEnd}
      minimumLength={1}
      format='dd MMM yyyy'
      locale={es}
    >
      {({ startDateInputProps, endDateInputProps }) => (
        <div>
          <input
            className="text-center rounded-l p-2 shadow"
            {...startDateInputProps}
            placeholder="Desde"
          />
          <input
            className="text-center rounded-r p-2 shadow"
            {...endDateInputProps}
            placeholder="Hasta"
          />
        </div>
      )}
    </DateRangePicker>
  )
}
