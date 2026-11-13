import 'package:dio/dio.dart';

import '../storage/token_storage.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required this._tokenStorage,
    required this._refreshDio,
    required this._dio,
  });

  final TokenStorage _tokenStorage;
  final Dio _refreshDio;
  final Dio _dio;

  Future<String>? _refreshingFuture;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Request refresh không cần access token.
    if (options.extra['skipAuth'] == true) {
      handler.next(options);
      return;
    }

    final accessToken = await _tokenStorage.getAccessToken();

    if (accessToken != null && accessToken.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final request = err.requestOptions;

    final isUnauthorized = err.response?.statusCode == 401;
    final skipAuth = request.extra['skipAuth'] == true;
    final alreadyRetried = request.extra['retried'] == true;

    if (!isUnauthorized || skipAuth || alreadyRetried) {
      handler.next(err);
      return;
    }

    try {
      final newAccessToken = await (_refreshingFuture ??=
          _refreshAccessToken());

      request.headers['Authorization'] = 'Bearer $newAccessToken';
      request.extra['retried'] = true;

      final response = await _dio.fetch<dynamic>(request);
      handler.resolve(response);
    } catch (_) {
      handler.next(err);
    }
  }

  Future<String> _refreshAccessToken() async {
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();

      if (refreshToken == null || refreshToken.isEmpty) {
        throw StateError('Refresh token is missing.');
      }

      final response = await _refreshDio.post<dynamic>(
        '/api/v1/auth/refresh-token',
        data: {'refreshToken': refreshToken},
        options: Options(extra: {'skipAuth': true}),
      );

      final data = Map<String, dynamic>.from(response.data as Map);
      final newAccessToken = data['accessToken'] as String;
      final newRefreshToken = data['refreshToken'] as String;

      await _tokenStorage.saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );

      return newAccessToken;
    } catch (_) {
      await _tokenStorage.clearTokens();
      rethrow;
    } finally {
      _refreshingFuture = null;
    }
  }
}
