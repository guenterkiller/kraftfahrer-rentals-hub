export type DriverApprovalReview = {
  status: string;
  is_blocked?: boolean;
  is_inactive?: boolean;
  documentTypes: string[];
  tradeReviewed: boolean;
  driverDocumentsReviewed: boolean;
};

/** Vorschau-/Oberflächenprüfung, kein Ersatz für die serverseitige Prüfung. */
export function canConfirmDriverApproval(review: DriverApprovalReview): boolean {
  return review.status === "pending" &&
    !review.is_blocked && !review.is_inactive &&
    review.documentTypes.includes("gewerbeanmeldung") &&
    review.documentTypes.includes("fuehrerschein") &&
    review.tradeReviewed && review.driverDocumentsReviewed;
}