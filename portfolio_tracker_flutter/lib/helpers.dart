import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:portfolio_tracker_flutter/models/company.dart';
import 'package:logger/logger.dart';

final Logger _logger = Logger();

const String apiKey = String.fromEnvironment('APP_API_KEY');

Future<Company?> fetchCompanyData(String url) async {
  try {
    if (apiKey.isEmpty) {
      _logger.e('API Key is missing');
      throw Exception('API Key is missing');
    }

    final headers = {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    };

    final response = await http.get(Uri.parse(url), headers: headers);

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      return Company.fromJson(data);
    } else if (response.statusCode == 401) {
      _logger.e('Unauthorized: Invalid API Key');
      throw Exception('Unauthorized: Invalid API Key');
    } else if (response.statusCode == 404) {
      _logger.e('Company not found: 404');
      throw Exception('Company not found');
    } else {
      _logger.e('Failed to load company data: ${response.statusCode}');
      throw Exception('Failed to load company data');
    }
  } catch (e, stackTrace) {
    _logger.e('Error fetching company data: $e');
    return null;
  }
}
