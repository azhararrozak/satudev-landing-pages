"use client";

import { useState, type InputHTMLAttributes } from 'react';
import {
  FieldValues,
  UseFormRegister,
  FieldErrors,
  Path,
} from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

interface FormInputProps<T extends FieldValues> {
  label: string;
  type: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  autoComplete?: string;
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
  spellCheck?: boolean;
  autoCorrect?: string;
  autoCapitalize?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormInput = <T extends FieldValues>({
  label,
  type,
  name,
  register,
  errors,
  autoComplete,
  enterKeyHint,
  spellCheck,
  autoCorrect,
  autoCapitalize,
  placeholder,
  required = true,
  disabled = false,
}: FormInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const fieldError = errors[name];
  const errorId = `${String(name)}-error`;
  const toggleWarningId = `${String(name)}-toggle-warning`;

  return (
    <div className="mb-5">
      <Label 
        htmlFor={name} 
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type={effectiveType}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          spellCheck={spellCheck}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!fieldError}
          aria-describedby={fieldError ? errorId : undefined}
          {...register(name, required ? { required: `${label} is required` } : undefined)}
          className={`w-full min-h-12 px-4 py-2.5 text-base md:text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition ${
            isPassword ? 'pr-12' : ''
          }`}
        />
        {isPassword && (
          <>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-describedby={toggleWarningId}
              disabled={disabled}
              className="absolute inset-y-0 right-0 flex min-w-12 items-center justify-center px-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-r-lg transition"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <span id={toggleWarningId} className="sr-only">
              Warning: this will display your password on the screen.
            </span>
          </>
        )}
      </div>
      {fieldError && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm text-red-500 dark:text-red-400 mt-1.5"
        >
          {fieldError?.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default FormInput;