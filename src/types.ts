type Card = {
  sid: string;
  name: string;
  customImage?: string; // base64 or uri for custom card design
  showCustomDesign?: boolean; // toggle custom design mode
};

export type { Card };
