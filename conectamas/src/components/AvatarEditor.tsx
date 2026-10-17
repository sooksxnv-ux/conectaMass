import React, { useState } from 'react';
import { AvatarConfig } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { Sparkles, Check, X } from 'lucide-react';

interface AvatarEditorProps {
  initialAvatar: AvatarConfig;
  onSave: (avatar: AvatarConfig) => Promise<void>;
  onClose: () => void;
}

const SKIN_TONES = [
  { label: 'Tono 1', value: '#FCD5B5' },
  { label: 'Tono 2', value: '#F7D0B2' },
  { label: 'Tono 3', value: '#F3C59E' },
  { label: 'Tono 4', value: '#E0A899' },
  { label: 'Tono 5', value: '#E8B382' },
  { label: 'Tono 6', value: '#D1926B' },
  { label: 'Tono 7', value: '#8D5524' },
  { label: 'Tono 8', value: '#5C381E' },
];

const HAIR_STYLES = [
  { label: 'Corto', value: 'short' as const },
  { label: 'Rizado', value: 'curly' as const },
  { label: 'Trenzas', value: 'braids' as const },
  { label: 'Afro Puffs', value: 'puff' as const },
  { label: 'Ondulado Largo', value: 'wavy_long' as const },
  { label: 'Lacio', value: 'straight' as const },
];

const HAIR_COLORS = [
  { label: 'Negro', value: '#171717' },
  { label: 'Castaño Oscuro', value: '#2C1B18' },
  { label: 'Café Cálido', value: '#4A2810' },
  { label: 'Miel', value: '#6B3A19' },
  { label: 'Pelirrojo / Cobrizo', value: '#9A3412' },
  { label: 'Rubio Dorado', value: '#D97706' },
  { label: 'Azul Fantasía', value: '#2563EB' },
  { label: 'Morado Creativo', value: '#7C3AED' },
];

const CLOTHING_STYLES = [
  { label: 'Polerón / Hoodie', value: 'hoodie' as const },
  { label: 'Chaleco Explorador', value: 'vest' as const },
  { label: 'Polera Rayada', value: 'stripes' as const },
  { label: 'Chaqueta Escolar', value: 'jacket' as const },
  { label: 'Mandil de Arte', value: 'smock' as const },
];

const CLOTHING_COLORS = [
  { label: 'Azul Amistad', value: '#3B82F6' },
  { label: 'Verde Esperanza', value: '#10B981' },
  { label: 'Ámbar Cálido', value: '#F59E0B' },
  { label: 'Violeta Creativo', value: '#8B5CF6' },
  { label: 'Rosa Cariño', value: '#EC4899' },
  { label: 'Cian Alegre', value: '#06B6D4' },
  { label: 'Rojo Energía', value: '#EF4444' },
];

const ACCESSORIES = [
  { label: 'Ninguno', value: 'none' as const, emoji: '✨' },
  { label: 'Lentes', value: 'glasses' as const, emoji: '👓' },
  { label: 'Audífonos', value: 'headphones' as const, emoji: '🎧' },
  { label: 'Audífono Medicado (Inclusión)', value: 'hearing_aid' as const, emoji: '🦻' },
  { label: 'Ganchito / Flor', value: 'clip' as const, emoji: '🌸' },
  { label: 'Gorra Deportiva', value: 'cap' as const, emoji: '🧢' },
  { label: 'Insignia Estrella', value: 'badge' as const, emoji: '⭐' },
];

const EXPRESSIONS = [
  { label: 'Sonriente', value: 'smiling' as const, emoji: '😊' },
  { label: 'Súper Alegre', value: 'cheerful' as const, emoji: '😄' },
  { label: 'Curioso / Atento', value: 'curious' as const, emoji: '🧐' },
  { label: 'Guiño Amistoso', value: 'wink' as const, emoji: '😉' },
];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  initialAvatar,
  onSave,
  onClose,
}) => {
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...initialAvatar });
  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'clothing' | 'accessory' | 'face'>('skin');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(avatar);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personaliza tu Avatar</h2>
              <p className="text-xs text-slate-500">
                ¡Crea un personaje único que te represente en todas las actividades!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Avatar Preview (Left) + Options Deck (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 overflow-y-auto pr-1">
          {/* Preview Box */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-indigo-50/50 rounded-2xl p-6 border border-sky-100 text-center">
            <div className="relative mb-4">
              <AvatarRenderer avatar={avatar} size="2xl" className="shadow-lg ring-4 ring-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Vista previa en tiempo real</span>
            <span className="text-xs text-slate-500 mt-1">¡Tus cambios se reflejarán con tu compañero!</span>
          </div>

          {/* Controls Deck */}
          <div className="md:col-span-7 flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('skin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'skin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Piel
              </button>
              <button
                onClick={() => setActiveTab('hair')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'hair' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cabello
              </button>
              <button
                onClick={() => setActiveTab('clothing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'clothing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ropa
              </button>
              <button
                onClick={() => setActiveTab('accessory')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'accessory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Accesorios
              </button>
              <button
                onClick={() => setActiveTab('face')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'face' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expresión
              </button>
            </div>

            {/* Options Body */}
            <div className="flex-1">
              {/* SKIN TAB */}
              {activeTab === 'skin' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Tono de piel diverso
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, skinTone: tone.value })}
                        className={`group p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          avatar.skinTone === tone.value
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-8 h-8 rounded-full border border-black/10 shadow-inner block"
                          style={{ backgroundColor: tone.value }}
                        />
                        <span className="text-[11px] font-medium text-slate-600">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* HAIR TAB */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                      Estilo de peinado
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {HAIR_STYLES.map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, hairStyle: style.value })}
                          className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all ${
                            avatar.hairStyle === style.value
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                      Color de cabello
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, hairColor: color.value })}
                          className={`w-8 h-8 rounded-full border border-black/10 shadow-xs flex items-center justify-center transition-transform ${
                            avatar.hairColor === color.value ? 'ring-3 ring-blue-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        >
                          {avatar.hairColor === color.value && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CLOTHING TAB */}
              {activeTab === 'clothing' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                      Tipo de prenda
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CLOTHING_STYLES.map((cloth) => (
                        <button
                          key={cloth.value}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, clothing: cloth.value })}
                          className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all ${
                            avatar.clothing === cloth.value
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {cloth.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                      Color de prenda
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, clothingColor: c.value })}
                          className={`w-8 h-8 rounded-full border border-black/10 shadow-xs flex items-center justify-center transition-transform ${
                            avatar.clothingColor === c.value ? 'ring-3 ring-blue-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {avatar.clothingColor === c.value && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACCESSORIES TAB */}
              {activeTab === 'accessory' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                    Accesorios inclusivos
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORIES.map((acc) => (
                      <button
                        key={acc.value}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, accessory: acc.value })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs text-left transition-all ${
                          avatar.accessory === acc.value
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{acc.emoji}</span>
                        <span>{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPRESSIONS TAB */}
              {activeTab === 'face' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                    Expresión facial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPRESSIONS.map((exp) => (
                      <button
                        key={exp.value}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, expression: exp.value })}
                        className={`p-3 rounded-xl border flex items-center gap-3 text-xs text-left transition-all ${
                          avatar.expression === exp.value
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{exp.emoji}</span>
                        <span className="font-medium">{exp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar mi Avatar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
