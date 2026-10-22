/**
 * The English messages of the UI kit, as a catalog of messages: every label, description and live-region text the components show, keyed
 * by component. Pass it (or a copy with your own words) to the strings provider of your project, or into a `createI18n` catalog.
 *
 * @example
 * import en from "@shadow-js/ui/locales/en";
 *
 * console.log(typeof en.toast.close);
 * @since 1.0.0
 */
const en = {
  breadcrumb: {
    label: "breadcrumb",
    more: "More",
  },
  calendar: {
    month: "Month",
    nextMonth: "Next month",
    previousMonth: "Previous month",
    year: "Year",
  },
  carousel: {
    goToSlide: "Go to slide {position}",
    next: "Next slide",
    previous: "Previous slide",
    slide: "{position} of {total}",
  },
  chart: {
    announce: "{label}: {values}",
    captionTruncated:
      "{series}. Showing {shown, number} of {total, plural, one {# data point} other {# data points}}.",
    label: {
      area: "Area chart of {series}",
      bar: "Bar chart of {series}",
      donut: "Donut chart of {series}",
      line: "Line chart of {series}",
      pie: "Pie chart of {series}",
      radial: "Radial chart of {series}",
    },
    roledescription: "chart",
    separator: ", ",
    share: "{name}: {value} ({percent})",
    value: "{name}: {value}",
  },
  codeBlock: {
    copied: "Copied",
    copy: "Copy code",
  },
  combobox: {
    clear: "Clear",
    toggle: "Toggle suggestions",
  },
  command: {
    description: "Search for a command to run...",
    title: "Command Palette",
  },
  dataTable: {
    empty: "No results.",
    next: "Next",
    noPages: "No pages",
    page: "Page {page} of {pages}",
    previous: "Previous",
    view: "View",
  },
  datePicker: {
    open: "Open calendar",
  },
  dialog: {
    close: "Close",
  },
  drawer: {
    handle: "Drag to resize",
  },
  form: {
    errorSummary: {
      item: "{label}: {message}",
      title:
        "{count, plural, one {There is # problem with your submission} other {There are # problems with your submission}}",
    },
  },
  inputOtp: {
    character: "Character {position} of {total}",
    digit: "Digit {position} of {total}",
  },
  messageScroller: {
    label: "Messages",
    toEnd: "Scroll to latest",
    toStart: "Scroll to start",
  },
  pagination: {
    goNext: "Go to next page",
    goPrevious: "Go to previous page",
    goToPage: "Go to page {page}",
    label: "pagination",
    next: "Next",
    previous: "Previous",
  },
  password: {
    capsLock: "Caps Lock is on",
    level: {
      "0": "Very weak",
      "1": "Weak",
      "2": "Fair",
      "3": "Good",
      "4": "Strong",
    },
    show: "Show password",
    strength: "Password strength",
  },
  questionnaire: {
    next: "Next",
    optional: "Answer this question, or skip it, to continue.",
    previous: "Back",
    progress: "Question {current} of {total}",
    progressLabel: "Questionnaire progress",
    required: "Answer this question to continue.",
    skip: "Skip",
    submit: "Submit",
  },
  resizable: {
    handle: "Resize panels",
  },
  sheet: {
    close: "Close",
  },
  sidebar: {
    mobileDescription: "Displays the mobile sidebar.",
    title: "Sidebar",
    toggle: "Toggle Sidebar",
  },
  spinner: {
    loading: "Loading",
  },
  toast: {
    action: "Action",
    close: "Close toast",
    notifications: "Notifications",
  },
} as const;

export default en;
