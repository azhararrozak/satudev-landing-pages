import Link from "next/link";

const dummyPosts = [
  { id: "1", title: "Post Pertama", status: "published", createdAt: "2025-12-01" },
  { id: "2", title: "Belajar Next.js App Router", status: "draft", createdAt: "2025-12-10" },
  { id: "3", title: "Tailwind Tips", status: "published", createdAt: "2025-12-20" },
];

export default function PostsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Post</h1>
          <p className="mt-1 text-sm text-slate-600">Kelola daftar posting.</p>
        </div>

        <Link
          href="/dashboard/posts/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {dummyPosts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "rounded-full px-2 py-1 text-xs font-medium",
                      p.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/posts/${p.id}`}
                    className="rounded-xl border bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}