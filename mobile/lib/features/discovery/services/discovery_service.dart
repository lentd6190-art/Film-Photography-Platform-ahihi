import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';


class DiscoveryService {
  DiscoveryService()
      : _apiClient = ApiClient(
          baseUrl: 'http://localhost:5000/api/resource',
          tokenStorage: TokenStorage(),
        );

  final ApiClient _apiClient;

  Future<List<Map<String, dynamic>>> getCreativeSpaces() async {
    final response = await _apiClient.dio.get(
      '/resources/CREATIVE_SPACE',
      queryParameters: {
        'page': 0,
        'size': 50,
      },
    );

    final responseData = response.data;

    if (responseData is! Map<String, dynamic>) {
      throw Exception('Invalid API response format');
    }

    final data = responseData['data'];

    if (data is! List) {
      throw Exception('Invalid creative spaces data');
    }

    return data
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }
}