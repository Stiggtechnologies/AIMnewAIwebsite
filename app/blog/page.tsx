import Link from 'next/link';

export const metadata = {
  title: 'Physiotherapy Blog | AIM Physiotherapy Edmonton',
  description: 'Evidence‑based physiotherapy tips, recovery guides, and injury prevention insights from AIM Physiotherapy in Edmonton.',
};

const posts = [
  {
    slug: 'first-physiotherapy-appointment-edmonton',
    title: 'What to Expect at Your First Physiotherapy Appointment in Edmonton',
    excerpt: 'A clear walkthrough of your first visit — assessment, treatment plan, and what to bring.',
  },
  {
    slug: 'back-pain-when-to-see-physio-edmonton',
    title: 'Understanding Your Back Pain: When to See a Physiotherapist in Edmonton',
    excerpt: 'Red flags, common causes, and how physiotherapy resolves the root problem.',
  },
  {
    slug: 'custom-orthotics-edmonton-guide',
    title: 'The Complete Guide to Custom Orthotics in Edmonton',
    excerpt: 'Who needs orthotics, how they work, and what to expect during assessment.',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-aim-navy sm:text-5xl">
          Physiotherapy Blog
        </h1>
        <p className="mt-4 text-lg text-aim-slate">
          Evidence‑based guidance from Edmonton physiotherapists.
        </p>

        <div className="mt-10 space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-aim-steel-blue pb-6">
              <h2 className="text-2xl font-semibold text-aim-navy">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-aim-slate">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-aim-teal hover:underline">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
