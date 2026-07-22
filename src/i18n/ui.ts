// src/i18n/ui.ts — diccionarios de UI (es/en) + helpers de traducción e i18n.
// Español es el idioma por defecto (sin prefijo); inglés vive en /en/.

export const defaultLocale = 'es';
export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

type Dict = Record<string, string>;

const es: Dict = {
  // Chrome
  'chrome.search': 'Buscar',
  'chrome.searchAria': 'Buscar módulos',
  'chrome.themeAria': 'Cambiar tema',
  'chrome.langAria': 'Idioma',

  // Home
  'home.metaTitle': 'Navaja — Utilidades de texto',
  'home.metaDesc': 'Una colección de utilidades de texto, rápidas y sin distracciones.',
  'home.eyebrow': '{n} utilidades de texto · sin distracciones',
  'home.title': '¿Qué necesitas hacer?',
  'home.launch': 'Busca una herramienta…',
  'home.launchAria': 'Buscar una herramienta',
  'home.allTools': 'Todas las herramientas',

  // Command palette
  'cmdk.placeholder': 'Buscar módulo…',
  'cmdk.empty': 'Sin resultados',

  // Footer
  'footer.rights': '© {year} Navaja. Todos los derechos reservados.',
  'footer.os': 'Open source',
  'footer.by': 'Creado por',

  // Común
  'common.copied': '¡Copiado!',
  'common.copy': 'Copiar',
  'common.clear': 'Limpiar',
  'common.text': 'Texto',
  'common.result': 'Resultado',
  'common.copyText': 'Copiar texto',

  // Tarjetas (label = nav/grid/⌘K, desc = subtítulo de tarjeta)
  'tool.contador.label': 'Contador',
  'tool.contador.desc': 'Cuenta caracteres y palabras',
  'tool.conversor.label': 'Conversor',
  'tool.conversor.desc': 'Mayúsculas, minúsculas, capitalizar',
  'tool.lorem.label': 'Lorem Ipsum',
  'tool.lorem.desc': 'Genera texto de relleno',
  'tool.binario.label': 'Binario',
  'tool.binario.desc': 'Convierte texto ↔ binario',
  'tool.password.label': 'Contraseñas',
  'tool.password.desc': 'Genera contraseñas seguras',
  'tool.base64.label': 'Base64',
  'tool.base64.desc': 'Codifica y descodifica Base64',
  'tool.slug.label': 'Slug',
  'tool.slug.desc': 'Convierte texto en slug de URL',
  'tool.naming.label': 'Naming',
  'tool.naming.desc': 'Genera nombres de negocio',
  'tool.diff.label': 'Diff',
  'tool.diff.desc': 'Compara dos textos',
  'tool.json.label': 'JSON',
  'tool.json.desc': 'Formatea y valida JSON',
  'tool.url.label': 'URL encode',
  'tool.url.desc': 'Codifica y descodifica URLs',
  'tool.limpiador.label': 'Limpiador',
  'tool.limpiador.desc': 'Limpia espacios y caracteres invisibles',
  'tool.ordenar.label': 'Ordenar líneas',
  'tool.ordenar.desc': 'Ordena listas y quita duplicados',
  'tool.extractor.label': 'Extractor',
  'tool.extractor.desc': 'Extrae emails, URLs o números',
  'tool.placeholder.label': 'Placeholder',
  'tool.placeholder.desc': 'Texto de muestra multilingüe',

  // Páginas (title = h1 + <title>, lead = subtítulo + meta description)
  'tool.contador.title': 'Contador de caracteres',
  'tool.contador.lead': 'Escribe o pega una frase y cuenta sus caracteres y palabras al instante.',
  'tool.conversor.title': 'Conversor de texto',
  'tool.conversor.lead': 'Pega tu texto y transfórmalo: mayúscula tras punto, todo minúsculas, todo MAYÚSCULAS o capitalizar.',
  'tool.lorem.title': 'Lorem Ipsum',
  'tool.lorem.lead': 'Genera texto de relleno al instante: elige párrafos, frases o palabras y cópialo.',
  'tool.binario.title': 'Texto ↔ Binario',
  'tool.binario.lead': 'Convierte texto a código binario y binario a texto al instante, en ambos sentidos.',
  'tool.password.title': 'Generador de contraseñas',
  'tool.password.lead': 'Crea contraseñas seguras y aleatorias con el nivel de complejidad que elijas.',
  'tool.base64.title': 'Texto ↔ Base64',
  'tool.base64.lead': 'Codifica y descodifica Base64 al instante, en ambos sentidos.',
  'tool.slug.title': 'Slug de URL',
  'tool.slug.lead': 'Convierte cualquier texto en un slug limpio y legible para URLs.',
  'tool.naming.title': 'Naming',
  'tool.naming.lead': 'Genera nombres de negocio combinando prefijos y sufijos.',
  'tool.diff.title': 'Diff',
  'tool.diff.lead': 'Compara dos textos y ve las diferencias línea a línea.',
  'tool.json.title': 'JSON',
  'tool.json.lead': 'Formatea, minifica y valida JSON al instante.',
  'tool.url.title': 'URL encode',
  'tool.url.lead': 'Codifica y descodifica texto para usarlo en URLs.',
  'tool.limpiador.title': 'Limpiador de texto',
  'tool.limpiador.lead': 'Quita espacios dobles, saltos de línea de más y caracteres invisibles.',
  'tool.ordenar.title': 'Ordenar líneas',
  'tool.ordenar.lead': 'Ordena listas alfabéticamente, al revés o al azar, y quita duplicados.',
  'tool.extractor.title': 'Extractor',
  'tool.extractor.lead': 'Extrae todos los emails, URLs o números de cualquier texto.',
  'tool.placeholder.title': 'Placeholder',
  'tool.placeholder.lead': 'Texto de muestra con palabras reales en 11 alfabetos.',

  // Contador
  'contador.fieldLabel': 'Escribe tu frase',
  'contador.ph': 'Escribe o pega aquí tu texto…',
  'contador.chars': 'Caracteres',
  'contador.noSpaces': 'Sin espacios',
  'contador.words': 'Palabras',

  // Conversor
  'conversor.origLabel': 'Texto original',
  'conversor.origPh': 'Escribe o pega aquí el texto que deseas convertir…',
  'conversor.outPh': 'Aquí aparecerá el texto convertido…',
  'conversor.group': 'Tipo de conversión',
  'conversor.sentence': 'Mayúscula tras punto',
  'conversor.lower': 'Todo minúsculas',
  'conversor.upper': 'Todo MAYÚSCULAS',
  'conversor.title': 'Capitalizar texto',

  // Lorem
  'lorem.amount': 'Cantidad',
  'lorem.unit': 'Unidad',
  'lorem.paragraphs': 'Párrafos',
  'lorem.sentences': 'Frases',
  'lorem.words': 'Palabras',
  'lorem.classic': 'Empezar con «Lorem ipsum…»',
  'lorem.generate': 'Generar',
  'lorem.outPh': 'Aquí aparecerá el texto generado…',

  // Binario
  'binario.binary': 'Binario',
  'binario.ph': 'Escribe o pega texto…',
  'binario.copyBinary': 'Copiar binario',
  'binario.binCopied': '¡Binario copiado!',
  'binario.textCopied': '¡Texto copiado!',

  // Contraseñas
  'password.genAria': 'Contraseña generada',
  'password.length': 'Longitud:',
  'password.upper': 'Mayúsculas (A-Z)',
  'password.lower': 'Minúsculas (a-z)',
  'password.num': 'Números (0-9)',
  'password.sym': 'Símbolos (!@#…)',
  'password.ambig': 'Evitar ambiguos (l, 1, O, 0…)',
  'password.regen': 'Generar de nuevo',
  'password.strengthPrefix': 'Seguridad: ',
  'password.weak': 'Débil',
  'password.medium': 'Media',
  'password.strong': 'Fuerte',
  'password.veryStrong': 'Muy fuerte',
  'password.chooseType': 'Elige al menos un tipo de carácter',

  // Base64
  'base64.ph': 'Escribe o pega texto…',
  'base64.copyB64': 'Copiar Base64',
  'base64.b64Copied': '¡Base64 copiado!',
  'base64.textCopied': '¡Texto copiado!',
  'base64.invalid': 'Base64 no válido',

  // Slug
  'slug.ph': 'Ej.: ¿Cómo hacer café con leche?',
  'slug.sep': 'Separador',
  'slug.hyphen': 'Guion (-)',
  'slug.underscore': 'Guion bajo (_)',
  'slug.slugLabel': 'Slug',
  'slug.genAria': 'Slug generado',
  'slug.copy': 'Copiar slug',

  // Naming
  'naming.baseWord': 'Palabra base',
  'naming.ph': 'Ej.: web, taco, viaje…',
  'naming.empty': 'Escribe una palabra y verás 16 ideas de nombre. Pulsa cualquiera para copiarla.',
  'naming.withPrefix': 'Con prefijo',
  'naming.withSuffix': 'Con sufijo',
  'naming.copyAll': 'Copiar todos',

  // Diff
  'diff.original': 'Original',
  'diff.modified': 'Modificado',
  'diff.origPh': 'Pega el texto original…',
  'diff.modPh': 'Pega el texto modificado…',
  'diff.copy': 'Copiar diff',
  'diff.hint': 'Pega dos textos y verás las diferencias línea a línea.',
  'diff.identical': 'Los textos son idénticos.',
  'diff.tooMany': 'Demasiadas líneas distintas para comparar (máx. {max}).',
  'diff.added': 'añadidas',
  'diff.removed': 'eliminadas',

  // JSON
  'json.ph': '{"nombre": "Navaja", "modulos": 15}',
  'json.format': 'Formatear',
  'json.minify': 'Minificar',
  'json.valid': 'JSON válido',
  'json.pos': ' (línea {line}, columna {col})',

  // URL
  'url.ph': 'Escribe o pega texto… ej.: ¿cómo hacer café?',
  'url.encodedLabel': 'URL codificada',
  'url.mode': 'Modo',
  'url.modeComponent': 'Componente (codifica todo)',
  'url.modeFull': 'URL completa (respeta / ? & =)',
  'url.copyEncoded': 'Copiar codificada',
  'url.urlCopied': '¡URL copiada!',
  'url.textCopied': '¡Texto copiado!',
  'url.invalid': 'Secuencia % no válida',

  // Limpiador
  'limpiador.origLabel': 'Texto original',
  'limpiador.origPh': 'Pega aquí el texto a limpiar…',
  'limpiador.cleanLabel': 'Texto limpio',
  'limpiador.cleanPh': 'Aquí aparecerá el resultado…',
  'limpiador.optSpaces': 'Espacios duplicados',
  'limpiador.optBreaks': 'Saltos de línea de más',
  'limpiador.optInvisible': 'Caracteres invisibles (zero-width, nbsp…)',
  'limpiador.optTrim': 'Espacios al inicio/final de línea',
  'limpiador.copyClean': 'Copiar limpio',
  'limpiador.clearFields': 'Limpiar campos',
  'limpiador.removed': '−{n} caracteres',

  // Ordenar líneas
  'ordenar.linesLabel': 'Líneas',
  'ordenar.linesPh': 'Pega una lista, una entrada por línea…',
  'ordenar.outPh': 'Aquí aparecerá la lista ordenada…',
  'ordenar.order': 'Orden',
  'ordenar.az': 'Alfabético (A→Z)',
  'ordenar.za': 'Inverso (Z→A)',
  'ordenar.random': 'Aleatorio',
  'ordenar.dedupe': 'Quitar duplicados',
  'ordenar.nocase': 'Ignorar mayúsculas/minúsculas',
  'ordenar.noempty': 'Quitar líneas vacías',
  'ordenar.copyResult': 'Copiar resultado',
  'ordenar.shuffle': 'Barajar de nuevo',
  'ordenar.lines': '{n} líneas',
  'ordenar.ofTotal': 'de {total}',

  // Extractor
  'extractor.ph': 'Pega aquí cualquier texto: un correo, un log, una página…',
  'extractor.extract': 'Extraer',
  'extractor.emails': 'Emails',
  'extractor.urls': 'URLs',
  'extractor.numbers': 'Números',
  'extractor.dedupe': 'Quitar duplicados',
  'extractor.outPh': 'Aquí aparecerá lo encontrado, uno por línea…',
  'extractor.copyResult': 'Copiar resultado',
  'extractor.emailSing': 'email',
  'extractor.emailPlur': 'emails',
  'extractor.urlSing': 'URL',
  'extractor.urlPlur': 'URLs',
  'extractor.numSing': 'número',
  'extractor.numPlur': 'números',
  'extractor.none': 'Sin resultados',

  // Placeholder
  'placeholder.langAria': 'Idioma',
  'placeholder.paragraphs': 'Párrafos',
  'placeholder.copy': 'Copiar texto',
  'placeholder.paraSing': 'párrafo',
  'placeholder.paraPlur': 'párrafos',
  'placeholder.chars': 'caracteres',

  // Color (tarjeta, página y componente)
  'tool.color.label': 'Color',
  'tool.color.desc': 'Convierte, escala y contraste',
  'tool.color.title': 'Color y contraste',
  'tool.color.lead': 'Convierte HEX a RGB, HSL y OKLCH, genera tintes y sombras, y comprueba el contraste WCAG.',
  'color.colorLabel': 'Color',
  'color.bgLabel': 'Fondo',
  'color.invalid': 'Color no válido',
  'color.formats': 'Formatos',
  'color.scaleTitle': 'Tintes y sombras',
  'color.contrastTitle': 'Contraste WCAG',
  'color.sample': 'El veloz murciélago hindú comía feliz cardillo',
  'color.normal': 'Texto normal',
  'color.large': 'Texto grande',
  'color.pass': 'Cumple',
  'color.fail': 'No cumple',
  'color.base': 'Base',
  'color.copyHint': 'Pulsa cualquier valor o color para copiarlo.',

  // Gradientes (tarjeta, página y componente)
  'tool.gradiente.label': 'Gradientes',
  'tool.gradiente.desc': 'Crea degradados CSS',
  'tool.gradiente.title': 'Gradientes CSS',
  'tool.gradiente.lead': 'Crea degradados lineales, radiales y cónicos, y copia el CSS listo para usar.',
  'gradiente.preview': 'Vista previa del degradado',
  'gradiente.type': 'Tipo',
  'gradiente.linear': 'Lineal',
  'gradiente.radial': 'Radial',
  'gradiente.conic': 'Cónico',
  'gradiente.angle': 'Ángulo',
  'gradiente.shape': 'Forma',
  'gradiente.circle': 'Círculo',
  'gradiente.ellipse': 'Elipse',
  'gradiente.stops': 'Paradas de color',
  'gradiente.addStop': 'Añadir parada',
  'gradiente.removeStop': 'Quitar parada',
  'gradiente.random': 'Aleatorio',
  'gradiente.copyCss': 'Copiar CSS',
  'gradiente.colorAria': 'Color de la parada',
  'gradiente.posAria': 'Posición de la parada',

  // Sombras (tarjeta, página y componente)
  'tool.sombra.label': 'Sombras',
  'tool.sombra.desc': 'Crea sombras CSS',
  'tool.sombra.title': 'Sombras CSS',
  'tool.sombra.lead': 'Diseña sombras con varias capas y copia el box-shadow listo para usar.',
  'sombra.preview': 'Vista previa de la sombra',
  'sombra.layers': 'Capas',
  'sombra.layer': 'Capa',
  'sombra.addLayer': 'Añadir capa',
  'sombra.removeLayer': 'Quitar capa',
  'sombra.x': 'Desplazamiento X',
  'sombra.y': 'Desplazamiento Y',
  'sombra.blur': 'Desenfoque',
  'sombra.spread': 'Expansión',
  'sombra.color': 'Color',
  'sombra.opacity': 'Opacidad',
  'sombra.inset': 'Interior',
  'sombra.copyCss': 'Copiar CSS',

  // Regex (tarjeta, página y componente)
  'tool.regex.label': 'Regex',
  'tool.regex.desc': 'Prueba expresiones regulares',
  'tool.regex.title': 'Probador de regex',
  'tool.regex.lead': 'Prueba tus expresiones regulares y ve las coincidencias y los grupos resaltados en vivo.',
  'regex.pattern': 'Expresión',
  'regex.flags': 'Flags',
  'regex.flagG': 'global — busca todas las coincidencias',
  'regex.flagI': 'ignore case — no distingue mayúsculas',
  'regex.flagM': 'multiline — ^ y $ actúan por línea',
  'regex.flagS': 'dotAll — el punto también casa saltos de línea',
  'regex.flagU': 'unicode — trata el patrón como Unicode',
  'regex.text': 'Texto de prueba',
  'regex.result': 'Resultado',
  'regex.groups': 'Grupos',
  'regex.match': 'Coincidencia',
  'regex.pos': 'posición',
  'regex.named': 'con nombre',
  'regex.none': 'Sin coincidencias',
  'regex.one': '1 coincidencia',
  'regex.many': '{n} coincidencias',
  'regex.limited': 'límite de {n}',
  'regex.invalid': 'Expresión no válida',
  'regex.empty': 'Escribe una expresión para empezar',
  'regex.defaultPattern': '(?<usuario>[\\w.+-]+)@(?<dominio>[\\w.-]+\\.\\w+)',
  'regex.defaultText':
    'Escribe a ana.garcia@example.com o a soporte@navaja.es.\nPublicado el 2026-07-09 y actualizado el 2026-08-01.',
};

