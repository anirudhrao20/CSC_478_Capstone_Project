import { Navbar } from './Navbar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 md:p-6 container mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
