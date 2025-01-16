import * as t from 'io-ts';

/**
 * IPv4 Regex
 */
const IPv4SegmentFormat =
  '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])';
const IPv4AddressFormat = `(${IPv4SegmentFormat}\\.){3}${IPv4SegmentFormat}`;
const IPv4Regex = new RegExp(`^${IPv4AddressFormat}$`);

/**
 * IPv6 Regex
 */
const IPv6SegmentFormat = '(?:[0-9a-fA-F]{1,4})';
const IPv6Regex = new RegExp(
  '^(' +
    `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
    `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
    `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
    `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
    `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
    `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
    `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
    `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
    ')(%[0-9a-zA-Z-.:]{1,})?$',
);

/**
 * @since 0.0.6
 */
export interface IPv4Brand {
  readonly IPv4: unique symbol;
}

/**
 * @since 0.0.6
 */
export type IPv4 = t.Branded<string, IPv4Brand>;

/**
 * @since 0.0.6
 */
export interface IPv4C extends t.Type<IPv4, string, unknown> {}

/**
 * @since 0.0.6
 */
export const IPv4: IPv4C = t.brand(
  t.string,
  (s): s is IPv4 => IPv4Regex.test(s),
  'IPv4',
);

/**
 * @since 0.0.6
 */
export interface IPv6Brand {
  readonly IPv6: unique symbol;
}

/**
 * @since 0.0.6
 */
export type IPv6 = t.Branded<string, IPv6Brand>;

/**
 * @since 0.0.6
 */
export interface IPv6C extends t.Type<IPv6, string, unknown> {}

/**
 * @since 0.0.6
 */
export const IPv6: IPv6C = t.brand(
  t.string,
  (s): s is IPv6 => IPv6Regex.test(s),
  'IPv6',
);

/**
 * @since 0.0.6
 */
export interface IPBrand {
  readonly IP: unique symbol;
}

/**
 * @since 0.0.6
 */
export type IP = t.Branded<string, IPBrand>;

/**
 * @since 0.0.6
 */
export interface IPC extends t.Type<IP, string, unknown> {}

/**
 * @since 0.0.6
 */
export const IP: IPC = t.brand(
  t.string,
  (s): s is IP => IPv4Regex.test(s) || IPv6Regex.test(s),
  'IP',
);
