class Company {
  String country;
  String currency;
  String exchange;
  String ipo;
  int marketCapitalization;
  String name;
  String phone;
  double shareOutstanding;
  String ticker;
  String weburl;
  String logo;
  String finnhubIndustry;

  Company(this.country, this.currency, this.exchange, this.ipo, this.marketCapitalization, this.name, this.phone, this.shareOutstanding, this.ticker, this.weburl, this.logo, this.finnhubIndustry);
}


Company testCompany = Company("US", "USD", "NASDAQ/NMS (GLOBAL MARKET)", "1980-12-12", 1415993, "Apple Inc", "14089961010", 4375.47998046875, "AAPL", "https://www.apple.com/", "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.png", "Technology");