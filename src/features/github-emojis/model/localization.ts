import type { EmojiSection } from './emoji'
import type { UNLanguage } from './emojiSearchRoutes'

type TranslationMessages = {
  appTitle: string
  copyIdle: string
  copied: string
  clipboardUnavailable: string
  copyFailed: string
  copyLabel: string
  appLoadFailed: string
  tryAgain: string
  loading: string
  visibleEmojiCount: string
  searchRegionLabel: string
  searchPlaceholder: string
  searchAriaLabel: string
  clearSearch: string
  settingsMenu: string
  settingsTitle: string
  showCategory: string
  dimCategory: string
  showInResults: string
  dimSection: string
  noCategories: string
  language: string
  profiles: string
  current: string
  offlineCache: string
  cacheAvailable: string
  cacheBuild: string
  cacheRebuild: string
  cacheBuilding: string
  cacheHelp: string
  cacheSelectFolder: string
  cacheUpdating: string
  cacheBuildingProgress: string
  cacheReady: string
  cacheReadFailed: string
  cacheBuildFailed: string
  cacheWrongFolder: string
  noMatches: string
  noVisibleEmojis: string
  resultsLabel: string
  catalogRefreshFailed: string
  userSettingsSaveFailed: string
  teamSettingsSaveFailed: string
  activeProfileSaveFailed: string
  unknownError: string
  projectFiles: string
  projectFilesConnected: string
  projectFilesConnect: string
  projectFilesHelp: string
  projectFilesChoose: string
  projectFilesConnectFailed: string
  sectionLabels: Record<EmojiSection, string>
}

