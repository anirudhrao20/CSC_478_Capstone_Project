class Company {
  final String country;
  final String currency;
  final String exchange;
  final String ipo;
  final double marketCapitalization;
  final String name;
  final String phone;
  final double shareOutstanding;
  final String ticker;
  final String weburl;
  final String logo;
  final String finnhubIndustry;

  Company({
    required this.country,
    required this.currency,
    required this.exchange,
    required this.ipo,
    required this.marketCapitalization,
    required this.name,
    required this.phone,
    required this.shareOutstanding,
    required this.ticker,
    required this.weburl,
    required this.logo,
    required this.finnhubIndustry,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      country: json['country'],
      currency: json['currency'],
      exchange: json['exchange'],
      ipo: json['ipo'],
      marketCapitalization: json['marketCapitalization'],
      name: json['name'],
      phone: json['phone'],
      shareOutstanding: json['shareOutstanding'].toDouble(),
      ticker: json['ticker'],
      weburl: json['weburl'],
      logo: json['logo'],
      finnhubIndustry: json['finnhubIndustry'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'country': country,
      'currency': currency,
      'exchange': exchange,
      'ipo': ipo,
      'marketCapitalization': marketCapitalization,
      'name': name,
      'phone': phone,
      'shareOutstanding': shareOutstanding,
      'ticker': ticker,
      'weburl': weburl,
      'logo': logo,
      'finnhubIndustry': finnhubIndustry,
    };
  }
}
