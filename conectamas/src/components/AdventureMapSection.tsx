import React from 'react';
import { Student, Pairing, ChallengeDef, AdventureStation } from '../types';
import { CHALLENGES } from '../data/challenges';
import {
  Lock,
  CheckCircle2,
  Play,
  Sparkles,
  Star,
  Award,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AdventureMapSectionProps {
  currentStudent: Student;
  currentPairing: Pairing | null;
  partner?: Student;
  onLaunchStationChallenge: (challenge: ChallengeDef) => void;
  onNavigateToPartner: () => void;
}

export const ADVENTURE_STATIONS: AdventureStation[] = [
  {
    levelNumber: 1,
    name: 'Primeros Pasos',
    subtitle: 'El Arte de Escuchar y Presentarse',
    description: 'Aprende a conocer a tu compañero, escuchar sus propuestas y redactar juntos el primer capítulo del cuento escolar.',
    icon: '🌱',
    challengeId: 'reto_cuento_jardin',
    minPointsToUnlock: 0,
    badgeRewardId: 'primer_duo',
    badgeRewardName: 'Insignia Primer Dúo',
    coexistenceSkill: 'Escucha activa, respeto de turnos y diálogo inicial',
  },
  {
    levelNumber: 2,
    name: 'Aprendemos a Escuchar',
    subtitle: 'La Fiesta Escolar Compartida',
    description: 'Combina información matemática complementaria para calcular los refrigerios saludables sin que ningún compañero quede fuera.',
    icon: '👂',
    challengeId: 'reto_matematicas_fiesta',
    minPointsToUnlock: 120,
    badgeRewardId: 'escucha_activa',
    badgeRewardName: 'Insignia Escucha Activa',
    coexistenceSkill: 'Hacer preguntas, valorar datos mutuos y no asumir por el otro',
  },
  {
    levelNumber: 3,
    name: 'Creamos en Equipo',
    subtitle: 'El Patio de Recreo Inclusivo',
    description: 'Diseñen juntos un espacio recreativo con rampas, zonas de calma y banco de la amistad para que todos puedan jugar.',
    icon: '✨',
    challengeId: 'reto_patio_inclusivo',
    minPointsToUnlock: 240,
    badgeRewardId: 'patio_para_todos',
    badgeRewardName: 'Insignia Patio Para Todos',
    coexistenceSkill: 'Combinar ideas, repartir roles y construir accesibilidad',
  },
  {
    levelNumber: 4,
    name: 'Resolvemos Juntos',
    subtitle: 'El Enigma de las Pistas Cruzadas',
    description: 'Intercambien pistas confidenciales para descifrar el cofre con el gran valor que une a toda la escuela.',
    icon: '🔍',
    challengeId: 'reto_pistas_cruzadas',
    minPointsToUnlock: 360,
    badgeRewardId: 'pistas_unidas',
    badgeRewardName: 'Insignia Pistas Unidas',
    coexistenceSkill: 'Dialogar ante discrepancias y acordar deducciones mutuas',
  },
  {
    levelNumber: 5,
    name: 'Agentes de Inclusión',
    subtitle: 'Mural y Promesa Anti-Exclusión',
    description: 'Establezcan los compromisos definitivos para erradicar apodos, burlas y aislamiento en toda la institución.',
    icon: '👑',
    challengeId: 'reto_mural_antiexclusion',
    minPointsToUnlock: 480,
    badgeRewardId: 'defensores_inclusion',
    badgeRewardName: 'Insignia Agentes de Inclusión',
    coexistenceSkill: 'Liderar la empatía, apoyar a quien está solo e incluir a todos',
  },
];

export const AdventureMapSection: React.FC<AdventureMapSectionProps> = ({
  currentStudent,
  currentPairing,
  partner,
  onLaunchStationChallenge,
  onNavigateToPartner,
}) => {
  const currentUnlocked = currentStudent.unlockedLevel || 1;
  const completedList = currentStudent.completedLevels || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" /> Mapa de Progresión Escolar
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">5 Estaciones de Convivencia</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Mi Aventura en Pareja
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Avanza estación por estación en el camino de la inclusión. Cada nivel desbloquea nuevos desafíos colaborativos para resolver junto a tu compañero.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50/70 p-3.5 rounded-2xl border border-blue-100 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {currentUnlocked}
          </div>
          <div className="text-left text-xs">
            <span className="text-slate-500 font-medium block">Nivel Actual</span>
            <strong className="text-slate-900 font-extrabold">
              {ADVENTURE_STATIONS.find((s) => s.levelNumber === currentUnlocked)?.name || 'Primeros Pasos'}
            </strong>
          </div>
        </div>
      </div>

      {/* Partner Notice if unassigned */}
      {!currentPairing || !partner ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>¡Para jugar necesitas a tu compañero!</strong> En CONECTA+ todos los niveles se resuelven en parejas colaborativas.
            </span>
          </div>
          <button
            onClick={onNavigateToPartner}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Elegir Compañero
          </button>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* THE CURVED ADVENTURE TRAIL (Visual winding road with interactive nodes) */}
      {/* ========================================================================= */}
      <div className="relative py-8 px-4">
        {/* Background decorative path (SVG winding line) */}
        <div className="absolute inset-0 flex justify-center pointer-events-none opacity-40">
          <svg className="w-full h-full max-w-3xl" viewBox="0 0 400 900" fill="none">
            <path
              d="M200 80 C 320 180, 80 280, 200 380 C 320 480, 80 580, 200 680 C 320 780, 200 840, 200 880"
              stroke="#CBD5E1"
              strokeWidth="12"
              strokeDasharray="16 12"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Stations Sequence */}
        <div className="relative z-10 space-y-12 max-w-3xl mx-auto">
          {ADVENTURE_STATIONS.map((station, index) => {
            const isCompleted = completedList.includes(station.levelNumber) || station.levelNumber < currentUnlocked;
            const isCurrent = station.levelNumber === currentUnlocked;
            const isLocked = station.levelNumber > currentUnlocked;
            const challenge = CHALLENGES.find((c) => c.id === station.challengeId);
            const isOdd = index % 2 === 1;

            return (
              <div
                key={station.levelNumber}
                className={`flex flex-col md:flex-row items-center gap-6 ${
                  isOdd ? 'md:flex-row-reverse text-right md:text-right' : 'text-left'
                }`}
              >
                {/* Visual Station Node Icon */}
                <div className="relative shrink-0">
                  <div
                    className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 shadow-md ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-200 shadow-emerald-200'
                        : isCurrent
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-8 ring-blue-200 animate-pulse'
                        : 'bg-slate-200 text-slate-400 border border-slate-300 opacity-60'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow">{station.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                      Nivel {station.levelNumber}
                    </span>
                  </div>

                  {/* Status Overlay Badge */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs border border-white">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs border border-white">
                        <Sparkles className="w-3 h-3" /> ¡Disponible!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        <Lock className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Station Card Content */}
                <div
                  className={`flex-1 bg-white rounded-3xl p-6 border transition-all shadow-xs ${
                    isCurrent
                      ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                        Estación {station.levelNumber} · {station.subtitle}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">{station.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{station.badgeRewardName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {station.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-700 mb-4 flex items-center gap-2">
                    <span className="font-bold text-blue-900 shrink-0">Habilidad de Convivencia:</span>
                    <span className="italic">{station.coexistenceSkill}</span>
                  </div>

                  {/* Launch action button */}
                  <div>
                    {isCurrent && challenge ? (
                      <button
                        onClick={() => {
                          if (currentPairing && partner) {
                            onLaunchStationChallenge(challenge);
                          } else {
                            onNavigateToPartner();
                          }
                        }}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {currentPairing ? 'Iniciar Reto del Nivel en Pareja' : 'Emparejarme para Iniciar'}
                      </button>
                    ) : isCompleted && challenge ? (
                      <button
                        onClick={() => onLaunchStationChallenge(challenge)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Repasar Reto Completado
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Se desbloquea al superar con éxito la Estación {station.levelNumber - 1}.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
