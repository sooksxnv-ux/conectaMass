import React, { useState } from 'react';
import { Student } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { Users, ExternalLink, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface DualStudentTesterProps {
  currentStudent: Student | null;
  students: Student[];
  onSwitchStudent: (studentId: string) => void;
}

export const DualStudentTester: React.FC<DualStudentTesterProps> = ({
  currentStudent,
  students,
  onSwitchStudent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Focus on top 4 students from classroom
  const sampleStudents = students.slice(0, 4);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3 border border-slate-700 shadow-xl text-xs space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-white text-[11px] uppercase tracking-wide">
              Modo Pruebas Multiusuario
            </span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {isOpen ? (
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <p className="text-[11px] text-slate-300 leading-tight">
              Para verificar que la sesión colaborativa requiere la participación de <strong>dos estudiantes reales</strong>, puedes cambiar de alumno en 1 clic o abrir esta URL en otra ventana/computadora:
            </p>

            <div className="space-y-1.5">
              {sampleStudents.map((std, idx) => {
                const isSelected = currentStudent?.id === std.id;
                return (
                  <button
                    key={std.id}
                    onClick={() => onSwitchStudent(std.id)}
                    className={`w-full p-1.5 rounded-xl flex items-center justify-between text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AvatarRenderer avatar={std.avatar} size="xs" />
                      <span className="truncate">{std.name}</span>
                    </div>
                    <span className="text-[10px] opacity-80">
                      {idx === 0 ? 'Dúo A' : idx === 1 ? 'Dúo B' : 'Alumno'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 text-[10px] text-slate-400 italic text-center">
              Las respuestas y el chat se sincronizan en vivo entre ambos.
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
            <span className="truncate">
              Actualmente como: <strong>{currentStudent?.name || 'Invitado'}</strong>
            </span>
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-bold underline shrink-0"
            >
              Cambiar alumno
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
