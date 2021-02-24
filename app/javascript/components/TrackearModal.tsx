import React, { memo } from "react"
import Modal, { Props, Styles } from "react-modal"

type TrackearModalProps = Props & {
  children: React.ReactNode
}

type CloseButtonProps = {
  onClick?: (event: React.MouseEvent | React.KeyboardEvent) => void,
}

const CloseButton = memo((props: CloseButtonProps) => {
  return (
    <button
      className="absolute top-0 right-0 p-5"
      type="button"
      onClick={props.onClick}
    >
      <svg className="w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
})

function TrackearModal({ style, children, ...props }: TrackearModalProps) {
  const extraStyles: Styles = {
    overlay: {
      backgroundColor: "#283c6480",
      zIndex: 1000,
    },
    content : {
      top : "50%",
      left : "50%",
      right : "auto",
      bottom : "auto",
      transform : "translate(-50%, -50%)"
    },
    ...style,
  }

  return (
    <Modal
      appElement={document.body}
      style={extraStyles}
      {...props}
    >
      <CloseButton onClick={props.onRequestClose} />
      {children}
    </Modal>
  )
}

export default memo(TrackearModal)
