"use client";

interface Province {
  id: string;
  name: string;
  labelX: number;
  labelY: number;
  d: string;
}

// Simplified SVG paths for Iran provinces (viewBox 0 0 800 600)
const PROVINCES: Province[] = [
  { id: "tehran", name: "تهران", labelX: 390, labelY: 230, d: "M 370 210 L 400 205 L 420 215 L 415 240 L 390 245 L 370 235 Z" },
  { id: "alborz", name: "البرز", labelX: 345, labelY: 218, d: "M 330 205 L 365 200 L 370 210 L 370 235 L 345 235 L 330 220 Z" },
  { id: "qazvin", name: "قزوین", labelX: 310, labelY: 225, d: "M 280 200 L 330 195 L 330 205 L 345 235 L 320 245 L 285 235 L 280 215 Z" },
  { id: "gilan", name: "گیلان", labelX: 290, labelY: 178, d: "M 255 165 L 310 155 L 330 175 L 330 195 L 280 200 L 260 185 Z" },
  { id: "mazandaran", name: "مازندران", labelX: 400, labelY: 178, d: "M 310 155 L 430 145 L 445 165 L 430 185 L 400 190 L 370 185 L 330 175 Z" },
  { id: "golestan", name: "گلستان", labelX: 480, labelY: 165, d: "M 430 145 L 510 140 L 520 160 L 500 175 L 445 165 Z" },
  { id: "khorasan-north", name: "خراسان شمالی", labelX: 545, labelY: 165, d: "M 510 140 L 590 135 L 600 160 L 575 175 L 545 175 L 520 160 Z" },
  { id: "khorasan-razavi", name: "خراسان رضوی", labelX: 590, labelY: 220, d: "M 575 175 L 640 165 L 660 200 L 645 245 L 605 260 L 570 250 L 545 225 L 545 175 Z" },
  { id: "khorasan-south", name: "خراسان جنوبی", labelX: 590, labelY: 290, d: "M 570 250 L 640 245 L 650 310 L 620 340 L 575 335 L 555 295 Z" },
  { id: "semnan", name: "سمنان", labelX: 480, labelY: 210, d: "M 430 185 L 500 175 L 545 175 L 545 225 L 510 235 L 460 240 L 430 225 Z" },
  { id: "tehran2", name: "", labelX: 0, labelY: 0, d: "" }, // placeholder
  { id: "isfahan", name: "اصفهان", labelX: 445, labelY: 295, d: "M 390 260 L 460 255 L 510 265 L 520 320 L 490 345 L 445 350 L 400 335 L 385 295 Z" },
  { id: "yazd", name: "یزد", labelX: 510, labelY: 330, d: "M 490 295 L 555 295 L 575 335 L 560 375 L 520 385 L 490 360 L 480 325 Z" },
  { id: "kerman", name: "کرمان", labelX: 550, labelY: 390, d: "M 520 360 L 580 355 L 615 380 L 620 430 L 590 460 L 545 455 L 515 420 L 510 385 Z" },
  { id: "hormozgan", name: "هرمزگان", labelX: 530, labelY: 480, d: "M 480 455 L 555 450 L 590 465 L 595 495 L 555 510 L 505 500 L 475 480 Z" },
  { id: "sistan-baluchestan", name: "سیستان و بلوچستان", labelX: 650, labelY: 400, d: "M 615 335 L 680 330 L 720 380 L 715 450 L 680 475 L 635 470 L 605 440 L 615 380 Z" },
  { id: "fars", name: "فارس", labelX: 450, labelY: 400, d: "M 395 355 L 490 345 L 510 385 L 505 430 L 470 450 L 430 445 L 400 415 L 390 375 Z" },
  { id: "bushehr", name: "بوشهر", labelX: 390, labelY: 455, d: "M 375 430 L 420 425 L 440 450 L 430 475 L 400 480 L 375 465 Z" },
  { id: "kohgiluyeh-boyer-ahmad", name: "کهگیلویه", labelX: 395, labelY: 375, d: "M 360 355 L 395 350 L 410 375 L 400 400 L 375 405 L 355 385 Z" },
  { id: "chahar-mahaal-bakhtiari", name: "چهارمحال", labelX: 385, labelY: 325, d: "M 360 305 L 400 300 L 415 320 L 405 345 L 375 348 L 358 330 Z" },
  { id: "khuzestan", name: "خوزستان", labelX: 340, labelY: 370, d: "M 300 320 L 360 305 L 380 330 L 375 370 L 355 395 L 320 395 L 295 370 L 295 340 Z" },
  { id: "lorestan", name: "لرستان", labelX: 340, labelY: 295, d: "M 305 265 L 360 260 L 380 280 L 375 310 L 345 320 L 305 305 Z" },
  { id: "ilam", name: "ایلام", labelX: 290, labelY: 310, d: "M 260 285 L 305 275 L 310 305 L 295 330 L 265 330 L 250 310 Z" },
  { id: "kermanshah", name: "کرمانشاه", labelX: 285, labelY: 268, d: "M 255 245 L 305 240 L 315 265 L 295 280 L 260 278 L 248 260 Z" },
  { id: "kurdistan", name: "کردستان", labelX: 275, labelY: 230, d: "M 248 210 L 290 205 L 305 225 L 300 248 L 265 250 L 245 235 Z" },
  { id: "hamadan", name: "همدان", labelX: 320, labelY: 258, d: "M 305 240 L 355 235 L 365 255 L 355 275 L 315 275 L 305 260 Z" },
  { id: "markazi", name: "مرکزی", labelX: 360, labelY: 255, d: "M 345 235 L 390 230 L 400 245 L 395 265 L 365 268 L 345 255 Z" },
  { id: "qom", name: "قم", labelX: 400, labelY: 258, d: "M 390 245 L 420 242 L 425 258 L 415 270 L 390 268 L 385 255 Z" },
  { id: "zanjan", name: "زنجان", labelX: 290, labelY: 195, d: "M 255 175 L 300 170 L 310 188 L 300 205 L 268 205 L 250 192 Z" },
  { id: "azerbaijan-west", name: "آذربایجان غربی", labelX: 218, labelY: 180, d: "M 185 155 L 255 150 L 268 175 L 255 195 L 220 200 L 188 185 Z" },
  { id: "azerbaijan-east", name: "آذربایجان شرقی", labelX: 252, labelY: 162, d: "M 255 150 L 310 145 L 320 168 L 310 188 L 280 195 L 255 185 Z" },
  { id: "ardabil", name: "اردبیل", labelX: 258, labelY: 140, d: "M 240 118 L 295 112 L 310 138 L 300 152 L 255 150 L 238 135 Z" },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  hasAgency: (id: string) => boolean;
}

export default function IranMap({ selected, onSelect, hasAgency }: Props) {
  return (
    <svg
      viewBox="150 100 600 430"
      className="w-full h-full"
      style={{ maxHeight: 480 }}
    >
      {PROVINCES.filter(p => p.d).map((prov) => (
        <g key={prov.id} onClick={() => onSelect(prov.id)} className="cursor-pointer">
          <path
            d={prov.d}
            fill={
              selected === prov.id
                ? "#c0392b"
                : hasAgency(prov.id)
                ? "#2c5f8a"
                : "#b0bec5"
            }
            stroke="#fff"
            strokeWidth="1.5"
            opacity={selected === prov.id ? 1 : 0.85}
            className="transition-all duration-200 hover:opacity-100"
          />
          {prov.name && (
            <text
              x={prov.labelX}
              y={prov.labelY}
              textAnchor="middle"
              fontSize="7"
              fill="#fff"
              fontFamily="inherit"
              pointerEvents="none"
              fontWeight="bold"
            >
              {prov.name}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
