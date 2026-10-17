import React, { useState } from 'react';
import { AvatarConfig } from '../types';
import { AvatarRenderer, DEFAULT_AVATAR } from './AvatarRenderer';
import {
  Sparkles,
  Check,
  RotateCcw,
  Palette,
  Scissors,
  Shirt,
  Footprints,
  Glasses,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface AvatarEditorSectionProps {
  initialAvatar: AvatarConfig;
  studentName: string;
  onSave: (avatar: AvatarConfig) => Promise<void>;
  onCancel?: () => void;
}

type CategoryKey = 'cabello' | 'color_cabello' | 'ropa' | 'calzado' | 'accesorios' | 'diversidad';

export const AvatarEditorSection: React.FC<AvatarEditorSectionProps> = ({
  initialAvatar,
  studentName,
  onSave,
  onCancel,
}) => {
  const [avatar, setAvatar] = useState<AvatarConfig>({
    ...DEFAULT_AVATAR,
    ...(initialAvatar || {}),
  });
  const [originalAvatar] = useState<AvatarConfig>({
    ...DEFAULT_AVATAR,
    ...(initialAvatar || {}),
  });
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('cabello');
  const [saving, setSaving] = useState(false);
  const [customHue, setCustomHue] = useState<number>(25);
  const [customLightness, setCustomLightness] = useState<number>(30);

  // Categories list for Left sidebar
  const categories = [
    { id: 'cabello' as CategoryKey, label: 'Cabello', icon: Scissors, badge: '9 peinados' },
    { id: 'color_cabello' as CategoryKey, label: 'Color de Cabello', icon: Palette, badge: 'Rueda de color' },
    { id: 'ropa' as CategoryKey, label: 'Ropa y Estilo', icon: Shirt, badge: 'Prendas' },
    { id: 'calzado' as CategoryKey, label: 'Calzado', icon: Footprints, badge: 'Zapatos' },
    { id: 'accesorios' as CategoryKey, label: 'Accesorios', icon: Glasses, badge: 'Detalles' },
    { id: 'diversidad' as CategoryKey, label: 'Piel y Expresión', icon: Smile, badge: 'Diversidad' },
  ];

  // Options catalogs
  const HAIR_STYLES = [
    { id: 'lacio_largo', label: 'Lacio Largo', desc: 'Cabello liso hasta los hombros' },
    { id: 'ondulado_largo', label: 'Ondulado Largo', desc: 'Ondas suaves y con volumen' },
    { id: 'corto', label: 'Corto Moderno', desc: 'Corte fresco y despejado' },
    { id: 'media_melena', label: 'Media Melena', desc: 'Corte bob clásico y prolijo' },
    { id: 'dos_trencitas', label: 'Dos Trencitas', desc: 'Trenzas con ligas de colores' },
    { id: 'dos_monitos', label: 'Dos Moñitos', desc: 'Divertidos space buns laterales' },
    { id: 'coleta', label: 'Coleta Alta', desc: 'Coleta deportiva con lazo' },
    { id: 'puff', label: 'Afro Puffs', desc: 'Volumen natural esponjoso' },
  ];

  const HAIR_COLORS_NATURAL = [
    { label: 'Negro Azabache', hex: '#111827' },
    { label: 'Castaño Oscuro', hex: '#2C1B18' },
    { label: 'Castaño Cálido', hex: '#4A2810' },
    { label: 'Miel / Avellana', hex: '#713F12' },
    { label: 'Pelirrojo / Cobrizo', hex: '#9A3412' },
    { label: 'Rubio Dorado', hex: '#CA8A04' },
    { label: 'Rubio Claro', hex: '#EAB308' },
  ];

  const HAIR_COLORS_FANTASY = [
    { label: 'Rosa Fantasía', hex: '#EC4899' },
    { label: 'Azul Eléctrico', hex: '#2563EB' },
    { label: 'Violeta Mágico', hex: '#8B5CF6' },
    { label: 'Verde Esmeralda', hex: '#059669' },
    { label: 'Cian Turquesa', hex: '#06B6D4' },
    { label: 'Coral Suave', hex: '#F97316' },
  ];

  const CLOTHING_STYLES = [
    { id: 'sudadera', label: 'Sudadera con Capucha', desc: 'Cómoda, juvenil y abrigadora' },
    { id: 'polo', label: 'Polo Escolar', desc: 'Camiseta clásica de manga corta' },
    { id: 'chaqueta', label: 'Chaqueta Deportiva', desc: 'Chaqueta con cierre y solapa' },
    { id: 'vestido', label: 'Vestido Alegre', desc: 'Vestido con lazo en la cintura' },
    { id: 'falda', label: 'Falda Plisada', desc: 'Falda escolar combinable' },
    { id: 'pantalon', label: 'Pantalón Jeans', desc: 'Pantalón clásico y resistente' },
  ];

  const CLOTHING_COLORS = [
    { label: 'Azul Marino', hex: '#1D4ED8' },
    { label: 'Azul Celeste', hex: '#0284C7' },
    { label: 'Verde Bosque', hex: '#15803D' },
    { label: 'Verde Menta', hex: '#10B981' },
    { label: 'Rojo Pasión', hex: '#DC2626' },
    { label: 'Ámbar Cálido', hex: '#D97706' },
    { label: 'Morado Creativo', hex: '#7C3AED' },
    { label: 'Rosa Cariño', hex: '#DB2777' },
    { label: 'Gris Grafito', hex: '#334155' },
    { label: 'Coral Brillante', hex: '#EA580C' },
  ];

  const FOOTWEAR_STYLES = [
    { id: 'zapatillas', label: 'Zapatillas Deportivas', desc: 'Ideales para correr y jugar' },
    { id: 'botines', label: 'Botines Resistentes', desc: 'Calzado todoterreno seguro' },
    { id: 'sandalias', label: 'Sandalias Cómodas', desc: 'Ligeras y frescas' },
    { id: 'clasicos', label: 'Zapatos Colegiales', desc: 'Clásicos y formales' },
  ];

  const FOOTWEAR_COLORS = [
    { label: 'Rojo', hex: '#EF4444' },
    { label: 'Azul', hex: '#3B82F6' },
    { label: 'Negro', hex: '#0F172A' },
    { label: 'Blanco / Gris', hex: '#E2E8F0' },
    { label: 'Verde', hex: '#10B981' },
    { label: 'Miel', hex: '#D97706' },
  ];

  const ACCESSORIES = [
    { id: 'none', label: 'Sin Accesorio', icon: '✨', desc: 'Estilo natural y libre' },
    { id: 'glasses', label: 'Lentes Redondos', icon: '👓', desc: 'Lentes clásicos' },
    { id: 'vincha', label: 'Vincha Escolar', icon: '🎀', desc: 'Diadema con color vivo' },
    { id: 'lazo', label: 'Lazo en el Cabello', icon: '🌸', desc: 'Moño dulce en el pelo' },
    { id: 'cap', label: 'Gorra Deportiva', icon: '🧢', desc: 'Gorra para el sol y deporte' },
    { id: 'aretes', label: 'Aretes Dorados', icon: '✨', desc: 'Pendientes brillantes' },
    { id: 'collar', label: 'Collar de la Amistad', icon: '📿', desc: 'Collar dorado de equipo' },
    { id: 'mochila', label: 'Mochila Escolar', icon: '🎒', desc: 'Tiras de mochila en hombros' },
    { id: 'headphones', label: 'Audífonos de Música', icon: '🎧', desc: 'Cascos de audio' },
    { id: 'hearing_aid', label: 'Audífono Medicado (Inclusión)', icon: '🦻', desc: 'Apoyo auditivo visible' },
    { id: 'badge', label: 'Insignia CONECTA+', icon: '⭐', desc: 'Estrella dorada de convivencia' },
  ];

  const SKIN_TONES = [
    { label: 'Tono Porcelana', hex: '#FCD5B5' },
    { label: 'Tono Melocotón', hex: '#F7D0B2' },
    { label: 'Tono Beige Cálido', hex: '#F3C59E' },
    { label: 'Tono Trigueño Claro', hex: '#E0A899' },
    { label: 'Tono Bronceado', hex: '#E8B382' },
    { label: 'Tono Caramelo', hex: '#D1926B' },
    { label: 'Tono Castaño Maduro', hex: '#8D5524' },
    { label: 'Tono Ébano Profundo', hex: '#5C381E' },
  ];

  const EXPRESSIONS = [
    { id: 'smiling', label: 'Sonriente', emoji: '😊', desc: 'Amable y receptivo' },
    { id: 'cheerful', label: 'Súper Alegre', emoji: '😄', desc: 'Entusiasta y motivado' },
    { id: 'curious', label: 'Curioso / Atento', emoji: '🧐', desc: 'Observador y reflexivo' },
    { id: 'wink', label: 'Guiño Amistoso', emoji: '😉', desc: 'Cómplice y divertido' },
  ];

  // Helper to convert HSL to Hex for custom color wheel
  const handleHslChange = (hue: number, light: number) => {
    setCustomHue(hue);
    setCustomLightness(light);
    // Convert HSL to Hex
    const h = hue / 360;
    const s = 0.75;
    const l = light / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      let tc = t;
      if (tc < 0) tc += 1;
      if (tc > 1) tc -= 1;
      if (tc < 1 / 6) return p + (q - p) * 6 * tc;
      if (tc < 1 / 2) return q;
      if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    setAvatar((prev) => ({ ...prev, hairColor: hexColor }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(avatar);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAvatar({ ...originalAvatar });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Estudio de Creación
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Cuerpo Completo</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Mi Avatar · {studentName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza tu personaje de pies a cabeza con peinados cuidados, prendas combinables y accesorios inclusivos.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Volver al diseño anterior
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Guardando cambios...' : 'Guardar mi Avatar'}
          </button>
        </div>
      </div>

      {/* THREE-COLUMN WORKSPACE:
          Left: Categories Menu
          Center: Full-Body Avatar Showcase (Head to Toe)
          Right: Options Catalog Thumbnails */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1: CATEGORIES MENU (LEFT - 3 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-3 py-1">
            Categorías de Diseño
          </span>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-900 border border-blue-200 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs block">{cat.label}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{cat.badge}</span>
                  </div>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 px-3">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Los cambios se guardan en tu perfil y son visibles en todas las actividades en pareja.
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: FULL-BODY SHOWCASE (CENTER - 4 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-gradient-to-b from-sky-50/70 via-indigo-50/40 to-slate-50 rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-between min-h-[560px]">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 pb-2">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Sparkles className="w-3.5 h-3.5" /> Vista de Cuerpo Completo
            </span>
            <span className="text-[11px] text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              Escala 1:1
            </span>
          </div>

          {/* Full Body Renderer Display */}
          <div className="my-auto py-2">
            <AvatarRenderer avatar={avatar} viewMode="full" size="full" />
          </div>

          <div className="w-full bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/60 text-center">
            <span className="text-xs font-bold text-slate-800 block">
              {studentName}
            </span>
            <span className="text-[11px] text-slate-500">
              {HAIR_STYLES.find((h) => h.id === avatar.hairStyle)?.label || 'Cabello'} ·{' '}
              {CLOTHING_STYLES.find((c) => c.id === avatar.clothing)?.label || 'Ropa'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3: OPTIONS CATALOG (RIGHT - 5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs min-h-[560px] flex flex-col justify-between">
          <div>
            {/* Category Title */}
            <div className="pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Catálogo de Selección
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h3>
            </div>

            {/* A. CABELLO (HAIR STYLES) */}
            {activeCategory === 'cabello' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Elige un peinado diseñado con volumen para cubrir completamente la cabeza:
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {HAIR_STYLES.map((style) => {
                    const isSelected = avatar.hairStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, hairStyle: style.id as any })}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div>
                          <span className="text-xs block font-bold">{style.label}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{style.desc}</span>
                        </div>
                        {isSelected && (
                          <span className="mt-2 text-[10px] text-blue-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Seleccionado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* B. COLOR DEL CABELLO (HAIR COLORS + COLOR WHEEL) */}
            {activeCategory === 'color_cabello' && (
              <div className="space-y-5">
                {/* Natural Colors */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Tonos Naturales
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {HAIR_COLORS_NATURAL.map((col) => {
                      const isSelected = avatar.hairColor === col.hex;
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, hairColor: col.hex })}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-transform ${
                            isSelected ? 'ring-2 ring-blue-600 scale-105 border-blue-500' : 'border-slate-200'
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded-full border border-black/10 shadow-inner block"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="text-[10px] text-slate-600 truncate max-w-full">
                            {col.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fantasy Colors */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Tonos de Fantasía
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {HAIR_COLORS_FANTASY.map((col) => {
                      const isSelected = avatar.hairColor === col.hex;
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, hairColor: col.hex })}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-transform ${
                            isSelected ? 'ring-2 ring-blue-600 scale-105 border-blue-500 bg-blue-50/50' : 'border-slate-200'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full border border-black/10 shadow-inner shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="text-[11px] text-slate-700 font-medium truncate">
                            {col.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Hue & Luminosity Sliders (Color Wheel Equivalent) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Selector Cromático Personalizado
                    </span>
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: avatar.hairColor }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Tonalidad del Espectro (Hue)</span>
                      <span>{customHue}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={customHue}
                      onChange={(e) => handleHslChange(Number(e.target.value), customLightness)}
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background:
                          'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Luminosidad / Brillo</span>
                      <span>{customLightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="80"
                      value={customLightness}
                      onChange={(e) => handleHslChange(customHue, Number(e.target.value))}
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-slate-900 via-amber-600 to-amber-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* C. ROPA (CLOTHING) */}
            {activeCategory === 'ropa' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Estilo de Prenda
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CLOTHING_STYLES.map((c) => {
                      const isSelected = avatar.clothing === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, clothing: c.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <span className="text-xs block font-bold">{c.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{c.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Color de la Prenda
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLOTHING_COLORS.map((col) => {
                      const isSelected = avatar.clothingColor === col.hex;
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, clothingColor: col.hex })}
                          className={`w-8 h-8 rounded-full border border-black/10 shadow-xs flex items-center justify-center transition-transform ${
                            isSelected ? 'ring-3 ring-blue-600 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.label}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* D. CALZADO (FOOTWEAR) */}
            {activeCategory === 'calzado' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Tipo de Calzado
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {FOOTWEAR_STYLES.map((foot) => {
                      const isSelected = avatar.footwear === foot.id;
                      return (
                        <button
                          key={foot.id}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, footwear: foot.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <span className="text-xs block font-bold">{foot.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{foot.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Color del Calzado
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FOOTWEAR_COLORS.map((col) => {
                      const isSelected = avatar.footwearColor === col.hex;
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, footwearColor: col.hex })}
                          className={`w-8 h-8 rounded-full border border-black/10 shadow-xs flex items-center justify-center transition-transform ${
                            isSelected ? 'ring-3 ring-blue-600 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.label}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* E. ACCESORIOS (ACCESSORIES) */}
            {activeCategory === 'accesorios' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Añade accesorios que reflejen tu personalidad e inclusión:
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {ACCESSORIES.map((acc) => {
                    const isSelected = avatar.accessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, accessory: acc.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{acc.icon}</span>
                        <div className="min-w-0">
                          <span className="text-xs block font-bold truncate">{acc.label}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{acc.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* F. DIVERSIDAD Y EXPRESIÓN (SKIN TONES + EXPRESSIONS) */}
            {activeCategory === 'diversidad' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Tono de Piel Diverso
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SKIN_TONES.map((tone) => {
                      const isSelected = avatar.skinTone === tone.hex;
                      return (
                        <button
                          key={tone.hex}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, skinTone: tone.hex })}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded-full border border-black/10 shadow-inner block"
                            style={{ backgroundColor: tone.hex }}
                          />
                          <span className="text-[10px] text-slate-600 truncate max-w-full">
                            {tone.label.split(' ')[1]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
                    Expresión Facial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPRESSIONS.map((exp) => {
                      const isSelected = avatar.expression === exp.id;
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, expression: exp.id as any })}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <span className="text-2xl">{exp.emoji}</span>
                          <div>
                            <span className="text-xs block font-bold">{exp.label}</span>
                            <span className="text-[10px] text-slate-400 block">{exp.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
