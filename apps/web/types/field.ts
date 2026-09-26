export type FieldOption = {
  id?: number;
  label: string;
};

export type FormField = {
  id?: number;
  tempId?: string;
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "date"
    | "dropdown"
    | "single_select"
    | "multi_select";
  label: string;
  description?: string | null;
  placeholder?: string | null;
  required: boolean;
  config: Record<string, unknown>;
  options?: FieldOption[];
};

export type Fields = FormField[];