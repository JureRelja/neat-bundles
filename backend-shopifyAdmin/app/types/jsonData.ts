export class JsonData<T> {
  ok: boolean;
  status: "success" | "error";
  message: string;
  errors?: error[];
  data: T;

  constructor(
    ok: boolean,
    status: "success" | "error",
    message: string,
    errors?: error[],
    data?: T,
  ) {
    this.ok = status === "success";
    this.status = status;
    this.message = message;
    this.errors = errors;
    if (data) this.data = data;
    else this.data = {} as T;
  }
}

export type error = {
  fieldId: string;
  field: string;
  message: string;
};
