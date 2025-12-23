type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Detail Post</h1>
        <p className="mt-1 text-sm text-slate-600">Post ID: {id}</p>
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4">
        <p className="text-sm font-medium">Contoh data</p>
        <p className="mt-1 text-sm text-slate-600">
          Di sini nanti biasanya kamu fetch data post berdasarkan <code className="rounded bg-white px-1">id</code>.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
            defaultValue={`Judul post ${id}`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Content</label>
          <textarea
            className="min-h-[160px] w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
            defaultValue={`Isi post ${id}...`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Update
          </button>
          <button
            type="button"
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}