const messages = {
  en: {
    appTitle: 'GitHub emoji',
    copyIdle: 'Ready to copy',
    copied: 'Copied: {value}',
    clipboardUnavailable: 'Clipboard access is unavailable in this browser.',
    copyFailed: 'Copy failed. Check clipboard permissions and try again.',
    copyLabel: 'Copy {name}',
    appLoadFailed: 'Could not load the saved emoji data or settings.',
    tryAgain: 'Try again',
    loading: 'Loading emoji browser',
    visibleEmojiCount: '{count} visible emojis',
    searchRegionLabel: 'Emoji search',
    searchPlaceholder: 'Search emoji…',
    searchAriaLabel: 'Search emojis by name or meaning',
    clearSearch: 'Clear search',
    settingsMenu: 'Category settings',
    settingsTitle: 'Settings',
    showCategory: 'Show {category}',
    dimCategory: 'Dim {category}',
    showInResults: 'Show {category} in results',
    dimSection: 'Dim {category} section',
    noCategories: 'This profile has no categories.',
    language: 'Language',
    profiles: 'Profiles',
    current: 'Current',
    offlineCache: 'Offline cache',
    cacheAvailable: 'Project cache is available',
    cacheBuild: 'Build offline cache',
    cacheRebuild: 'Force rebuild',
    cacheBuilding: 'Building cache…',
    cacheHelp: "Select the project's public folder when prompted.",
    cacheSelectFolder: 'Choose the project public folder to create the cache.',
    cacheUpdating: 'Updating the cache manifest…',
    cacheBuildingProgress: 'Building offline cache: {completed} of {total} images',
    cacheReady: 'Offline cache is ready in the project.',
    cacheReadFailed: 'Could not read the project cache. {error}',
    cacheBuildFailed: 'Could not build the project cache. {error}',
    cacheWrongFolder: "Select this project's public folder so the app can read the cache.",
    noMatches: 'No matches',
    noVisibleEmojis: 'No visible emojis',
    resultsLabel: 'Emoji results',
    catalogRefreshFailed: 'Catalog refresh failed; continuing with saved data. {error}',
    userSettingsSaveFailed: 'Could not save user settings locally. {error}',
    teamSettingsSaveFailed: 'Could not save {profile} locally. {error}',
    activeProfileSaveFailed: 'Could not save settings profile locally. {error}',
    unknownError: 'Unknown error',
    projectFiles: 'Project settings file',
    projectFilesConnected: 'Project folder connected; user settings save to the JSON file.',
    projectFilesConnect: 'Connect project folder',
    projectFilesHelp: 'User settings file: public/user_settings.json',
    projectFilesChoose: "Choose this project's public folder.",
    projectFilesConnectFailed: 'Could not connect the project folder. {error}',
    sectionLabels: {
      Other: 'Other',
      Animals: 'Animals',
      Emotes: 'Emotes',
      'Sports & activities': 'Sports & activities',
      Celestial: 'Celestial',
      Weather: 'Weather',
      Unicode: 'Unicode',
      Arrows: 'Arrows',
      Clocks: 'Clocks',
      Colors: 'Colors',
      People: 'People',
      Countries: 'Countries',
      GitHub: 'GitHub',
    },
  },
  ar: {
    appTitle: 'إيموجي GitHub',
    copyIdle: 'جاهز للنسخ',
    copied: 'تم النسخ: {value}',
    clipboardUnavailable: 'الوصول إلى الحافظة غير متاح في هذا المتصفح.',
    copyFailed: 'تعذر النسخ. تحقق من أذونات الحافظة وحاول مرة أخرى.',
    copyLabel: 'نسخ {name}',
    appLoadFailed: 'تعذر تحميل بيانات الإيموجي أو الإعدادات المحفوظة.',
    tryAgain: 'حاول مرة أخرى',
    loading: 'جارٍ تحميل مستعرض الإيموجي',
    visibleEmojiCount: '{count} إيموجي ظاهرة',
    searchRegionLabel: 'البحث عن الإيموجي',
    searchPlaceholder: 'ابحث عن إيموجي…',
    searchAriaLabel: 'ابحث عن الإيموجي بالاسم أو المعنى',
    clearSearch: 'مسح البحث',
    settingsMenu: 'إعدادات الفئات',
    settingsTitle: 'الإعدادات',
    showCategory: 'إظهار {category}',
    dimCategory: 'تعتيم {category}',
    showInResults: 'إظهار {category} في النتائج',
    dimSection: 'تعتيم قسم {category}',
    noCategories: 'لا توجد فئات في هذا الملف الشخصي.',
    language: 'اللغة',
    profiles: 'الملفات الشخصية',
    current: 'الحالي',
    offlineCache: 'ذاكرة التخزين دون اتصال',
    cacheAvailable: 'ذاكرة المشروع متاحة',
    cacheBuild: 'إنشاء ذاكرة دون اتصال',
    cacheRebuild: 'إعادة الإنشاء الآن',
    cacheBuilding: 'جارٍ إنشاء الذاكرة…',
    cacheHelp: 'اختر مجلد public للمشروع عند الطلب.',
    cacheSelectFolder: 'اختر مجلد public للمشروع لإنشاء الذاكرة.',
    cacheUpdating: 'جارٍ تحديث ملف الذاكرة…',
    cacheBuildingProgress: 'إنشاء الذاكرة: {completed} من {total} صورة',
    cacheReady: 'ذاكرة دون اتصال جاهزة في المشروع.',
    cacheReadFailed: 'تعذرت قراءة ذاكرة المشروع. {error}',
    cacheBuildFailed: 'تعذر إنشاء ذاكرة المشروع. {error}',
    cacheWrongFolder: 'اختر مجلد public لهذا المشروع ليتمكن التطبيق من قراءة الذاكرة.',
    noMatches: 'لا توجد نتائج مطابقة',
    noVisibleEmojis: 'لا توجد إيموجي ظاهرة',
    resultsLabel: 'نتائج الإيموجي',
    catalogRefreshFailed: 'تعذر تحديث القائمة؛ سيستمر استخدام البيانات المحفوظة. {error}',
    userSettingsSaveFailed: 'تعذر حفظ إعدادات المستخدم محليًا. {error}',
    teamSettingsSaveFailed: 'تعذر حفظ {profile} محليًا. {error}',
    activeProfileSaveFailed: 'تعذر حفظ الملف الشخصي للإعدادات محليًا. {error}',
    unknownError: 'خطأ غير معروف',
    projectFiles: 'ملف إعدادات المشروع',
    projectFilesConnected: 'تم ربط مجلد المشروع؛ تُحفظ إعدادات المستخدم في ملف JSON.',
    projectFilesConnect: 'ربط مجلد المشروع',
    projectFilesHelp: 'ملف إعدادات المستخدم: public/user_settings.json',
    projectFilesChoose: 'اختر مجلد public لهذا المشروع.',
    projectFilesConnectFailed: 'تعذر ربط مجلد المشروع. {error}',
    sectionLabels: {
      Other: 'أخرى',
      Animals: 'حيوانات',
      Emotes: 'تعبيرات',
      'Sports & activities': 'الرياضة والأنشطة',
      Celestial: 'أجرام سماوية',
      Weather: 'الطقس',
      Unicode: 'يونيكود',
      Arrows: 'أسهم',
      Clocks: 'ساعات',
      Colors: 'ألوان',
      People: 'أشخاص',
      Countries: 'دول',
      GitHub: 'GitHub',
    },
  },
  zh: {
    appTitle: 'GitHub 表情',
    copyIdle: '可以复制了',
    copied: '已复制：{value}',
    clipboardUnavailable: '此浏览器无法访问剪贴板。',
    copyFailed: '复制失败。请检查剪贴板权限后重试。',
    copyLabel: '复制{name}',
    appLoadFailed: '无法加载已保存的表情数据或设置。',
    tryAgain: '重试',
    loading: '正在加载表情浏览器',
    visibleEmojiCount: '显示 {count} 个表情',
    searchRegionLabel: '表情搜索',
    searchPlaceholder: '搜索表情…',
    searchAriaLabel: '按名称或含义搜索表情',
    clearSearch: '清除搜索',
    settingsMenu: '分类设置',
    settingsTitle: '设置',
    showCategory: '显示{category}',
    dimCategory: '调暗{category}',
    showInResults: '在结果中显示{category}',
    dimSection: '调暗{category}分区',
    noCategories: '此配置没有分类。',
    language: '语言',
    profiles: '配置',
    current: '当前',
    offlineCache: '离线缓存',
    cacheAvailable: '项目缓存可用',
    cacheBuild: '创建离线缓存',
    cacheRebuild: '强制重建',
    cacheBuilding: '正在创建缓存…',
    cacheHelp: '出现提示时请选择项目的 public 文件夹。',
    cacheSelectFolder: '选择项目的 public 文件夹以创建缓存。',
    cacheUpdating: '正在更新缓存清单…',
    cacheBuildingProgress: '正在创建离线缓存：{completed}/{total} 张图片',
    cacheReady: '项目中的离线缓存已就绪。',
    cacheReadFailed: '无法读取项目缓存。{error}',
    cacheBuildFailed: '无法创建项目缓存。{error}',
    cacheWrongFolder: '请选择此项目的 public 文件夹，以便应用读取缓存。',
    noMatches: '没有匹配项',
    noVisibleEmojis: '没有可见的表情',
    resultsLabel: '表情结果',
    catalogRefreshFailed: '无法更新目录；继续使用已保存的数据。{error}',
    userSettingsSaveFailed: '无法在本地保存用户设置。{error}',
    teamSettingsSaveFailed: '无法在本地保存{profile}。{error}',
    activeProfileSaveFailed: '无法在本地保存设置配置。{error}',
    unknownError: '未知错误',
    projectFiles: '项目设置文件',
    projectFilesConnected: '项目文件夹已连接；用户设置将保存到 JSON 文件。',
    projectFilesConnect: '连接项目文件夹',
    projectFilesHelp: '用户设置文件：public/user_settings.json',
    projectFilesChoose: '请选择此项目的 public 文件夹。',
    projectFilesConnectFailed: '无法连接项目文件夹。{error}',
    sectionLabels: {
      Other: '其他',
      Animals: '动物',
      Emotes: '表情符号',
      'Sports & activities': '运动与活动',
      Celestial: '天体',
      Weather: '天气',
      Unicode: 'Unicode',
      Arrows: '箭头',
      Clocks: '时钟',
      Colors: '颜色',
      People: '人物',
      Countries: '国家和地区',
      GitHub: 'GitHub',
    },
  },
  fr: {
    appTitle: 'Émojis GitHub',
    copyIdle: 'Prêt à copier',
    copied: 'Copié : {value}',
    clipboardUnavailable: "L’accès au presse-papiers n’est pas disponible dans ce navigateur.",
    copyFailed: 'Échec de la copie. Vérifiez les autorisations du presse-papiers et réessayez.',
    copyLabel: 'Copier {name}',
    appLoadFailed: 'Impossible de charger les données ou les paramètres enregistrés.',
    tryAgain: 'Réessayer',
    loading: 'Chargement du navigateur d’émojis',
    visibleEmojiCount: '{count} émojis visibles',
    searchRegionLabel: 'Recherche d’émojis',
    searchPlaceholder: 'Rechercher un émoji…',
    searchAriaLabel: 'Rechercher des émojis par nom ou par sens',
    clearSearch: 'Effacer la recherche',
    settingsMenu: 'Paramètres des catégories',
    settingsTitle: 'Paramètres',
    showCategory: 'Afficher {category}',
    dimCategory: 'Atténuer {category}',
    showInResults: 'Afficher {category} dans les résultats',
    dimSection: 'Atténuer la section {category}',
    noCategories: 'Ce profil ne contient aucune catégorie.',
    language: 'Langue',
    profiles: 'Profils',
    current: 'Actuel',
    offlineCache: 'Cache hors ligne',
    cacheAvailable: 'Le cache du projet est disponible',
    cacheBuild: 'Créer le cache hors ligne',
    cacheRebuild: 'Reconstruire maintenant',
    cacheBuilding: 'Création du cache…',
    cacheHelp: 'Sélectionnez le dossier public du projet à l’invite.',
    cacheSelectFolder: 'Sélectionnez le dossier public du projet pour créer le cache.',
    cacheUpdating: 'Mise à jour du manifeste du cache…',
    cacheBuildingProgress: 'Création du cache hors ligne : {completed} sur {total} images',
    cacheReady: 'Le cache hors ligne du projet est prêt.',
    cacheReadFailed: 'Impossible de lire le cache du projet. {error}',
    cacheBuildFailed: 'Impossible de créer le cache du projet. {error}',
    cacheWrongFolder: 'Sélectionnez le dossier public de ce projet pour que l’application lise le cache.',
    noMatches: 'Aucun résultat',
    noVisibleEmojis: 'Aucun émoji visible',
    resultsLabel: 'Résultats des émojis',
    catalogRefreshFailed: 'Échec de la mise à jour ; les données enregistrées sont conservées. {error}',
    userSettingsSaveFailed: 'Impossible d’enregistrer les paramètres utilisateur localement. {error}',
    teamSettingsSaveFailed: 'Impossible d’enregistrer {profile} localement. {error}',
    activeProfileSaveFailed: 'Impossible d’enregistrer le profil localement. {error}',
    unknownError: 'Erreur inconnue',
    projectFiles: 'Fichier de paramètres du projet',
    projectFilesConnected: 'Dossier connecté ; les paramètres utilisateur sont enregistrés dans le fichier JSON.',
    projectFilesConnect: 'Connecter le dossier du projet',
    projectFilesHelp: 'Fichier utilisateur : public/user_settings.json',
    projectFilesChoose: 'Sélectionnez le dossier public de ce projet.',
    projectFilesConnectFailed: 'Impossible de connecter le dossier du projet. {error}',
    sectionLabels: {
      Other: 'Autres',
      Animals: 'Animaux',
      Emotes: 'Émoticônes',
      'Sports & activities': 'Sports et activités',
      Celestial: 'Ciel et espace',
      Weather: 'Météo',
      Unicode: 'Unicode',
      Arrows: 'Flèches',
      Clocks: 'Horloges',
      Colors: 'Couleurs',
      People: 'Personnes',
      Countries: 'Pays',
      GitHub: 'GitHub',
    },
  },
  ru: {
    appTitle: 'Эмодзи GitHub',
    copyIdle: 'Готово к копированию',
    copied: 'Скопировано: {value}',
    clipboardUnavailable: 'В этом браузере нет доступа к буферу обмена.',
    copyFailed: 'Не удалось скопировать. Проверьте разрешения буфера обмена и повторите попытку.',
    copyLabel: 'Скопировать {name}',
    appLoadFailed: 'Не удалось загрузить сохранённые данные эмодзи или настройки.',
    tryAgain: 'Повторить',
    loading: 'Загрузка браузера эмодзи',
    visibleEmojiCount: 'Видно эмодзи: {count}',
    searchRegionLabel: 'Поиск эмодзи',
    searchPlaceholder: 'Поиск эмодзи…',
    searchAriaLabel: 'Поиск эмодзи по названию или значению',
    clearSearch: 'Очистить поиск',
    settingsMenu: 'Настройки категорий',
    settingsTitle: 'Настройки',
    showCategory: 'Показывать: {category}',
    dimCategory: 'Затемнить: {category}',
    showInResults: 'Показывать {category} в результатах',
    dimSection: 'Затемнить раздел «{category}»',
    noCategories: 'В этом профиле нет категорий.',
    language: 'Язык',
    profiles: 'Профили',
    current: 'Текущий',
    offlineCache: 'Офлайн-кэш',
    cacheAvailable: 'Кэш проекта доступен',
    cacheBuild: 'Создать офлайн-кэш',
    cacheRebuild: 'Пересобрать кэш',
    cacheBuilding: 'Создание кэша…',
    cacheHelp: 'В открывшемся окне выберите папку public проекта.',
    cacheSelectFolder: 'Выберите папку public проекта для создания кэша.',
    cacheUpdating: 'Обновление манифеста кэша…',
    cacheBuildingProgress: 'Создание офлайн-кэша: изображений {completed} из {total}',
    cacheReady: 'Офлайн-кэш проекта готов.',
    cacheReadFailed: 'Не удалось прочитать кэш проекта. {error}',
    cacheBuildFailed: 'Не удалось создать кэш проекта. {error}',
    cacheWrongFolder: 'Выберите папку public этого проекта, чтобы приложение могло прочитать кэш.',
    noMatches: 'Совпадений нет',
    noVisibleEmojis: 'Нет видимых эмодзи',
    resultsLabel: 'Результаты поиска эмодзи',
    catalogRefreshFailed: 'Не удалось обновить каталог; используются сохранённые данные. {error}',
    userSettingsSaveFailed: 'Не удалось сохранить настройки пользователя. {error}',
    teamSettingsSaveFailed: 'Не удалось сохранить профиль {profile}. {error}',
    activeProfileSaveFailed: 'Не удалось сохранить выбранный профиль. {error}',
    unknownError: 'Неизвестная ошибка',
    projectFiles: 'Файл настроек проекта',
    projectFilesConnected: 'Папка проекта подключена; настройки сохраняются в JSON-файл.',
    projectFilesConnect: 'Подключить папку проекта',
    projectFilesHelp: 'Файл настроек: public/user_settings.json',
    projectFilesChoose: 'Выберите папку public этого проекта.',
    projectFilesConnectFailed: 'Не удалось подключить папку проекта. {error}',
    sectionLabels: {
      Other: 'Другое',
      Animals: 'Животные',
      Emotes: 'Эмоции',
      'Sports & activities': 'Спорт и занятия',
      Celestial: 'Космос',
      Weather: 'Погода',
      Unicode: 'Юникод',
      Arrows: 'Стрелки',
      Clocks: 'Часы',
      Colors: 'Цвета',
      People: 'Люди',
      Countries: 'Страны',
      GitHub: 'GitHub',
    },
  },
  es: {
    appTitle: 'Emojis de GitHub',
    copyIdle: 'Listo para copiar',
    copied: 'Copiado: {value}',
    clipboardUnavailable: 'Este navegador no permite acceder al portapapeles.',
    copyFailed: 'No se pudo copiar. Comprueba los permisos del portapapeles e inténtalo de nuevo.',
    copyLabel: 'Copiar {name}',
    appLoadFailed: 'No se pudieron cargar los datos o la configuración guardados.',
    tryAgain: 'Reintentar',
    loading: 'Cargando el navegador de emojis',
    visibleEmojiCount: '{count} emojis visibles',
    searchRegionLabel: 'Búsqueda de emojis',
    searchPlaceholder: 'Buscar emoji…',
    searchAriaLabel: 'Buscar emojis por nombre o significado',
    clearSearch: 'Borrar búsqueda',
    settingsMenu: 'Configuración de categorías',
    settingsTitle: 'Configuración',
    showCategory: 'Mostrar {category}',
    dimCategory: 'Atenuar {category}',
    showInResults: 'Mostrar {category} en los resultados',
    dimSection: 'Atenuar la sección {category}',
    noCategories: 'Este perfil no tiene categorías.',
    language: 'Idioma',
    profiles: 'Perfiles',
    current: 'Actual',
    offlineCache: 'Caché sin conexión',
    cacheAvailable: 'La caché del proyecto está disponible',
    cacheBuild: 'Crear caché sin conexión',
    cacheRebuild: 'Forzar reconstrucción',
    cacheBuilding: 'Creando caché…',
    cacheHelp: 'Selecciona la carpeta public del proyecto cuando se solicite.',
    cacheSelectFolder: 'Selecciona la carpeta public del proyecto para crear la caché.',
    cacheUpdating: 'Actualizando el manifiesto de caché…',
    cacheBuildingProgress: 'Creando caché sin conexión: {completed} de {total} imágenes',
    cacheReady: 'La caché sin conexión está lista en el proyecto.',
    cacheReadFailed: 'No se pudo leer la caché del proyecto. {error}',
    cacheBuildFailed: 'No se pudo crear la caché del proyecto. {error}',
    cacheWrongFolder: 'Selecciona la carpeta public de este proyecto para que la aplicación lea la caché.',
    noMatches: 'No hay coincidencias',
    noVisibleEmojis: 'No hay emojis visibles',
    resultsLabel: 'Resultados de emojis',
    catalogRefreshFailed: 'No se pudo actualizar el catálogo; se usan los datos guardados. {error}',
    userSettingsSaveFailed: 'No se pudo guardar la configuración de usuario localmente. {error}',
    teamSettingsSaveFailed: 'No se pudo guardar {profile} localmente. {error}',
    activeProfileSaveFailed: 'No se pudo guardar el perfil de configuración. {error}',
    unknownError: 'Error desconocido',
    projectFiles: 'Archivo de configuración del proyecto',
    projectFilesConnected: 'Carpeta conectada; la configuración se guarda en el archivo JSON.',
    projectFilesConnect: 'Conectar carpeta del proyecto',
    projectFilesHelp: 'Archivo de usuario: public/user_settings.json',
    projectFilesChoose: 'Selecciona la carpeta public de este proyecto.',
    projectFilesConnectFailed: 'No se pudo conectar la carpeta del proyecto. {error}',
    sectionLabels: {
      Other: 'Otros',
      Animals: 'Animales',
      Emotes: 'Emoticonos',
      'Sports & activities': 'Deportes y actividades',
      Celestial: 'Cielo y espacio',
      Weather: 'Tiempo',
      Unicode: 'Unicode',
      Arrows: 'Flechas',
      Clocks: 'Relojes',
      Colors: 'Colores',
      People: 'Personas',
      Countries: 'Países',
      GitHub: 'GitHub',
    },
  },
} satisfies Record<UNLanguage, TranslationMessages>

