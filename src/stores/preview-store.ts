import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PreviewPresetId =
  | "brand-logo"
  | "poster-heading"
  | "website-hero"
  | "ui-label"
  | "paragraph"
  | "alphabet"
  | "numbers-symbols";

export type PreviewPreset = {
  id: PreviewPresetId;
  label: string;
  text: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
};

export const previewPresets: PreviewPreset[] = [
  { id: "brand-logo", label: "Brand Logo", text: "Northstar", fontSize: 76, letterSpacing: -2, lineHeight: 0.92 },
  { id: "poster-heading", label: "Poster Heading", text: "MAKE IT\nUNMISSABLE", fontSize: 68, letterSpacing: -1.5, lineHeight: 0.88 },
  { id: "website-hero", label: "Website Hero", text: "A calmer way\nto shape ideas.", fontSize: 56, letterSpacing: -1.2, lineHeight: 0.98 },
  { id: "ui-label", label: "UI Label", text: "Continue to workspace", fontSize: 18, letterSpacing: 0, lineHeight: 1.25 },
  { id: "paragraph", label: "Paragraph", text: "Typography gives language its voice. Balance, rhythm, and texture make every idea easier to read.", fontSize: 24, letterSpacing: 0, lineHeight: 1.55 },
  { id: "alphabet", label: "Alphabet", text: "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz", fontSize: 31, letterSpacing: 0.1, lineHeight: 1.45 },
  { id: "numbers-symbols", label: "Numbers & Symbols", text: "0123456789  ! ? @ # $ % & * ( ) + = / : ;", fontSize: 32, letterSpacing: 0, lineHeight: 1.35 },
];

type PreviewState = {
  presetId: PreviewPresetId;
  text: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  weight: number;
  italic: boolean;
  compareFontIds: string[];
  setText: (text: string) => void;
  applyPreset: (preset: PreviewPreset) => void;
  setFontSize: (fontSize: number) => void;
  setLetterSpacing: (letterSpacing: number) => void;
  setLineHeight: (lineHeight: number) => void;
  setWeight: (weight: number) => void;
  setItalic: (italic: boolean) => void;
  setCompareFontIds: (ids: string[]) => void;
};

const defaultPreset = previewPresets[2]!;

export const usePreviewStore = create<PreviewState>()(
  persist(
    (set) => ({
      presetId: defaultPreset.id,
      text: defaultPreset.text,
      fontSize: defaultPreset.fontSize,
      letterSpacing: defaultPreset.letterSpacing,
      lineHeight: defaultPreset.lineHeight,
      weight: 400,
      italic: false,
      compareFontIds: [],
      setText: (text) => set({ text }),
      applyPreset: (preset) => set({ ...preset, presetId: preset.id }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setWeight: (weight) => set({ weight }),
      setItalic: (italic) => set({ italic }),
      setCompareFontIds: (ids) => set({ compareFontIds: [...new Set(ids)].slice(0, 4) }),
    }),
    {
      name: "fontsequal-preview-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ presetId, text, fontSize, letterSpacing, lineHeight, weight, italic, compareFontIds }) => ({
        presetId,
        text,
        fontSize,
        letterSpacing,
        lineHeight,
        weight,
        italic,
        compareFontIds,
      }),
    },
  ),
);
