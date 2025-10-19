import SuperAdminNav from '@/components/SuperAdminNav'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SuperAdminNav />
      {children}
    </>
  )
}
