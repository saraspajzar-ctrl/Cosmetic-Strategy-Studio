import React from 'react'

// ---------------------------------------------------------------------------
// Base SVG product silhouette components
// ---------------------------------------------------------------------------

function DropperBottle({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Body */}
      <rect x="31" y="38" width="18" height="28" rx="5" fill={main} />
      {/* Shoulder taper */}
      <path d="M31 45 Q31 38 35 36 L45 36 Q49 38 49 45" fill={accent} />
      {/* Neck */}
      <rect x="36" y="22" width="8" height="16" rx="3" fill={accent} />
      {/* Dropper tip */}
      <ellipse cx="40" cy="20" rx="4" ry="2.5" fill={main} />
      <rect x="39" y="14" width="2" height="8" rx="1" fill={accent} />
      <ellipse cx="40" cy="13.5" rx="1.5" ry="2" fill={main} />
      {/* Label */}
      <rect x="33" y="46" width="14" height="10" rx="2" fill="rgba(255,255,255,0.4)" />
      {/* Highlight */}
      <rect x="33" y="39" width="4" height="14" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

function RoundJar({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Lid */}
      <ellipse cx="40" cy="36" rx="18" ry="5" fill={accent} />
      <rect x="22" y="33" width="36" height="7" rx="3" fill={accent} />
      {/* Lid top sheen */}
      <ellipse cx="40" cy="33" rx="18" ry="5" fill={main} />
      {/* Body */}
      <rect x="23" y="39" width="34" height="20" rx="6" fill={main} />
      {/* Body bottom cap */}
      <ellipse cx="40" cy="59" rx="17" ry="4" fill={accent} />
      {/* Label stripe */}
      <rect x="26" y="44" width="28" height="9" rx="2" fill="rgba(255,255,255,0.4)" />
      {/* Highlight */}
      <ellipse cx="32" cy="35" rx="5" ry="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

function PumpBottle({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Bottle body */}
      <rect x="28" y="36" width="24" height="30" rx="7" fill={main} />
      {/* Shoulder */}
      <path d="M28 44 Q28 36 34 34 H46 Q52 36 52 44" fill={accent} />
      {/* Neck */}
      <rect x="37" y="26" width="6" height="12" rx="2" fill={accent} />
      {/* Pump head */}
      <rect x="33" y="21" width="14" height="7" rx="3.5" fill={accent} />
      {/* Pump nozzle */}
      <rect x="47" y="23" width="9" height="3" rx="1.5" fill={main} />
      {/* Label */}
      <rect x="31" y="45" width="18" height="12" rx="2" fill="rgba(255,255,255,0.4)" />
      {/* Highlight */}
      <rect x="30" y="37" width="4" height="18" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

function LipstickTube({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Base/case */}
      <rect x="33" y="46" width="14" height="22" rx="4" fill={accent} />
      {/* Case collar */}
      <rect x="32" y="43" width="16" height="5" rx="2" fill={main} />
      {/* Bullet body */}
      <rect x="34" y="26" width="12" height="19" rx="3" fill={main} />
      {/* Bullet tip */}
      <path d="M34 30 Q34 22 40 20 Q46 22 46 30" fill={accent} />
      {/* Highlight on bullet */}
      <rect x="35" y="27" width="3" height="12" rx="1.5" fill="rgba(255,255,255,0.35)" />
      {/* Base highlight */}
      <rect x="35" y="47" width="3" height="12" rx="1.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  )
}

function MascaraTube({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Main tube body */}
      <rect x="34" y="28" width="12" height="36" rx="5" fill={main} />
      {/* Cap */}
      <rect x="33" y="16" width="14" height="14" rx="5" fill={accent} />
      {/* Cap tip */}
      <ellipse cx="40" cy="15" rx="5" ry="2.5" fill={accent} />
      {/* Wand line */}
      <rect x="39" y="15" width="2" height="14" rx="1" fill="rgba(255,255,255,0.5)" />
      {/* Label band */}
      <rect x="35" y="38" width="10" height="12" rx="2" fill={accent} />
      {/* Tube highlight */}
      <rect x="35.5" y="30" width="3" height="22" rx="1.5" fill="rgba(255,255,255,0.35)" />
      {/* Bottom cap */}
      <ellipse cx="40" cy="64" rx="6" ry="2.5" fill={accent} />
    </svg>
  )
}

function CompactCase({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Case bottom */}
      <rect x="18" y="46" width="44" height="18" rx="6" fill={accent} />
      {/* Case top (open lid) */}
      <rect x="18" y="24" width="44" height="22" rx="6" fill={main} />
      {/* Mirror / pan in lid */}
      <ellipse cx="40" cy="35" rx="17" ry="9" fill="rgba(255,255,255,0.55)" />
      {/* Powder pan in bottom */}
      <ellipse cx="40" cy="52" rx="17" ry="6" fill={main} />
      {/* Powder texture circles */}
      <ellipse cx="40" cy="52" rx="11" ry="3.5" fill={accent} />
      {/* Compact hinge */}
      <rect x="37" y="44" width="6" height="4" rx="1" fill={accent} />
      {/* Lid highlight */}
      <rect x="20" y="26" width="10" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

function EyelinerPencil({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Pencil body — slightly tilted using transform */}
      <g transform="rotate(-15, 40, 40)">
        {/* Body */}
        <rect x="36" y="18" width="8" height="44" rx="3" fill={main} />
        {/* Eraser/top cap */}
        <rect x="36" y="14" width="8" height="6" rx="3" fill={accent} />
        {/* Tip cone */}
        <path d="M36 60 L40 68 L44 60 Z" fill={accent} />
        {/* Tip point */}
        <ellipse cx="40" cy="67" rx="1.5" ry="1" fill={main} />
        {/* Highlight stripe */}
        <rect x="37.5" y="19" width="2" height="38" rx="1" fill="rgba(255,255,255,0.35)" />
        {/* Label band */}
        <rect x="36" y="32" width="8" height="12" rx="1" fill={accent} />
      </g>
    </svg>
  )
}

function SheetMask({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Mask face outline */}
      <ellipse cx="40" cy="44" rx="24" ry="28" fill={main} />
      {/* Forehead cutout / edge */}
      <ellipse cx="40" cy="18" rx="14" ry="6" fill={bg} />
      {/* Eye holes */}
      <ellipse cx="31" cy="38" rx="5" ry="3.5" fill={bg} />
      <ellipse cx="49" cy="38" rx="5" ry="3.5" fill={bg} />
      {/* Nose cutout */}
      <path d="M36 48 Q40 44 44 48 Q42 52 38 52 Z" fill={bg} />
      {/* Essence droplet texture */}
      <ellipse cx="40" cy="58" rx="7" ry="3" fill={accent} />
      <ellipse cx="30" cy="44" rx="2" ry="3" fill={accent} />
      <ellipse cx="50" cy="44" rx="2" ry="3" fill={accent} />
      {/* Highlight */}
      <ellipse cx="33" cy="30" rx="4" ry="2.5" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

function GenericBottle({ bg, main, accent, w = 80, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill={bg} />
      {/* Body */}
      <rect x="27" y="38" width="26" height="28" rx="7" fill={main} />
      {/* Shoulder */}
      <path d="M27 46 Q27 38 33 36 H47 Q53 38 53 46" fill={accent} />
      {/* Neck */}
      <rect x="35" y="24" width="10" height="14" rx="4" fill={accent} />
      {/* Cap */}
      <rect x="33" y="18" width="14" height="8" rx="4" fill={main} />
      {/* Label */}
      <rect x="30" y="46" width="20" height="13" rx="2" fill="rgba(255,255,255,0.4)" />
      {/* Highlight */}
      <rect x="29" y="39" width="4" height="18" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Category configuration
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG = {
  'Serum':          { Component: DropperBottle,  bg: '#FCF0F2', main: '#D4A4B0', accent: '#B76E79' },
  'Moisturizer':    { Component: RoundJar,        bg: '#FFF1E8', main: '#D4B89A', accent: '#C4885A' },
  'Foundation':     { Component: PumpBottle,      bg: '#F7EEE8', main: '#C4A890', accent: '#9E7E60' },
  'Lipstick':       { Component: LipstickTube,    bg: '#FFF0F2', main: '#C98FA3', accent: '#C2415D' },
  'Mascara':        { Component: MascaraTube,     bg: '#F0ECF4', main: '#6F5D66', accent: '#B76E79' },
  'Cleanser':       { Component: PumpBottle,      bg: '#EEF5FF', main: '#A8C8E8', accent: '#6FA0CC' },
  'Face Mask':      { Component: SheetMask,       bg: '#F0FFF4', main: '#A8D5B5', accent: '#5A9E6E' },
  'Eyeliner':       { Component: EyelinerPencil,  bg: '#F5F0F5', main: '#7A5C72', accent: '#B76E79' },
  'Blush':          { Component: CompactCase,     bg: '#FFF0F5', main: '#E8C4D4', accent: '#C98FA3' },
  'Highlighter':    { Component: CompactCase,     bg: '#FFFBF0', main: '#E8D8A0', accent: '#D4AA50' },
  'Concealer':      { Component: GenericBottle,   bg: '#FFF8F0', main: '#D4B890', accent: '#B09070' },
  'Eye Shadow':     { Component: CompactCase,     bg: '#F8F0FF', main: '#C4A8D4', accent: '#8B5EA0' },
  'Primer':         { Component: GenericBottle,   bg: '#F5F8FF', main: '#B0C4D8', accent: '#7090B4' },
  'Toner':          { Component: DropperBottle,   bg: '#F0F8FF', main: '#A8C4D8', accent: '#5A90B4' },
  'SPF':            { Component: PumpBottle,      bg: '#FFFEF0', main: '#D4CC88', accent: '#A09840' },
  'Makeup Remover': { Component: GenericBottle,   bg: '#F5F5FF', main: '#C0B8D4', accent: '#9088B4' },
  'Body Lotion':    { Component: PumpBottle,      bg: '#FFF5E0', main: '#E8C890', accent: '#C4A060' },
  'Eye Cream':      { Component: RoundJar,        bg: '#F0F8FF', main: '#B0C8D8', accent: '#6090B0' },
  'Hair Care':      { Component: PumpBottle,      bg: '#F5F0FF', main: '#C0A8D8', accent: '#9070B8' },
}

// ---------------------------------------------------------------------------
// Exported components
// ---------------------------------------------------------------------------

export function CategorySVG({ category, size = 80 }) {
  const cfg = CATEGORY_CONFIG[category]
  if (!cfg) {
    return (
      <GenericBottle
        bg="#F5F5F5"
        main="#C0C0C0"
        accent="#909090"
        w={size}
        h={size}
      />
    )
  }
  const { Component, bg, main, accent } = cfg
  return <Component bg={bg} main={main} accent={accent} w={size} h={size} />
}

export function getCategoryImage(category) {
  const slug = (category || 'default').toLowerCase().replace(/\s+/g, '-')
  return `/images/categories/${slug}.png`
}
