import 'package:flutter/material.dart';
import 'package:portfolio_tracker_flutter/items/stock_card.dart';
import 'package:portfolio_tracker_flutter/models/company.dart';
import 'package:portfolio_tracker_flutter/helpers.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Company? _company;

  @override
  void initState() {
    super.initState();
    _loadCompanyData('AAPL');
  }

  Future<void> _loadCompanyData(String ticker) async {
    var url = 'https://csc478-group6-capstone-portfolio-tracker.koyeb.app/company_profile/$ticker';
    final company = await fetchCompanyData(url);
    setState(() {
      _company = company;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _company == null
          ? const Center(child: CircularProgressIndicator())
          : Column(
        children: [
          StockCard(company: _company!),
        ],
      ),
    );
  }
}
