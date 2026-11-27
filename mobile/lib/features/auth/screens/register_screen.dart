import 'package:flutter/material.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  static const Color background = Color(0xFFF7F1E9);
  static const Color darkBrown = Color(0xFF49352B);
  static const Color orange = Color(0xFFFF6500);
  static const Color mutedBrown = Color(0xFF8A8178);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
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
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.arrow_back),
                            color: darkBrown,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Create account',
                            style: TextStyle(
                              fontSize: 18,
                              color: darkBrown,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

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

                      const SizedBox(height: 24),

                      const Text(
                        'Tạo tài khoản',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                          color: darkBrown,
                        ),
                      ),

                      const SizedBox(height: 10),

                      const Text(
                        'Tham gia cộng đồng nhiếp ảnh film\n'
                        'và khám phá thế giới sáng tạo.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: mutedBrown,
                          height: 1.6,
                        ),
                      ),

                      const SizedBox(height: 28),

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
                            _field(
                              label: 'Họ và tên',
                              hint: 'Nhập họ và tên',
                            ),

                            const SizedBox(height: 18),

                            _field(
                              label: 'Email',
                              hint: 'Nhập email của bạn',
                              keyboardType: TextInputType.emailAddress,
                            ),

                            const SizedBox(height: 18),

                            _field(
                              label: 'Mật khẩu',
                              hint: 'Tạo mật khẩu',
                              obscureText: true,
                            ),

                            const SizedBox(height: 18),

                            _field(
                              label: 'Xác nhận mật khẩu',
                              hint: 'Nhập lại mật khẩu',
                              obscureText: true,
                            ),

                            const SizedBox(height: 28),

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
                                  'Tạo tài khoản',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 20),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Flexible(
                                  child: Text(
                                    'Đã có tài khoản?',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: mutedBrown,
                                    ),
                                  ),
                                ),
                                TextButton(
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
                                    'Đăng nhập',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

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
            );
          },
        ),
      ),
    );
  }

  static Widget _field({
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: darkBrown,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          keyboardType: keyboardType,
          obscureText: obscureText,
          decoration: InputDecoration(
            hintText: hint,
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
      ],
    );
  }
}