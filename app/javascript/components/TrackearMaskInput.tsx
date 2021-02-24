import React, { memo } from "react"
import MaskInput, { IInputProps } from "react-maskinput"

type Props = {
  className: string,
}

const defaultMaskFormat = [
  { str: "0", regexp: /[0-9]/ },
  { str: "*", regexp: /./ },
  { str: "a", regexp: /[a-zA-Z]/ },
]

function TrackerMaskInput(props: Props & IInputProps) {
  return (
    <MaskInput
      maskFormat={defaultMaskFormat}
      {...props}
    />
  )
}

export default memo(TrackerMaskInput)
