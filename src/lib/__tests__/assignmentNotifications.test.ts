import { describe, expect, it, vi } from 'vitest';
import { sendAssignmentNotifications } from '../assignmentNotifications';

const deps = () => ({
  confirmAdminAssignment: vi.fn(async () => {}),
  sendCustomerConfirmation: vi.fn(async () => {}),
  sendDriverOffer: vi.fn(async () => {}),
});

describe('Versand nach Fahrerzuweisung', () => {
  it('bestätigt den Kunden nach der Zuweisung und vor dem Fahrerangebot, ohne Fahrerannahme', async () => {
    const order: string[] = [];
    const result = await sendAssignmentNotifications({
      confirmAdminAssignment: async () => { order.push('zuweisung-bestätigt'); },
      sendCustomerConfirmation: async () => { order.push('kunde-bestätigt'); },
      sendDriverOffer: async () => { order.push('fahrer-angebot'); },
    });
    expect(order).toEqual(['zuweisung-bestätigt', 'kunde-bestätigt', 'fahrer-angebot']);
    expect(result).toEqual({ adminConfirmation: 'sent', customerConfirmation: 'sent', driverOffer: 'sent', errors: [] });
  });

  it('versendet das Fahrerangebot auch nach einem Fehler der Kundenbestätigung', async () => {
    const d = deps();
    d.sendCustomerConfirmation.mockRejectedValue(new Error('Kundenmail blockiert'));
    const result = await sendAssignmentNotifications(d);
    expect(d.sendDriverOffer).toHaveBeenCalledOnce();
    expect(result.customerConfirmation).toBe('failed');
    expect(result.driverOffer).toBe('sent');
  });

  it('versendet die Kundenbestätigung auch nach einem Fehler des Fahrerangebots', async () => {
    const d = deps();
    d.sendDriverOffer.mockRejectedValue(new Error('Fahrermail blockiert'));
    const result = await sendAssignmentNotifications(d);
    expect(d.sendCustomerConfirmation).toHaveBeenCalledOnce();
    expect(result.customerConfirmation).toBe('sent');
    expect(result.driverOffer).toBe('failed');
  });

  it('meldet einen Fehler der internen Bestätigung, ohne die Zuweisung zu verbergen', async () => {
    const d = deps();
    d.confirmAdminAssignment.mockRejectedValue(new Error('RPC nicht erreichbar'));
    const result = await sendAssignmentNotifications(d);
    expect(result.adminConfirmation).toBe('failed');
    expect(result.customerConfirmation).toBe('sent');
    expect(result.driverOffer).toBe('sent');
    expect(result.errors[0]).toContain('RPC nicht erreichbar');
  });
});
