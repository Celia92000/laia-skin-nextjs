import type { Metadata } from "next";
import WelcomeModal from "@/components/admin/WelcomeModal";
import GuidedTour from "@/components/admin/GuidedTour";
import QuickSetupWizard from "@/components/admin/QuickSetupWizard";
import SetupReminderBanner from "@/components/admin/SetupReminderBanner";

export const metadata: Metadata = {
  title: "Dashboard - LAIA SKIN INSTITUT",
  description: "Espace administration LAIA SKIN INSTITUT",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout spécial pour l'admin sans Header et Footer
  return (
    <>
      <SetupReminderBanner />
      {children}
      <WelcomeModal />
      <GuidedTour />
      <QuickSetupWizard />
    </>
  );
}