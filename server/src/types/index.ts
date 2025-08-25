import { Request } from 'express';

// 사용자 관련 타입
export interface User {
  id: number;
  email: string;
  name?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    posts: number;
  };
}

// 게시물 관련 타입
export interface Post {
  id: number;
  title: string;
  content?: string;
  published: boolean;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  published?: boolean;
  authorId: number;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface PostResponse {
  id: number;
  title: string;
  content?: string;
  published: boolean;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: number;
    name?: string;
    email: string;
  };
}

// API 응답 타입
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// 확장된 Request 타입
export interface AuthenticatedRequest extends Request {
  user?: UserResponse;
}

// 쿼리 파라미터 타입
export interface GetPostsQuery {
  published?: string;
  authorId?: string;
}

export interface GetUserParams {
  id: string;
}

export interface GetPostParams {
  id: string;
}
