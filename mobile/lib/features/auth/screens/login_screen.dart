import 'package:flutter/material.dart';
import '../widgets/login_form_panel.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  static const Color background = Color(0xFFF7F1E9);
  static const Color darkBrown = Color(0xFF49352B);
  static const Color orange = Color(0xFFFF6500);
  static const Color cream = Color(0xFFF8F4EE);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 800;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1100),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.06),
                          blurRadius: 35,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: isWide
                        ? SizedBox(
                            height: 560,
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 5,
                                  child: _buildBrandPanel(),
                                ),
                                Expanded(
                                  flex: 5,
                                  child: _buildFormPanel(),
                                ),
                              ],
                            ),
                          )
                        : Column(
                            children: [
                              _buildMobileBrand(),
                              Padding(
                                padding: const EdgeInsets.all(28),
                                child: ConstrainedBox(
                                  constraints: const BoxConstraints(
                                    maxWidth: 460,
                                  ),
                                  child: const LoginFormPanel(),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildBrandPanel() {
    return Stack(
      clipBehavior: Clip.hardEdge,
      children: [
        Container(
          color: darkBrown,
          padding: const EdgeInsets.all(32),
        ),

        // Decorative circles
        Positioned(
          top: -100,
          right: -90,
          child: Container(
            width: 260,
            height: 260,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.035),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.03),
                width: 35,
              ),
            ),
          ),
        ),

        Positioned(
          bottom: -100,
          left: -80,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFF95632F).withValues(alpha: 0.55),
                width: 35,
              ),
            ),
          ),
        ),

        Positioned(
          bottom: -60,
          left: -40,
          child: Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.025),
            ),
          ),
        ),

        Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: orange,
                      borderRadius: BorderRadius.circular(11),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'F',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'FILM. STUDIO',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 34),

              const Text(
                'FILM PHOTOGRAPHY PLATFORM',
                style: TextStyle(
                  color: Color(0xFFE8A16A),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),

              const SizedBox(height: 18),

              const Text(
                'Lưu giữ khoảnh khắc,\ntheo cách của riêng bạn.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  height: 1.25,
                ),
              ),

              const SizedBox(height: 18),

              const Text(
                'Không gian kết nối cộng đồng nhiếp ảnh film, '
                'nhà cung cấp dịch vụ và những người yêu thích nghệ thuật hình ảnh.',
                style: TextStyle(
                  color: Color(0xFFD7C7B9),
                  fontSize: 13,
                  height: 1.8,
                ),
              ),

              const Spacer(),

              Row(
                children: [
                  Container(
                    width: 26,
                    height: 4,
                    decoration: BoxDecoration(
                      color: orange,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(width: 6),
                  _indicator(),
                  const SizedBox(width: 6),
                  _indicator(),
                ],
              ),

              const SizedBox(height: 12),

              const Text(
                'Capture moments. Keep stories.',
                style: TextStyle(
                  color: Color(0xFFD0BDAE),
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _indicator() {
    return Container(
      width: 9,
      height: 4,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(10),
      ),
    );
  }

  Widget _buildFormPanel() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 44, vertical: 40),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: const LoginFormPanel(),
        ),
      ),
    );
  }

  Widget _buildMobileBrand() {
    return Stack(
      clipBehavior: Clip.hardEdge,
      children: [
        Container(
          width: double.infinity,
          color: darkBrown,
          padding: const EdgeInsets.all(28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: orange,
                      borderRadius: BorderRadius.circular(11),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'F',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'FILM. STUDIO',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 26),
              const Text(
                'FILM PHOTOGRAPHY PLATFORM',
                style: TextStyle(
                  color: Color(0xFFE8A16A),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Lưu giữ khoảnh khắc,\ntheo cách của riêng bạn.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Không gian kết nối cộng đồng nhiếp ảnh film.',
                style: TextStyle(
                  color: Color(0xFFD7C7B9),
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}