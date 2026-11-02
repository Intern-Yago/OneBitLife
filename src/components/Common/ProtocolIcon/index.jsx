import React from "react";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

export const PROTOCOL_ICONS = [
  { id: "bolt", label: "Energia" },
  { id: "dumbbell", label: "Treino" },
  { id: "book", label: "Leitura" },
  { id: "target", label: "Meta" },
  { id: "flame", label: "Foco" },
  { id: "wallet", label: "Finanças" },
  { id: "heart", label: "Saúde" },
  { id: "shield", label: "Disciplina" },
  { id: "clock", label: "Tempo" },
  { id: "star", label: "Maestria" },
];

export default function ProtocolIcon({ name, size = 20, color = "#00F0FF" }) {
  // Normalização de nomes legados (emojis ou caracteres unicode) para os IDs de ícone
  let iconId = name || "bolt";
  if (iconId === "⚡") iconId = "bolt";
  else if (iconId === "◆" || iconId === "◇") iconId = "target";
  else if (iconId === "▲") iconId = "flame";
  else if (iconId === "●" || iconId === "■") iconId = "shield";
  else if (iconId === "★" || iconId === "✦" || iconId === "◈") iconId = "star";

  switch (iconId) {
    case "bolt":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "dumbbell":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "book":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "target":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
          <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
          <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Line x1="2" y1="12" x2="4" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Line x1="20" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case "flame":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "wallet":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
          <Line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="2" />
          <Circle cx="17" cy="15" r="1.5" fill={color} />
        </Svg>
      );
    case "heart":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "shield":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "clock":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
          <Polyline points="12 7 12 12 15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "star":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}
