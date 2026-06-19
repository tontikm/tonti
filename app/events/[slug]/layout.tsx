import { SetEventBrand } from "@/components/layout/SetEventBrand";
import { getEventBySlug } from "@/lib/data/events";
import { getSafeOrganizerLogoUrl } from "@/lib/images";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function EventSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  return (
    <>
      {event?.organizerLogo && event.organizerName ? (
        <SetEventBrand
          slug={slug}
          name={event.organizerName}
          logo={getSafeOrganizerLogoUrl(event.organizerLogo)}
        />
      ) : null}
      {children}
    </>
  );
}