export type TranslationKey = keyof typeof messages.en
export type TranslationMessageKey = Exclude<TranslationKey, 'sectionLabels'>
export type TranslationParameters = Record<string, string | number>

export const languageNames: Record<UNLanguage, string> = {
  ar: 'العربية',
  zh: '中文',
  en: 'English',
  fr: 'Français',
  ru: 'Русский',
  es: 'Español',
}

export function translate(
  language: UNLanguage,
  key: TranslationMessageKey,
  parameters: TranslationParameters = {},
): string {
  const message: string = messages[language][key]
  return message.replace(/\{(\w+)\}/g, (_match: string, name: string) =>
    String(parameters[name] ?? ''),
  )
}

export function translateSection(language: UNLanguage, section: EmojiSection): string {
  return messages[language].sectionLabels[section]
}

export function formatCount(language: UNLanguage, count: number): string {
  return count.toLocaleString(language)
}

const uiLanguageStorageKey = 'gh-emoji-ui-language'

/** Synchronous hint so the loading skeleton and error boundary use the saved language. */
export function readUiLanguage(): UNLanguage {
  try {
    const value = localStorage.getItem(uiLanguageStorageKey)
    if (value === 'ar' || value === 'zh' || value === 'en' || value === 'fr' || value === 'ru' || value === 'es') {
      return value
    }
  } catch {
    // Storage may be unavailable in private browsing.
  }
  return 'en'
}

export function writeUiLanguage(language: UNLanguage): void {
  try {
    localStorage.setItem(uiLanguageStorageKey, language)
  } catch {
    // The language is still persisted in the user settings profile.
  }
}
