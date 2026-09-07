# -*- coding: utf-8 -*-
"""Situations, and the many ways a person might describe being in one.

`match`   — regex run over the hadith's English text to auto-assign the situation
`feelings`— what a visitor might actually type. This list is the product; be generous.
"""

CATEGORIES = {
    "heart":      ("The heart",        "What you are feeling right now"),
    "hardship":   ("Hardship",         "When something has gone wrong"),
    "people":     ("People & family",  "Marriage, children, parents, others"),
    "provision":  ("Work & provision", "Money, work, study, decisions"),
    "faith":      ("Faith & the self", "Sin, doubt, guidance, closeness"),
    "protection": ("Protection",       "Seeking refuge and safety"),
    "body":       ("Health & the body","Illness, pain, healing"),
    "daily":      ("Through the day",  "Morning to night, and the ordinary moments"),
    "reference":  ("Remembrance & more","Praise, glorification, and the wider collection"),
}

AR_PATTERNS = {'debt': 'المغرم|ضلع الدين|اقض عنا الدين|من الدين|الماثم والمغرم',
     'poverty': 'الرزق|الفقر|اغنني|اغننا|الغني|رزقا',
     'illness': 'اشف|الشفاء|شفاء|السقم|المرض|البرص|الجذام|الجنون|سيء الاسقام|البلاء',
     'forgiveness': 'اغفر|استغفر|المغفره|تب علي|ذنب|ذنوبي|خطاياي|توبه',
     'death-remembrance': 'القبر|الموت|توفني|النار|الجنه|عذاب|الحساب|البعث',
     'children': 'ذريه|الولد|اولاد|ابني|ابنتي|الحسن والحسين|بارك له',
     'anxiety': 'الهم|الحزن|الغم|الكرب',
     'sadness': 'الحزن|الهم',
     'fear': 'الخوف|روعاتي|فزع|امن روعاتي|الجبن',
     'knowledge': 'علما|العلم|فقه|علمني',
     'travel': 'السفر|سفرنا|وعثاء|الظعن|المنقلب',
     'marriage': 'زوج|ازواجنا|النكاح|اهلي',
     'refuge': 'اعوذ بك|اعوذ بالله|اجرني|اعذني',
     'anger': 'الغضب|الشيطان الرجيم',
     'oppression': 'الظلم|المظلوم|ظلمت|القهر|قهر الرجال|غلبه الرجال',
     'steadfastness': 'ثبت|الصبر|صابر|استقم',
     'weak-iman': 'مقلب القلوب|ثبت قلبي|اهدني|الهدي|دينك|قلبي',
     'sleep': 'باسمك اللهم اموت|المضجع|النوم|احيا|الرؤيا',
     'eating': 'اطعمنا|طعام|اطعم|بارك لنا فيه|سقانا|شراب',
     'rain-weather': 'الغيث|المطر|السحاب|الريح|صيبا|هلال|الرعد',
    'parents': 'والدي|والديه|لوالدي|ارحمهما|كما ربياني|والدين',
    'death': 'الميت|المقابر|القبور|اهل الديار|جنازه|اجرني في مصيبتي|اللهم اغفر له وارحمه|توفيتني',
    'gratitude': 'الحمد لله|الشكر|اشكر|انعمت|نعمتك|اوزعني',
    'distress': 'الكرب|كربي|الشدائد|الفرج|البلاء|جهد البلاء',
    'prayer': 'ركعت|سجد|الركوع|السجود|التحيات|القنوت|رب اغفر لي وارحمني|وجهت وجهي',
    'mosque': 'المسجد|ابواب رحمتك|ابواب فضلك',
    'morning-evening': 'امسينا|اصبحنا|بك امسينا|بك اصبحنا|المصير|النشور',
    'decision': 'استخيرك|استقدرك|خير لي في ديني',
    'home': 'البيت|المنزل|منزلا|خير المولج|خير المخرج',
    'someone-ill': 'يشفيك|اشفه|شفاء|لا باس طهور',
    'evil-eye': 'العين|عين لامه|الحسد|السحر|النفاثات|حاسد',
    'enemy': 'العدو|عدوي|نحورهم|شرورهم|كيدهم|بواءهم',
    'waswas': 'الشيطان|الوسواس|همزات|نزغ',
    'shame': 'خطاياي|اسرفت|ظلمت نفسي|الخزي|فضيحه',
    'loneliness': 'الوحشه|الغربه|وحيدا|الفرد|لا تذرني فردا',
    'envy': 'الحسد|حاسد',
    'reconcile': 'اصلح ذات بين|الفت بين قلوب|التحريش|بين اخوان',
    'failure': 'قدر الله وما شاء فعل|لو اني',
    'overwhelm': 'لا تحملنا ما لا طاقه لنا|الا وسعها|طاقه لنا'}

