class Quote {
  double c;
  double d;
  double dp;
  double h;
  double l;
  double o;
  double pc;

  Quote({
    required this.c,
    required this.d,
    required this.dp,
    required this.h,
    required this.l,
    required this.o,
    required this.pc,
  });

  factory Quote.fromJson(Map<String, dynamic> json) {
    return Quote(
      c: json['c'],
      d: json['d'],
      dp: json['dp'],
      h: json['h'],
      l: json['l'],
      o: json['o'],
      pc: json['pc'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'c': c,
      'd': d,
      'dp': dp,
      'h': h,
      'l': l,
      'o': o,
      'pc': pc,
    };
  }
}
