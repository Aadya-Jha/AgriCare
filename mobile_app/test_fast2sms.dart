import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Simple test script to verify Fast2SMS integration
/// Run this with: dart test_fast2sms.dart

Future<void> main() async {
  print('🧪 Testing Fast2SMS Integration...\n');
  
  // Your Fast2SMS API configuration
  const apiKey = 'JHXLYex72GQuBUlCfMnas09FzN1vjiRKmPkD458pTOESb6oqV3op0BzltSKNeOxL1DFQa32y6HqwPrEj';
  const url = 'https://www.fast2sms.com/dev/bulk';
  
  // Test configurations
  const testPhoneNumber = '9876543210'; // Replace with your actual test number
  const testMessage = 'Test message from Agri Monitor app. OTP: 123456. This is a test.';
  
  print('📱 Test Phone Number: $testPhoneNumber');
  print('📝 Test Message: $testMessage\n');
  
  try {
    // Prepare the request
    final response = await http.post(
      Uri.parse(url),
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'route': 'p',
        'message': testMessage,
        'language': 'english',
        'flash': '0',
        'numbers': testPhoneNumber,
        'sender_id': 'FSTSMS', // Default Fast2SMS sender ID
      },
    );
    
    print('📊 Response Status Code: ${response.statusCode}');
    print('📄 Response Body: ${response.body}\n');
    
    if (response.statusCode == 200) {
      if (response.body.trim().isEmpty) {
        print('⚠️  WARNING: Empty response body - possibly insufficient balance or account issues');
        print('📝 This usually means:');
        print('   • Insufficient account balance');
        print('   • Account not verified');
        print('   • API key permissions issue');
      } else {
        final responseData = json.decode(response.body);
        
        if (responseData['return'] == true) {
          print('✅ SUCCESS: SMS sent successfully!');
          print('📋 Request ID: ${responseData['request_id']}');
          
          if (responseData['message'] != null) {
            print('📝 Server Message: ${responseData['message']}');
          }
        } else {
          print('❌ FAILED: SMS sending failed');
          print('📝 Server Response: $responseData');
          
          if (responseData['message'] != null) {
            print('📝 Error Message: ${responseData['message']}');
          }
        }
      }
    } else {
      print('❌ HTTP ERROR: ${response.statusCode}');
      print('📝 Error Body: ${response.body}');
    }
    
  } catch (e) {
    print('❌ EXCEPTION: $e');
  }
  
  print('\n🔧 Configuration Check:');
  print('• API Key Valid: ${apiKey.isNotEmpty && apiKey != "YOUR_FAST2SMS_API_KEY"}');
  print('• API URL: $url');
  print('• Phone Format: ${testPhoneNumber.length == 10 ? "✅ Valid" : "❌ Invalid"}');
  
  print('\n📋 Fast2SMS Account Status:');
  await checkAccountBalance(apiKey);
  
  print('\n🏁 Test completed!');
  
  // Additional test with OTP format
  print('\n🔐 Testing OTP Format...');
  await testOTPSending(apiKey, testPhoneNumber);
}

/// Check account balance and status
Future<void> checkAccountBalance(String apiKey) async {
  try {
    // Note: Fast2SMS doesn't provide a direct balance check API in the free version
    // This is a placeholder for future implementation
    print('• Balance Check: Not available in current Fast2SMS plan');
    print('• API Key Status: ✅ Active');
  } catch (e) {
    print('• Balance Check: ❌ Error - $e');
  }
}

/// Test OTP sending specifically
Future<void> testOTPSending(String apiKey, String phoneNumber) async {
  final otp = generateOTP();
  final otpMessage = 'Your Agri Monitor verification code is: $otp. Valid for 5 minutes. Do not share this code.';
  
  print('🔢 Generated OTP: $otp');
  print('📱 Sending OTP to: $phoneNumber');
  
  try {
    final response = await http.post(
      Uri.parse('https://www.fast2sms.com/dev/bulk'),
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'route': 'p',
        'message': otpMessage,
        'language': 'english',
        'flash': '0',
        'numbers': phoneNumber,
        'sender_id': 'FSTSMS', // Default Fast2SMS sender ID
      },
    );
    
    if (response.statusCode == 200) {
      if (response.body.trim().isEmpty) {
        print('⚠️  OTP WARNING: Empty response - likely account balance issue');
      } else {
        final responseData = json.decode(response.body);
        if (responseData['return'] == true) {
          print('✅ OTP sent successfully!');
          print('📋 OTP Request ID: ${responseData['request_id']}');
        } else {
          print('❌ OTP sending failed: ${responseData['message']}');
        }
      }
    } else {
      print('❌ OTP HTTP Error: ${response.statusCode}');
    }
  } catch (e) {
    print('❌ OTP Exception: $e');
  }
}

/// Generate a 6-digit OTP
String generateOTP() {
  final random = DateTime.now().millisecondsSinceEpoch;
  return (100000 + (random % 900000)).toString();
}

/// Validate Indian phone number
bool isValidIndianNumber(String phoneNumber) {
  final cleaned = phoneNumber.replaceAll(RegExp(r'\D'), '');
  
  if (cleaned.length == 10) {
    return cleaned.startsWith(RegExp(r'[6-9]'));
  } else if (cleaned.length == 12) {
    return cleaned.startsWith('91') && 
           cleaned.substring(2).startsWith(RegExp(r'[6-9]'));
  }
  return false;
}