import { Input } from "@/components/ui/input";

export const FormInput = ({
  icon: Icon,
  name,
  placeholder,
  type = "text",
  form,
  onFocus,
  onBlur,
}) => (
  <div className="space-y-2">
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        className="text-sm rounded-xl border-gray-200 pl-12"
        placeholder={placeholder}
        type={type}
        onFocus={onFocus}
        onBlur={onBlur}
        {...form.register(name)}
      />
    </div>
    {form.formState.errors[name] && (
      <p className="text-sm text-primary px-1">
        {form.formState.errors[name].message}
      </p>
    )}
  </div>
);
