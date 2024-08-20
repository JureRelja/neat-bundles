import { useFetcher } from "@remix-run/react";

//Handing the action submit request
export function useAsyncSubmit(): {
  submit: (action: string, url: string, id?: number) => void;
  state: "idle" | "loading" | "submitting";
} {
  const fetcher = useFetcher();

  const submitFunction = (action: string, url: string, id?: number): void => {
    const formData = new FormData();
    formData.append("action", action);
    if (id) {
      formData.append("id", id.toString());
    }
    fetcher.submit(formData, {
      method: "POST",
      action: url,
    });
  };

  return {
    submit: submitFunction,
    state: fetcher.state,
  };
}
