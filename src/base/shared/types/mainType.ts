export interface ItemPostProps {
    userId: { fullName: string; images: imageProps[]; _id: string };
    _id: string;
    createdAt: string;
    content: string;
    image?: imageProps[];
    hashTags: any[];
    likes: any[];
    comments: any[];
    images: any[];
    likeCount: number;
    commentCount: number;
    handleLike: (data: LikePayload) => void;
    handleComment: (data: CommentPayload) => void;
    handleDeleteComment?: (id: string) => void;
    isLike: boolean;
}

export interface imageProps {
    fileName: string;
    imageBase64String: string;
    imageAbsolutePath: string;
    imageFile: any;
    isNewUpload: boolean;
    isVideo?: boolean;
}

export type LikePayload = {
    userId: string;
    postId: string;
    isLike: boolean;
};

export type CommentPayload = {
    userId: string;
    postId: string;
    content: string;
    parentId?: string;
    createdAt?: string;
};

export type SortOrder = 1 | -1;

export type Filter = {
    keySearch: string;
    sort: Record<string, SortOrder>;
    page: number;
    pageSize: number;
    sessionCode: string;
    sortField?: string;
    sortOrder?: string;
    userId?: string;
};

export interface LoginProps {
    email: string;
    password: string;
}