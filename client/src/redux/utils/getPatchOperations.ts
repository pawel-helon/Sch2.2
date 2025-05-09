import { Patch } from 'immer';
import { Slot } from 'src/types/slots';
import { Session } from 'src/types/sessions';

export const getPatchOperations = (
  eventAction: 'create' | 'update' | 'delete',
  data: Slot | Session
): Patch[] => {
  switch (eventAction) {
    case 'create':
      return [
        { op: 'add', path: ['byId', data.id], value: data },
        { op: 'add', path: ['allIds', '-'], value: data.id }
      ]
    case 'update':
      return [
        { op: 'replace', path: ['byId', data.id], value: data }
      ];
    case 'delete':
      return [
        { op: 'remove', path: ['byId', data.id], value: data },
        { op: 'remove', path: ['allIds', '-'] }
      ];
    default:
      return [];
  }
};
