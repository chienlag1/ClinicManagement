import React from "react";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen bg-green-50">
      <header className="bg-green-700 text-white p-4">Doctor Dashboard</header>
      <main className="flex-1 container mx-auto p-4">{children}</main>
      <footer className="bg-green-700 text-white p-2 text-center">
        Doctor Footer
      </footer>
    </section>
  );
}
