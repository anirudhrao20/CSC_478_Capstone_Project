import 'package:flutter/material.dart';
import '../models/company.dart';

class StockCard extends StatefulWidget {
  final Company company;

  const StockCard({super.key, required this.company});

  @override
  State<StockCard> createState() => _StockCardState();
}

class _StockCardState extends State<StockCard> {
  @override
  Widget build(BuildContext context) {
    final company = widget.company;
    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 50.0,
              height: 50.0,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(30.0),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Image.network(
                    company.logo,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            const SizedBox(
              width: 10.0,
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(company.ticker),
                Text(company.name),
              ],
            ),
          ],
        )
      ],
    );
  }
}
