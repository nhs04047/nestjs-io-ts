import { IP, IPv4, IPv6 } from '../../src/extends';

describe('IP codec test suit', () => {
  describe('IPv4 codec test suit', () => {
    test('should validate valid IPv4 addresses', () => {
      const validIPv4Addresses = [
        '192.168.0.1',
        '127.0.0.1',
        '255.255.255.255',
        '0.0.0.0',
      ];

      validIPv4Addresses.forEach((address) => {
        const result = IPv4.decode(address);
        expect(result._tag).toBe('Right');
      });
    });

    test('should invalidate invalid IPv4 addresses', () => {
      const invalidIPv4Addresses = [
        '256.256.256.256',
        '192.168.0.256',
        '1234.123.123.123',
        '192.168.0',
        'abc.def.ghi.jkl',
      ];

      invalidIPv4Addresses.forEach((address) => {
        const result = IPv4.decode(address);
        expect(result._tag).toBe('Left');
      });
    });
  });

  describe('IPv6 codec test suit', () => {
    test('should validate valid IPv6 addresses', () => {
      const validIPv6Addresses = [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '::1',
        'fe80::1',
        '2001:db8::ff00:42:8329',
      ];

      validIPv6Addresses.forEach((address) => {
        const result = IPv6.decode(address);
        expect(result._tag).toBe('Right');
      });
    });

    test('should invalidate invalid IPv6 addresses', () => {
      const invalidIPv6Addresses = [
        '2001:db8:85a3::8a2e:370g:7334', // Invalid character
        '12345::', // Segment too large
        '2001:db8:::1', // Too many colons
        '::1::', // Invalid placement of colons
        'abcd', // Too short
      ];

      invalidIPv6Addresses.forEach((address) => {
        const result = IPv6.decode(address);
        expect(result._tag).toBe('Left');
      });
    });
  });

  describe('IP codec test suit', () => {
    test('should validate both IPv4 and IPv6 addresses', () => {
      const validIPs = [
        '192.168.0.1', // Valid IPv4
        '2001:db8::1', // Valid IPv6
        '127.0.0.1', // Valid IPv4
        '::1', // Valid IPv6
      ];

      validIPs.forEach((address) => {
        const result = IP.decode(address);
        expect(result._tag).toBe('Right');
      });
    });

    test('should invalidate invalid IP addresses', () => {
      const invalidIPs = [
        '256.256.256.256',
        'abcd',
        '192.168.0.256',
        '2001:db8:::1',
        '::1::',
      ];

      invalidIPs.forEach((address) => {
        const result = IP.decode(address);
        expect(result._tag).toBe('Left');
      });
    });
  });
});
