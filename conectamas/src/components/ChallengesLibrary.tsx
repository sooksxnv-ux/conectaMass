import React from 'react';
import { ChallengeDef, Pairing, Student } from '../types';
import { CHALLENGES } from '../data/challenges';
import { Users, Clock, Target, Play, HeartHandshake, Sparkles, AlertCircle } from 'lucide-react';

interface ChallengesLibraryProps {
  currentStudent: Student;
  pairing: Pairing | null;
  partner?: Student;
  onSelectChallenge: (challenge: ChallengeDef) => void;
  onNavigateToPairing: () => void;
}

export const ChallengesLibrary: React.FC<ChallengesLibraryProps> = ({
  currentStudent,
  pairing,
  partner,
  onSelectChallenge,
  onNavigateToPairing,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Anti-Individual-Challenge Policy Callout */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              Biblioteca de Retos Colaborativos
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">6 Retos Disponibles</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Aprender y Crecer Juntos
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            En CONECTA+, no existen retos individuales. Todas las experiencias requieren la cooperación genuina de dos estudiantes desde sus computadoras para prevenir la exclusión y fortalecer la amistad escolar.
          </p>
        </div>

        {/* Pairing Status Banner */}
        {pairing && partner ? (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
            <span className="text-2xl">🤝</span>
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block">
                Listo para jugar con:
              </span>
              <span className="text-xs font-black text-emerald-800">{partner.name}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onNavigateToPairing}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <AlertCircle className="w-4 h-4" />
            Emparejarme primero
          </button>
        )}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHALLENGES.map((challenge) => {
          const isAssigned = pairing?.assignedChallengeId === challenge.id;

          return (
            <div
              key={challenge.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isAssigned ? 'ring-2 ring-blue-500 border-blue-400' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Image Cover */}
                <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                  <img
                    src={challenge.illustrationImage}
                    alt={challenge.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-blue-600" />
                    En Pareja
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-medium text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{challenge.durationMinutes} min
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide block">
                    {challenge.categoryLabel}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {challenge.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <Target className="w-3 h-3 text-emerald-600" /> Objetivo de Inclusión:
                    </span>
                    <p className="line-clamp-2">{challenge.educationalObjective}</p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-0">
                {pairing && partner ? (
                  <button
                    onClick={() => onSelectChallenge(challenge)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Reto en Pareja
                  </button>
                ) : (
                  <button
                    onClick={onNavigateToPairing}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4 text-blue-600" />
                    Elegir Compañero para Jugar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
