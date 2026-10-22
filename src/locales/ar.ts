/**
 * The Arabic messages of the UI kit, as a catalog of messages: every label, description and live-region text the components show, keyed
 * by component. Pass it (or a copy with your own words) to the strings provider of your project, or into a `createI18n` catalog.
 *
 * @example
 * import ar from "@shadow-js/ui/locales/ar";
 *
 * console.log(typeof ar.toast.close);
 * @since 1.0.0
 */
const ar = {
  breadcrumb: {
    label: "مسار التنقل",
    more: "المزيد",
  },
  calendar: {
    month: "الشهر",
    nextMonth: "الشهر التالي",
    previousMonth: "الشهر السابق",
    year: "السنة",
  },
  carousel: {
    goToSlide: "الانتقال إلى الشريحة {position}",
    next: "الشريحة التالية",
    previous: "الشريحة السابقة",
    slide: "{position} من {total}",
  },
  chart: {
    announce: "{label}: {values}",
    captionTruncated:
      "{series}. عرض {shown, number} من أصل {total, plural, zero {لا توجد نقاط بيانات} one {نقطة بيانات واحدة} two {نقطتي بيانات} few {# نقاط بيانات} many {# نقطة بيانات} other {# نقطة بيانات}}.",
    label: {
      area: "مخطط مساحي لـ {series}",
      bar: "مخطط أعمدة لـ {series}",
      donut: "مخطط حلقي لـ {series}",
      line: "مخطط خطي لـ {series}",
      pie: "مخطط دائري لـ {series}",
      radial: "مخطط شعاعي لـ {series}",
    },
    roledescription: "مخطط",
    separator: "، ",
    share: "{name}: {value} ({percent})",
    value: "{name}: {value}",
  },
  codeBlock: {
    copied: "تم النسخ",
    copy: "نسخ الشيفرة",
  },
  combobox: {
    clear: "مسح",
    toggle: "تبديل الاقتراحات",
  },
  command: {
    description: "ابحث عن أمر لتنفيذه...",
    title: "لوحة الأوامر",
  },
  dataTable: {
    empty: "لا توجد نتائج.",
    next: "التالي",
    noPages: "لا توجد صفحات",
    page: "الصفحة {page} من {pages}",
    previous: "السابق",
    view: "عرض",
  },
  datePicker: {
    open: "فتح التقويم",
  },
  dialog: {
    close: "إغلاق",
  },
  drawer: {
    handle: "اسحب لتغيير الحجم",
  },
  form: {
    errorSummary: {
      item: "{label}: {message}",
      title:
        "{count, plural, zero {لا توجد مشكلات في النموذج} one {هناك مشكلة واحدة في النموذج} two {هناك مشكلتان في النموذج} few {هناك # مشكلات في النموذج} many {هناك # مشكلة في النموذج} other {هناك # مشكلة في النموذج}}",
    },
  },
  inputOtp: {
    character: "الحرف {position} من {total}",
    digit: "الرقم {position} من {total}",
  },
  messageScroller: {
    label: "الرسائل",
    toEnd: "الانتقال إلى أحدث رسالة",
    toStart: "الانتقال إلى البداية",
  },
  pagination: {
    goNext: "الانتقال إلى الصفحة التالية",
    goPrevious: "الانتقال إلى الصفحة السابقة",
    goToPage: "الانتقال إلى الصفحة {page}",
    label: "ترقيم الصفحات",
    next: "التالي",
    previous: "السابق",
  },
  password: {
    capsLock: "مفتاح Caps Lock مفعّل",
    level: {
      "0": "ضعيفة جداً",
      "1": "ضعيفة",
      "2": "مقبولة",
      "3": "جيدة",
      "4": "قوية",
    },
    show: "إظهار كلمة المرور",
    strength: "قوة كلمة المرور",
  },
  questionnaire: {
    next: "التالي",
    optional: "أجب عن هذا السؤال، أو تخطَّه، للمتابعة.",
    previous: "السابق",
    progress: "السؤال {current} من {total}",
    progressLabel: "تقدم الاستبيان",
    required: "أجب عن هذا السؤال للمتابعة.",
    skip: "تخطَّ",
    submit: "إرسال",
  },
  resizable: {
    handle: "تغيير حجم اللوحات",
  },
  sheet: {
    close: "إغلاق",
  },
  sidebar: {
    mobileDescription: "يعرض الشريط الجانبي للجوال.",
    title: "الشريط الجانبي",
    toggle: "تبديل الشريط الجانبي",
  },
  spinner: {
    loading: "جارٍ التحميل",
  },
  toast: {
    action: "إجراء",
    close: "إغلاق الإشعار",
    notifications: "الإشعارات",
  },
} as const;

export default ar;
