/**
 * Curated fallback content.
 *
 * Every public section is database-driven, but the committee has not entered
 * anything yet — and a half-empty institutional website is worse than none. So
 * each section falls back to this vetted copy, drawn from the institution's own
 * facts, and switches to live data the moment a published row exists.
 *
 * These are defaults, not hardcoded content: once the admin panel is populated,
 * nothing here is rendered. Treat it as the launch-day safety net.
 */

export const defaultMissions = [
  {
    title: "Teaching",
    description:
      "A rigorous Islamic and academic curriculum delivered under the Darul Huda Islamic University framework.",
    icon: "book-open",
  },
  {
    title: "Nurturing",
    description:
      "A residential community where character, discipline and confidence are cultivated alongside scholarship.",
    icon: "heart",
  },
  {
    title: "Islamic Propagation",
    description:
      "Preparing scholars who carry knowledge outward — to serve, guide and strengthen their communities.",
    icon: "star",
  },
];

export const defaultStatistics = [
  { label: "Residential students", value: 240, suffix: "+", number_format: "grouped" as const },
  { label: "Darul Huda branches", value: 28, suffix: null, number_format: "grouped" as const },
  { label: "Established", value: 2015, suffix: null, number_format: "plain" as const },
  { label: "Free of cost", value: 100, suffix: "%", number_format: "grouped" as const },
];

export const defaultFacilities = [
  {
    name: "Digital Classrooms",
    description:
      "Smart-enabled classrooms that pair traditional instruction with modern teaching tools.",
    icon: "layout-template",
  },
  {
    name: "Computer Laboratory",
    description:
      "A dedicated laboratory supporting the academy's design, media and cyber security training.",
    icon: "laptop",
  },
  {
    name: "Library",
    description:
      "A reference and reading collection spanning Islamic sciences, languages and general studies.",
    icon: "library",
  },
  {
    name: "Residential Campus",
    description:
      "Accommodation and dining for more than 240 students, provided entirely free of cost.",
    icon: "building-2",
  },
];

export const defaultSkills = [
  { title: "Graphic Designing", description: "Visual design, typography and brand work.", icon: "palette" },
  { title: "Video Editing", description: "Storytelling, editing and post-production.", icon: "clapperboard" },
  { title: "3D Modelling", description: "Spatial design and three-dimensional visualisation.", icon: "box" },
  { title: "Cyber Security", description: "Digital safety, systems and responsible technology.", icon: "shield" },
  { title: "Language Learning", description: "Arabic, Urdu, English and Malayalam proficiency.", icon: "languages" },
  { title: "Creative Talents", description: "Oratory, literature and the arts, cultivated through KISWA.", icon: "sparkles" },
];

export const defaultAchievements = [
  {
    title: "A+ Accredited Branch",
    description:
      "Recognised at the highest accreditation grade within the Darul Huda branch network.",
    category: "institutional",
  },
  {
    title: "India's First Arabic Reality Show",
    description:
      "A landmark initiative that brought Arabic language learning to a national audience.",
    category: "student",
  },
  {
    title: "Academic Rank Holders",
    description:
      "Students consistently placing among the top ranks in university examinations.",
    category: "academic",
  },
  {
    title: "28 Branch Network",
    description:
      "One among 28 Darul Huda branches serving communities across Kerala.",
    category: "institutional",
  },
  {
    title: "240+ Residential Students",
    description:
      "Education, accommodation and food provided free of cost to every student.",
    category: "milestones",
  },
  {
    title: "Digital Classrooms & Computer Laboratory",
    description:
      "Modern teaching infrastructure supporting both religious and technical education.",
    category: "infrastructure",
  },
];

export const defaultTimeline = [
  {
    year: 2015,
    title: "The Academy is Established",
    description:
      "KMO Islamic Academy was founded on 1 August 2015 under the KMO Koduvally Orphanage, made possible through the invaluable efforts of Vavad Kunji Koya Musliyar, whose vision and dedication remain priceless in the institution's history.",
  },
  {
    year: 2016,
    title: "Affiliation with Darul Huda Islamic University",
    description:
      "The academy joined the Darul Huda network, adopting its curriculum, academic standards and scholarly tradition.",
  },
  {
    year: 2019,
    title: "Digital Infrastructure",
    description:
      "Digital classrooms and a computer laboratory were established, extending the curriculum into design, media and technology.",
  },
  {
    year: 2025,
    title: "A Decade of Service",
    description:
      "Ten years of teaching, nurturing and propagation — and the academy's first graduating cohort.",
  },
];

export const defaultDepartments = [
  {
    name: "Islamic Sciences",
    description:
      "Qur'anic studies, Hadith, Fiqh and the classical disciplines at the heart of the curriculum.",
  },
  {
    name: "Languages",
    description:
      "Arabic, Urdu, English and Malayalam, taught for both scholarship and communication.",
  },
  {
    name: "General Education",
    description:
      "The academic subjects that run alongside religious instruction throughout a student's years here.",
  },
  {
    name: "Skills & Technology",
    description:
      "Design, media, computing and cyber security — practical training for a modern world.",
  },
];
