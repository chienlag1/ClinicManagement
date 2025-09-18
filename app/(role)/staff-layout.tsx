import React from "react";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen bg-blue-50">
      <header className="bg-blue-700 text-white p-4">Staff Dashboard</header>
      <main className="flex-1 container mx-auto p-4">{children}</main>
      <footer className="bg-blue-700 text-white p-2 text-center">
        Staff Footer
      </footer>
    </section>
  );
}
