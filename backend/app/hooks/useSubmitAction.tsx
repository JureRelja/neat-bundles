import { useSubmit } from "@remix-run/react";

//Handing the action submit request
export function useSubmitAction(
  action: string,
  navigate: boolean,
  url: string,
) {
  const submit = useSubmit();

  const formData = new FormData();
  formData.append("action", action);

  return submit(formData, {
    method: "POST",
    navigate: navigate,
    action: url,
  });
}
