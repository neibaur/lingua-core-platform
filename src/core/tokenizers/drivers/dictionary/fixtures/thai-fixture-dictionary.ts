export interface ThaiFixtureDictionaryEntry {
  surface: string;
  romanized?: string;
}

export const THAI_FIXTURE_DICTIONARY: readonly ThaiFixtureDictionaryEntry[] = [
  { surface: "กิน", romanized: "kin" },
  { surface: "ข้าว", romanized: "khao" },
  { surface: "หรือ", romanized: "rue" },
  { surface: "ยัง", romanized: "yang" },
  { surface: "หรือยัง", romanized: "rue yang" },
];
