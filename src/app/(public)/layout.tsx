import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Configuration spécifique pour les pages publiques LAIA Connect
  const laiaConnectConfig = {
    config: {
      siteName: 'LAIA Connect',
      logoUrl: '/logo-laia-skin.png',
      primaryColor: '#d4b5a0',
      secondaryColor: '#c9a084',
      accentColor: '#2c3e50',
    }
  };

  return (
    <div>
      <Header organizationData={laiaConnectConfig} />
      {children}
      <Footer organizationData={laiaConnectConfig} />
    </div>
  );
}
