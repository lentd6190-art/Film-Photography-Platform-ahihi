import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/network/auth_interceptor.dart';
import 'package:mobile/core/storage/token_storage.dart';

// TokenStorage giả lập để không sử dụng bộ nhớ thật.
class FakeTokenStorage implements TokenStorage {
  String? accessToken;
  String? refreshToken;

  @override
  Future<String?> getAccessToken() async => accessToken;

  @override
  Future<String?> getRefreshToken() async => refreshToken;

  @override
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  @override
  Future<void> clearTokens() async {
    accessToken = null;
    refreshToken = null;
  }
}

// Adapter giả lập phản hồi từ server.
class FakeAdapter implements HttpClientAdapter {
  FakeAdapter(this.onFetch);

  final Future<ResponseBody> Function(RequestOptions options) onFetch;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) {
    return onFetch(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody fakeResponse(int statusCode, String body) {
  return ResponseBody.fromString(
    body,
    statusCode,
    headers: {
      Headers.contentTypeHeader: [Headers.jsonContentType],
    },
  );
}

void main() {
  group('AuthInterceptor', () {
    late FakeTokenStorage storage;
    late Dio dio;
    late Dio refreshDio;

    setUp(() {
      storage = FakeTokenStorage()
        ..accessToken = 'old-access-token'
        ..refreshToken = 'old-refresh-token';

      dio = Dio(BaseOptions(baseUrl: 'https://example.com'));
      refreshDio = Dio(BaseOptions(baseUrl: 'https://example.com'));

      dio.interceptors.add(
        AuthInterceptor(
          tokenStorage: storage,
          refreshDio: refreshDio,
          dio: dio,
        ),
      );
    });

    tearDown(() {
      dio.close();
      refreshDio.close();
    });

    test('adds access token to request header', () async {
      String? authorizationHeader;

      dio.httpClientAdapter = FakeAdapter((options) async {
        authorizationHeader = options.headers['Authorization'];

        return fakeResponse(200, '{"message":"Success"}');
      });

      await dio.get('/protected');

      expect(authorizationHeader, 'Bearer old-access-token');
    });

    test('refreshes token when request returns 401', () async {
      int refreshCalls = 0;

      dio.httpClientAdapter = FakeAdapter((options) async {
        final authorization = options.headers['Authorization'];

        if (authorization == 'Bearer new-access-token') {
          return fakeResponse(200, '{"message":"Success"}');
        }

        return fakeResponse(401, '{"message":"Unauthorized"}');
      });

      refreshDio.httpClientAdapter = FakeAdapter((options) async {
        refreshCalls++;

        return fakeResponse(
          200,
          jsonEncode({
            'accessToken': 'new-access-token',
            'refreshToken': 'new-refresh-token',
          }),
        );
      });

      final response = await dio.get('/protected');

      expect(response.statusCode, 200);
      expect(refreshCalls, 1);
      expect(storage.accessToken, 'new-access-token');
      expect(storage.refreshToken, 'new-refresh-token');
    });

    test('uses one refresh request for concurrent 401 responses', () async {
      var refreshCalls = 0;

      dio.httpClientAdapter = FakeAdapter((options) async {
        if (options.headers['Authorization'] == 'Bearer new-access-token') {
          return fakeResponse(200, '{"message":"Success"}');
        }

        return fakeResponse(401, '{"message":"Unauthorized"}');
      });

      refreshDio.httpClientAdapter = FakeAdapter((options) async {
        refreshCalls++;

        // Giả lập server mất một khoảng thời gian để refresh token.
        await Future<void>.delayed(const Duration(milliseconds: 100));

        return fakeResponse(
          200,
          jsonEncode({
            'accessToken': 'new-access-token',
            'refreshToken': 'new-refresh-token',
          }),
        );
      });

      final responses = await Future.wait([
        dio.get('/protected/1'),
        dio.get('/protected/2'),
        dio.get('/protected/3'),
      ]);

      expect(responses.length, 3);
      expect(responses.every((response) => response.statusCode == 200), isTrue);
      expect(refreshCalls, 1);
      expect(storage.accessToken, 'new-access-token');
    });

    test('clears tokens when refresh fails', () async {
      dio.httpClientAdapter = FakeAdapter((options) async {
        return fakeResponse(401, '{"message":"Unauthorized"}');
      });

      refreshDio.httpClientAdapter = FakeAdapter((options) async {
        return fakeResponse(401, '{"message":"Refresh failed"}');
      });

      await expectLater(dio.get('/protected'), throwsA(isA<DioException>()));

      expect(storage.accessToken, isNull);
      expect(storage.refreshToken, isNull);
    });
  });
}
