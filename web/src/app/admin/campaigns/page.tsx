import AdminCampaignsClient from "./AdminCampaignsClient";

/**
 * Campaign / UTM attribution dashboard. Same ADMIN_SECRET gate as the
 * sibling admin pages.
 */
export const metadata = {
  title: "Campaigns",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminCampaignsClient />;
}
