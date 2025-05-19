// Reusable component that handles displaying warning, alert or validation messages for any field

import clsx from "clsx";

export function FormFieldError({ form, name, className = "text-right" }) {
  const error = form.formState.errors?.[name];
  if (!error) return null;

  return (
    <p className={clsx("text-sm text-red-500 mt-1", className)}>
      {error.message}
    </p>
  );
}
