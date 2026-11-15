import AdminHelpChatClient from "./AdminHelpChatClient";

export const metadata = {
  title: "Help assistant",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminHelpChatClient />;
}
