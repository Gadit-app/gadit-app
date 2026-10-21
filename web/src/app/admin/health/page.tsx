import AdminHealthClient from "./AdminHealthClient";

export const metadata = {
  title: "Subscriber health",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminHealthClient />;
}
