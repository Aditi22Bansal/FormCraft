import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-base">
      <Sidebar />
      <main className="ml-60 min-h-screen">{children}</main>
    </div>
  );
}
