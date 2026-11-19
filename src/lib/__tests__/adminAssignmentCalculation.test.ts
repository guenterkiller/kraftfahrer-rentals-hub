import { describe, expect, it } from "vitest";
import {
  calculateCeAssignmentRemuneration,
  countRegularMondayFridayDays,
  parseAssignmentPeriod,
} from "../adminAssignmentCalculation";
import { agreementNote } from "../offerReadiness";
import { buildDriverOfferView } from "../driverOfferRemuneration";

const place = "TEST Hafenstraße 12, 66333 Völklingen";
const job = { tarif_type: "lkw_ce_woche", einsatzort: place };

function assignmentFor(startDate: string, endDate: string) {
  const calculation = calculateCeAssignmentRemuneration(startDate, endDate);
  if (!calculation) throw new Error("TEST: Berechnung fehlt");
  return {
    rate_type: calculation.rateType,
    rate_value: calculation.rateValue,
    start_date: `${startDate}T00:00:00.000Z`,
    end_date: `${endDate}T00:00:00.000Z`,
    admin_note: agreementNote("TEST", {
      rate: calculation.rateValue,
      unit: calculation.rateType,
      units: calculation.paidUnits,
      place,
      remunerationConfirmed: true,
      placeConfirmed: true,
    }),
  };
}

describe("CE-Honorar im vorhandenen Zuweisungsdialog", () => {
  it("eine volle Mo–Fr-Woche: 1.645 € vor Provision, 1.316 € Fahrer-Netto", () => {
    const result = calculateCeAssignmentRemuneration("2026-11-16", "2026-11-20");
    expect(result).toMatchObject({
      regularDays: 5,
      rateType: "weekly",
      rateValue: 1645,
      paidUnits: 1,
      grossCents: 164500,
      commissionCents: 32900,
      totalNetCents: 131600,
      weeklyNetCents: 131600,
      dailyNetCents: 26320,
    });
    expect(buildDriverOfferView(job, assignmentFor("2026-11-16", "2026-11-20")).mode).toBe("binding");
  });

  it("24.11.–23.12.2026: 22 reguläre Mo–Fr-Tage und 5.790,40 € Fahrer-Netto", () => {
    const result = calculateCeAssignmentRemuneration("2026-11-24", "2026-12-23");
    expect(result).toMatchObject({
      regularDays: 22,
      rateType: "daily",
      rateValue: 329,
      paidUnits: 22,
      grossCents: 723800,
      commissionCents: 144760,
      totalNetCents: 579040,
      weeklyNetCents: 131600,
      dailyNetCents: 26320,
    });
  });

  it("zieht die Provision genau einmal ab", () => {
    const result = calculateCeAssignmentRemuneration("2026-11-24", "2026-12-23");
    expect(result?.totalNetCents).toBe(723800 - 144760);
    expect(result?.totalNetCents).toBe(579040);
    expect(result?.totalNetCents).not.toBe(463232);
  });

  it("zählt Samstage, Sonntage und gesetzliche Feiertage nicht als reguläre Tage", () => {
    expect(countRegularMondayFridayDays("2026-12-21", "2026-12-27")).toBe(4);
  });

  it("übernimmt die beiden vorhandenen Auftragsdaten ohne neue Datumsangaben", () => {
    expect(parseAssignmentPeriod("vom 24.11.2026 bis 23.12.2026 (30 Kalendertage)")).toEqual({
      startDate: "2026-11-24",
      endDate: "2026-12-23",
    });
  });

  it("22 CE-Mo–Fr-Tage über Wochenenden sind freigebbar (329 € je Tag, Wochenenden unbezahlt)", () => {
    const view = buildDriverOfferView(job, assignmentFor("2026-11-24", "2026-12-23"));
    expect(view.missing).toEqual([]);
    expect(view.mode).toBe("binding");
  });

  it("gebuchte Wochenendarbeit sperrt weiterhin", () => {
    const view = buildDriverOfferView({ ...job, besonderheiten: "Wochenendarbeit" }, assignmentFor("2026-11-24", "2026-12-23"));
    expect(view.mode).toBe("interest");
    expect(view.missing.length).toBeGreaterThan(0);
  });
});
