import AdminAiCostsClient from "./AdminAiCostsClient";

export const metadata = {
  title: "Engine costs",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminAiCostsClient />;
}
