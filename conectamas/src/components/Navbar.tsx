import React from 'react';
import { Student, Classroom } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { getLevelInfo } from '../data/challenges';
import { LogOut, GraduationCap, Users, User, Compass, Sparkles, BookOpen, Lightbulb } from 'lucide-react';

export type MainNavView =
  | 'library'
  | 'partner'
  | 'avatar'
  | 'adventure'
  | 'recommendations'
  | 'profile'
  | 'session'
  | 'teacher';

interface NavbarProps {
  currentStudent: Student | null;
  currentClassroom: Classroom | null;
  isTeacherMode: boolean;
  activeView: MainNavView;
  onNavigate: (view: MainNavView) => void;
  onLogout: () => void;
  onSwitchStudent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  currentClassroom,
  isTeacherMode,
  activeView,
  onNavigate,
  onLogout,
  onSwitchStudent,
}) => {
  const level = currentStudent ? getLevelInfo(currentStudent.points) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Zone 1: Logo Wordmark */}
        <button
          onClick={() => onNavigate(isTeacherMode ? 'teacher' : 'library')}
          className="text-xl font-black tracking-tight text-blue-600 font-display whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs text-base font-black">
            C+
          </div>
          <span className="font-extrabold text-blue-600">CONECTA</span>
          <span className="text-amber-500 font-extrabold text-2xl leading-none">+</span>
        </button>

        {/* Zone 2: Navigation Links for Students or Teacher */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          {!isTeacherMode ? (
            <>
              {/* 1. Retos en Equipo */}
              <button
                onClick={() => onNavigate('library')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeView === 'library'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Retos en Equipo
              </button>

              {/* 2. Mi Compañero */}
              <button
                onClick={() => onNavigate('partner')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeView === 'partner'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Mi Compañero
              </button>

              {/* 3. MI AVATAR - SECCIÓN INDEPENDIENTE */}
              <button
                onClick={() => onNavigate('avatar')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeView === 'avatar'
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-blue-700 hover:bg-blue-50/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mi Avatar
              </button>

              {/* 4. Aventura y Niveles */}
              <button
                onClick={() => onNavigate('adventure')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeView === 'adventure'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Mapa de Aventura
              </button>

              {/* 5. Recomendaciones */}
              <button
                onClick={() => onNavigate('recommendations')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeView === 'recommendations'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Consejos
              </button>

              {/* 6. Mi Progreso */}
              <button
                onClick={() => onNavigate('profile')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeView === 'profile'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Mi Progreso
              </button>

              {/* 7. Switch to Teacher Panel */}
              <button
                onClick={() => onNavigate('teacher')}
                className="px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 font-bold"
              >
                Panel Docente
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('teacher')}
                className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl shadow-xs font-bold whitespace-nowrap shrink-0"
              >
                Panel de Supervisión Docente
              </button>
              <button
                onClick={() => onNavigate('library')}
                className="px-3.5 py-1.5 hover:text-slate-900 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Vista de Alumnos
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Student Badge / Profile Action & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          {currentStudent && !isTeacherMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors text-left"
                title="Ver mi perfil y logros"
              >
                <AvatarRenderer avatar={currentStudent.avatar} size="xs" />
                <div className="hidden sm:block">
                  <span className="text-xs font-extrabold text-slate-800 truncate max-w-[110px] block leading-tight">
                    {currentStudent.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold block leading-none">
                    {currentStudent.points} pts
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : isTeacherMode ? (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir de Docente
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      {/* Secondary Bar for Mobile & Smaller Tablets */}
      {currentStudent && !isTeacherMode && (
        <div className="lg:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-100 bg-slate-50/90 text-xs font-bold text-slate-600 scrollbar-none">
          <button
            onClick={() => onNavigate('library')}
            className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
              activeView === 'library' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
            }`}
          >
            Retos
          </button>
          <button
            onClick={() => onNavigate('partner')}
            className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
              activeView === 'partner' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
            }`}
          >
            Compañero
          </button>
          <button
            onClick={() => onNavigate('avatar')}
            className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap flex items-center gap-1 ${
              activeView === 'avatar' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Mi Avatar
          </button>
          <button
            onClick={() => onNavigate('adventure')}
            className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
              activeView === 'adventure' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
            }`}
          >
            Aventura
          </button>
          <button
            onClick={() => onNavigate('recommendations')}
            className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
              activeView === 'recommendations' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
            }`}
          >
            Consejos
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
              activeView === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
            }`}
          >
            Progreso
          </button>
          <button
            onClick={() => onNavigate('teacher')}
            className="px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap text-indigo-700 hover:bg-indigo-50 font-bold"
          >
            Docente
          </button>
        </div>
      )}
    </header>
  );
};
