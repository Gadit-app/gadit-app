import { Lang } from "./i18n";

export type ContactContent = {
  pageTitle: string;
  pageSubtitle: string;
  faqHeading: string;
  stillNeedHelpHeading: string;
  stillNeedHelpBody: string;
  emailButton: string;
  responseTime: string;
  faq: { q: string; a: string }[];
};

export const CONTACT: Record<Lang, ContactContent> = {
  en: {
    pageTitle: "Contact & FAQ",
    pageSubtitle: "Common questions, and how to reach us if you can't find what you're looking for.",
    faqHeading: "Frequently asked questions",
    stillNeedHelpHeading: "Still need help?",
    stillNeedHelpBody: "If your question isn't answered here, email us directly. We read every message.",
    emailButton: "Email support",
    responseTime: "We usually reply within 24 to 48 hours.",
    faq: [
      {
        q: "What is Gadit?",
        a: "Gadit is a smart dictionary that goes far beyond a regular definition. You get clear meanings, real life examples, etymology (the origin of the word), idioms and expressions, kids explanations, illustrations, sentence practice with feedback, and short quizzes. New features are added all the time to make sure everyone really understands words.",
      },
      {
        q: "Which languages does Gadit support?",
        a: "The interface currently supports English, Hebrew, Arabic, Russian, Spanish, Portuguese, and French, with more on the way.",
      },
      {
        q: "How is Gadit different from a regular dictionary?",
        a: "A regular dictionary gives you a definition and a few example sentences. With Gadit you can illustrate the word with an image, you can write a full sentence with the word and get exactly the meaning that fits the context, you can practice the word by writing your own sentence and get feedback, and at the end you can also take a short quiz to lock it in.",
      },
      {
        q: "What subscription plans are available?",
        a: "There are three. Basic is free, requires no signup, and includes definitions, examples, and etymology (the origin of the word). Clear adds kids explanations, idioms and expressions, illustrations, voice input, sentence practice with feedback, and search history, with 14 free trial days. Deep adds interactive quizzes that help you really lock in what you learned.",
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes. You can cancel your subscription at any time from your account area. Access to the paid plan remains until the end of the current billing period.",
      },
      {
        q: "How accurate are Gadit's definitions?",
        a: "Definitions are written to be clear, useful, and faithful to how words are actually used.",
      },
      {
        q: "What happens to my data and search history?",
        a: "Your account data, search history (up to the 10 most recent words), and generated images are stored securely. We never sell your data. For full details, see our Privacy Policy.",
      },
    ],
  },

  he: {
    pageTitle: "יצירת קשר ושאלות נפוצות",
    pageSubtitle: "שאלות נפוצות, ואיך אפשר לפנות אלינו אם לא מצאתם את מה שחיפשתם.",
    faqHeading: "שאלות נפוצות",
    stillNeedHelpHeading: "עדיין צריכים עזרה?",
    stillNeedHelpBody: "אם השאלה שלכם לא מופיעה כאן, פשוט כתבו לנו. אנחנו קוראים כל הודעה.",
    emailButton: "שליחת מייל לתמיכה",
    responseTime: "בדרך כלל אנחנו חוזרים תוך 24 עד 48 שעות.",
    faq: [
      {
        q: "מה זה Gadit?",
        a: "Gadit הוא מילון חכם שהולך הרבה מעבר להגדרה רגילה. מקבלים משמעויות ברורות, דוגמאות מהחיים, אטימולוגיה (מקור המילה), ניבים וצירופי מילים, הסבר לילדים, המחשה בתמונות, תרגול משפטים עם פידבק, וחידונים קצרים. ותכונות חדשות שמתווספות כל הזמן כדי לוודא שכל אחד מבין מילים עד הסוף.",
      },
      {
        q: "באילו שפות Gadit תומך?",
        a: "הממשק תומך כרגע באנגלית, עברית, ערבית, רוסית, ספרדית, פורטוגזית וצרפתית, ועוד שפות בדרך.",
      },
      {
        q: "במה Gadit שונה ממילון רגיל?",
        a: "מילון רגיל נותן הגדרה ומשפטים לדוגמה. ב-Gadit אפשר להמחיש את המילה עם תמונה, אפשר לכתוב משפט שלם עם המילה ולקבל בדיוק את ההגדרה שמתאימה להקשר, אפשר לתרגל את המילה בכתיבת משפט משלכם ולקבל פידבק, ובסוף אפשר גם לעבור חידון קצר כדי להטמיע אותה.",
      },
      {
        q: "מה הם סוגי המנויים הקיימים?",
        a: "יש שלושה סוגים. Basic הוא חינמי, לא דורש הרשמה, וכולל הגדרות, דוגמאות, ואטימולוגיה (מקור המילה). Clear מוסיף הסברים לילדים, ניבים וצירופי מילים, המחשה בתמונות, הקלדה קולית, תרגול משפטים עם פידבק, והיסטוריית חיפושים, עם 14 ימי התנסות חינם. Deep מוסיף חידונים אינטראקטיביים שעוזרים להטמיע את החומר.",
      },
      {
        q: "האם אני יכול לבטל את המנוי בכל עת?",
        a: "כן. ניתן לבטל את המנוי בכל עת דרך אזור החשבון שלך. הגישה לתוכנית בתשלום נשמרת עד סוף תקופת החיוב הנוכחית.",
      },
      {
        q: "עד כמה ההגדרות של Gadit מדויקות?",
        a: "ההגדרות נכתבות כך שיהיו ברורות, מועילות ונאמנות לאופן שבו המילים באמת בשימוש.",
      },
      {
        q: "מה קורה למידע ולהיסטוריית החיפוש שלי?",
        a: "נתוני החשבון, היסטוריית החיפוש (עד 10 מילים אחרונות), והתמונות שנוצרו נשמרים באופן מאובטח. אנחנו לא מוכרים את המידע שלכם. לפרטים מלאים, אפשר לעיין במדיניות הפרטיות.",
      },
    ],
  },

  ar: {
    pageTitle: "الاتصال والأسئلة الشائعة",
    pageSubtitle: "الأسئلة الشائعة، وكيف يمكنك التواصل معنا إذا لم تجد ما تبحث عنه.",
    faqHeading: "الأسئلة الشائعة",
    stillNeedHelpHeading: "ما زلت بحاجة إلى المساعدة؟",
    stillNeedHelpBody: "إذا لم تجد إجابة سؤالك هنا، راسلنا مباشرةً. نحن نقرأ كل رسالة.",
    emailButton: "مراسلة الدعم",
    responseTime: "نرد عادةً خلال 24 إلى 48 ساعة.",
    faq: [
      {
        q: "ما هو Gadit؟",
        a: "Gadit قاموس ذكي يتجاوز التعريف العادي بكثير. تحصل على معانٍ واضحة، أمثلة من الحياة الواقعية، علم اشتقاق (أصل الكلمة)، تعابير اصطلاحية وعبارات شائعة، شروحات للأطفال، رسوم توضيحية، تدريب على الجمل مع تغذية راجعة، واختبارات قصيرة. وتُضاف ميزات جديدة باستمرار لضمان أن يفهم الجميع الكلمات حقًا.",
      },
      {
        q: "ما اللغات التي يدعمها Gadit؟",
        a: "تدعم الواجهة حاليًا الإنجليزية، العبرية، العربية، الروسية، الإسبانية، البرتغالية، والفرنسية، والمزيد قادم.",
      },
      {
        q: "كيف يختلف Gadit عن قاموس عادي؟",
        a: "القاموس العادي يعطيك تعريفًا وبعض الأمثلة. مع Gadit يمكنك توضيح الكلمة بصورة، يمكنك كتابة جملة كاملة بالكلمة والحصول بالضبط على المعنى الذي يناسب السياق، يمكنك التدرب على الكلمة بكتابة جملتك الخاصة والحصول على تغذية راجعة، وفي النهاية يمكنك أيضًا إجراء اختبار قصير لتثبيتها.",
      },
      {
        q: "ما هي خطط الاشتراك المتاحة؟",
        a: "هناك ثلاث خطط. Basic مجانية، لا تتطلب تسجيلًا، وتشمل التعريفات، الأمثلة، وعلم الاشتقاق (أصل الكلمة). Clear تضيف شروحات للأطفال، تعابير اصطلاحية وعبارات شائعة، رسومًا توضيحية، إدخالًا صوتيًا، تدريبًا على الجمل مع تغذية راجعة، وسجل البحث، مع 14 يومًا تجريبيًا مجانيًا. Deep تضيف اختبارات تفاعلية تساعدك على تثبيت ما تعلمته.",
      },
      {
        q: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
        a: "نعم. يمكنك إلغاء اشتراكك في أي وقت من منطقة حسابك. يستمر الوصول إلى الخطة المدفوعة حتى نهاية فترة الفوترة الحالية.",
      },
      {
        q: "ما مدى دقة تعريفات Gadit؟",
        a: "تُكتب التعريفات لتكون واضحة، مفيدة، ووفية للطريقة التي تُستخدم بها الكلمات فعلًا.",
      },
      {
        q: "ماذا يحدث لبياناتي وسجل البحث الخاص بي؟",
        a: "بيانات حسابك، سجل البحث (حتى 10 كلمات حديثة)، والصور التي تم إنشاؤها تُخزَّن بأمان. نحن لا نبيع بياناتك أبدًا. للتفاصيل الكاملة، يمكنك مراجعة سياسة الخصوصية.",
      },
    ],
  },

  ru: {
    pageTitle: "Контакты и частые вопросы",
    pageSubtitle: "Часто задаваемые вопросы и как с нами связаться, если вы не нашли ответ.",
    faqHeading: "Часто задаваемые вопросы",
    stillNeedHelpHeading: "Нужна ещё помощь?",
    stillNeedHelpBody: "Если вашего вопроса нет здесь, напишите нам напрямую. Мы читаем каждое сообщение.",
    emailButton: "Написать в поддержку",
    responseTime: "Обычно отвечаем в течение 24 до 48 часов.",
    faq: [
      {
        q: "Что такое Gadit?",
        a: "Gadit — это умный словарь, который выходит далеко за рамки обычного определения. Вы получаете ясные значения, живые примеры, этимологию (происхождение слова), идиомы и устойчивые выражения, объяснения для детей, иллюстрации, практику предложений с обратной связью и короткие викторины. Постоянно добавляются новые возможности, чтобы каждый по-настоящему понимал слова.",
      },
      {
        q: "Какие языки поддерживает Gadit?",
        a: "Интерфейс сейчас поддерживает английский, иврит, арабский, русский, испанский, португальский и французский, и добавятся ещё.",
      },
      {
        q: "Чем Gadit отличается от обычного словаря?",
        a: "Обычный словарь даёт определение и несколько примеров. В Gadit можно проиллюстрировать слово картинкой, можно написать целое предложение со словом и получить именно то значение, которое подходит контексту, можно потренироваться, написав своё собственное предложение и получить обратную связь, а в конце можно ещё пройти короткую викторину, чтобы закрепить его.",
      },
      {
        q: "Какие тарифы существуют?",
        a: "Их три. Basic бесплатный, не требует регистрации и включает определения, примеры и этимологию (происхождение слова). Clear добавляет объяснения для детей, идиомы и устойчивые выражения, иллюстрации, голосовой ввод, практику предложений с обратной связью и историю поиска, с 14 днями бесплатного пробного периода. Deep добавляет интерактивные викторины, которые помогают по-настоящему закрепить пройденное.",
      },
      {
        q: "Могу ли я отменить подписку в любое время?",
        a: "Да. Вы можете отменить подписку в любое время в разделе аккаунта. Доступ к платному тарифу сохраняется до конца текущего периода оплаты.",
      },
      {
        q: "Насколько точны определения Gadit?",
        a: "Определения пишутся так, чтобы быть ясными, полезными и верными тому, как слова реально используются.",
      },
      {
        q: "Что происходит с моими данными и историей поиска?",
        a: "Данные аккаунта, история поиска (до 10 недавних слов) и созданные изображения хранятся в защищённом виде. Мы никогда не продаём ваши данные. Подробнее можно прочитать в Политике конфиденциальности.",
      },
    ],
  },

  es: {
    pageTitle: "Contacto y preguntas frecuentes",
    pageSubtitle: "Preguntas comunes y cómo comunicarte con nosotros si no encuentras lo que buscas.",
    faqHeading: "Preguntas frecuentes",
    stillNeedHelpHeading: "¿Todavía necesitas ayuda?",
    stillNeedHelpBody: "Si tu pregunta no está aquí, escríbenos directamente. Leemos cada mensaje.",
    emailButton: "Escribir a soporte",
    responseTime: "Solemos responder en 24 a 48 horas.",
    faq: [
      {
        q: "¿Qué es Gadit?",
        a: "Gadit es un diccionario inteligente que va mucho más allá de una definición común. Obtienes significados claros, ejemplos de la vida real, etimología (el origen de la palabra), modismos y expresiones, explicaciones para niños, ilustraciones, práctica de oraciones con retroalimentación y cuestionarios breves. Se añaden nuevas funciones todo el tiempo para que todos entiendan de verdad las palabras.",
      },
      {
        q: "¿Qué idiomas admite Gadit?",
        a: "La interfaz actualmente admite inglés, hebreo, árabe, ruso, español, portugués y francés, y habrá más.",
      },
      {
        q: "¿En qué se diferencia Gadit de un diccionario común?",
        a: "Un diccionario común te da una definición y algunos ejemplos. Con Gadit puedes ilustrar la palabra con una imagen, puedes escribir una oración completa con la palabra y obtener exactamente el significado que encaja con el contexto, puedes practicar la palabra escribiendo tu propia oración y recibir retroalimentación, y al final también puedes hacer un cuestionario breve para fijarla.",
      },
      {
        q: "¿Qué planes de suscripción están disponibles?",
        a: "Hay tres. Basic es gratis, no requiere registro, e incluye definiciones, ejemplos y etimología (el origen de la palabra). Clear añade explicaciones para niños, modismos y expresiones, ilustraciones, entrada por voz, práctica de oraciones con retroalimentación e historial de búsqueda, con 14 días de prueba gratis. Deep añade cuestionarios interactivos que te ayudan a fijar de verdad lo aprendido.",
      },
      {
        q: "¿Puedo cancelar mi suscripción en cualquier momento?",
        a: "Sí. Puedes cancelar tu suscripción en cualquier momento desde tu área de cuenta. El acceso al plan de pago se mantiene hasta el final del período de facturación actual.",
      },
      {
        q: "¿Qué tan precisas son las definiciones de Gadit?",
        a: "Las definiciones están escritas para ser claras, útiles y fieles a cómo se usan realmente las palabras.",
      },
      {
        q: "¿Qué pasa con mis datos y mi historial de búsqueda?",
        a: "Los datos de tu cuenta, tu historial de búsqueda (hasta 10 palabras recientes) y las imágenes generadas se almacenan de forma segura. Nunca vendemos tus datos. Para más detalles, puedes consultar nuestra Política de Privacidad.",
      },
    ],
  },

  pt: {
    pageTitle: "Contato e perguntas frequentes",
    pageSubtitle: "Perguntas comuns e como falar conosco se você não encontrar o que procura.",
    faqHeading: "Perguntas frequentes",
    stillNeedHelpHeading: "Ainda precisa de ajuda?",
    stillNeedHelpBody: "Se sua pergunta não está aqui, escreva para a gente. Lemos todas as mensagens.",
    emailButton: "Enviar e-mail ao suporte",
    responseTime: "Costumamos responder em 24 a 48 horas.",
    faq: [
      {
        q: "O que é o Gadit?",
        a: "O Gadit é um dicionário inteligente que vai muito além de uma definição comum. Você recebe significados claros, exemplos do dia a dia, etimologia (a origem da palavra), expressões idiomáticas e combinações de palavras, explicações para crianças, ilustrações, prática de frases com feedback e quizzes curtos. Novas funcionalidades são adicionadas o tempo todo para garantir que todos realmente entendam as palavras.",
      },
      {
        q: "Quais idiomas o Gadit suporta?",
        a: "A interface atualmente oferece inglês, hebraico, árabe, russo, espanhol, português e francês, com mais a caminho.",
      },
      {
        q: "Como o Gadit é diferente de um dicionário comum?",
        a: "Um dicionário comum dá uma definição e alguns exemplos. No Gadit você pode ilustrar a palavra com uma imagem, pode escrever uma frase completa com a palavra e receber exatamente o significado que combina com o contexto, pode praticar a palavra escrevendo sua própria frase e receber feedback, e no final ainda pode fazer um quiz curto para fixá-la.",
      },
      {
        q: "Quais planos de assinatura estão disponíveis?",
        a: "Existem três. Basic é gratuito, não exige cadastro, e inclui definições, exemplos e etimologia (a origem da palavra). Clear adiciona explicações para crianças, expressões idiomáticas e combinações de palavras, ilustrações, entrada de voz, prática de frases com feedback e histórico de buscas, com 14 dias de teste grátis. Deep adiciona quizzes interativos que ajudam você a fixar de verdade o que aprendeu.",
      },
      {
        q: "Posso cancelar minha assinatura a qualquer momento?",
        a: "Sim. Você pode cancelar sua assinatura a qualquer momento na sua área de conta. O acesso ao plano pago permanece até o fim do período de cobrança atual.",
      },
      {
        q: "Quão precisas são as definições do Gadit?",
        a: "As definições são escritas para serem claras, úteis e fiéis ao modo como as palavras são realmente usadas.",
      },
      {
        q: "O que acontece com meus dados e meu histórico de buscas?",
        a: "Os dados da sua conta, o histórico de buscas (até 10 palavras recentes) e as imagens geradas ficam armazenados com segurança. Nunca vendemos seus dados. Para detalhes completos, você pode consultar nossa Política de Privacidade.",
      },
    ],
  },

  fr: {
    pageTitle: "Contact et questions fréquentes",
    pageSubtitle: "Questions courantes et comment nous contacter si vous ne trouvez pas ce que vous cherchez.",
    faqHeading: "Foire aux questions",
    stillNeedHelpHeading: "Besoin d'aide supplémentaire ?",
    stillNeedHelpBody: "Si votre question n'a pas de réponse ici, écrivez-nous directement. Nous lisons chaque message.",
    emailButton: "Contacter le support",
    responseTime: "Nous répondons généralement sous 24 à 48 heures.",
    faq: [
      {
        q: "Qu'est-ce que Gadit ?",
        a: "Gadit est un dictionnaire intelligent qui va bien au-delà d'une définition classique. Vous obtenez des significations claires, des exemples de la vie réelle, l'étymologie (l'origine du mot), des expressions et tournures, des explications pour enfants, des illustrations, un entraînement aux phrases avec retour, et de courts quiz. De nouvelles fonctionnalités sont ajoutées en permanence pour que chacun comprenne vraiment les mots.",
      },
      {
        q: "Quelles langues Gadit prend-il en charge ?",
        a: "L'interface prend actuellement en charge l'anglais, l'hébreu, l'arabe, le russe, l'espagnol, le portugais et le français, et d'autres arrivent.",
      },
      {
        q: "En quoi Gadit est-il différent d'un dictionnaire classique ?",
        a: "Un dictionnaire classique donne une définition et quelques exemples. Avec Gadit vous pouvez illustrer le mot par une image, vous pouvez écrire une phrase complète avec le mot et obtenir exactement le sens qui correspond au contexte, vous pouvez vous entraîner sur le mot en écrivant votre propre phrase et recevoir un retour, et à la fin vous pouvez aussi passer un court quiz pour bien l'ancrer.",
      },
      {
        q: "Quelles formules d'abonnement sont disponibles ?",
        a: "Il y en a trois. Basic est gratuite, ne nécessite pas d'inscription, et inclut les définitions, les exemples et l'étymologie (l'origine du mot). Clear ajoute les explications pour enfants, les expressions et tournures, les illustrations, la saisie vocale, l'entraînement aux phrases avec retour, et l'historique de recherche, avec 14 jours d'essai gratuit. Deep ajoute des quiz interactifs qui vous aident à vraiment ancrer ce que vous avez appris.",
      },
      {
        q: "Puis-je annuler mon abonnement à tout moment ?",
        a: "Oui. Vous pouvez annuler votre abonnement à tout moment depuis votre espace compte. L'accès à la formule payante est conservé jusqu'à la fin de la période de facturation en cours.",
      },
      {
        q: "Quelle est la précision des définitions de Gadit ?",
        a: "Les définitions sont rédigées pour être claires, utiles et fidèles à la façon dont les mots sont réellement utilisés.",
      },
      {
        q: "Que deviennent mes données et mon historique de recherche ?",
        a: "Les données de votre compte, votre historique (jusqu'à 10 mots récents) et les images générées sont stockés en toute sécurité. Nous ne vendons jamais vos données. Pour plus de détails, vous pouvez consulter notre Politique de confidentialité.",
      },
    ],
  },
};
