// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Request Types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface RegisterResponse {
  user: AuthUser;
  token: string;
  message: string;
}

// File Upload Types
export interface FileUpload {
  file: File;
  type: 'image' | 'document' | 'video' | 'audio';
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketConnection {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  lastMessage?: WebSocketMessage;
}

// Cache Types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface CacheItem<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
}

// Rate Limiting Types
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Health Check Types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// Metrics Types
export interface Metrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    rate: number;
  };
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  users: {
    active: number;
    total: number;
    new: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface NotificationRequest {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
}

// Search Types
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  query: string;
  filters: Record<string, any>;
  suggestions?: string[];
}

// Export Types
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  filters?: Record<string, any>;
  fields?: string[];
  filename?: string;
}

export interface ExportResponse {
  url: string;
  filename: string;
  size: number;
  expiresAt: string;
}

