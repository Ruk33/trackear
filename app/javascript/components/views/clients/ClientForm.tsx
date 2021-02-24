import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TrackearButton from "components/TrackearButton";

const schema = yup.object().shape({
  firstName: yup.string().required("El nombre es requerido"),
  lastName: yup.string().required("El apellido es requerido"),
  email: yup.string().required("El correo es requerido"),
  address: yup.string().required("La dirección es requerida"),
});

type Form = {
  firstName: string,
  lastName: string,
  email: string,
  address: string,
}

type Props = {
  /**
   * Client id if the client is already
   * persisted in the database.
   */
  id?: string,

  /**
   * Initial client values (if any)
   */
  client?: Form,

  /**
   * Callback function executed when the
   * client is created or updated
   * successfully.
   */
  onSuccess?: () => void,
}

type FieldProps = {
  name: string,
  label: string,
  errors: any,
}

const Field = forwardRef(({ label, name, errors }: FieldProps, ref: React.Ref<HTMLInputElement>) => {
  const error = errors[name] ? errors[name].message : ""

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className="form-control"
        ref={ref}
      />
      <p className="text-red-400">{error}</p>
    </div>
  )
})

export default function ClientForm({ id, client, onSuccess }: Props) {
  const [serviceError, setServiceError] = useState("")
  const { register, handleSubmit, errors } = useForm<Form>({
    defaultValues: client,
    resolver: yupResolver(schema)
  })

  const isPersisted = id !== undefined

  const onSubmit = useCallback(async (form: Form) => {
    const service = isPersisted ? `/clients/${id}.json` : "/clients.json"
    const data = new FormData()
    try {
      data.append("client[first_name]", form.firstName)
      data.append("client[last_name]", form.lastName)
      data.append("client[email]", form.email)
      data.append("client[address]", form.address)

      const csrf = document.getElementsByName("csrf-token")[0].content

      await fetch(
        service,
        {
          method: isPersisted ? "PUT" : "POST",
          body: data,
          headers: { "X-CSRF-Token": csrf }
        }
      )

      if (!onSuccess) {
        return
      }

      onSuccess()
    } catch (e) {
      setServiceError("Hubo un error al procesar la solicitud. Por favor intentalo mas tarde.")
    }
  }, [isPersisted, id, onSuccess])

  const submit = useMemo(
    () => handleSubmit(onSubmit),
    [handleSubmit, onSubmit]
  )

  return (
    <form onSubmit={submit}>
      <Field name="firstName" label="Nombre" errors={errors} ref={register} />
      <Field name="lastName" label="Apellido" errors={errors} ref={register} />
      <Field name="email" label="Email" errors={errors} ref={register} />
      <Field name="address" label="Dirección" errors={errors} ref={register} />
      <p className="py-3 text-red-400">{serviceError}</p>
      <TrackearButton className="btn btn-primary">
        {isPersisted && "Actualizar cliente"}
        {!isPersisted && "Crear nuevo cliente"}
      </TrackearButton>
    </form>
  )
}
