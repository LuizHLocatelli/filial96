import { toast } from "sonner";

/**
 * Returns the Tailwind aspect ratio class for a given card aspect ratio.
 */
export function getAspectRatioClass(aspectRatio: "1:1" | "3:4" | "4:5" = "4:5"): string {
  switch (aspectRatio) {
    case "1:1":
      return "aspect-square";
    case "3:4":
      return "aspect-[3/4]";
    case "4:5":
      return "aspect-[4/5]";
    default:
      return "aspect-[4/5]";
  }
}

/**
 * Downloads a card image to the user's device.
 */
export async function downloadCardImage(imageUrl: string, title: string): Promise<void> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_card.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Shares a card via WhatsApp (native on mobile, Web on desktop).
 */
export async function shareCardWhatsApp(imageUrl: string, title: string, code?: string | null): Promise<void> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  const messageText = code
    ? `*${title}*\n\nCódigo: ${code}`
    : `*${title}*`;

  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobileDevice && navigator.share && navigator.canShare) {
    const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}_card.jpg`, { type: blob.type || 'image/jpeg' });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: title,
        text: messageText,
      });

      toast({
        title: "Compartilhado!",
        description: "Card compartilhado com sucesso.",
      });
      return;
    }
  }

  // Desktop: download + open WhatsApp Web
  await downloadCardImage(imageUrl, title);

  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');

  toast({
    title: "Imagem baixada!",
    description: "A imagem foi salva. Anexe-a manualmente no WhatsApp Web.",
    duration: 5000,
  });
}
