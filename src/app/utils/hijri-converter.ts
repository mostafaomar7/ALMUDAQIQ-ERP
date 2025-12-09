export class HijriDateConverter {

  // تحويل هجري → ميلادي
  static hijriToGregorian(iy: number, im: number, id: number): Date {
    let jd = HijriDateConverter.hijriToJulian(iy, im, id);
    return HijriDateConverter.julianToGregorian(jd);
  }

  // تحويل ميلادي → هجري
  static gregorianToHijri(gy: number, gm: number, gd: number) {
    let jd = HijriDateConverter.gregorianToJulian(gy, gm, gd);
    return HijriDateConverter.julianToHijri(jd);
  }

  // دوال داخلية مساعدة
  private static gregorianToJulian(y: number, m: number, d: number): number {
    return (
      Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
      Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
      Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
      d -
      32075
    );
  }

  private static julianToGregorian(j: number): Date {
    let f = j + 1401 + Math.floor((Math.floor((4 * j + 274277) / 146097) * 3) / 4) - 38;
    let e = 4 * f + 3;
    let g = Math.floor((e % 1461) / 4);
    let h = 5 * g + 2;
    let D = Math.floor((h % 153) / 5) + 1;
    let M = (Math.floor(h / 153) + 2) % 12 + 1;
    let Y = Math.floor(e / 1461) - 4716 + Math.floor((12 + 2 - M) / 12);

    return new Date(Y, M - 1, D);
  }

  private static hijriToJulian(iy: number, im: number, id: number): number {
    return (
      Math.floor((11 * iy + 3) / 30) +
      354 * iy +
      30 * im -
      Math.floor((im - 1) / 2) +
      id +
      1948440 -
      385
    );
  }

  private static julianToHijri(j: number) {
    let y = Math.floor((30 * (j - 1948439) + 10646) / 10631);
    let m = Math.min(12, Math.ceil((j - (29 + HijriDateConverter.hijriToJulian(y, 1, 1))) / 29.5) + 1);
    let d = j - HijriDateConverter.hijriToJulian(y, m, 1) + 1;
    return { year: y, month: m, day: d };
  }
}
