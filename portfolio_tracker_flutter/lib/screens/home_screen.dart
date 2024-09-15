import 'package:flutter/material.dart';
import 'package:portfolio_tracker_flutter/items/stock_card.dart';
import 'package:portfolio_tracker_flutter/models/company.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          StockCard(company: testCompany,)
        ],
      ),
    );
  }
}