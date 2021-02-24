import React from "react"

type Props = {
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

export default function TrackearFetching(props: Props) {
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
