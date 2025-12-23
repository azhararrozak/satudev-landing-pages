import {
  FieldValues,
  UseFormRegister,
  FieldErrors,
  Path,
} from 'react-hook-form';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

interface FormInputProps<T extends FieldValues> {
  label: string;
  type: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

const FormInput = <T extends FieldValues>({
  label,
  type,
  name,
  register,
  errors,
}: FormInputProps<T>) => {
  return (
    <div className="mb-6">
      <Label 
        htmlFor={name} 
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
      >
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        {...register(name, { required: `${label} is required` })}
        className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
      />
      {errors[name] && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">
          {errors[name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default FormInput;