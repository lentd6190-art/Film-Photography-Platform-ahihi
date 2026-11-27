import 'package:flutter/material.dart';

class LoginFormPanel extends StatelessWidget {
  const LoginFormPanel({super.key});

  static const Color darkBrown = Color(0xFF49352B);
  static const Color orange = Color(0xFFFF6500);
  static const Color muted = Color(0xFF8A8178);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Badge
        Align(
          alignment: Alignment.centerLeft,
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 5,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF1E8),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'WELCOME BACK',
              style: TextStyle(
                color: Color(0xFFD97745),
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ),

        const SizedBox(height: 16),

        const Text(
          'Đăng nhập',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: darkBrown,
          ),
        ),

        const SizedBox(height: 10),

        const Text(
          'Đăng nhập để tiếp tục khám phá Film Photography Platform.',
          style: TextStyle(
            fontSize: 12,
            color: muted,
            height: 1.6,
          ),
        ),

        const SizedBox(height: 30),

        // Email
        const Text(
          'Email',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: darkBrown,
          ),
        ),

        const SizedBox(height: 8),

        TextField(
          keyboardType: TextInputType.emailAddress,
          decoration: _inputDecoration('Nhập email của bạn'),
        ),

        const SizedBox(height: 20),

        // Password
        const Text(
          'Mật khẩu',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: darkBrown,
          ),
        ),

        const SizedBox(height: 8),

        TextField(
          obscureText: true,
          decoration: _inputDecoration('Nhập mật khẩu'),
        ),

        const SizedBox(height: 24),

        // Login button
        SizedBox(
          height: 48,
          child: FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              backgroundColor: orange,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Đăng nhập',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),

        const SizedBox(height: 18),

        // Guest
        SizedBox(
          height: 46,
          child: OutlinedButton(
            onPressed: () {
              Navigator.pushNamed(context, '/discovery');
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: darkBrown,
              side: const BorderSide(color: Color(0xFFE6DED5)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Khám phá với tư cách khách',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),

        const SizedBox(height: 22),

        // Forgot password and register
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Flexible(
              child: TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/forgot-password');
                },
                style: TextButton.styleFrom(
                  foregroundColor: orange,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
                child: const Text(
                  'Quên mật khẩu?',
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ),
            const Text(
              '|',
              style: TextStyle(color: Color(0xFFE6DED5)),
            ),
            Flexible(
              child: TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/register');
                },
                style: TextButton.styleFrom(
                  foregroundColor: orange,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
                child: const Text(
                  'Đăng ký',
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 20),

        const Center(
          child: Text(
            'Film Photography Platform  ·  Capture moments, keep stories.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              color: Color(0xFFAAA39B),
            ),
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        fontSize: 13,
        color: Color(0xFFAAA39B),
      ),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 14,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFE3DED8)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFE3DED8)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: orange, width: 1.3),
      ),
    );
  }
}