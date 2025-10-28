import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import CrispChatLoader from "@/components/CrispChatLoader";
import PushNotificationManager from "@/components/PushNotificationManager";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ImpersonationBanner />
      <Header />
      {children}
      <Footer />
      <PWAInstallPrompt />
      <CrispChatLoader />
      <PushNotificationManager />
    </>
  );
}