import React from 'react';
import { AvatarConfig } from '../types';

interface AvatarRendererProps {
  avatar?: AvatarConfig | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  viewMode?: 'head' | 'full';
  className?: string;
  showBadge?: boolean;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: '#FCD5B5',
  hairStyle: 'lacio_largo',
  hairColor: '#4A2810',
  clothing: 'sudadera',
  clothingColor: '#3B82F6',
  clothingSecondaryColor: '#60A5FA',
  footwear: 'zapatillas',
  footwearColor: '#EF4444',
  accessory: 'none',
  accessoryColor: '#F59E0B',
  expression: 'smiling',
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatar,
  size = 'md',
  viewMode = 'head',
  className = '',
  showBadge = false,
}) => {
  const safeAvatar: AvatarConfig = {
    ...DEFAULT_AVATAR,
    ...(avatar || {}),
  };

  const skin = safeAvatar.skinTone || '#FCD5B5';
  const hair = safeAvatar.hairColor || '#4A2810';
  const cloth = safeAvatar.clothingColor || '#3B82F6';
  const cloth2 = safeAvatar.clothingSecondaryColor || '#60A5FA';
  const shoe = safeAvatar.footwearColor || '#EF4444';
  const accColor = safeAvatar.accessoryColor || '#F59E0B';

  // Normalize hair style aliases
  let hStyle = safeAvatar.hairStyle || 'lacio_largo';
  if (hStyle === 'short') hStyle = 'corto';
  if (hStyle === 'curly') hStyle = 'ondulado_largo';
  if (hStyle === 'straight') hStyle = 'lacio_largo';
  if (hStyle === 'braids') hStyle = 'dos_trencitas';
  if (hStyle === 'wavy_long') hStyle = 'ondulado_largo';

  // Normalize clothing aliases
  let cStyle = safeAvatar.clothing || 'sudadera';
  if (cStyle === 'hoodie') cStyle = 'sudadera';
  if (cStyle === 'jacket') cStyle = 'chaqueta';
  if (cStyle === 'stripes') cStyle = 'polo';
  if (cStyle === 'vest') cStyle = 'chaqueta';
  if (cStyle === 'smock') cStyle = 'vestido';

  // Size mapping
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    '2xl': 'w-44 h-44',
    full: 'w-full max-w-[280px] h-[440px]',
  };

  const isFull = viewMode === 'full' || size === 'full';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isFull
          ? sizeMap.full
          : `rounded-full overflow-hidden shadow-sm bg-gradient-to-b from-sky-50 to-indigo-50/70 border-2 border-white ring-1 ring-slate-200/60 ${sizeMap[size]}`
      } ${className}`}
    >
      <svg
        viewBox={isFull ? '0 0 200 420' : '50 25 100 100'}
        className={isFull ? 'w-full h-full drop-shadow-sm' : 'w-full h-full'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft ground shadow in full view */}
        {isFull && <ellipse cx="100" cy="402" rx="60" ry="8" fill="#1E293B" opacity="0.12" />}

        {/* ========================================================================= */}
        {/* LAYER 1: BACK HAIR (Draws behind body and neck) */}
        {/* ========================================================================= */}
        {hStyle === 'lacio_largo' && (
          <g fill={hair}>
            {/* Long sleek hair cascading down behind shoulders */}
            <path d="M56 80 C50 120 48 180 52 230 C56 240 68 245 74 235 C78 190 76 130 76 90 Z" />
            <path d="M144 80 C150 120 152 180 148 230 C144 240 132 245 126 235 C122 190 124 130 124 90 Z" />
            <path d="M58 85 C58 140 62 210 100 220 C138 210 142 140 142 85 Z" />
          </g>
        )}

        {hStyle === 'ondulado_largo' && (
          <g fill={hair}>
            {/* Wavy locks with volume */}
            <path d="M54 82 C44 110 42 150 56 180 C44 200 50 235 66 245 C76 235 78 200 70 175 C80 145 74 100 74 85 Z" />
            <path d="M146 82 C156 110 158 150 144 180 C156 200 150 235 134 245 C124 235 122 200 130 175 C120 145 126 100 126 85 Z" />
            <path d="M56 85 Q100 120 144 85 Q150 170 100 230 Q50 170 56 85 Z" />
          </g>
        )}

        {hStyle === 'dos_trencitas' && (
          <g fill={hair}>
            {/* Left Braid */}
            <path d="M56 85 C48 110 46 140 50 170 C48 195 54 220 58 235 C64 235 68 220 64 195 C68 170 66 130 72 88 Z" />
            {/* Right Braid */}
            <path d="M144 85 C152 110 154 140 150 170 C152 195 146 220 142 235 C136 235 132 220 136 195 C132 170 134 130 128 88 Z" />
            {/* Colorful Braid Ties */}
            <rect x="47" y="215" width="14" height="6" rx="3" fill="#EC4899" />
            <rect x="139" y="215" width="14" height="6" rx="3" fill="#10B981" />
          </g>
        )}

        {hStyle === 'dos_monitos' && (
          <g fill={hair}>
            {/* Left space bun */}
            <circle cx="52" cy="48" r="22" />
            <circle cx="50" cy="46" r="18" fill="#FFFFFF" opacity="0.08" />
            {/* Right space bun */}
            <circle cx="148" cy="48" r="22" />
            <circle cx="150" cy="46" r="18" fill="#FFFFFF" opacity="0.08" />
            {/* Cute bun scrunchies */}
            <ellipse cx="62" cy="62" rx="9" ry="5" fill="#F43F5E" />
            <ellipse cx="138" cy="62" rx="9" ry="5" fill="#3B82F6" />
          </g>
        )}

        {hStyle === 'puff' && (
          <g fill={hair}>
            {/* High voluminous afro puffs */}
            <circle cx="48" cy="45" r="25" />
            <circle cx="152" cy="45" r="25" />
          </g>
        )}

        {hStyle === 'coleta' && (
          <g fill={hair}>
            {/* High side-arched ponytail */}
            <path d="M136 55 C160 45 178 70 176 110 C174 150 152 195 140 215 C136 210 134 185 144 150 C150 120 140 85 130 65 Z" />
            <ellipse cx="136" cy="60" rx="9" ry="6" fill="#F59E0B" />
          </g>
        )}

        {hStyle === 'media_melena' && (
          <g fill={hair}>
            <path d="M54 80 C50 110 50 145 60 165 C68 165 74 155 74 135 C76 105 76 85 76 80 Z" />
            <path d="M146 80 C150 110 150 145 140 165 C132 165 126 155 126 135 C124 105 124 85 124 80 Z" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* LAYER 2: BODY & LIMBS (Legs, Feet, Arms, Neck) */}
        {/* ========================================================================= */}
        {/* Legs (Visible in full view) */}
        {isFull && (
          <g fill={skin}>
            {/* Left leg */}
            <rect x="76" y="240" width="18" height="125" rx="8" />
            {/* Right leg */}
            <rect x="106" y="240" width="18" height="125" rx="8" />
          </g>
        )}

        {/* Calzado / Shoes (Visible in full view) */}
        {isFull && (
          <g>
            {safeAvatar.footwear === 'zapatillas' && (
              <g fill={shoe}>
                {/* Left sneaker */}
                <path d="M68 375 C68 365 80 360 95 360 L95 385 C95 390 85 392 72 392 C68 392 68 385 68 375 Z" />
                <rect x="66" y="385" width="31" height="7" rx="3.5" fill="#FFFFFF" />
                <path d="M74 372 L86 372" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                {/* Right sneaker */}
                <path d="M132 375 C132 365 120 360 105 360 L105 385 C105 390 115 392 128 392 C132 392 132 385 132 375 Z" />
                <rect x="103" y="385" width="31" height="7" rx="3.5" fill="#FFFFFF" />
                <path d="M114 372 L126 372" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {safeAvatar.footwear === 'botines' && (
              <g fill={shoe}>
                {/* Left ankle boot */}
                <path d="M72 345 L96 345 L96 390 L68 390 C66 380 66 360 72 345 Z" />
                <rect x="66" y="385" width="31" height="6" rx="2" fill="#334155" />
                {/* Right ankle boot */}
                <path d="M128 345 L104 345 L104 390 L132 390 C134 380 134 360 128 345 Z" />
                <rect x="103" y="385" width="31" height="6" rx="2" fill="#334155" />
              </g>
            )}

            {safeAvatar.footwear === 'sandalias' && (
              <g>
                <rect x="66" y="386" width="30" height="6" rx="3" fill="#D97706" />
                <path d="M72 386 Q82 375 92 386" stroke={shoe} strokeWidth="4" fill="none" />
                <rect x="104" y="386" width="30" height="6" rx="3" fill="#D97706" />
                <path d="M108 386 Q118 375 128 386" stroke={shoe} strokeWidth="4" fill="none" />
              </g>
            )}

            {safeAvatar.footwear === 'clasicos' && (
              <g fill={shoe}>
                <ellipse cx="82" cy="385" rx="15" ry="8" />
                <ellipse cx="118" cy="385" rx="15" ry="8" />
              </g>
            )}
          </g>
        )}

        {/* Lower Garment (Pants / Skirt) in full view */}
        {isFull && (
          <g>
            {cStyle === 'pantalon' && (
              <g fill="#1E3A8A">
                {/* Jeans/Pants */}
                <path d="M73 220 L127 220 L125 345 L106 345 L101 265 L96 265 L94 345 L75 345 Z" />
                <line x1="100" y1="220" x2="100" y2="265" stroke="#3B82F6" strokeWidth="2" />
              </g>
            )}

            {cStyle === 'falda' && (
              <g fill={cloth2}>
                {/* Pleated Skirt */}
                <polygon points="76,215 124,215 142,280 58,280" />
                <line x1="82" y1="218" x2="72" y2="280" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
                <line x1="100" y1="218" x2="100" y2="280" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
                <line x1="118" y1="218" x2="128" y2="280" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
              </g>
            )}

            {(cStyle === 'polo' || cStyle === 'sudadera' || cStyle === 'chaqueta') && (
              <g fill="#334155">
                {/* Regular trousers */}
                <path d="M74 220 L126 220 L124 330 L107 330 L101 255 L97 255 L93 330 L76 330 Z" />
              </g>
            )}
          </g>
        )}

        {/* Torso / Upper Body & Arms (Always rendered) */}
        <g>
          {/* Arms */}
          {isFull && (
            <g fill={skin}>
              <path d="M58 140 C52 170 50 205 52 230 C56 235 64 235 66 225 C66 200 68 170 72 145 Z" />
              <circle cx="56" cy="235" r="7" />
              <path d="M142 140 C148 170 150 205 148 230 C144 235 136 235 134 225 C134 200 132 170 128 145 Z" />
              <circle cx="144" cy="235" r="7" />
            </g>
          )}

          {/* Clothing - Upper garment */}
          {cStyle === 'polo' && (
            <g>
              <path d="M60 135 C60 130 80 125 100 125 C120 125 140 130 140 135 L136 225 L64 225 Z" fill={cloth} />
              {/* Sleeves */}
              <polygon points="60,135 48,165 65,172 72,142" fill={cloth} />
              <polygon points="140,135 152,165 135,172 128,142" fill={cloth} />
              {/* Collar */}
              <path d="M88 126 Q100 138 112 126" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            </g>
          )}

          {cStyle === 'sudadera' && (
            <g>
              <path d="M58 135 C58 130 80 124 100 124 C120 124 142 130 142 135 L138 230 L62 230 Z" fill={cloth} />
              {/* Long sleeves */}
              {isFull && (
                <>
                  <path d="M60 135 L48 215 L62 218 L72 148 Z" fill={cloth} />
                  <path d="M140 135 L152 215 L138 218 L128 148 Z" fill={cloth} />
                </>
              )}
              {/* Kangaroo Pocket */}
              <path d="M76 185 L124 185 L118 220 L82 220 Z" fill={cloth2} opacity="0.85" />
              {/* Hoodie strings */}
              <line x1="93" y1="130" x2="93" y2="152" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="107" y1="130" x2="107" y2="152" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {cStyle === 'chaqueta' && (
            <g>
              <path d="M58 135 C58 130 80 124 100 124 C120 124 142 130 142 135 L138 225 L62 225 Z" fill="#F8FAFC" />
              {/* Outer jacket */}
              <path d="M58 135 L90 135 L86 225 L62 225 Z" fill={cloth} />
              <path d="M142 135 L110 135 L114 225 L138 225 Z" fill={cloth} />
              {/* Lapels */}
              <polygon points="86,135 96,160 88,160" fill={cloth2} />
              <polygon points="114,135 104,160 112,160" fill={cloth2} />
            </g>
          )}

          {cStyle === 'vestido' && (
            <g>
              <polygon points="68,132 132,132 148,275 52,275" fill={cloth} />
              <rect x="70" y="185" width="60" height="8" rx="4" fill={cloth2} />
              <circle cx="100" cy="189" r="6" fill="#F59E0B" />
            </g>
          )}
        </g>

        {/* Neck */}
        <path d="M92 110 L92 132 Q100 138 108 132 L108 110 Z" fill={skin} />

        {/* Ears */}
        <circle cx="64" cy="85" r="8" fill={skin} />
        <circle cx="136" cy="85" r="8" fill={skin} />

        {/* Aretes (Earrings) Accessory */}
        {safeAvatar.accessory === 'aretes' && (
          <g fill="#F59E0B">
            <circle cx="63" cy="91" r="2.5" />
            <circle cx="137" cy="91" r="2.5" />
          </g>
        )}

        {/* Hearing Aid Accessory (Inclusion feature) */}
        {safeAvatar.accessory === 'hearing_aid' && (
          <path
            d="M135 77 C142 77 143 89 137 91 L135 88"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Head / Face Base Oval */}
        <ellipse cx="100" cy="82" rx="36" ry="40" fill={skin} />

        {/* ========================================================================= */}
        {/* LAYER 3: FACIAL FEATURES (Eyes, brows, expression, blush) */}
        {/* ========================================================================= */}
        {/* Rosy Cheeks */}
        <circle cx="76" cy="92" r="5.5" fill="#F43F5E" opacity="0.32" />
        <circle cx="124" cy="92" r="5.5" fill="#F43F5E" opacity="0.32" />

        {/* Nose */}
        <path d="M98 83 Q100 86 102 83" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />

        {/* Expressions */}
        {safeAvatar.expression === 'smiling' && (
          <g>
            {/* Eyes */}
            <circle cx="86" cy="79" r="4.5" fill="#0F172A" />
            <circle cx="114" cy="79" r="4.5" fill="#0F172A" />
            <circle cx="84.5" cy="77" r="1.5" fill="#FFFFFF" />
            <circle cx="112.5" cy="77" r="1.5" fill="#FFFFFF" />
            {/* Eyebrows */}
            <path d="M79 70 Q86 67 93 70" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M107 70 Q114 67 121 70" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Sweet smile */}
            <path d="M89 94 Q100 104 111 94" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        )}

        {safeAvatar.expression === 'cheerful' && (
          <g>
            {/* Joyful crescent eyes */}
            <path d="M80 80 Q86 73 92 80" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M108 80 Q114 73 120 80" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            {/* Eyebrows up */}
            <path d="M79 67 Q86 64 93 67" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M107 67 Q114 64 121 67" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Big open smile */}
            <path d="M87 91 Q100 108 113 91 Z" fill="#DC2626" />
            <path d="M91 93 Q100 97 109 93" fill="#FFFFFF" />
          </g>
        )}

        {safeAvatar.expression === 'curious' && (
          <g>
            <circle cx="86" cy="78" r="4.8" fill="#0F172A" />
            <circle cx="114" cy="78" r="4.8" fill="#0F172A" />
            <circle cx="84.5" cy="76" r="1.5" fill="#FFFFFF" />
            <circle cx="112.5" cy="76" r="1.5" fill="#FFFFFF" />
            {/* Inquisitive brows */}
            <path d="M79 71 Q86 70 93 72" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M107 65 Q114 62 121 66" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Cute small "o" mouth */}
            <ellipse cx="100" cy="96" rx="4.5" ry="5" fill="#DC2626" />
          </g>
        )}

        {safeAvatar.expression === 'wink' && (
          <g>
            <circle cx="86" cy="79" r="4.5" fill="#0F172A" />
            <circle cx="84.5" cy="77" r="1.5" fill="#FFFFFF" />
            <path d="M108 80 Q114 74 120 80" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M79 70 Q86 67 93 70" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M107 68 Q114 65 121 69" stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M89 94 Q100 105 111 94" stroke="#DC2626" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Collar / Necklace Accessory */}
        {safeAvatar.accessory === 'collar' && (
          <path d="M88 128 Q100 142 112 128" stroke="#F59E0B" strokeWidth="3" fill="none" />
        )}

        {/* ========================================================================= */}
        {/* LAYER 4: FRONT HAIR & SKULL VOLUME (BUG FIX: COMPLETE CRANIAL COVERAGE) */}
        {/* Guarantees that EVERY style has a solid, voluminous crown covering the head */}
        {/* ========================================================================= */}
        <g fill={hair}>
          {/* Universal Crown Base: Solid top skull cap from y=30 to y=70 */}
          <path d="M64 80 C60 48 78 32 100 32 C122 32 140 48 136 80 C130 65 118 64 100 64 C82 64 70 65 64 80 Z" />

          {hStyle === 'lacio_largo' && (
            <g>
              {/* Elegant bangs and side locks framing cheeks */}
              <path d="M64 75 C62 50 78 32 100 32 C122 32 138 50 136 75 C132 60 115 58 100 60 C85 58 68 60 64 75 Z" />
              <path d="M62 70 C60 90 62 120 66 140 C70 120 70 95 72 75 Z" />
              <path d="M138 70 C140 90 138 120 134 140 C130 120 130 95 128 75 Z" />
            </g>
          )}

          {hStyle === 'ondulado_largo' && (
            <g>
              {/* Bouncy wave locks framing the forehead */}
              <circle cx="78" cy="45" r="14" />
              <circle cx="95" cy="40" r="15" />
              <circle cx="112" cy="40" r="15" />
              <circle cx="128" cy="48" r="14" />
              <path d="M64 72 Q82 62 100 68 Q118 62 136 72 Q120 54 100 54 Q80 54 64 72 Z" />
            </g>
          )}

          {hStyle === 'corto' && (
            <g>
              {/* Modern cropped kid haircut with stylish spikes/fringe */}
              <path d="M62 76 C60 45 76 30 100 30 C124 30 140 45 138 76 C134 62 124 55 106 58 C94 54 78 58 62 76 Z" />
              <polygon points="76,34 84,24 92,34" />
              <polygon points="90,32 100,20 110,32" />
              <polygon points="108,34 116,24 124,34" />
            </g>
          )}

          {hStyle === 'media_melena' && (
            <g>
              {/* Bob cut with neat fringe */}
              <path d="M62 82 C60 46 76 32 100 32 C124 32 140 46 138 82 C134 95 136 125 130 135 C124 105 126 80 122 68 C112 62 88 62 78 68 C74 80 76 105 70 135 C64 125 66 95 62 82 Z" />
              <path d="M72 65 Q100 60 128 65 Q100 55 72 65 Z" />
            </g>
          )}

          {hStyle === 'dos_trencitas' && (
            <g>
              {/* Center parted cute fringe */}
              <path d="M64 75 C60 46 78 32 100 32 C122 32 140 46 136 75 C128 62 116 58 100 66 C84 58 72 62 64 75 Z" />
            </g>
          )}

          {hStyle === 'dos_monitos' && (
            <g>
              {/* Rounded crown with soft bangs */}
              <path d="M64 78 C60 46 78 34 100 34 C122 34 140 46 136 78 C126 62 114 60 100 66 C86 60 74 62 64 78 Z" />
              <circle cx="82" cy="62" r="5" />
              <circle cx="118" cy="62" r="5" />
            </g>
          )}

          {hStyle === 'puff' && (
            <g>
              {/* Front neat edges & hairline */}
              <path d="M66 78 C62 48 78 36 100 36 C122 36 138 48 134 78 C124 62 114 62 100 65 C86 62 76 62 66 78 Z" />
            </g>
          )}

          {hStyle === 'coleta' && (
            <g>
              {/* Pulled back hair volume into high pony */}
              <path d="M64 78 C60 46 78 32 100 32 C122 32 138 46 136 78 C126 60 114 56 100 60 C86 56 74 60 64 78 Z" />
            </g>
          )}
        </g>

        {/* ========================================================================= */}
        {/* LAYER 5: ACCESSORIES (Glasses, Hats, Headbands, Clips) */}
        {/* ========================================================================= */}
        {safeAvatar.accessory === 'glasses' && (
          <g stroke="#0F172A" strokeWidth="3" fill="none">
            {/* Left lens */}
            <circle cx="86" cy="79" r="11" />
            {/* Right lens */}
            <circle cx="114" cy="79" r="11" />
            {/* Bridge */}
            <path d="M97 79 L103 79" />
            {/* Left temple */}
            <path d="M75 79 L64 77" />
            {/* Right temple */}
            <path d="M125 79 L136 77" />
          </g>
        )}

        {safeAvatar.accessory === 'headphones' && (
          <g>
            <path d="M62 82 C55 35 145 35 138 82" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" fill="none" />
            <rect x="56" y="72" width="10" height="22" rx="5" fill="#0369A1" />
            <rect x="134" y="72" width="10" height="22" rx="5" fill="#0369A1" />
          </g>
        )}

        {safeAvatar.accessory === 'vincha' && (
          <path d="M62 76 C65 38 135 38 138 76" stroke={accColor} strokeWidth="6" strokeLinecap="round" fill="none" />
        )}

        {safeAvatar.accessory === 'lazo' && (
          <g fill="#F43F5E">
            <circle cx="76" cy="48" r="5" fill="#FEF08A" />
            <polygon points="76,48 62,38 64,58" />
            <polygon points="76,48 90,38 88,58" />
          </g>
        )}

        {safeAvatar.accessory === 'cap' && (
          <g fill={accColor}>
            {/* Baseball cap dome */}
            <path d="M64 58 C66 32 134 32 136 58 Z" />
            {/* Visor */}
            <path d="M58 58 Q100 52 144 58 L152 64 Q100 66 54 64 Z" fill="#D97706" />
          </g>
        )}

        {safeAvatar.accessory === 'badge' && (
          <g>
            <circle cx="75" cy="155" r="5" fill="#F59E0B" />
            <path d="M75 152 L76.5 155 L79.5 155 L77 156.5 L78 159.5 L75 158 L72 159.5 L73 156.5 L70.5 155 L73.5 155 Z" fill="#FFFFFF" />
          </g>
        )}

        {safeAvatar.accessory === 'clip' && (
          <g>
            <circle cx="74" cy="56" r="5" fill="#EC4899" />
            <circle cx="74" cy="56" r="2" fill="#FEF08A" />
          </g>
        )}

        {/* Mochila (Backpack straps) in full view */}
        {isFull && safeAvatar.accessory === 'mochila' && (
          <g stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" fill="none">
            <path d="M74 135 L72 195" />
            <path d="M126 135 L128 195" />
          </g>
        )}
      </svg>

      {/* Online presence badge */}
      {showBadge && (
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-600/30"
          title="En línea"
        />
      )}
    </div>
  );
};
