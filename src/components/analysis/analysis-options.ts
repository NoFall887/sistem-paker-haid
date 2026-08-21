import type {
  BloodColor,
  BloodConsistency,
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
  { value: "COKELAT", label: "Cokelat / Pirang" },
  { value: "KUNING", label: "Kuning (Ashfar)" },
  { value: "KERUH", label: "Keruh (Kudrah)" },
];

export const consistencies: {
  value: BloodConsistency;
  label: string;
}[] = [
  { value: "KENTAL", label: "Kental" },
  { value: "CAIR", label: "Cair" },
];

export const statusStyles: Record<FiqhStatus, string> = {
  HAID: "bg-red-600 text-white",
  HAID_SAHB: "bg-rose-400 text-white",
  ISTIHADHAH: "bg-orange-600 text-white",
  SUCI: "bg-emerald-700 text-white",
  FASAD: "bg-slate-600 text-white",
  IHTIYATH: "bg-violet-700 text-white",
};
