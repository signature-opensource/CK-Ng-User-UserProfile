import { TemplateRef } from "@angular/core";
import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";

export interface GenericFormData<T, TFormValues> {
  formControls: { [key: string]: IFormControlConfig<T, TFormValues> };
  generalFormErrors?: { [key: string]: string };
  generalFormValidators?: { validators: Array<ValidatorFn>; errorMessages: { [key: string]: string } };
  generalFormAsyncValidators?: { validators: Array<AsyncValidatorFn>; errorMessages: { [key: string]: string } };
}

export interface IFormControlConfig<T, TFormValues> {
  type: FormControlType;
  label: string;
  placeholder: string;
  defaultValue: T | T[];
  errorMessages: { [key: string]: string };
  required?: boolean;
  autocomplete?: string;
  options?: Array<{ label: string; value: T, disabled?: boolean }>;
  selectOptionTemplate?: TemplateRef<unknown>;
  validators?: Array<ValidatorFn>;
  disabled?: boolean;
  selectMode?: 'multiple' | 'tags' | 'default';
  dateFormat?: string;
  show?: ( formValue: TFormValues ) => boolean;
}

export class FormControlConfig<T, TFormValues> implements IFormControlConfig<T, TFormValues> {
  type: FormControlType;
  label: string;
  placeholder: string;
  value: T | T[];
  defaultValue: T | T[];
  validators?: ValidatorFn[];
  errorMessages: { [key: string]: string; };
  required?: boolean;
  autocomplete?: string;
  options?: { label: string; value: T, disabled?: boolean; }[];
  selectOptionTemplate?: TemplateRef<unknown>;
  disabled?: boolean;
  selectMode?: 'multiple' | 'tags' | 'default';
  dateFormat?: string;
  show?: ( ( formValue: TFormValues ) => boolean );

  constructor(
    type: FormControlType,
    label: string,
    defaultValue: T | T[],
    {
      placeholder = '',
      required,
      validators,
      errorMessages = {},
      autocomplete,
      options,
      selectOptionTemplate,
      disabled,
      selectMode,
      dateFormat,
      show,
    }: Partial<Omit<IFormControlConfig<T, TFormValues>, 'type' | 'label' | 'defaultValue'>> = {} ) {
    this.type = type;
    this.label = label;
    this.placeholder = placeholder;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.errorMessages = errorMessages;
    this.required = required;
    this.autocomplete = autocomplete;
    this.options = options;
    this.selectOptionTemplate = selectOptionTemplate;
    this.validators = validators;
    this.disabled = disabled;
    if ( type === 'select' ) {
      this.selectMode = selectMode ?? 'default';
    }
    this.dateFormat = dateFormat;
    this.show = show;
  }
}

export type FormControlType = 'text' | 'number' | 'date' | 'password' | 'select' | 'checkbox';
