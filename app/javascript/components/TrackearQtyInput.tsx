import React, { memo, useCallback, useRef } from "react"

type Props = {
  value: string,
  onChange: (value: string) => void,
}

function onlyNumbers(value: string) {
  return value.replace(/[^\d]+/, "")
}

function padWithZeros(value: string) {
  switch (value.length) {
    case 0:
      return "00"
    case 1:
      return "0" + value
    default:
      return value
  }
}

function TrackearQtyInput({ value, onChange }: Props) {
  const [hours, minutes] = value.split(":")
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const minutesCursor = useRef<number | null>(null)

  const onUpdateQty = useCallback((cursor: number | null, hours: string, minutes: string) => {
    const paddedHours = padWithZeros(hours)
    let paddedMinutes = padWithZeros(minutes).slice(0, 3)

    /*
     * | = cursor
     * |123 If the cursor is at the beginning and the user
     * types 1 (in this example), replace 2 with 1
     */
    if (cursor === 1 && paddedMinutes.length === 3) {
      paddedMinutes = paddedMinutes[0] + paddedMinutes[2]
    /*
     * | = cursor
     * 1|23 If the cursor is in the "middle" (in quotes because
     * we only accept 2 numbers but we accept 3 to be able
     * to make these replacements), replace 3 with 2
     */
    } else if (cursor === 2 && paddedMinutes.length === 3) {
      paddedMinutes = paddedMinutes[0] + paddedMinutes[1]
    /*
     * | = cursor
     * 00|0 The user is trying to erase/clear the input with zeros
     */
    } else if (cursor === 3 && paddedMinutes.slice(1, 3) === "00") {
      paddedMinutes = "00"
    /*
     * | = cursor
     * 01|2 Transform to 12 (remove initial zero)
     */
    } else if (cursor === 3 && paddedMinutes[0] === "0") {
      paddedMinutes = paddedMinutes[1] + paddedMinutes[2]
    /*
     * | = cursor
     * 31|2 = Replace last character, meaning 1 with 2 in this example
     */
    } else if (cursor === 3) {
      paddedMinutes = paddedMinutes[0] + paddedMinutes[2]
    /*
     * Just in case, make sure we only use 2 characters for minutes
     */
    } else {
      paddedMinutes = paddedMinutes.slice(0, 2)
    }

    onChange(`${paddedHours}:${paddedMinutes}`)
  }, [onChange])

  const onChangeHours = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedHours = onlyNumbers(e.target.value)
    onUpdateQty(null, updatedHours, minutes || "")
  }, [onUpdateQty, minutes])

  const onChangeMinutes = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedMinutes = onlyNumbers(e.target.value)
    const padMinutes = padWithZeros(updatedMinutes).slice(0, 3)

    minutesCursor.current = e.target.selectionStart
    onUpdateQty(minutesCursor.current, hours || "", updatedMinutes)

    /*
     * This case happens when the users selects the entire input
     * and replaces the content. Without this check, the following happens:
     * | = cursor
     * 00 The user select both zeros and type 1, the result 0|1
     * which is wrong, since the cursor should be at the end
     *
     * The check for "00" is used for when the user is backspacing
     * without this check, the cursor remains always at the end of the
     * input, which is wrong since it should move backwards
     */
    if (padMinutes.length === 2 && padMinutes !== "00" && minutesCursor.current === 1) {
      minutesCursor.current += 1
    }

    /*
     * Prevent user's cursor to jump at the end
     * of the input. We are using a timer so
     * these actions get executed after the value
     * gets updated and rendered
     */
    setTimeout(() => {
      e.target.selectionStart = minutesCursor.current
      e.target.selectionEnd = minutesCursor.current
    })
  }, [hours, onUpdateQty])

  const goToLowestHourUnit = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!hoursRef.current) {
      return
    }

    setTimeout(() => {
      const endOfInput = padWithZeros(hours).length
      e.target.selectionStart = endOfInput
      e.target.selectionEnd = endOfInput
    })
  }, [hoursRef, hours])

  const focusHoursIfRequired = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hoursRef.current) {
      return
    }

    // Not at the beginning of the input?
    if (e.currentTarget.selectionStart !== 0) {
      return
    }

    if (e.key !== "Backspace" && e.key !== "ArrowLeft") {
      return
    }

    e.preventDefault()
    hoursRef.current.focus()
  }, [hoursRef])

  const focusMinutesIfRequired = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!minutesRef.current) {
      return
    }

    if (e.key !== ":" && e.key !== "." && e.key !== "," && e.key !== "ArrowRight") {
      return
    }

    const padHours = padWithZeros(hours)
    if (e.key === "ArrowRight" && e.currentTarget.selectionStart !== padHours.length) {
      return
    }

    e.preventDefault()

    minutesRef.current.focus()
    minutesRef.current.selectionStart = 0
    minutesRef.current.selectionEnd = 0
  }, [minutesRef, hours])

  return (
    <div className="flex items-center border">
      <input
        placeholder="00"
        className="w-full p-2 text-center"
        ref={hoursRef}
        value={hours || ""}
        onKeyDown={focusMinutesIfRequired}
        onChange={onChangeHours}
        onFocus={goToLowestHourUnit}
      />
      <span className="px-1">:</span>
      <input
        placeholder="00"
        className="w-full p-2 text-center"
        ref={minutesRef}
        value={minutes || ""}
        onKeyDown={focusHoursIfRequired}
        onChange={onChangeMinutes}
      />
    </div>
  )
}

export default memo(TrackearQtyInput)
