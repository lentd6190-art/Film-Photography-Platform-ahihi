import 'package:flutter/material.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  static const Color background = Color(0xFFF7F1E9);
  static const Color darkBrown = Color(0xFF49352B);
  static const Color orange = Color(0xFFFF6500);
  static const Color mutedBrown = Color(0xFF8A8178);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 18,
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          Navigator.pushReplacementNamed(context, '/login');
                        },
                        icon: const Icon(Icons.arrow_back),
                        color: darkBrown,
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Forgot password',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: darkBrown,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),

                  // Brand
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: orange,
                          borderRadius: BorderRadius.circular(13),
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          'F',
                          style: TextStyle(
                            fontSize: 25,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'FILM. STUDIO',
                        style: TextStyle(
                          color: darkBrown,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  const Text(
                    'Khôi phục mật khẩu',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: darkBrown,
                    ),
                  ),

                  const SizedBox(height: 12),

                  const Text(
                    'Nhập email của bạn để nhận hướng dẫn '
                    'đặt lại mật khẩu.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: mutedBrown,
                      height: 1.6,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Form card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: const Color(0xFFEAE2D9),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Email',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: darkBrown,
                          ),
                        ),

                        const SizedBox(height: 8),

                        TextField(
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            hintText: 'Nhập email của bạn',
                            hintStyle: const TextStyle(
                              color: Color(0xFFAAA39B),
                              fontSize: 14,
                            ),
                            filled: true,
                            fillColor: const Color(0xFFFCFBFA),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 16,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Color(0xFFE3DED8),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Color(0xFFE3DED8),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: orange,
                                width: 1.4,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        SizedBox(
                          height: 52,
                          child: FilledButton(
                            onPressed: () {},
                            style: FilledButton.styleFrom(
                              backgroundColor: orange,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Gửi hướng dẫn đặt lại mật khẩu',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 18),

                        Center(
                          child: TextButton(
                            onPressed: () {
                              Navigator.pushReplacementNamed(
                                context,
                                '/login',
                              );
                            },
                            style: TextButton.styleFrom(
                              foregroundColor: orange,
                            ),
                            child: const Text(
                              'Quay lại đăng nhập',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  const Text(
                    'FILM PHOTOGRAPHY PLATFORM',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFFAAA39B),
                      letterSpacing: 1.5,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}