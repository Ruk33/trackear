import React, { memo } from "react"
import { ToastContainer, toast as _toast, ToastContent, ToastProps } from "react-toastify";

require("../../../node_modules/react-toastify/dist/ReactToastify.css")

type Props = {

}

/**
 * This component should render once!
 * See https://fkhadra.github.io/react-toastify/installation
 */
function TrackearToast(props: Props) {
  return (
    <ToastContainer
      newestOnTop
      limit={5}
    />
  )
}

export function toast(content: ToastContent, props: ToastProps = {}) {
  _toast(content, {
    autoClose: 6000,
    draggable: false,
    closeButton: true,
    closeOnClick: false,
    position: "bottom-right",
    type: "dark",
    ...props,
  })
}

export default memo(TrackearToast)
