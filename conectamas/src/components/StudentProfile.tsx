import React from 'react';
import { Student, LevelInfo } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { BADGES, getLevelInfo, COEXISTENCE_RECOMMENDATIONS } from '../data/challenges';
import { Award, Star, Sparkles, HeartHandshake, Lightbulb, ShieldCheck, Edit3 } from 'lucide-react';

interface StudentProfileProps {
  student: Student;
  onOpenAvatarEditor: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onOpenAvatarEditor,
}) => {
  const levelInfo = getLevelInfo(student.points);
  const progressPercent = Math.min(
    100,
    Math.round(
      ((student.points - levelInfo.minPoints) /
        (levelInfo.maxPoints - levelInfo.minPoints)) *
        100
    )
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="relative group cursor-pointer" onClick={onOpenAvatarEditor}>
            <AvatarRenderer avatar={student.avatar} size="2xl" />
            <button
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-transform group-hover:scale-110"
              title="Personalizar avatar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Estudiante de Primaria
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Aula {student.classroomCode}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{student.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span>⭐</span> {levelInfo.badgeLevel} - {levelInfo.name}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {student.points} Puntos Cooperativos
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAvatarEditor}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Ir a «Mi Avatar»
        </button>
      </div>

      {/* Cooperative Progression Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Progreso de Convivencia e Inclusión
            </h3>
            <p className="text-xs text-slate-500">
              Avanzas de nivel completando retos educativos junto a tus compañeros.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {progressPercent}% hacia el siguiente nivel
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
          <span>{levelInfo.name} ({levelInfo.minPoints} pts)</span>
          {levelInfo.nextLevelName ? (
            <span>Siguiente: {levelInfo.nextLevelName} ({levelInfo.maxPoints} pts)</span>
          ) : (
            <span className="text-emerald-600 font-bold">¡Nivel Máximo de Inclusión Alcanzado! 👑</span>
          )}
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Insignias de Trabajo en Equipo
          </h3>
          <p className="text-xs text-slate-500">
            Reconocimientos ganados por colaborar, escuchar y construir una escuela donde nadie quede excluido.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {BADGES.map((badge) => {
            const isUnlocked = student.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-200 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-40 grayscale'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-2 bg-white shadow-2xs border border-slate-100">
                  {badge.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{badge.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {badge.description}
                </p>
                <span
                  className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUnlocked
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isUnlocked ? 'Desbloqueada' : 'Por desbloquear'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Recommendations for Coexistence */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50/80 rounded-3xl p-6 border border-sky-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-200/80 text-sky-800 flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5 text-sky-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wide">
              Recomendaciones para una Convivencia Inclusiva
            </h3>
            <p className="text-xs text-sky-800/80">
              Consejos prácticos para poner en práctica en el aula y en el recreo:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {COEXISTENCE_RECOMMENDATIONS.slice(0, 4).map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white/90 backdrop-blur-xs rounded-2xl border border-sky-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs"
            >
              <HeartHandshake className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
