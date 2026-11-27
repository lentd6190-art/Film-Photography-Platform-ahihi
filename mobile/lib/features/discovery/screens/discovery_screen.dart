import 'package:flutter/material.dart';
import '../services/discovery_service.dart';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  final TextEditingController _searchController = TextEditingController();

  final DiscoveryService _discoveryService = DiscoveryService();

  List<Map<String, dynamic>> _spaces = [];

  bool _isLoading = true;
  String? _errorMessage;

  String _searchQuery = '';
  String? _selectedLocation;
  int? _maxPrice;
  String? _selectedStyle;
  int? _minCapacity;

  @override
    void initState() {
      super.initState();
      _loadCreativeSpaces();
  }

  Future<void> _loadCreativeSpaces() async {
    try {
      final spaces = await _discoveryService.getCreativeSpaces();

      if (!mounted) return;

      setState(() {
        _spaces = spaces;
        _isLoading = false;
        _errorMessage = null;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

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
      backgroundColor: const Color(0xFFF7F1E9),
      appBar: AppBar(
      backgroundColor: const Color(0xFFF7F1E9),
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_rounded,
          color: Color(0xFF49352B),
        ),
        onPressed: () => Navigator.pop(context),
      ),
      title: const Text(
        'Khám phá',
        style: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Color(0xFF49352B),
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
                hintText: 'Tìm studio, phòng tối...',
                hintStyle: const TextStyle(
                  color: Color(0xFF9B8A7D),
                ),
                prefixIcon: const Icon(
                  Icons.search,
                  color: Color(0xFF795548),
                ),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(
                          Icons.close,
                          color: Color(0xFF795548),
                        ),
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
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 16,
                  horizontal: 16,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(
                    color: Color(0xFFE8DCD2),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(
                    color: Color(0xFFE8DCD2),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(
                    color: Color(0xFFFF6500),
                    width: 1.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                FilterChip(
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  showCheckmark: false,
                  backgroundColor: const Color(0xFFF8F4EE),
                  label: Text(_selectedLocation ?? 'Địa điểm'),
                  avatar: const Icon(
                  Icons.location_on_outlined,
                  color: Color(0xFF795548),
                ),
                  selected: _selectedLocation != null,
                  selectedColor: const Color(0xFFFFE3D0),
                  side: const BorderSide(color: Color(0xFFE8DCD2)),
                  labelStyle: const TextStyle(color: Color(0xFF49352B)),
                  onSelected: (_) {
                  _showLocationFilter();
                },
              ),
                const SizedBox(width: 8),
                FilterChip(
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  showCheckmark: false,
                  backgroundColor: const Color(0xFFF8F4EE),
                  label: Text(
                  _maxPrice == null ? 'Giá' : '≤ ${_maxPrice! ~/ 1000}K',
                ),
                  avatar: const Icon(
                  Icons.payments_outlined,
                  color: Color(0xFF795548),
                ),
                  selected: _maxPrice != null,
                  selectedColor: const Color(0xFFFFE3D0),
                  side: const BorderSide(color: Color(0xFFE8DCD2)),
                  labelStyle: const TextStyle(color: Color(0xFF49352B)),
                  onSelected: (_) {
                  _showPriceFilter();
                },
              ),
                const SizedBox(width: 8),
                FilterChip(
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  showCheckmark: false,
                  backgroundColor: const Color(0xFFF8F4EE),
                  label: Text(
                    _selectedStyle != null
                        ? _selectedStyle!
                        : _minCapacity != null
                            ? '$_minCapacity+ people'
                            : 'Bộ Lọc',
                  ),
                  avatar: const Icon(
                  Icons.tune,
                  color: Color(0xFF795548),
                ),
                  selected: _selectedStyle != null || _minCapacity != null,
                  selectedColor: const Color(0xFFFFE3D0),
                  side: const BorderSide(color: Color(0xFFE8DCD2)),
                  labelStyle: const TextStyle(color: Color(0xFF49352B)),
                  onSelected: (_) {
                    _showMoreFilters();
                  },
                ),
                ],
              ),

            const SizedBox(height: 24),

            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Không gian sáng tạo',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF49352B),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Tìm không gian hoàn hảo cho buổi chụp hình của bạn',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF8A7565),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFE3D0),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.camera_alt_outlined,
                    color: Color(0xFF795548),
                    size: 20,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

          Expanded(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF795548),
                ),
              )
            : _errorMessage != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 48,
                          color: Colors.redAccent,
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Failed to load creative spaces',
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: _loadCreativeSpaces,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )

                  : spaces.isEmpty
                      ? Center(
                          child: Container(
                            width: double.infinity,
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: const Color(0xFFE8DCD2)),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF49352B).withValues(alpha: 0.05),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 88,
                                  height: 88,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8F4EE),
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: const Icon(
                                    Icons.camera_alt_outlined,
                                    size: 42,
                                    color: Color(0xFF795548),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                const Text(
                                  'Chưa có không gian sáng tạo nào',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF49352B),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                const Text(
                                  'Hiện chưa tìm thấy không gian nào.\nHãy thử điều chỉnh bộ lọc hoặc quay lại sau nhé.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 14,
                                    height: 1.6,
                                    color: Color(0xFF8A7565),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                OutlinedButton.icon(
                                  onPressed: () {
                                    _searchController.clear();
                                    setState(() {
                                      _searchQuery = '';
                                      _selectedLocation = null;
                                      _maxPrice = null;
                                      _selectedStyle = null;
                                      _minCapacity = null;
                                    });
                                  },
                                  icon: const Icon(Icons.refresh_rounded),
                                  label: const Text('Xóa bộ lọc'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF795548),
                                    side: const BorderSide(color: Color(0xFFE8DCD2)),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 24,
                                      vertical: 14,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                        itemCount: spaces.length,
                        itemBuilder: (context, index) {
                          final space = spaces[index];

                       return Card(
                        color: Colors.white,
                        elevation: 0,
                        shadowColor: const Color(0xFF49352B).withValues(alpha: 0.06),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: const BorderSide(color: Color(0xFFE8DCD2)),
                        ),
                        margin: const EdgeInsets.only(bottom: 16),
                        clipBehavior: Clip.antiAlias,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 76,
                                height: 76,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8F4EE),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Icon(
                                  Icons.camera_alt_outlined,
                                  size: 32,
                                  color: Color(0xFF795548),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      space['name']?.toString() ?? 'Unnamed space',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF49352B),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      space['type']?.toString() ?? 'Creative Space',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(0xFF795548),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.location_on_outlined,
                                          size: 16,
                                          color: Color(0xFF8A7565),
                                        ),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            space['location']?.toString() ?? 'Unknown location',
                                            style: const TextStyle(
                                              fontSize: 13,
                                              color: Color(0xFF8A7565),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
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