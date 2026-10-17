/**
 * Minimal typed i18n. `t('intent.title')`, `t('common.stepOf', { current: 2, total: 5 })`.
 * Language lives outside the session so "Start over" keeps it.
 */
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Locale } from '@/domain/types';

import en from './en';
import es, { type Dictionary } from './es';

const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TKey = Leaves<Dictionary>;
export type TParams = Record<string, string | number>;

function lookup(dict: Dictionary, key: string): string {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    node = (node as Record<string, unknown> | undefined)?.[part];
  }
  return typeof node === 'string' ? node : key;
}

function interpolate(text: string, params?: TParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

export function translate(locale: Locale, key: TKey, params?: TParams): string {
  return interpolate(lookup(DICTIONARIES[locale], key), params);
}

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return code === 'es' ? 'es' : 'en';
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey, params?: TParams) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children, initial }: { children: ReactNode; initial?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initial ?? deviceLocale);
  const t = useCallback((key: TKey, params?: TParams) => translate(locale, key, params), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Shorthand for components that only need `t`. */
export function useT() {
  return useI18n().t;
}

/** Join zone names naturally: "los ojos y las mejillas" / "your eyes and your cheeks". */
export function joinList(items: string[], joiner: string): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')}${joiner}${items[items.length - 1]}`;
}
