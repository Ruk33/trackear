import React from "react"

type LoadingIconProps = {
  loading?: boolean,
}

function LoadingIcon({ loading }: LoadingIconProps) {
  if (!loading) {
    return null
  }
  return (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode
  loading?: boolean,
}

export default function TrackearButton({ loading, icon, ...props }: Props) {
  if (icon) {
    return (
      <button {...props} disabled={loading}>
        <div className="flex items-center">
          <LoadingIcon loading={loading} />
          {!loading && <div className="mr-2 w-5">{icon}</div>}
          {props.children}
        </div>
      </button>
    )
  }

  return (
    <button {...props} disabled={loading}>
      <div className="flex items-center">
        <LoadingIcon loading={loading} />
        {props.children}
      </div>
    </button>
  )
}
