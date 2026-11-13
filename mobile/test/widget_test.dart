import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/app.dart';

void main() {
  testWidgets('App displays its title', (WidgetTester tester) async {
    await tester.pumpWidget(const FilmPhotographyApp());

    expect(find.text('Film Photography Platform'), findsOneWidget);
  });
}