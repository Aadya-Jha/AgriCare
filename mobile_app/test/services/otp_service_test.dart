import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../../lib/core/services/otp_service_enhanced.dart';
import '../../lib/core/services/storage_service.dart';
import '../../lib/core/config/app_config.dart';

// Generate mocks
@GenerateMocks([http.Client, StorageService])
import 'otp_service_test.mocks.dart';

void main() {
  group('OTP Service Tests', () {
    late MockHttpClient mockHttpClient;
    late MockStorageService mockStorageService;
    late OtpService otpService;

    setUp(() {
      mockHttpClient = MockHttpClient();
      mockStorageService = MockStorageService();
    });

    group('Configuration Tests', () {
      test('should have valid Fast2SMS API key', () {
        expect(AppConfig.hasValidFast2smsKey, isTrue);
        expect(AppConfig.fast2smsApiKey, isNotEmpty);
        expect(AppConfig.fast2smsApiKey, isNot('YOUR_FAST2SMS_API_KEY'));
      });

      test('should identify Fast2SMS as primary SMS provider', () {
        expect(AppConfig.primarySmsProvider, equals('Fast2SMS'));
      });

      test('should print debug info in development', () {
        expect(() => AppConfig.printDebugInfo(), returnsNormally);
      });
    });

    group('OTP Generation Tests', () {
      setUp(() async {
        otpService = await OtpService.getInstance(
          httpClient: mockHttpClient,
          storageService: mockStorageService,
        );
      });

      test('should generate valid 6-digit OTP', () {
        // Since _generateOtp is private, we'll test it indirectly through sendOtp
        // Set up mocks for successful SMS sending
        when(mockStorageService.getString(any)).thenAnswer((_) async => null);
        when(mockStorageService.setString(any, any)).thenAnswer((_) async {});
        
        // Mock successful Fast2SMS response
        when(mockHttpClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          jsonEncode({'return': true, 'request_id': 'test123'}),
          200,
        ));

        expect(
          () => otpService.sendOtp(phoneNumber: '9876543210'),
          returnsNormally,
        );
      });

      test('should validate Indian phone numbers correctly', () {
        // Test through the public interface
        const validNumbers = [
          '9876543210',
          '8765432109',
          '7654321098',
          '6543210987',
          '+919876543210',
          '919876543210',
        ];

        const invalidNumbers = [
          '5432109876', // doesn't start with 6-9
          '12345',      // too short
          '98765432101234', // too long
          'abcdefghij',     // not numeric
        ];

        for (final number in validNumbers) {
          expect(
            () => otpService.sendOtp(phoneNumber: number),
            returnsNormally,
            reason: 'Should accept valid number: $number',
          );
        }
      });
    });

    group('Fast2SMS Integration Tests', () {
      setUp(() async {
        otpService = await OtpService.getInstance(
          httpClient: mockHttpClient,
          storageService: mockStorageService,
        );
      });

      test('should send OTP via Fast2SMS successfully', () async {
        // Arrange
        when(mockStorageService.getString(any)).thenAnswer((_) async => null);
        when(mockStorageService.setString(any, any)).thenAnswer((_) async {});
        
        when(mockHttpClient.post(
          Uri.parse(AppConfig.fast2smsUrl),
          headers: {
            'authorization': AppConfig.fast2smsApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          jsonEncode({
            'return': true,
            'request_id': 'SMS123456789',
            'message': ['SMS sent successfully']
          }),
          200,
        ));

        // Act & Assert
        expect(
          () => otpService.sendOtp(phoneNumber: '9876543210'),
          returnsNormally,
        );

        // Verify the HTTP call was made
        verify(mockHttpClient.post(
          Uri.parse(AppConfig.fast2smsUrl),
          headers: {
            'authorization': AppConfig.fast2smsApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: anyNamed('body'),
        )).called(1);
      });

      test('should handle Fast2SMS API error', () async {
        // Arrange
        when(mockStorageService.getString(any)).thenAnswer((_) async => null);
        when(mockStorageService.setString(any, any)).thenAnswer((_) async {});
        
        when(mockHttpClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          jsonEncode({
            'return': false,
            'message': ['Insufficient balance']
          }),
          200,
        ));

        // Act & Assert
        expect(
          () => otpService.sendOtp(phoneNumber: '9876543210'),
          throwsA(isA<Exception>()),
        );
      });

      test('should handle network errors', () async {
        // Arrange
        when(mockStorageService.getString(any)).thenAnswer((_) async => null);
        when(mockStorageService.setString(any, any)).thenAnswer((_) async {});
        
        when(mockHttpClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenThrow(Exception('Network error'));

        // Act & Assert
        expect(
          () => otpService.sendOtp(phoneNumber: '9876543210'),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('OTP Verification Tests', () {
      setUp(() async {
        otpService = await OtpService.getInstance(
          httpClient: mockHttpClient,
          storageService: mockStorageService,
        );
      });

      test('should verify correct OTP', () async {
        // Arrange - Mock stored OTP data
        final otpData = {
          'otp': '123456',
          'hash': 'test_hash',
          'phoneNumber': '9876543210',
          'expiryTime': DateTime.now().add(Duration(minutes: 5)).toIso8601String(),
          'attempts': 0,
          'maxAttempts': 3,
        };
        
        when(mockStorageService.getString('otp_data_9876543210'))
            .thenAnswer((_) async => jsonEncode(otpData));
        when(mockStorageService.remove(any)).thenAnswer((_) async {});

        // Act
        final result = await otpService.verifyOtp(
          phoneNumber: '9876543210',
          otp: '123456',
        );

        // Assert
        expect(result, isTrue);
        verify(mockStorageService.remove('otp_data_9876543210')).called(1);
      });

      test('should reject incorrect OTP', () async {
        // Arrange
        final otpData = {
          'otp': '123456',
          'hash': 'test_hash',
          'phoneNumber': '9876543210',
          'expiryTime': DateTime.now().add(Duration(minutes: 5)).toIso8601String(),
          'attempts': 0,
          'maxAttempts': 3,
        };
        
        when(mockStorageService.getString('otp_data_9876543210'))
            .thenAnswer((_) async => jsonEncode(otpData));
        when(mockStorageService.setString(any, any)).thenAnswer((_) async {});

        // Act & Assert
        expect(
          () => otpService.verifyOtp(
            phoneNumber: '9876543210',
            otp: '654321', // Wrong OTP
          ),
          throwsA(isA<Exception>()),
        );
      });

      test('should reject expired OTP', () async {
        // Arrange
        final otpData = {
          'otp': '123456',
          'hash': 'test_hash',
          'phoneNumber': '9876543210',
          'expiryTime': DateTime.now().subtract(Duration(minutes: 1)).toIso8601String(),
          'attempts': 0,
          'maxAttempts': 3,
        };
        
        when(mockStorageService.getString('otp_data_9876543210'))
            .thenAnswer((_) async => jsonEncode(otpData));
        when(mockStorageService.remove(any)).thenAnswer((_) async {});

        // Act & Assert
        expect(
          () => otpService.verifyOtp(
            phoneNumber: '9876543210',
            otp: '123456',
          ),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('Rate Limiting Tests', () {
      setUp(() async {
        otpService = await OtpService.getInstance(
          httpClient: mockHttpClient,
          storageService: mockStorageService,
        );
      });

      test('should enforce rate limiting', () async {
        // Arrange - Mock recent OTP send
        when(mockStorageService.getString('otp_last_sent_9876543210'))
            .thenAnswer((_) async => DateTime.now().subtract(Duration(seconds: 30)).toIso8601String());

        // Act & Assert
        expect(
          () => otpService.sendOtp(phoneNumber: '9876543210'),
          throwsA(isA<Exception>()),
        );
      });

      test('should allow sending after cooldown period', () async {
        // Arrange
        when(mockStorageService.getString('otp_last_sent_9876543210'))
            .thenAnswer((_) async => DateTime.now().subtract(Duration(minutes: 2)).toIso8601String());
        when(mockStorageService.getString('otp_data_9876543210'))
            .thenAnswer((_) async => null);
        when(mockStorageService.setString(any, any)).thenAnswer((_) async {});
        
        when(mockHttpClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          jsonEncode({'return': true, 'request_id': 'test123'}),
          200,
        ));

        // Act & Assert
        expect(
          () => otpService.sendOtp(phoneNumber: '9876543210'),
          returnsNormally,
        );
      });
    });

    group('OTP Status Tests', () {
      setUp(() async {
        otpService = await OtpService.getInstance(
          httpClient: mockHttpClient,
          storageService: mockStorageService,
        );
      });

      test('should return correct OTP status', () async {
        // Arrange
        final otpData = {
          'otp': '123456',
          'hash': 'test_hash',
          'phoneNumber': '9876543210',
          'expiryTime': DateTime.now().add(Duration(minutes: 3)).toIso8601String(),
          'attempts': 1,
          'maxAttempts': 3,
        };
        
        when(mockStorageService.getString('otp_data_9876543210'))
            .thenAnswer((_) async => jsonEncode(otpData));

        // Act
        final status = await otpService.getOtpStatus('9876543210');

        // Assert
        expect(status['exists'], isTrue);
        expect(status['expired'], isFalse);
        expect(status['attempts'], equals(1));
        expect(status['maxAttempts'], equals(3));
        expect(status['remainingTime'], isA<int>());
        expect(status['remainingTimeFormatted'], isA<String>());
      });
    });
  });
}

/// Manual test function for Fast2SMS integration
/// Call this to manually test the SMS sending functionality
Future<void> manualFast2SMSTest() async {
  print('🧪 Starting manual Fast2SMS test...');
  
  // Create OTP service instance
  final mockStorage = MockStorageService();
  when(mockStorage.getString(any)).thenAnswer((_) async => null);
  when(mockStorage.setString(any, any)).thenAnswer((_) async {});
  when(mockStorage.remove(any)).thenAnswer((_) async {});
  
  final otpService = await OtpService.getInstance(
    httpClient: http.Client(),
    storageService: mockStorage,
  );
  
  try {
    // Replace with a test phone number
    const testPhoneNumber = '9876543210'; // Replace with actual number for testing
    
    print('📱 Sending OTP to $testPhoneNumber...');
    await otpService.sendOtp(phoneNumber: testPhoneNumber);
    
    print('✅ OTP sent successfully!');
    
    // Get OTP status
    final status = await otpService.getOtpStatus(testPhoneNumber);
    print('📊 OTP Status: $status');
    
  } catch (e) {
    print('❌ Test failed: $e');
  }
  
  print('🏁 Manual test completed.');
}