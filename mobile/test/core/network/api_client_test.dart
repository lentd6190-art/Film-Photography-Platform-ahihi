
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/network/api_client.dart';

void main() {
  group('ApiClient', () {
    test('configures base URL and timeouts', () {
      final apiClient = ApiClient(
        baseUrl: 'https://example.com/api',
      );

      expect(
        apiClient.dio.options.baseUrl,
        'https://example.com/api',
      );
      expect(
        apiClient.dio.options.connectTimeout,
        const Duration(seconds: 15),
      );
      expect(
        apiClient.dio.options.receiveTimeout,
        const Duration(seconds: 15),
      );
    });

    test('configures JSON headers', () {
      final apiClient = ApiClient(
        baseUrl: 'https://example.com/api',
      );

      expect(
        apiClient.dio.options.headers['Content-Type'],
        'application/json',
      );
      expect(
        apiClient.dio.options.headers['Accept'],
        'application/json',
      );
    });
  });
}
