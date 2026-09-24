import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { useSyncHtmlLang } from "@/hooks/useSyncHtmlLang";

export default function App() {
  useSyncHtmlLang();
  return <RouterProvider router={router} />;
}
