import 'package:flutter/material.dart';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  final TextEditingController _searchController = TextEditingController();

  // Data mẫu, sau này sẽ thay bằng API Resource Service.
  final List<Map<String, dynamic>> _spaces = [
  {
    'name': 'Saigon Film Lab',
    'type': 'Darkroom',
    'location': 'Ho Chi Minh City',
    'price': 150000,
    'style': 'Vintage',
    'capacity': 5,
    'equipment': ['Film scanner', 'Darkroom enlarger'],
    'amenities': ['Wi-Fi', 'Air conditioning'],
  },
  {
    'name': 'Vintage Studio',
    'type': 'Photography Studio',
    'location': 'Ho Chi Minh City',
    'price': 300000,
    'style': 'Retro',
    'capacity': 10,
    'equipment': ['Camera', 'Lighting'],
    'amenities': ['Wi-Fi', 'Parking'],
  },
  {
    'name': 'Analog Corner',
    'type': 'Darkroom',
    'location': 'Da Nang',
    'price': 100000,
    'style': 'Minimalist',
    'capacity': 3,
    'equipment': ['Film scanner'],
    'amenities': ['Air conditioning'],
  },
];

  String _searchQuery = '';
  String? _selectedLocation;
  int? _maxPrice;
  String? _selectedStyle;
  int? _minCapacity;

  List<Map<String, dynamic>> get _filteredSpaces {
    return _spaces.where((space) {
      final name = space['name']!.toLowerCase();
      final type = space['type']!.toLowerCase();
      final location = space['location']!.toLowerCase();
      final query = _searchQuery.toLowerCase();

      final matchesSearch = name.contains(query) ||
          type.contains(query) ||
          location.contains(query);

      final matchesLocation = _selectedLocation == null ||
        space['location'] == _selectedLocation;

      final price = space['price'] as int;

      final matchesPrice = _maxPrice == null || price <= _maxPrice!;

      final matchesStyle = _selectedStyle == null ||
        space['style'] == _selectedStyle;

      final matchesCapacity = _minCapacity == null ||
        space['capacity'] >= _minCapacity!;

      return matchesSearch &&
        matchesLocation &&
        matchesPrice &&
        matchesStyle &&
        matchesCapacity;
    }).toList();
  }

    void _showMoreFilters() {
        showModalBottomSheet(
          context: context,
          builder: (context) {
            return SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'More Filters',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.palette_outlined),
                    title: const Text('Artistic Style'),
                    subtitle: Text(_selectedStyle ?? 'Any style'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.pop(context);
                      _showStyleFilter();
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.people_outline),
                    title: const Text('Capacity'),
                    subtitle: Text(
                    _minCapacity == null
                        ? 'Any capacity'
                        : '${_minCapacity!}+ people',
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.pop(context);
                      _showCapacityFilter();
                    },
                  ),
                ],
              ),
            );
          },
        );
      }
    void _showCapacityFilter() {
      final options = [2, 3, 5, 10];

      showModalBottomSheet(
        context: context,
        builder: (context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Minimum Capacity',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                ListTile(
                  title: const Text('Any capacity'),
                  trailing: _minCapacity == null
                      ? const Icon(Icons.check)
                      : null,
                  onTap: () {
                    setState(() {
                      _minCapacity = null;
                    });
                    Navigator.pop(context);
                  },
                ),
                ...options.map((capacity) {
                  return ListTile(
                    title: Text('$capacity people or more'),
                    trailing: _minCapacity == capacity
                        ? const Icon(Icons.check)
                        : null,
                    onTap: () {
                      setState(() {
                        _minCapacity = capacity;
                      });
                      Navigator.pop(context);
                    },
                  );
                }),
              ],
            ),
          );
        },
      );
    }

    void _showStyleFilter() {
      final styles = _spaces
          .map((space) => space['style'] as String)
          .toSet()
          .toList();

      showModalBottomSheet(
        context: context,
        builder: (context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Select Artistic Style',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                ListTile(
                  title: const Text('All styles'),
                  trailing: _selectedStyle == null
                      ? const Icon(Icons.check)
                      : null,
                  onTap: () {
                    setState(() {
                      _selectedStyle = null;
                    });
                    Navigator.pop(context);
                  },
                ),
                ...styles.map((style) {
                  return ListTile(
                    title: Text(style),
                    trailing: _selectedStyle == style
                        ? const Icon(Icons.check)
                        : null,
                    onTap: () {
                      setState(() {
                        _selectedStyle = style;
                        });
                      Navigator.pop(context);
                    },
                  );
                }),
              ],
            ),
          );
        },
      );
    }

    void _showPriceFilter() {
      final options = [100000, 150000, 200000, 300000];

      showModalBottomSheet(
        context: context,
        builder: (context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Maximum Price (per hour)',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ListTile(
              title: const Text('All prices'),
              trailing: _maxPrice == null
                  ? const Icon(Icons.check)
                  : null,
              onTap: () {
                setState(() {
                  _maxPrice = null;
                });
                Navigator.pop(context);
              },
            ),
            ...options.map((price) {
              return ListTile(
                title: Text('${price ~/ 1000}K VND/hour'),
                trailing: _maxPrice == price
                    ? const Icon(Icons.check)
                    : null,
                onTap: () {
                  setState(() {
                    _maxPrice = price;
                  });
                  Navigator.pop(context);
                },
              );
            }),
          ],
        ),
      );
    },
  );
}
    void _showLocationFilter() {
    final locations = _spaces
        .map((space) => space['location']!)
        .toSet()
        .toList();

    showModalBottomSheet(
     context: context,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Select Location',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                 ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.public),
                title: const Text('All locations'),
                trailing: _selectedLocation == null
                    ? const Icon(Icons.check)
                    : null,
                onTap: () {
                  setState(() {
                    _selectedLocation = null;
                  });
                  Navigator.pop(context);
                },
              ),
              ...locations.map((location) {
                return ListTile(
                  leading: const Icon(Icons.location_on_outlined),
                  title: Text(location),
                  trailing: _selectedLocation == location
                      ? const Icon(Icons.check)
                      : null,
                  onTap: () {
                    setState(() {
                      _selectedLocation = location;
                    });
                   Navigator.pop(context);
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final spaces = _filteredSpaces;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F7F4),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF8F7F4),
        elevation: 0,
        title: const Text(
          'Discover',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _searchQuery = value.trim();
                });
              },
              decoration: InputDecoration(
                hintText: 'Search studios, darkrooms...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                FilterChip(
                  label: Text(_selectedLocation ?? 'Location'),
                  avatar: const Icon(Icons.location_on_outlined),
                  selected: _selectedLocation != null,
                  onSelected: (_) {
                  _showLocationFilter();
                },
              ),
                const SizedBox(width: 8),
                FilterChip(
                  label: Text(
                  _maxPrice == null ? 'Price' : '≤ ${_maxPrice! ~/ 1000}K',
                ),
                  avatar: const Icon(Icons.payments_outlined),
                  selected: _maxPrice != null,
                  onSelected: (_) {
                  _showPriceFilter();
                },
              ),
                const SizedBox(width: 8),
                FilterChip(
                  label: Text(
                    _selectedStyle != null
                        ? _selectedStyle!
                        : _minCapacity != null
                            ? '$_minCapacity+ people'
                            : 'More',
                  ),
                  avatar: const Icon(Icons.tune),
                  selected: _selectedStyle != null || _minCapacity != null,
                  onSelected: (_) {
                    _showMoreFilters();
                  },
                ),
                ],
              ),

            const SizedBox(height: 24),

            const Text(
              'Creative Spaces',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            Expanded(
              child: spaces.isEmpty
                  ? const Center(
                      child: Text('No creative spaces found'),
                    )
                  : ListView.builder(
                      itemCount: spaces.length,
                      itemBuilder: (context, index) {
                        final space = spaces[index];

                        return Card(
                          color: Colors.white,
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFE8DCD2),
                              child: Icon(
                                Icons.camera_alt_outlined,
                                color: Color(0xFF795548),
                              ),
                            ),
                            title: Text(
                              space['name']!,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Text(
                              '${space['type']} • ${space['location']}',
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}