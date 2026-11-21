import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';

class AuthService {
  AuthService({required ApiClient apiClient, required this._tokenStorage})
    : _dio = apiClient.dio;
  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/api/v1/auth/login',
      data: {'email': email, 'password': password},
    );

    final data = Map<String, dynamic>.from(response.data as Map);

    await _tokenStorage.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String?,
    );

    return data;
  }

  Future<String> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final response = await _dio.post(
      '/api/v1/auth/register',
      data: {'email': email, 'password': password, 'fullName': fullName},
    );

    return response.data.toString();
  }

  Future<Map<String, dynamic>> refreshToken() async {
    final oldRefreshToken = await _tokenStorage.getRefreshToken();

    if (oldRefreshToken == null || oldRefreshToken.isEmpty) {
      throw StateError('Refresh token is missing. Please log in again.');
    }

    final response = await _dio.post(
      '/api/v1/auth/refresh-token',
      data: {'refreshToken': oldRefreshToken},
    );

    final data = Map<String, dynamic>.from(response.data as Map);

    await _tokenStorage.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String?,
    );

    return data;
  }

  Future<void> logout() async {
    await _tokenStorage.clearTokens();
  }
}
