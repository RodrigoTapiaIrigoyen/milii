export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-brand-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Lux<span className="text-brand-500">Profile</span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
