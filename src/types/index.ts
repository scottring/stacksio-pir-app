/**
 * Core type definitions for the Stacksio PIR workflow
 */

// PIR Status types
export enum PIRStatus {
  REQUESTED = 'REQUESTED',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED'
}

// User role types
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  REQUESTER = 'REQUESTER',
  REVIEWER = 'REVIEWER'
}

// Base document interface (common fields for all document types)
export interface BaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// PIR document interface
export interface PIR extends BaseDocument {
  title: string;
  description: string;
  status: PIRStatus;
  requester: string;
  requesterEmail: string;
  dueDate?: Date;
  product: string;
  tags: string[];
  isUrgent: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  acceptedBy?: string;
  acceptedAt?: Date;
  version: number;
  questionCount: number;
  answeredQuestionCount: number;
}

// Question document interface
export interface Question extends BaseDocument {
  pirId: string;
  text: string;
  isAnswered: boolean;
  assignedTo?: string;
  dueDate?: Date;
  isRequired: boolean;
  position: number;
}

// Answer document interface
export interface Answer extends BaseDocument {
  questionId: string;
  pirId: string;
  text: string;
  attachments: string[];
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
}

// Tag document interface
export interface Tag extends BaseDocument {
  name: string;
  color: string;
  description?: string;
}

// User document interface
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department?: string;
}

// Attachment document interface
export interface Attachment extends BaseDocument {
  pirId: string;
  questionId?: string;
  answerId?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageRef: string;
  downloadUrl: string;
}

// Notification types
export enum NotificationType {
  PIR_CREATED = 'PIR_CREATED',
  PIR_UPDATED = 'PIR_UPDATED',
  PIR_SUBMITTED = 'PIR_SUBMITTED',
  PIR_REVIEWED = 'PIR_REVIEWED',
  PIR_ACCEPTED = 'PIR_ACCEPTED',
  QUESTION_ADDED = 'QUESTION_ADDED',
  QUESTION_ANSWERED = 'QUESTION_ANSWERED',
  ANSWER_APPROVED = 'ANSWER_APPROVED',
  ANSWER_REJECTED = 'ANSWER_REJECTED'
}

// Email notification interface
export interface EmailNotification {
  type: NotificationType;
  recipients: string[];
  subject: string;
  templateId: string;
  data: any;
}

// Repository interfaces
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Additional filter types
export interface PIRFilter {
  status?: PIRStatus;
  requester?: string;
  product?: string;
  tags?: string[];
  isUrgent?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Form state interfaces
export interface PIRFormState {
  title: string;
  description: string;
  requester: string;
  requesterEmail: string;
  product: string;
  dueDate?: Date;
  tags: string[];
  isUrgent: boolean;
}

export interface QuestionFormState {
  text: string;
  isRequired: boolean;
  assignedTo?: string;
  dueDate?: Date;
}

export interface AnswerFormState {
  text: string;
  attachments: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
