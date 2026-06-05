import { useRef, useCallback } from 'react';

export function useJourney() {
  const log = useRef([]);
  const focusTimes = useRef({});
  const prevValues = useRef({});

  const onFocus = useCallback((fieldId) => {
    focusTimes.current[fieldId] = Date.now();
  }, []);

  const onBlur = useCallback((fieldId, value) => {
    const spent = focusTimes.current[fieldId] ? Math.round((Date.now() - focusTimes.current[fieldId]) / 1000) : 0;
    const changed = prevValues.current[fieldId] !== undefined && prevValues.current[fieldId] !== value;
    log.current.push({
      fieldId,
      focusedAt: new Date(focusTimes.current[fieldId] || Date.now()).toISOString(),
      timeSpent: spent,
      changedValue: changed,
    });
    prevValues.current[fieldId] = value;
  }, []);

  const getLog = useCallback(() => log.current, []);

  return { onFocus, onBlur, getLog };
}
