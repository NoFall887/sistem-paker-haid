import type {
  BloodColor,
  BloodConsistency,
  BloodOdor,
  BloodOrigin,
  FiqhStatus,
  UserStatus,
} from "@/lib/fiqh-engine";

export const profiles: {
  value: UserStatus;
  title: string;
  description: string;
}[] = [
  {
    value: "MUTADAH",
    title: "Mu'tadah",
    description:
      "Sudah pernah haid dan suci serta mengetahui kebiasaan sebelumnya.",
  },
  {
    value: "MUBTADAH",
    title: "Mubtada'ah",
    description: "Baru pertama kali mengalami keluarnya darah setelah balig.",
  },
  {
    value: "MUTAHAYYIRAH_MUTLAQAH",
    title: "Mutahayyirah Muthlaqah",
    description: "Lupa seluruh jumlah hari dan waktu mulai kebiasaan haid.",
  },
  {
    value: "DZAKIRAH_QADR",
    title: "Dzākirah lil-Qadr",
    description:
      "Masih ingat jumlah hari kebiasaan, tetapi lupa waktu mulainya.",
  },
  {
    value: "DZAKIRAH_WAQT",
    title: "Dzākirah lil-Waqt",
    description:
      "Masih ingat waktu mulai kebiasaan, tetapi lupa jumlah harinya.",
  },
];

export const colors: { value: BloodColor; label: string }[] = [
  { value: "HITAM", label: "Hitam (Aswad)" },
  { value: "MERAH", label: "Merah (Ahmar)" },
  { value: "PIRANG", label: "Pirang (Asyqar)" },
  { value: "KUNING", label: "Kuning (Ashfar)" },
  { value: "KERUH", label: "Keruh / Cokelat (Kudrah)" },
];

export const consistencies: {
  value: BloodConsistency;
  label: string;
}[] = [
  { value: "KENTAL", label: "Kental" },
  { value: "CAIR", label: "Cair" },
];

export const odors: { value: BloodOdor; label: string }[] = [
  { value: "BERAROMA", label: "Beraroma kuat" },
  { value: "TIDAK_BERAROMA", label: "Tidak beraroma kuat" },
];

export const origins: { value: BloodOrigin; label: string }[] = [
  { value: "ALAMI", label: "Alami dari rahim" },
  { value: "LUKA_PENYAKIT", label: "Luka / penyakit" },
];

export const statusStyles: Record<FiqhStatus, string> = {
  HAID: "bg-red-600 text-white",
  HAID_SAHB: "bg-rose-400 text-white",
  NIFAS: "bg-fuchsia-700 text-white",
  ISTIHADHAH: "bg-orange-600 text-white",
  SUCI: "bg-emerald-700 text-white",
  FASAD: "bg-slate-600 text-white",
  IHTIYATH: "bg-violet-700 text-white",
};
