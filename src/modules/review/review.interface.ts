export interface ICreateReviewPayload {
  mediaId: string;
  rating: number;
  review_content: string;
  hasSpoiler?: boolean;
  tags?: string[];
}

export interface IApproveRejectPayload {
  status: "APPROVED" | "REJECTED" | "PENDING";
}

export interface ICreateCommentPayload {
  content: string;
  parentId?: string;
}
