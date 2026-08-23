import { redirect } from "react-router";

export function loader() {
  return redirect("/admin");
}

export default function TodayRedirect() {
  return null;
}
