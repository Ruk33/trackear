import React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode
}

export default function TrackearButton({ icon, ...props }: Props) {
  if (icon) {
    return (
      <button {...props}>
        <div className="flex items-center">
          <div className="mr-2 w-5">{icon}</div>
          {props.children}
        </div>
      </button>
    )
  }

  return <button {...props}>{props.children}</button>
}
