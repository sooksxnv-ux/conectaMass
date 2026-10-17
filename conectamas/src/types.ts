export interface AvatarConfig {
  skinTone: string;
  hairStyle:
    | 'lacio_largo'
    | 'ondulado_largo'
    | 'corto'
    | 'media_melena'
    | 'dos_trencitas'
    | 'dos_monitos'
    | 'coleta'
    | 'puff'
    | 'curly'
    | 'straight'
    | 'short'
    | 'braids'
    | 'wavy_long';
  hairColor: string;
  clothing:
    | 'polo'
    | 'pantalon'
    | 'falda'
    | 'vestido'
    | 'sudadera'
    | 'chaqueta'
    | 'hoodie'
    | 'vest'
    | 'stripes'
    | 'jacket'
    | 'smock';
  clothingColor: string;
  clothingSecondaryColor?: string;
  footwear?: 'zapatillas' | 'botines' | 'sandalias' | 'clasicos';
  footwearColor?: string;
  accessory:
    | 'none'
    | 'glasses'
    | 'headphones'
    | 'hearing_aid'
    | 'vincha'
    | 'lazo'
    | 'cap'
    | 'aretes'
    | 'collar'
    | 'mochila'
    | 'badge'
    | 'clip';
  accessoryColor?: string;
  expression: 'smiling' | 'cheerful' | 'curious' | 'wink';
}

export interface Student {
  id: string;
  name: string;
  classroomCode: string;
  pin: string;
  avatar: AvatarConfig;
  points: number;
  badges: string[];
  completedChallengesCount: number;
  unlockedLevel?: number; // 1 to 5
  completedLevels?: number[];
  isOnline: boolean;
  lastSeen: number;
  joinedAt?: number;
}

export interface Classroom {
  code: string;
  name: string;
  grade: string;
  teacherName: string;
  createdAt?: number;
}

export interface Pairing {
  id: string;
  classroomCode: string;
  student1Id: string;
  student2Id: string;
  student3Id?: string; // For odd student count trio
  activeSessionId?: string;
  assignedChallengeId?: string;
  status: 'active' | 'completed';
  createdAt: number;
}

export interface PairRequest {
  id: string;
  fromStudentId: string;
  toStudentId: string;
  classroomCode: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface StoryPart {
  authorId: string;
  authorName: string;
  text: string;
  step: number;
  timestamp: number;
}

export interface MathStep {
  stepId: string;
  stepName: string;
  authorId: string;
  authorName: string;
  value: string;
  notes: string;
  verifiedByPartner: boolean;
}

export interface PlaygroundItem {
  id: string;
  type: string;
  name: string;
  placedBy: string;
  x: number;
  y: number;
  icon: string;
}

export interface ClueItem {
  clueId: string;
  title: string;
  text: string;
  revealedBy: string;
}

export interface MuralCommitment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface SessionState {
  id: string;
  pairingId: string;
  challengeId: string;
  classroomCode: string;
  student1Id: string;
  student2Id: string;
  student3Id?: string;
  student1Online: boolean;
  student2Online: boolean;
  student1LastHeartbeat: number;
  student2LastHeartbeat: number;
  state: {
    storyTitle?: string;
    storyParts?: StoryPart[];
    mathSteps?: MathStep[];
    playgroundItems?: PlaygroundItem[];
    cluesShared?: ClueItem[];
    puzzleAnswers?: { [key: string]: string };
    dilemmaVotes?: { student1Choice?: string; student2Choice?: string; agreementReflection?: string };
    muralCommitments?: MuralCommitment[];
    chatMessages?: ChatMessage[];
  };
  student1ReadyToFinish: boolean;
  student2ReadyToFinish: boolean;
  isCompleted: boolean;
  completedAt?: number;
  earnedPoints: number;
  badgesUnlocked: string[];
  reflection?: {
    recommendationGiven: string;
    rating: number;
  };
}

export interface ChallengeDef {
  id: string;
  title: string;
  category: 'cuento' | 'matematicas' | 'inclusion_escuela' | 'acertijo' | 'convivencia' | 'solucion_exclusion';
  categoryLabel: string;
  durationMinutes: number;
  educationalObjective: string;
  cooperationDynamic: string;
  illustrationImage: string;
  accentColor: string;
  description: string;
  associatedLevel?: number;
}

export interface LevelInfo {
  name: string;
  badgeLevel: string;
  minPoints: number;
  maxPoints: number;
  nextLevelName?: string;
  levelNumber?: number;
  description?: string;
  icon?: string;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface AdventureStation {
  levelNumber: number;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  challengeId: string;
  minPointsToUnlock: number;
  badgeRewardId: string;
  badgeRewardName: string;
  coexistenceSkill: string;
}

export interface LevelRecommendation {
  levelNumber: number;
  levelName: string;
  coreAdvice: string;
  concreteActions: string[];
  classroomExample: string;
  icon: string;
}
