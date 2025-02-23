import { useSubmit } from "@remix-run/react";

//Handing the action submit request
export function useNavigateSubmit(): {
  (action: string, url: string, id?: number): void;
} {
  const submit = useSubmit();

  return (action: string, url: string, id?: number): void => {
    const formData = new FormData();
    formData.append("action", action);
    if (id) {
      formData.append("id", id.toString());
    }
    submit(formData, {
      method: "POST",
      navigate: true,
      action: url,
    });
  };
}