S = [
# ── HEART ─────────────────────────────────────────────────────────────────
dict(id="sadness", cat="heart", label="Sadness", blurb="Grief, low spirits, a heaviness you can't name",
     match=r"\b(grief|sorrow|sad(ness)?|hazan)\b",
     feelings=["sad","sadness","i am sad","i feel sad","so sad","feeling low","low","down","feeling down","heavy","heavy heart","heartbroken","broken","broken hearted","miserable","unhappy","depressed","depression","despondent","blue","gloomy","empty","hollow","numb","crying","i keep crying","cant stop crying","tears","weeping","grief","grieving","sorrow","mourning","melancholy","dejected","downcast","joyless","cant feel happy","nothing makes me happy","lost my spark","feel like crying"]),

dict(id="anxiety", cat="heart", label="Anxiety & worry", blurb="Racing thoughts, dread, the mind that won't settle",
     match=r"\b(anxiety|anxious|worry|worried|distress(ed)?|hamm)\b",
     feelings=["anxious","anxiety","worried","worry","worrying","cant stop worrying","overthinking","overthink","racing thoughts","mind wont stop","restless","uneasy","nervous","on edge","panicking","panic","panic attack","dread","dreading","tense","stressed","stress","stressed out","pressure","cant relax","cant switch off","churning","knot in my stomach","what if","scared about the future","future","uncertain","uncertainty","insomnia","cant sleep from worry","spiralling","spiraling"]),

dict(id="fear", cat="heart", label="Fear", blurb="When you are frightened of something or someone",
     match=r"\b(afraid|fear(ed|ing|s)?|frightened|terrif)",
     feelings=["afraid","fear","scared","frightened","terrified","petrified","fearful","im scared","so scared","danger","in danger","threatened","unsafe","not safe","someone is after me","being followed","intimidated","bullied","bully","confrontation","dreading tomorrow","scared of dying","scared of death","phobia","nightmare","cant face it"]),

dict(id="anger", cat="heart", label="Anger", blurb="Rage, resentment, the urge to lash out",
     match=r"\b(anger|angry|furious|rage|wrath)\b",
     feelings=["angry","anger","furious","rage","raging","mad","livid","irritated","annoyed","frustrated","frustration","lost my temper","snapped","want to scream","want to lash out","resentful","resentment","bitter","bitterness","grudge","hate","i hate","seething","fuming","fed up","had enough","cant take it"]),

dict(id="loneliness", cat="heart", label="Loneliness", blurb="Feeling unseen, unaccompanied, far from everyone",
     match=r"\b(alone|lonely|loneliness|solitude)\b",
     feelings=["alone","lonely","loneliness","i feel alone","so alone","no one","nobody","no one cares","no one understands","isolated","isolation","abandoned","left out","forgotten","invisible","unseen","unwanted","no friends","far from home","homesick","estranged","cut off","by myself","single","unloved","nobody loves me"]),

dict(id="despair", cat="heart", label="Hopelessness", blurb="When you cannot see a way forward at all",
     match=r"\b(despair|hopeless|give up|gave up|no hope)\b",
     feelings=["hopeless","hopelessness","despair","no hope","given up","want to give up","gave up","whats the point","pointless","no way out","trapped","stuck","cornered","dead end","cant go on","cant do this anymore","end of my rope","breaking point","at my limit","defeated","lost everything","nothing left","rock bottom","worthless","useless","failure","im a failure"]),

dict(id="overwhelm", cat="heart", label="Feeling overwhelmed", blurb="Carrying more than you think you can hold",
     match=r"\b(burden|overburden|beyond .{0,12}capacity|too much for)\b",
     feelings=["overwhelmed","too much","its too much","cant cope","cant handle it","drowning","suffocating","cant breathe","buried","burnt out","burned out","burnout","exhausted","drained","running on empty","spread thin","too many things","piling up","falling apart","everything at once","breaking","cracking","at capacity","carrying too much"]),

dict(id="gratitude", cat="heart", label="Joy & gratitude", blurb="When something good has happened",
     match=r"\b(thank(s|ful|fulness)?|gratitude|grateful|praise be|good news|rejoic)",
     feelings=["happy","happiness","joy","joyful","grateful","gratitude","thankful","thank you","blessed","blessing","good news","great news","celebrate","celebrating","alhamdulillah","relieved","relief","it worked out","i got it","passed","succeeded","success","won","accepted","answered","prayers answered","excited","delighted","content","contentment","peaceful","at peace"]),

dict(id="envy", cat="heart", label="Envy & comparison", blurb="When someone else has what you wanted",
     match=r"\b(envy|envious|jealous|hasad)\b",
     feelings=["jealous","jealousy","envy","envious","comparing","comparison","why not me","everyone else","they have everything","bitter about","resent their success","social media","feel behind","left behind","everyone is ahead"]),

dict(id="shame", cat="heart", label="Shame & guilt", blurb="When you cannot forgive yourself",
     match=r"\b(shame|ashamed|regret|remorse)\b",
     feelings=["guilty","guilt","ashamed","shame","embarrassed","humiliated","regret","regretful","remorse","i messed up","i ruined it","my fault","blame myself","cant forgive myself","disgusted with myself","hate myself","dirty","unworthy","not good enough","let everyone down","disappointed in myself"]),

# ── HARDSHIP ──────────────────────────────────────────────────────────────
dict(id="distress", cat="hardship", label="Severe distress", blurb="The moment when everything presses in at once",
     match=r"\b(karb|severe distress|calamity|affliction|hardship|adversit)",
     feelings=["distress","distressed","crisis","emergency","disaster","catastrophe","calamity","desperate","desperation","urgent","help me","worst day","everything went wrong","falling apart","cant take anymore","rock bottom","darkest","hardest time","trial","tested","severe"]),

dict(id="illness", cat="body", label="Being ill", blurb="Sickness, pain, waiting on a diagnosis",
     match=r"\b(sick|illness|ill\b|disease|cure|heal|pain|ache|fever|patient)\b",
     feelings=["sick","ill","illness","unwell","disease","pain","in pain","hurts","hurting","ache","aching","sore","fever","infection","diagnosis","diagnosed","cancer","chronic","suffering","hospital","surgery","operation","treatment","recovery","not healing","doctor","test results","health","my health","body hurts"]),

dict(id="someone-ill", cat="body", label="Someone you love is ill", blurb="Sitting beside the sick",
     match=r"\b(visit(s|ing|ed)? (a |the )?sick|visiting the sick)",
     feelings=["someone is sick","my mother is ill","my father is ill","my child is sick","my wife is ill","my husband is ill","visiting the sick","hospital visit","they are dying","terminal","in the icu","praying for them","shifa","cure for them","dua for a sick person","healing for someone"]),

dict(id="death", cat="hardship", label="Losing someone", blurb="Death, funerals, and the days after",
     match=r"\b(death|died|deceased|funeral|janazah|grave|bereave|mourn)\b",
     feelings=["death","died","passed away","lost someone","loss","bereaved",
               "lost my mother","lost my father","lost my mum","lost my dad","lost my son",
               "lost my daughter","lost my wife","lost my husband","lost my brother",
               "lost my sister","lost my friend","lost my baby","lost my child",
               "lost my grandmother","lost my grandfather","he died","she died",
               "they died","just died","funeral tomorrow","buried","burying","funeral","janazah","burial","grave","my mother died","my father died","my child died","miscarriage","stillbirth","widow","orphan","mourning","grieving","miss them","they are gone","condolence","anniversary of their death"]),

dict(id="debt", cat="provision", label="Debt", blurb="When you owe more than you can pay",
     match=r"\b(debt|indebted|creditor|loan|owe[sd]?\b)",
     feelings=["debt","in debt","owe","i owe money","loan","loans","credit card","mortgage","cant pay","behind on payments","creditors","bills","bills piling up","interest","riba","borrowed","repay","bankrupt","bankruptcy","financial trouble","money problems"]),

dict(id="poverty", cat="provision", label="Money & provision", blurb="When income is tight or uncertain",
     match=r"\b(poverty|poor\b|provision|rizq|sustenance|wealth|need\b|destitute)",
     feelings=["poor","poverty","broke","no money","skint","cant afford","struggling financially","rizq","provision","sustenance","barely surviving","paycheck","rent","cant pay rent","food","feed my family","income","need money","tight month","expenses","cost of living"]),

dict(id="oppression", cat="hardship", label="Being wronged", blurb="Injustice, betrayal, harm from others",
     match=r"\b(oppress|wronged|injustice|unjust|tyrann|transgress)",
     feelings=["wronged","injustice","unfair","unjust","oppressed","oppression","betrayed","betrayal","cheated","stolen","robbed","lied to","backstabbed","abused","mistreated","harassed","discriminated","racism","exploited","taken advantage of","no one believes me","powerless","cant defend myself","they got away with it"]),

dict(id="enemy", cat="protection", label="Someone means you harm", blurb="Facing hostility or an enemy",
     match=r"\b(enem(y|ies)|adversar|against him|plot(s|ted|ting)?)\b",
     feelings=["enemy","enemies","against me","they hate me","plotting","conspiring","out to get me","hostile","attacked","threatened","rivalry","feud","court case","lawsuit","legal trouble","confrontation","war","conflict"]),

dict(id="failure", cat="hardship", label="When it did not work out", blurb="Rejection, failure, plans that collapsed",
     match=r"\b(if only|decree of allah|qadar|destin|fail(ed|ure)?)\b",
     feelings=["failed","failure","rejected","rejection","didnt get it","turned down","lost the job","lost my job","fired","redundant","didnt work out","plans ruined","cancelled","if only","should have","what if","regret my choice","wasted","started over","back to square one","disappointed"]),

# ── PEOPLE ────────────────────────────────────────────────────────────────
dict(id="marriage", cat="people", label="Marriage & spouse", blurb="Looking for, or living with, a partner",
     match=r"\b(marriage|marry|married|spouse|wife|husband|nikah|wedding)\b",
     feelings=["marriage","married","getting married","nikah","wedding","spouse","husband","wife","looking for a spouse","want to get married","proposal","rishta","partner","relationship","marriage problems","fighting with my wife","fighting with my husband","divorce","separated","in love","love","heartbreak","breakup","rejected proposal"]),

dict(id="children", cat="people", label="Children", blurb="Hoping for them, raising them, worrying about them",
     match=r"\b(child(ren)?|offspring|son|daughter|baby|born|pregnan)\b",
     feelings=["children","child","kids","my son","my daughter","baby","pregnant","pregnancy","expecting","birth","labour","labor","trying for a baby","infertility","cant conceive","ivf","childless","miscarriage","worried about my kids","my child is struggling","parenting","raising children","teenager","protect my children"]),

dict(id="parents", cat="people", label="Parents & family", blurb="Mothers, fathers, and those who raised you",
     match=r"\b(parents?|mother|father|mercy on them|raised me)\b",
     feelings=["parents","my mother","my father","mum","mom","dad","family","family problems","argument with family","estranged","dua for my parents","my parents are old","caring for parents","they passed away","honour my parents","siblings","brother","sister","in laws"]),

dict(id="reconcile", cat="people", label="Conflict with someone", blurb="Broken relationships and hard conversations",
     match=r"\b(reconcil|dispute|quarrel|argu(e|ment)|between them|brother)\b",
     feelings=["argument","fight","fighting","fell out","not speaking","conflict","dispute","tension","awkward","apologise","apologize","forgive them","cant forgive","misunderstanding","difficult conversation","confront","make up","reconcile","friendship ended","lost a friend"]),

# ── PROVISION / WORK ──────────────────────────────────────────────────────
dict(id="knowledge", cat="provision", label="Study & exams", blurb="Learning, memorising, being tested",
     match=r"\b(knowledge|learn|teach|memoris|memoriz|understand(ing)?)\b",
     feelings=["exam","exams","test","studying","study","revision","school","university","college","degree","dissertation","thesis","memorise","memorize","hifz","quran memorisation","cant focus","cant concentrate","results","grades","failed my exam","viva","interview","learning","understand","knowledge"]),

dict(id="work", cat="provision", label="Work", blurb="Jobs, colleagues, and the daily grind",
     match=r"\b(work|labour|earn|trade|business|market|employ)\b",
     feelings=["work","job","my job","career","unemployed","job hunting","applying","interview","promotion","boss","colleague","workplace","business","my business","clients","customers","startup","project","deadline","hate my job","stressed at work","overworked","looking for work"]),

dict(id="decision", cat="provision", label="A decision to make", blurb="When you genuinely do not know which way",
     match=r"\b(istikhara|seek(ing)? .{0,12}(guidance|good)|decide|decision)\b",
     feelings=["decision","decide","cant decide","which one","choice","choose","unsure","dont know what to do","confused","torn","crossroads","two options","should i","is this right","istikhara","guidance","need direction","what should i do","big decision","move abroad","accept the offer"]),

dict(id="travel", cat="daily", label="Travelling", blurb="Setting out, and coming home",
     match=r"\b(journey|travel|riding|mount|set out|return(ing)? home)\b",
     feelings=["travel","travelling","traveling","journey","trip","flight","flying","scared of flying","driving","commute","abroad","moving","relocating","holiday","hajj","umrah","pilgrimage","going home","arriving","safe travels","long drive"]),

# ── FAITH ─────────────────────────────────────────────────────────────────
dict(id="forgiveness", cat="faith", label="Seeking forgiveness", blurb="Turning back after sin",
     match=r"\b(forgive|forgiveness|istighfar|repent|pardon|sin(s|ned|ful)?)\b",
     feelings=["sin","sinned","sinning","guilt","forgive me","forgiveness","repent","repentance","tawbah","astaghfirullah","istighfar","keep relapsing","same sin","cant stop","addiction","porn","alcohol","gambling","haram","ashamed of myself","gone too far","unforgivable","start again","clean slate"]),

dict(id="weak-iman", cat="faith", label="Faith feeling weak", blurb="Distance, dryness, doubt",
     match=r"\b(steadfast|firm(ness)?|turner of hearts|guide|guidance|astray|iman|faith)\b",
     feelings=["weak iman","low iman","faith","losing faith","doubt","doubts","doubting","far from allah","distant","disconnected","empty prayers","cant pray","stopped praying","dont feel anything","spiritually dry","hypocrite","going through the motions","want to feel close","reconnect","lost my way","astray","need guidance"]),

dict(id="waswas", cat="faith", label="Intrusive thoughts", blurb="Whispers you would never choose to think",
     match=r"\b(whisper|waswas|satan|shaytan|devil|clear faith)\b",
     feelings=["waswas","whispers","intrusive thoughts","bad thoughts","blasphemous thoughts","scared of my own thoughts","ocd","obsessive","cant stop thinking","doubting my wudu","doubting my prayer","repeating","scrupulosity","terrible thoughts","am i a kafir"]),

dict(id="steadfastness", cat="faith", label="Staying firm", blurb="Patience, endurance, keeping going",
     match=r"\b(patien(ce|t)|sabr|persever|endur|steadfast)\b",
     feelings=["patience","sabr","be patient","hard to be patient","waiting","still waiting","how long","enduring","persevere","keep going","dont give up","strength","need strength","tired of trying","consistency","istiqamah","discipline"]),

dict(id="death-remembrance", cat="faith", label="Thinking about death", blurb="The hereafter, the grave, what comes after",
     match=r"\b(hereafter|akhirah|grave|resurrect|paradise|jannah|hell|fire\b|judgment)\b",
     feelings=["death","dying","afraid of death","the grave","hereafter","akhirah","jannah","paradise","hellfire","jahannam","judgment day","qiyamah","afterlife","am i ready","what happens after","meeting allah","accountability","my deeds"]),

# ── PROTECTION ────────────────────────────────────────────────────────────
dict(id="refuge", cat="protection", label="Seeking refuge", blurb="Asking to be shielded from harm",
     match=r"\b(seek refuge|refuge|protect(ion)?|guard)\b",
     feelings=["protection","protect me","seek refuge","refuge","keep me safe","safety","harm","danger","shield","cover","guard","watch over","travelling alone","walking home","at night","dark"]),

dict(id="evil-eye", cat="protection", label="Evil eye & envy of others", blurb="Nazar, ḥasad, and the harm of ill will",
     match=r"\b(evil eye|envious eye|ain\b|amulet|ruqya|magic|sorcer|witch)\b",
     feelings=["evil eye","nazar","ayn","hasad","envy","someone envied me","jinxed","bad luck","things keep going wrong","magic","sihr","black magic","cursed","ruqya","possessed","jinn","protection from people","they wish me harm"]),

dict(id="home", cat="protection", label="Home & household", blurb="Entering, leaving, and being kept in it",
     match=r"\b(enter(s|ing|ed)? .{0,12}(house|home)|leav(es|ing) .{0,12}(house|home)|household)\b",
     feelings=["home","my house","entering home","leaving home","household","family home","moving house","new home","safety at home","alone at home","noises","cant sleep at home"]),

# ── DAILY ─────────────────────────────────────────────────────────────────
dict(id="morning-evening", cat="daily", label="Morning & evening", blurb="How to begin and end a day",
     match=r"\b(morning|evening|when he (rose|woke)|at dawn|sunset)\b",
     feelings=["morning","good morning","start of the day","waking up","woke up","evening","end of the day","night","adhkar","daily dhikr","routine","every day","beginning","fresh start","new day"]),

dict(id="sleep", cat="daily", label="Sleep & the night", blurb="Lying down, waking, and bad dreams",
     match=r"\b(sleep|slept|bed\b|night|dream|awoke|wakes)\b",
     feelings=["sleep","cant sleep","insomnia","going to bed","bedtime","night","late at night","3am","awake","tired","nightmare","bad dream","dream","scared at night","waking up","restless night","sleep paralysis"]),

dict(id="eating", cat="daily", label="Food & drink", blurb="Before and after eating",
     match=r"\b(eat(s|ing|en)?|food|meal|drink|drank|ate)\b",
     feelings=["eating","food","meal","before eating","after eating","drinking","water","hungry","fasting","iftar","suhoor","breaking fast","bismillah before food","gratitude for food"]),

dict(id="prayer", cat="daily", label="In prayer", blurb="What is said within the ṣalāh",
     match=r"\b(rak(a|')ah|prostrat|sujud|ruku|bow(ing|ed)?|prayer|salat|salah|qunut|tashahhud)\b",
     feelings=["prayer","salah","salat","namaz","praying","in sujood","prostration","ruku","after prayer","before prayer","tahajjud","night prayer","qiyam","witr","qunut","dua in prayer","fajr","concentration in prayer","khushu"]),

dict(id="mosque", cat="daily", label="The masjid", blurb="Going to and being in the house of Allah",
     match=r"\b(mosque|masjid)\b",
     feelings=["mosque","masjid","going to the mosque","entering the masjid","jumuah","friday","congregation","jamaah","itikaf"]),

dict(id="rain-weather", cat="daily", label="Rain, wind & sky", blurb="When the weather turns",
     match=r"\b(rain|wind|thunder|lightning|cloud|drought|storm|moon|crescent)\b",
     feelings=["rain","raining","storm","thunder","lightning","wind","windy","weather","drought","flood","new moon","crescent","ramadan moon","looking at the sky","natural disaster","earthquake"]),

dict(id="dhikr", cat="reference", label="Remembrance & praise", blurb="Words of praise, glorification and testifying to Allah",
     match=r"(?!x)x",
     feelings=["dhikr","remembrance","praise","tasbih","subhanallah","alhamdulillah","allahu akbar","tahlil","la ilaha illallah","shahada","glorify","thank allah","remember allah","dhikr after prayer","counting","tasbeeh","words of praise"]),

dict(id="misc", cat="reference", label="Further supplications", blurb="Verified supplications that don't sit under a single heading",
     match=r"(?!x)x",
     feelings=["other","everything","all duas","browse everything","full collection","anything else"]),
]
