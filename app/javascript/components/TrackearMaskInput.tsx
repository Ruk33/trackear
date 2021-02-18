import React from "react"
import { hot } from "react-hot-loader"
import MaskInput, { IInputProps } from "react-maskinput"

type Props = {
  className: string,
}

/*
 * For some reason, while using hot code
 * replacement, the default value for
 * format is lost. This is why we have to
 * make sure we always send it so
 * it doesn't explode on reload...
 */
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

export default hot(module)(TrackerMaskInput)
