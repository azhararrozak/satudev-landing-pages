export default function NewPostPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">New Post</h1>
        <p className="mt-1 text-sm text-slate-600">Buat posting baru.</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Judul post..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Content</label>
          <textarea
            className="min-h-[160px] w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Isi post..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}