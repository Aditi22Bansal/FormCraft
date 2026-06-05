export default function Spinner({ full }) {
  if (full) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
