import QRCode from "qrcode";
import { getTicketVerifyUrl } from "@/lib/tickets";

type TicketQrProps = {
  code: string;
  size?: number;
};

export async function TicketQr({ code, size = 160 }: TicketQrProps) {
  const svg = await QRCode.toString(getTicketVerifyUrl(code), {
    type: "svg",
    margin: 1,
    width: size,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return (
    <div
      className="inline-flex rounded-xl bg-white p-3"
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label={`QR code for ticket ${code}`}
    />
  );
}
