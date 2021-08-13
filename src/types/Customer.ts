export interface Customer {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerID: number;
  weightQuestions: boolean;
  foodQuestions: boolean;
  sleepQuestions: boolean;
  moneyback: boolean;
  diagram: boolean;
  foodRecommendations: boolean;
  instagramFeed: boolean;
  fullName: string;
  phone: null;
  email: string;
  dob: Date;
  height: number;
  initialWeight: number;
  telegramChatID: number;
  telegramName: string;
  programRegistrationTimestamp: string;
  activeProgram: Program;
  supervisor: Supervisor;
  question: QuestionElement[];
  programHistory: ProgramHistory[];
}

export interface Program {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  productIDS: string[];
  variantID: null;
  moneyback: boolean;
  question: boolean;
  foodRecommendations: boolean;
  duration: number;
}

export interface ProgramHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  program: Program;
}

export interface QuestionElement {
  id: string;
  createdAt: string;
  updatedAt: string;
  question: QuestionEnum;
  answer: null | string | number;
  constraint: ConstraintEnum;
  expiration: string;
}

export enum ConstraintEnum {
  IsFood = 'isFood',
  IsSleep = 'isSleep',
  IsString = 'isString',
  IsWeight = 'isWeight',
}

export enum QuestionEnum {
  HowMuchDidYouSleepToday = 'How much did you sleep today?',
  HowMuchDoYouWeigh = 'How much do you weigh?',
  WhatDidYouEatToday = 'What did you eat today?',
}

export interface Supervisor {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  status: string;
  discountCode: null;
}
