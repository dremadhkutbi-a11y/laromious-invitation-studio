/**
 * Arabic copy. Every Arabic string in the app lives in this file:
 *
 * - `ui`    the editor interface
 * - `card`  text printed on the invitation (the card is always Arabic)
 * - `time`  words used to read and write 12-hour times
 * - `files` names given to downloaded files
 */
export const ui = {
  brandSubtitle: "استوديو الدعوات",
  localOnlyShort: "محلي على جهازك",
  pageTitle: "دعوة باسم ضيفك",
  introLead: "جهّز نسخة شخصية لكل مدعو، ثم احفظها كصورة جاهزة للإرسال.",
  editorTitle: "بيانات الدعوة",
  requiredNote: "مطلوب",
  designLabel: "تصميم الدعوة",
  designClassic: "الكلاسيكي",
  designGallery: "المعرض",
  designNight: "ليلة كحلية",
  eventTitleLabel: "عنوان الفعالية",
  eventTitlePlaceholder: "مثال: أمسية إطلاق العطر الجديد",
  descriptionLabel: "نص الدعوة",
  descriptionPlaceholder: "اكتب رسالة الدعوة هنا",
  descriptionHint: "يمكنك كتابة رسالة قصيرة أو فقرة أطول.",
  dateLabel: "التاريخ",
  datePlaceholder: "اليوم / الشهر / السنة",
  dateHint: "ميلادي",
  timeLabel: "الوقت",
  timePlaceholder: "مثال: ٧ مساءً",
  timeHint: "يظهر بصيغة ١٢ ساعة",
  venueLabel: "المكان",
  fixedBadge: "ثابت",
  guestNameLabel: "اسم المدعو",
  guestNamePlaceholder: "اكتب اسم المدعو",
  guestNameHint: "يدعم العربية والإنجليزية والأسماء المختلطة.",
  nameStyleLabel: "طريقة عرض الاسم",
  styleStandalone: "الاسم فقط",
  styleStandaloneHint: "اسم بارز وهادئ في منتصف البطاقة",
  styleGreeting: "داخل تحية",
  styleGreetingHint: "يظهر الاسم ضمن عبارة ترحيبية",
  photoLabel: "صورة الدعوة",
  photoHint: "PNG أو JPG أو WebP. تبقى الصورة على جهازك.",
  photoDefault: "الصورة الافتراضية",
  photoUpload: "رفع صورة",
  photoReset: "الصورة الافتراضية",
  photoError: "تعذر فتح الصورة. اختر ملف PNG أو JPG أو WebP.",
  nameFontLabel: "خط اسم المدعو",
  textFontLabel: "خط نص الدعوة",
  textFontHint: "لرسالة الدعوة والعنوان وباقي النصوص في البطاقة.",
  fontDefault: "الافتراضي",
  fontGroupModern: "حديث",
  fontGroupClassic: "كلاسيكي",
  fontGroupDecorative: "زخرفي",
  previewButton: "عرض البطاقة",
  downloadButton: "إنشاء وتنزيل الدعوة",
  resetButton: "إعادة تعيين",
  privacyNote: "تُنشأ البطاقة على جهازك. لا تُرفع الأسماء أو تفاصيل المناسبة إلى أي خادم.",
  previewHeading: "المعاينة",
  liveStatus: "مباشرة",
  previewFootnote: "PNG · 1080 × 1920 بكسل",
  dialogTitle: "راجع البطاقة",
  dialogHint: "راجع البطاقة بالحجم الكبير، ثم نزّل النسخة النهائية.",
  dialogEdit: "العودة للتعديل",
  dialogDownload: "تنزيل PNG",
  dialogClose: "إغلاق المعاينة",
  pickerDateLabel: "فتح منتقي التاريخ",
  pickerTimeLabel: "فتح منتقي الوقت",
  errorRequired: "هذا الحقل مطلوب.",
  errorDate: "أدخل تاريخًا ميلاديًا صحيحًا.",
  errorTime: "أدخل وقتًا صحيحًا مثل ٧ مساءً.",
  resetConfirm: "سيتم مسح الاسم وإعادة الحقول إلى حالتها الفارغة. هل تريد المتابعة؟",
  downloadSuccess: "تم تنزيل الدعوة بنجاح.",
  downloadError: "تعذر تنزيل الصورة. حاول مرة أخرى.",
  genericError: "حدث خطأ بسيط. راجع الحقول المميزة وحاول مرة أخرى.",
  previewTitle: "عنوان الدعوة",
  previewGuest: "اسم المدعو",
  languageName: "العربية",
  languageSwitch: "اللغة",
};

export const card = {
  kicker: "دعوة خاصة",
  greeting: {
    prelude: "ضيفنا الكريم",
    followup: "يسعدنا حضورك",
  },
  labels: {
    date: "التاريخ",
    time: "الوقت",
    venue: "المكان",
  },
  venue: "بوتيك لاروميوس",
  placeholders: {
    guestName: "اسم المدعو",
    title: "عنوان الدعوة",
    description: "اكتب رسالة الدعوة هنا",
    date: "-- / -- / ----",
    time: "--:--",
  },
};

export const time = {
  am: "صباحًا",
  pm: "مساءً",
  /** The shortest spelling that starts both the written and the typed forms. */
  amPrefix: "صبا",
  pmPrefix: "مسا",
};

export const files = {
  /** Downloads are saved as "<invitation> <guest name>.png". */
  invitation: "دعوة",
};
