interface Author {
  username: string;

  bio: string;

  image: string;

  following?: boolean;
}

export interface CommentResponseData {
  id: number;

  createdAt: Date;

  updatedAt: Date;

  body: string;

  author: Author;
}

export interface SingleCommentResponse {
  comment: CommentResponseData;
}

export interface MultipleCommentResponse {
  comments: CommentResponseData[];
}
