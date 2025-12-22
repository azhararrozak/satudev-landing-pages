export default function DashboardHomePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Home</h1>
        <p className="mt-1 text-sm text-slate-600">
          Selamat datang di dashboard.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Post", value: 12 },
          { label: "Total Komen", value: 48 },
          { label: "Category", value: 6 },
          { label: "Status", value: "Active" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border bg-slate-50 p-4"
          >
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4">
        <p className="text-sm font-medium">Quick Notes</p>
        <p className="mt-1 text-sm text-slate-600">
          Kamu bisa isi konten dashboard di sini (grafik, recent activity, dll).
        </p>
      </div>
    </div>
  );
}
