import { useMemo } from 'react';
import { suggestFieldType } from '../utils/fieldLogic';

export function useFieldSuggestion(label, currentType) {
  return useMemo(() => {
    const suggested = suggestFieldType(label);
    if (!suggested || suggested === currentType) return null;
    return suggested;
  }, [label, currentType]);
}
