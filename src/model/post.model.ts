interface ImageProps {
  url: string;
}

export interface PostRequest {
  content: string;
  imageUrl: ImageProps[];
}

export interface PostPagination {
  skip: string;
  limit: string;
}

export type LikeRequest = {
  postId: string;
  type: 'like' | 'unlike';
};

export interface PostResponse {
  id: string;
  content: string;
  author: string;
  likes: number;
  createAt: Date;
}

export interface CommentRequest {
  content: string;
  postId: string;
}
