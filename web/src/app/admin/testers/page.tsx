import AdminTestersClient from "./AdminTestersClient";

export const metadata = {
  title: "Game testers",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminTestersClient />;
}
