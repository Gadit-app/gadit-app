import AdminActivityClient from "./AdminActivityClient";

export const metadata = {
  title: "Activity log",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminActivityClient />;
}
