import { describe, expect, it } from "vitest";
import { canConfirmDriverApproval, type DriverApprovalReview } from "../driverApprovalReview";

const reviewed: DriverApprovalReview = {
  status: "pending", documentTypes: ["gewerbeanmeldung", "fuehrerschein", "fahrerkarte"],
  tradeReviewed: true, driverDocumentsReviewed: true,
};

describe("Manuelle Fahrerprüfung", () => {
  it("Registrierung ohne Prüfung schaltet nicht frei", () => {
    expect(canConfirmDriverApproval({ ...reviewed, tradeReviewed: false, driverDocumentsReviewed: false })).toBe(false);
  });
  it("Vertragsannahme ersetzt keine Unterlagenprüfung", () => {
    expect(canConfirmDriverApproval({ ...reviewed, tradeReviewed: false })).toBe(false);
  });
  it("Gewerbeanmeldung muss vorliegen", () => {
    expect(canConfirmDriverApproval({ ...reviewed, documentTypes: ["fuehrerschein"] })).toBe(false);
  });
  it("Führerschein muss vorliegen", () => {
    expect(canConfirmDriverApproval({ ...reviewed, documentTypes: ["gewerbeanmeldung"] })).toBe(false);
  });
  it("Erforderliche Fahrerunterlagen müssen geprüft sein", () => {
    expect(canConfirmDriverApproval({ ...reviewed, driverDocumentsReviewed: false })).toBe(false);
  });
  it.each([{ is_blocked: true }, { is_inactive: true }, { status: "approved" }])("keine Freigabe für gesperrte, inaktive oder bereits freigegebene Fahrer: %j", (change) => {
    expect(canConfirmDriverApproval({ ...reviewed, ...change })).toBe(false);
  });
  it("ermöglicht die ausdrückliche manuelle Freigabe nach Prüfung", () => {
    expect(canConfirmDriverApproval(reviewed)).toBe(true);
  });
});