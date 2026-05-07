import { MessageCircleMore } from "lucide-react";

const whatsappLink =
  "https://wa.me/919704668710?text=Hi%20iksha%20gifts%2C%20I%20want%20to%20order%20a%20gift.";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#1f7a4d] px-5 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.03]"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircleMore size={18} />
      Chat with us
    </a>
  );
}
