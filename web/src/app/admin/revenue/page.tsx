import AdminRevenueClient from "./AdminRevenueClient";

export const metadata = {
  title: "Revenue",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminRevenueClient />;
}
