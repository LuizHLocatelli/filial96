/**
 * Basic unit tests for shared Folgas types
 */

import { describe, it, expect } from 'vitest';
import { Consultor, Folga, UseFolgasConfig } from '@/types/shared/folgas';

describe('Folgas Types', () => {
  describe('Consultor', () => {
    it('should have required properties', () => {
      const consultor: Consultor = {
        id: 'test-id',
        nome: 'Test Consultant',
      };

      expect(consultor.id).toBe('test-id');
      expect(consultor.nome).toBe('Test Consultant');
    });

    it('should allow optional avatar', () => {
      const consultor: Consultor = {
        id: 'test-id',
        nome: 'Test Consultant',
        avatar: 'https://example.com/avatar.jpg',
      };

      expect(consultor.avatar).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('Folga', () => {
    it('should have required properties', () => {
      const folga: Folga = {
        id: 'folga-id',
        data: new Date('2024-01-15'),
        consultorId: 'consultor-id',
      };

      expect(folga.id).toBe('folga-id');
      expect(folga.data).toBeInstanceOf(Date);
      expect(folga.consultorId).toBe('consultor-id');
    });

    it('should allow optional properties', () => {
      const folga: Folga = {
        id: 'folga-id',
        data: new Date('2024-01-15'),
        consultorId: 'consultor-id',
        motivo: 'Vacation',
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-id',
      };

      expect(folga.motivo).toBe('Vacation');
      expect(folga.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(folga.createdBy).toBe('user-id');
    });
  });

  describe('UseFolgasConfig', () => {
    it('should have required properties', () => {
      const config: UseFolgasConfig = {
        tableName: 'moda_folgas',
        consultantRole: 'consultor_moda',
        moduleTitle: 'Folgas de Moda',
        moduleDescription: 'Gerenciamento de folgas do setor de moda',
      };

      expect(config.tableName).toBe('moda_folgas');
      expect(config.consultantRole).toBe('consultor_moda');
      expect(config.moduleTitle).toBe('Folgas de Moda');
      expect(config.moduleDescription).toBe('Gerenciamento de folgas do setor de moda');
    });
  });
});

describe('Date utilities', () => {
  it('should compare dates correctly', () => {
    const date1 = new Date('2024-01-15');
    const date2 = new Date('2024-01-15');
    const date3 = new Date('2024-01-16');

    expect(date1.toDateString()).toBe(date2.toDateString());
    expect(date1.toDateString()).not.toBe(date3.toDateString());
  });

  it('should format dates correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = date.toISOString().split('T')[0];

    expect(formatted).toBe('2024-01-15');
  });
});
