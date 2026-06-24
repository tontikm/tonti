import { CarouselManager } from "@/components/admin/CarouselManager";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import {
  listAdminCarouselSlides,
  listCarouselEventOptions,
} from "@/lib/carousel/slides";

export const metadata = {
  title: "Admin · Carousel",
  robots: { index: false, follow: false },
};

export default async function AdminCarouselPage() {
  const [slides, eventOptions] = await Promise.all([
    listAdminCarouselSlides(),
    listCarouselEventOptions(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Homepage carousel"
        description="Curate homepage slides, choose organizer images, and upload custom promos."
      />
      <CarouselManager slides={slides} eventOptions={eventOptions} />
    </>
  );
}