const en: Dict = {
  // Chrome
  'chrome.search': 'Search',
  'chrome.searchAria': 'Search tools',
  'chrome.themeAria': 'Toggle theme',
  'chrome.langAria': 'Language',

  // Home
  'home.metaTitle': 'Navaja — Text utilities',
  'home.metaDesc': 'A collection of fast, no-nonsense text utilities.',
  'home.eyebrow': '{n} text utilities · no distractions',
  'home.title': 'What do you need to do?',
  'home.launch': 'Search for a tool…',
  'home.launchAria': 'Search for a tool',
  'home.allTools': 'All tools',

  // Command palette
  'cmdk.placeholder': 'Search tools…',
  'cmdk.empty': 'No results',

  // Footer
  'footer.rights': '© {year} Navaja. All rights reserved.',
  'footer.os': 'Open source',
  'footer.by': 'Built by',

  // Common
  'common.copied': 'Copied!',
  'common.copy': 'Copy',
  'common.clear': 'Clear',
  'common.text': 'Text',
  'common.result': 'Result',
  'common.copyText': 'Copy text',

  // Cards
  'tool.contador.label': 'Counter',
  'tool.contador.desc': 'Count characters and words',
  'tool.conversor.label': 'Converter',
  'tool.conversor.desc': 'Uppercase, lowercase, capitalize',
  'tool.lorem.label': 'Lorem Ipsum',
  'tool.lorem.desc': 'Generate placeholder text',
  'tool.binario.label': 'Binary',
  'tool.binario.desc': 'Convert text ↔ binary',
  'tool.password.label': 'Passwords',
  'tool.password.desc': 'Generate secure passwords',
  'tool.base64.label': 'Base64',
  'tool.base64.desc': 'Encode and decode Base64',
  'tool.slug.label': 'Slug',
  'tool.slug.desc': 'Turn text into a URL slug',
  'tool.naming.label': 'Naming',
  'tool.naming.desc': 'Generate business names',
  'tool.diff.label': 'Diff',
  'tool.diff.desc': 'Compare two texts',
  'tool.json.label': 'JSON',
  'tool.json.desc': 'Format and validate JSON',
  'tool.url.label': 'URL encode',
  'tool.url.desc': 'Encode and decode URLs',
  'tool.limpiador.label': 'Cleaner',
  'tool.limpiador.desc': 'Clean spaces and invisible characters',
  'tool.ordenar.label': 'Sort lines',
  'tool.ordenar.desc': 'Sort lists and remove duplicates',
  'tool.extractor.label': 'Extractor',
  'tool.extractor.desc': 'Extract emails, URLs or numbers',
  'tool.placeholder.label': 'Placeholder',
  'tool.placeholder.desc': 'Multilingual sample text',

  // Pages
  'tool.contador.title': 'Character counter',
  'tool.contador.lead': 'Type or paste a phrase and count its characters and words instantly.',
  'tool.conversor.title': 'Text converter',
  'tool.conversor.lead': 'Paste your text and transform it: sentence case, lowercase, UPPERCASE or Title Case.',
  'tool.lorem.title': 'Lorem Ipsum',
  'tool.lorem.lead': 'Generate placeholder text instantly: choose paragraphs, sentences or words and copy it.',
  'tool.binario.title': 'Text ↔ Binary',
  'tool.binario.lead': 'Convert text to binary and binary to text instantly, both ways.',
  'tool.password.title': 'Password generator',
  'tool.password.lead': 'Create secure, random passwords with the complexity level you choose.',
  'tool.base64.title': 'Text ↔ Base64',
  'tool.base64.lead': 'Encode and decode Base64 instantly, both ways.',
  'tool.slug.title': 'URL slug',
  'tool.slug.lead': 'Turn any text into a clean, readable slug for URLs.',
  'tool.naming.title': 'Naming',
  'tool.naming.lead': 'Generate business names by combining prefixes and suffixes.',
  'tool.diff.title': 'Diff',
  'tool.diff.lead': 'Compare two texts and see the differences line by line.',
  'tool.json.title': 'JSON',
  'tool.json.lead': 'Format, minify and validate JSON instantly.',
  'tool.url.title': 'URL encode',
  'tool.url.lead': 'Encode and decode text to use it in URLs.',
  'tool.limpiador.title': 'Text cleaner',
  'tool.limpiador.lead': 'Remove double spaces, extra line breaks and invisible characters.',
  'tool.ordenar.title': 'Sort lines',
  'tool.ordenar.lead': 'Sort lists alphabetically, in reverse or at random, and remove duplicates.',
  'tool.extractor.title': 'Extractor',
  'tool.extractor.lead': 'Extract all emails, URLs or numbers from any text.',
  'tool.placeholder.title': 'Placeholder',
  'tool.placeholder.lead': 'Sample text with real words in 11 writing systems.',

  // Counter
  'contador.fieldLabel': 'Type your text',
  'contador.ph': 'Type or paste your text here…',
  'contador.chars': 'Characters',
  'contador.noSpaces': 'No spaces',
  'contador.words': 'Words',

  // Converter
  'conversor.origLabel': 'Original text',
  'conversor.origPh': 'Type or paste the text you want to convert here…',
  'conversor.outPh': 'The converted text will appear here…',
  'conversor.group': 'Conversion type',
  'conversor.sentence': 'Sentence case',
  'conversor.lower': 'lowercase',
  'conversor.upper': 'UPPERCASE',
  'conversor.title': 'Title Case',

  // Lorem
  'lorem.amount': 'Amount',
  'lorem.unit': 'Unit',
  'lorem.paragraphs': 'Paragraphs',
  'lorem.sentences': 'Sentences',
  'lorem.words': 'Words',
  'lorem.classic': 'Start with “Lorem ipsum…”',
  'lorem.generate': 'Generate',
  'lorem.outPh': 'The generated text will appear here…',

  // Binary
  'binario.binary': 'Binary',
  'binario.ph': 'Type or paste text…',
  'binario.copyBinary': 'Copy binary',
  'binario.binCopied': 'Binary copied!',
  'binario.textCopied': 'Text copied!',

  // Passwords
  'password.genAria': 'Generated password',
  'password.length': 'Length:',
  'password.upper': 'Uppercase (A-Z)',
  'password.lower': 'Lowercase (a-z)',
  'password.num': 'Numbers (0-9)',
  'password.sym': 'Symbols (!@#…)',
  'password.ambig': 'Avoid ambiguous (l, 1, O, 0…)',
  'password.regen': 'Generate again',
  'password.strengthPrefix': 'Strength: ',
  'password.weak': 'Weak',
  'password.medium': 'Medium',
  'password.strong': 'Strong',
  'password.veryStrong': 'Very strong',
  'password.chooseType': 'Choose at least one character type',

  // Base64
  'base64.ph': 'Type or paste text…',
  'base64.copyB64': 'Copy Base64',
  'base64.b64Copied': 'Base64 copied!',
  'base64.textCopied': 'Text copied!',
  'base64.invalid': 'Invalid Base64',

  // Slug
  'slug.ph': 'e.g. How to make coffee with milk?',
  'slug.sep': 'Separator',
  'slug.hyphen': 'Hyphen (-)',
  'slug.underscore': 'Underscore (_)',
  'slug.slugLabel': 'Slug',
  'slug.genAria': 'Generated slug',
  'slug.copy': 'Copy slug',

  // Naming
  'naming.baseWord': 'Base word',
  'naming.ph': 'e.g. web, taco, trip…',
  'naming.empty': 'Type a word to see 16 name ideas. Click any to copy it.',
  'naming.withPrefix': 'With prefix',
  'naming.withSuffix': 'With suffix',
  'naming.copyAll': 'Copy all',

  // Diff
  'diff.original': 'Original',
  'diff.modified': 'Modified',
  'diff.origPh': 'Paste the original text…',
  'diff.modPh': 'Paste the modified text…',
  'diff.copy': 'Copy diff',
  'diff.hint': 'Paste two texts to see the differences line by line.',
  'diff.identical': 'The texts are identical.',
  'diff.tooMany': 'Too many differing lines to compare (max {max}).',
  'diff.added': 'added',
  'diff.removed': 'removed',

  // JSON
  'json.ph': '{"name": "Navaja", "tools": 15}',
  'json.format': 'Format',
  'json.minify': 'Minify',
  'json.valid': 'Valid JSON',
  'json.pos': ' (line {line}, column {col})',

  // URL
  'url.ph': 'Type or paste text… e.g. how to make coffee?',
  'url.encodedLabel': 'Encoded URL',
  'url.mode': 'Mode',
  'url.modeComponent': 'Component (encode everything)',
  'url.modeFull': 'Full URL (keep / ? & =)',
  'url.copyEncoded': 'Copy encoded',
  'url.urlCopied': 'URL copied!',
  'url.textCopied': 'Text copied!',
  'url.invalid': 'Invalid % sequence',

  // Cleaner
  'limpiador.origLabel': 'Original text',
  'limpiador.origPh': 'Paste the text to clean here…',
  'limpiador.cleanLabel': 'Clean text',
  'limpiador.cleanPh': 'The result will appear here…',
  'limpiador.optSpaces': 'Duplicate spaces',
  'limpiador.optBreaks': 'Extra line breaks',
  'limpiador.optInvisible': 'Invisible characters (zero-width, nbsp…)',
  'limpiador.optTrim': 'Leading/trailing spaces',
  'limpiador.copyClean': 'Copy clean',
  'limpiador.clearFields': 'Clear fields',
  'limpiador.removed': '−{n} characters',

  // Sort lines
  'ordenar.linesLabel': 'Lines',
  'ordenar.linesPh': 'Paste a list, one item per line…',
  'ordenar.outPh': 'The sorted list will appear here…',
  'ordenar.order': 'Order',
  'ordenar.az': 'Alphabetical (A→Z)',
  'ordenar.za': 'Reverse (Z→A)',
  'ordenar.random': 'Random',
  'ordenar.dedupe': 'Remove duplicates',
  'ordenar.nocase': 'Ignore case',
  'ordenar.noempty': 'Remove empty lines',
  'ordenar.copyResult': 'Copy result',
  'ordenar.shuffle': 'Shuffle again',
  'ordenar.lines': '{n} lines',
  'ordenar.ofTotal': 'of {total}',

  // Extractor
  'extractor.ph': 'Paste any text here: an email, a log, a page…',
  'extractor.extract': 'Extract',
  'extractor.emails': 'Emails',
  'extractor.urls': 'URLs',
  'extractor.numbers': 'Numbers',
  'extractor.dedupe': 'Remove duplicates',
  'extractor.outPh': 'Matches will appear here, one per line…',
  'extractor.copyResult': 'Copy result',
  'extractor.emailSing': 'email',
  'extractor.emailPlur': 'emails',
  'extractor.urlSing': 'URL',
  'extractor.urlPlur': 'URLs',
  'extractor.numSing': 'number',
  'extractor.numPlur': 'numbers',
  'extractor.none': 'No results',

  // Placeholder
  'placeholder.langAria': 'Language',
  'placeholder.paragraphs': 'Paragraphs',
  'placeholder.copy': 'Copy text',
  'placeholder.paraSing': 'paragraph',
  'placeholder.paraPlur': 'paragraphs',
  'placeholder.chars': 'characters',

  // Color (card, page and component)
  'tool.color.label': 'Color',
  'tool.color.desc': 'Convert, scale and contrast',
  'tool.color.title': 'Color and contrast',
  'tool.color.lead': 'Convert HEX to RGB, HSL and OKLCH, generate tints and shades, and check WCAG contrast.',
  'color.colorLabel': 'Color',
  'color.bgLabel': 'Background',
  'color.invalid': 'Invalid color',
  'color.formats': 'Formats',
  'color.scaleTitle': 'Tints and shades',
  'color.contrastTitle': 'WCAG contrast',
  'color.sample': 'The quick brown fox jumps over the lazy dog',
  'color.normal': 'Normal text',
  'color.large': 'Large text',
  'color.pass': 'Pass',
  'color.fail': 'Fail',
  'color.base': 'Base',
  'color.copyHint': 'Click any value or swatch to copy it.',

  // Gradients (card, page and component)
  'tool.gradiente.label': 'Gradients',
  'tool.gradiente.desc': 'Create CSS gradients',
  'tool.gradiente.title': 'CSS gradients',
  'tool.gradiente.lead': 'Create linear, radial and conic gradients, and copy the CSS ready to use.',
  'gradiente.preview': 'Gradient preview',
  'gradiente.type': 'Type',
  'gradiente.linear': 'Linear',
  'gradiente.radial': 'Radial',
  'gradiente.conic': 'Conic',
  'gradiente.angle': 'Angle',
  'gradiente.shape': 'Shape',
  'gradiente.circle': 'Circle',
  'gradiente.ellipse': 'Ellipse',
  'gradiente.stops': 'Color stops',
  'gradiente.addStop': 'Add stop',
  'gradiente.removeStop': 'Remove stop',
  'gradiente.random': 'Random',
  'gradiente.copyCss': 'Copy CSS',
  'gradiente.colorAria': 'Stop color',
  'gradiente.posAria': 'Stop position',

  // Shadows (card, page and component)
  'tool.sombra.label': 'Shadows',
  'tool.sombra.desc': 'Create CSS shadows',
  'tool.sombra.title': 'CSS shadows',
  'tool.sombra.lead': 'Design multi-layer shadows and copy the box-shadow ready to use.',
  'sombra.preview': 'Shadow preview',
  'sombra.layers': 'Layers',
  'sombra.layer': 'Layer',
  'sombra.addLayer': 'Add layer',
  'sombra.removeLayer': 'Remove layer',
  'sombra.x': 'Offset X',
  'sombra.y': 'Offset Y',
  'sombra.blur': 'Blur',
  'sombra.spread': 'Spread',
  'sombra.color': 'Color',
  'sombra.opacity': 'Opacity',
  'sombra.inset': 'Inset',
  'sombra.copyCss': 'Copy CSS',

  // Regex (card, page and component)
  'tool.regex.label': 'Regex',
  'tool.regex.desc': 'Test regular expressions',
  'tool.regex.title': 'Regex tester',
  'tool.regex.lead': 'Test your regular expressions and see matches and groups highlighted live.',
  'regex.pattern': 'Pattern',
  'regex.flags': 'Flags',
  'regex.flagG': 'global — find every match',
  'regex.flagI': 'ignore case — case-insensitive',
  'regex.flagM': 'multiline — ^ and $ match per line',
  'regex.flagS': 'dotAll — dot also matches newlines',
  'regex.flagU': 'unicode — treat the pattern as Unicode',
  'regex.text': 'Test text',
  'regex.result': 'Result',
  'regex.groups': 'Groups',
  'regex.match': 'Match',
  'regex.pos': 'position',
  'regex.named': 'named',
  'regex.none': 'No matches',
  'regex.one': '1 match',
  'regex.many': '{n} matches',
  'regex.limited': '{n} limit',
  'regex.invalid': 'Invalid pattern',
  'regex.empty': 'Type a pattern to start',
  'regex.defaultPattern': '(?<user>[\\w.+-]+)@(?<domain>[\\w.-]+\\.\\w+)',
  'regex.defaultText':
    'Write to ana.garcia@example.com or soporte@navaja.es.\nPublished on 2026-07-09 and updated on 2026-08-01.',
};

export const ui: Record<Locale, Dict> = { es, en };

export function getLocale(astro: { currentLocale?: string }): Locale {
  const l = astro.currentLocale;
  return l === 'en' ? 'en' : 'es';
}

export function useTranslations(locale: Locale) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    let s = ui[locale][key] ?? ui[defaultLocale][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };
}

// Ruta base sin prefijo de idioma ni barras: '/en/contador/' → 'contador', '/' → ''.
export function basePath(pathname: string): string {
  const seg = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (seg[0] === 'en') seg.shift();
  return seg.join('/');
}
