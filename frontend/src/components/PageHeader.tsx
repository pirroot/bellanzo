import { serverFetch, mediaUrl } from '@/lib/api';

interface PageHeaderProps {
  page?: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

export default async function PageHeader({
  page = 'default',
  title,
  subtitle = '',
  badge = 'بلانزو',
}: PageHeaderProps) {
  let header: any = {};

  if (page) {
    try {
      const settings = await serverFetch<any>('/settings/');
      const headers = settings?.page_headers || {};
      header = headers[page] || {};
    } catch {}
  }

  console.log(header.image);

  const finalTitle = header?.title || title;
  const finalSubtitle = header?.subtitle || subtitle;
  const finalBadge = header?.badge || badge;
  const image = header?.image ? mediaUrl(header.image) : null;

  console.log(image);

  return (
    <section className="relative overflow-hidden bg-ink text-white pt-36 pb-16 mt-20">
      {image ? (
        <div className="absolute inset-0">
          <img
            src={'http://localhost:8000/' + image}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
          <div className="absolute inset-0 noise-grid opacity-[0.08]" />
          <div className="absolute -top-24 right-1/4 w-80 h-80 bg-brand/30 blur-[110px] rounded-full" />
        </>
      )}

      <div className="container-x relative">
        <span className="inline-flex items-center gap-2 text-brand font-bold text-sm mb-3">
          <span className="w-6 h-[2px] bg-brand" />
          {finalBadge}
        </span>
        <h1 className="text-4xl md:text-5xl font-black">{finalTitle}</h1>
        {finalSubtitle && <p className="mt-4 text-white/60 max-w-2xl leading-8">{finalSubtitle}</p>}
      </div>
    </section>
  );
}
