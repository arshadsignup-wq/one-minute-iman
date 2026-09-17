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
     'intimacy': 'جنبنا الشيطان|جنب الشيطان ما رزقتنا|اتى اهله|جامع',
     'desire': 'الفرج|فروجهم|فرجه|الشهوه|الزنا|غض البصر|يغضوا من ابصارهم',
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
     feelings=["sad","sadness","i am sad","i feel sad","so sad","feeling low","low","down","feeling down","heavy","heavy heart","heartbroken","broken","broken hearted","miserable","unhappy","depressed","depression","despondent","blue","gloomy","empty","hollow","numb","crying","i keep crying","cant stop crying","tears","weeping","grief","grieving","sorrow","mourning","melancholy","dejected","downcast","joyless","cant feel happy","nothing makes me happy","lost my spark","feel like crying", "im not okay", "not ok", "im not ok", "gutted", "devastated", "shattered", "heart broken", "my heart is heavy", "down bad", "hurting", "in pain emotionally", "teary", "crying a lot", "cant get out of bed", "no motivation", "unmotivated", "no energy", "dont want to do anything", "everything feels pointless"]),

dict(id="anxiety", cat="heart", label="Anxiety & worry", blurb="Racing thoughts, dread, the mind that won't settle",
     match=r"\b(anxiety|anxious|worry|worried|distress(ed)?|hamm)\b",
     feelings=["anxious","anxiety","worried","worry","worrying","cant stop worrying","overthinking","overthink","racing thoughts","mind wont stop","restless","uneasy","nervous","on edge","panicking","panic","panic attack","dread","dreading","tense","stressed","stress","stressed out","pressure","cant relax","cant switch off","churning","knot in my stomach","what if","scared about the future","future","uncertain","uncertainty","insomnia","cant sleep from worry","spiralling","spiraling", "my head is a mess", "im a mess", "losing it", "going crazy", "losing my mind", "my chest is tight", "tight chest", "cant breathe", "no peace of mind", "my mind is not calm", "i want peace", "peace of mind", "sakinah", "tension", "in tension"]),

dict(id="fear", cat="heart", label="Fear", blurb="When you are frightened of something or someone",
     match=r"\b(afraid|fear(ed|ing|s)?|frightened|terrif)",
     feelings=["afraid","fear","scared","frightened","terrified","petrified","fearful","im scared","so scared","danger","in danger","threatened","unsafe","not safe","someone is after me","being followed","intimidated","bullied","bully","confrontation","dreading tomorrow","scared of dying","scared of death","phobia","nightmare","cant face it"]),

dict(id="anger", cat="heart", label="Anger", blurb="Rage, resentment, the urge to lash out",
     match=r"\b(anger|angry|furious|rage|wrath)\b",
     feelings=["angry","anger","furious","rage","raging","mad","livid","irritated","annoyed","frustrated","frustration","lost my temper","snapped","want to scream","want to lash out","resentful","resentment","bitter","bitterness","grudge","hate","i hate","seething","fuming","fed up","had enough","cant take it"]),

dict(id="loneliness", cat="heart", label="Loneliness", blurb="Feeling unseen, unaccompanied, far from everyone",
     match=r"\b(alone|lonely|loneliness|solitude)\b",
     feelings=["alone","lonely","loneliness","i feel alone","so alone","no one","nobody","no one cares","no one understands","isolated","isolation","abandoned","left out","forgotten","invisible","unseen","unwanted","no friends","far from home","homesick","estranged","cut off","by myself","single","unloved","nobody loves me", "nobody understands me", "feel invisible", "no one checks on me", "excluded", "nobody cares", "i feel replaced", "replaced", "overlooked", "feel unwanted", "nobody near me"]),

dict(id="despair", cat="heart", label="Hopelessness", blurb="When you cannot see a way forward at all",
     match=r"\b(despair|hopeless|give up|gave up|no hope)\b",
     feelings=["hopeless","hopelessness","despair","no hope","given up","want to give up","gave up","whats the point","pointless","no way out","trapped","stuck","cornered","dead end","cant go on","cant do this anymore","end of my rope","breaking point","at my limit","defeated","lost everything","nothing left","rock bottom","worthless","useless","failure","im a failure", "i want to end it", "want to end it", "end it all", "i cant take it anymore", "cant take it", "no reason to live", "nothing to live for", "want to die", "wish i was dead", "better off dead", "better off without me", "dont want to live", "dont want to be here", "suicidal", "kill myself", "hurt myself", "self harm", "tired of living", "tired of everything", "done with life", "empty inside", "i feel numb", "dont feel anything", "feel nothing", "i feel like giving up", "nothing is working", "nothing works", "whats the use", "no point trying", "at rock bottom", "lowest point", "cant see a way"]),

dict(id="overwhelm", cat="heart", label="Feeling overwhelmed", blurb="Carrying more than you think you can hold",
     match=r"\b(burden|overburden|beyond .{0,12}capacity|too much for)\b",
     feelings=["overwhelmed","too much","its too much","cant cope","cant handle it","drowning","suffocating","cant breathe","buried","burnt out","burned out","burnout","exhausted","drained","running on empty","spread thin","too many things","piling up","falling apart","everything at once","breaking","cracking","at capacity","carrying too much", "im done", "so done", "over it", "cant deal", "had enough", "fed up", "life is difficult", "life is hard", "too much problem", "too many problems", "i am struggling", "struggling", "helpless", "no energy", "cant keep going", "spread too thin"]),

dict(id="gratitude", cat="heart", label="Joy & gratitude", blurb="When something good has happened",
     match=r"\b(thank(s|ful|fulness)?|gratitude|grateful|praise be|good news|rejoic)",
     feelings=["happy","happiness","joy","joyful","grateful","gratitude","thankful","thank you","blessed","blessing","good news","great news","celebrate","celebrating","alhamdulillah","relieved","relief","it worked out","i got it","passed","succeeded","success","won","accepted","answered","prayers answered","excited","delighted","content","contentment","peaceful","at peace", "something good happened", "i got the job", "got accepted", "she said yes", "my baby was born", "shukr", "barakah", "barakat", "blessings", "eid", "eid mubarak", "graduating", "graduated", "passed my exam", "got engaged", "engagement", "good things", "counting blessings", "dunya"]),

dict(id="envy", cat="heart", label="Envy & comparison", blurb="When someone else has what you wanted",
     match=r"\b(envy|envious|jealous|hasad)\b",
     feelings=["jealous","jealousy","envy","envious","comparing","comparison","why not me","everyone else","they have everything","bitter about","resent their success","social media","feel behind","left behind","everyone is ahead", "compare myself", "comparing myself", "everyone else has", "behind everyone", "social media makes me", "seeing everyone succeed"]),

dict(id="shame", cat="heart", label="Shame & guilt", blurb="When you cannot forgive yourself",
     match=r"\b(shame|ashamed|regret|remorse)\b",
     feelings=["guilty","guilt","ashamed","shame","embarrassed","humiliated","regret","regretful","remorse","i messed up","i ruined it","my fault","blame myself","cant forgive myself","disgusted with myself","hate myself","dirty","unworthy","not good enough","let everyone down","disappointed in myself", "i relapsed", "relapsed again", "i keep relapsing", "addicted", "addiction", "im addicted", "cant stop", "porn", "pornography", "gambling", "drinking", "alcohol", "drugs", "smoking", "bad habit", "keep going back", "slipped again", "did it again", "cant quit", "riya", "showing off", "show off", "pride", "arrogance", "arrogant", "ego", "vanity", "two faced", "hypocrite", "feel like a hypocrite", "munafiq", "insincere", "backbiting", "backbit", "gossiped", "gossiping", "i lied", "told a lie", "slandered someone", "spoke badly about someone", "lied", "i told a lie"]),

# ── HARDSHIP ──────────────────────────────────────────────────────────────
dict(id="distress", cat="hardship", label="Severe distress", blurb="The moment when everything presses in at once",
     match=r"\b(karb|severe distress|calamity|affliction|hardship|adversit)",
     feelings=["distress","distressed","crisis","emergency","disaster","catastrophe","calamity","desperate","desperation","urgent","help me","worst day","everything went wrong","falling apart","cant take anymore","rock bottom","darkest","hardest time","trial","tested","severe"]),

dict(id="illness", cat="body", label="Being ill", blurb="Sickness, pain, waiting on a diagnosis",
     match=r"\b(sick|illness|ill\b|disease|cure|heal|pain|ache|fever|patient)\b",
     feelings=["sick","ill","illness","unwell","disease","pain","in pain","hurts","hurting","ache","aching","sore","fever","infection","diagnosis","diagnosed","cancer","chronic","suffering","hospital","surgery","operation","treatment","recovery","not healing","doctor","test results","health","my health","body hurts", "chemo", "chemotherapy", "therapy", "counselling", "migraine", "headache", "ruqyah", "shifa", "healing", "poorly", "mental health", "depression", "anxiety disorder", "medication", "recovering", "getting better", "convalescing", "after surgery"]),

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
     feelings=["poor","poverty","broke","no money","skint","cant afford","struggling financially","rizq","provision","sustenance","barely surviving","paycheck","rent","cant pay rent","food","feed my family","income","need money","tight month","expenses","cost of living", "evicted", "eviction", "landlord", "cant pay the bills", "bills", "no money for food", "behind on rent", "homeless", "losing my home", "repossession", "cant afford it", "struggling to pay", "barakah in money", "payday", "salary", "expensive", "short on money", "tight this month"]),

dict(id="oppression", cat="hardship", label="Being wronged", blurb="Injustice, betrayal, harm from others",
     match=r"\b(oppress|wronged|injustice|unjust|tyrann|transgress)",
     feelings=["wronged","injustice","unfair","unjust","oppressed","oppression","betrayed","betrayal","cheated","stolen","robbed","lied to","backstabbed","abused","mistreated","harassed","discriminated","racism","exploited","taken advantage of","no one believes me","powerless","cant defend myself","they got away with it", "war", "genocide", "the news", "saw the news", "innocent people", "children dying", "bombing", "occupation", "cant watch the news", "helpless watching", "slandered", "someone slandered me", "false accusation", "accused me", "lied about me", "defamed", "islamophobia", "racist", "discrimination", "prejudice", "treated unfairly", "abuse", "abusive", "domestic", "domestic abuse", "domestic violence", "he hits me", "she hits me", "my husband hits me", "my dad hits me", "being abused", "abusive husband", "abusive wife", "abusive marriage", "abusive relationship", "abusive parent", "not safe at home", "afraid to go home", "scared of my husband", "forced marriage", "coerced", "controlling"]),

dict(id="enemy", cat="protection", label="Someone means you harm", blurb="Facing hostility or an enemy",
     match=r"\b(enem(y|ies)|adversar|against him|plot(s|ted|ting)?)\b",
     feelings=["enemy","enemies","against me","they hate me","plotting","conspiring","out to get me","hostile","attacked","threatened","rivalry","feud","court case","lawsuit","legal trouble","confrontation","war","conflict", "islamophobia", "someone is after me", "being targeted", "dushman", "my enemy", "someone hates me", "they want to harm me"]),

dict(id="failure", cat="hardship", label="When it did not work out", blurb="Rejection, failure, plans that collapsed",
     match=r"\b(if only|decree of allah|qadar|destin|fail(ed|ure)?)\b",
     feelings=["failed","failure","rejected","rejection","didnt get it","turned down","lost the job","lost my job","fired","redundant","didnt work out","plans ruined","cancelled","if only","should have","what if","regret my choice","wasted","started over","back to square one","disappointed", "nothing is working", "it didnt work", "messed up", "i failed", "let everyone down", "not good enough", "i feel like a failure", "feel worthless", "worthless", "useless", "qadr", "qadar", "decree", "meant to be", "wasnt meant for me", "i keep failing", "keep failing", "failing at everything", "nothing works out", "cant get anything right"]),

# ── PEOPLE ────────────────────────────────────────────────────────────────
dict(id="marriage", cat="people", label="Marriage & spouse", blurb="Looking for, or living with, a partner",
     match=r"\b(marriage|marry|married|spouse|wife|husband|nikah|wedding)\b",
     feelings=["marriage","married","getting married","nikah","wedding","spouse","husband","wife","looking for a spouse","want to get married","proposal","rishta","partner","relationship","marriage problems","fighting with my wife","fighting with my husband","divorce","separated","in love","love","heartbreak","breakup","rejected proposal", "got engaged", "engagement", "my nikah", "wedding tomorrow"]),

dict(id="intimacy", cat="people", label="Intimacy", blurb="What a husband and wife say, and what it guards",
     match=r"\b(intimacy|intimate|conjugal|comes to his wife|goes to his (wife|family)|sexual relation)\b",
     feelings=["sex","intimacy","intimate","making love","husband and wife","before intimacy","sleeping with my wife","sleeping with my husband","sleeping together","conjugal","marital relations","in the bedroom","bedroom","dua before intimacy","what to say before intimacy","physical relationship","being close to my wife","being close to my husband","consummate","wedding night","first night","trying for a baby","trying to conceive","we want a child","starting a family"]),

dict(id="children", cat="people", label="Children", blurb="Hoping for them, raising them, worrying about them",
     match=r"\b(child(ren)?|offspring|son|daughter|baby|born|pregnan)\b",
     feelings=["children","child","kids","my son","my daughter","baby","pregnant","pregnancy","expecting","birth","labour","labor","trying for a baby","infertility","cant conceive","ivf","childless","miscarriage","worried about my kids","my child is struggling","parenting","raising children","teenager","protect my children", "newborn", "new baby", "adoption", "adopted", "custody", "my kids", "raising kids", "single parent", "single mum", "single dad", "my teenager", "toddler"]),

dict(id="parents", cat="people", label="Parents & family", blurb="Mothers, fathers, and those who raised you",
     match=r"\b(parents?|mother|father|mercy on them|raised me)\b",
     feelings=["parents","my mother","my father","mum","mom","dad","family","family problems","argument with family","estranged","dua for my parents","my parents are old","caring for parents","they passed away","honour my parents","siblings","brother","sister","in laws", "absent father", "absent parent", "estranged parent", "my mum", "my dad", "looking after my parents", "caring for my mum", "caring for my dad", "elderly parents"]),

dict(id="reconcile", cat="people", label="Conflict with someone", blurb="Broken relationships and hard conversations",
     match=r"\b(reconcil|dispute|quarrel|argu(e|ment)|between them|brother)\b",
     feelings=["argument","fight","fighting","fell out","not speaking","conflict","dispute","tension","awkward","apologise","apologize","forgive them","cant forgive","misunderstanding","difficult conversation","confront","make up","reconcile","friendship ended","lost a friend", "people gossip about me", "talking behind my back", "want to apologise", "how do i make peace", "estranged", "in laws", "my brother doesnt speak to me", "my sister doesnt speak to me", "family feud", "toxic family", "fell out with family"]),

# ── PROVISION / WORK ──────────────────────────────────────────────────────
dict(id="knowledge", cat="provision", label="Study & exams", blurb="Learning, memorising, being tested",
     match=r"\b(knowledge|learn|teach|memoris|memoriz|understand(ing)?)\b",
     feelings=["exam","exams","test","studying","study","revision","school","university","college","degree","dissertation","thesis","memorise","memorize","hifz","quran memorisation","cant focus","cant concentrate","results","grades","failed my exam","viva","interview","learning","understand","knowledge", "graduating", "started university", "dua for exms", "cant memorise", "memorising quran", "learning arabic", "seeking knowledge"]),

dict(id="work", cat="provision", label="Work", blurb="Jobs, colleagues, and the daily grind",
     match=r"\b(work|labour|earn|trade|business|market|employ)\b",
     feelings=["work","job","my job","career","unemployed","job hunting","applying","interview","promotion","boss","colleague","workplace","business","my business","clients","customers","startup","project","deadline","hate my job","stressed at work","overworked","looking for work", "burnt out", "burnout", "toxic workplace", "my boss", "bullied at work", "made redundant", "laid off", "interview tomorrow", "cant find work", "redundancy", "salary", "payday", "pay rise", "job interview", "first day", "new job", "retiring", "retirement", "workload"]),

dict(id="decision", cat="provision", label="A decision to make", blurb="When you genuinely do not know which way",
     match=r"\b(istikhara|seek(ing)? .{0,12}(guidance|good)|decide|decision)\b",
     feelings=["decision","decide","cant decide","which one","choice","choose","unsure","dont know what to do","confused","torn","crossroads","two options","should i","is this right","istikhara","guidance","need direction","what should i do","big decision","move abroad","accept the offer", "lost", "feel lost", "which path", "cant choose", "is this right for me", "taqdeer", "qismat", "qadar", "destiny", "fate", "meant to be", "is it written for me"]),

dict(id="travel", cat="daily", label="Travelling", blurb="Setting out, and coming home",
     match=r"\b(journey|travel|riding|mount|set out|return(ing)? home)\b",
     feelings=["travel","travelling","traveling","journey","trip","flight","flying","scared of flying","driving","commute","abroad","moving","relocating","holiday","hajj","umrah","pilgrimage","going home","arriving","safe travels","long drive", "going for hajj", "going for umrah", "moving house", "moving country", "long journey", "makkah", "mecca", "madinah", "medina", "tawaf", "ihram", "arafah"]),

# ── FAITH ─────────────────────────────────────────────────────────────────
dict(id="forgiveness", cat="faith", label="Seeking forgiveness", blurb="Turning back after sin",
     match=r"\b(forgive|forgiveness|istighfar|repent|pardon|sin(s|ned|ful)?)\b",
     feelings=["sin","sinned","sinning","guilt","forgive me","forgiveness","repent","repentance","tawbah","astaghfirullah","istighfar","keep relapsing","same sin","cant stop","addiction","porn","alcohol","gambling","haram","ashamed of myself","gone too far","unforgivable","start again","clean slate", "taubah", "tawba", "turn back", "ramadan", "ramadan starting", "laylatul qadr", "last ten nights", "seeking pardon", "backbiting", "gossiped", "i lied", "cheated someone", "took what wasnt mine"]),

dict(id="weak-iman", cat="faith", label="Faith feeling weak", blurb="Distance, dryness, doubt",
     match=r"\b(steadfast|firm(ness)?|turner of hearts|guide|guidance|astray|iman|faith)\b",
     feelings=["weak iman","low iman","faith","losing faith","doubt","doubts","doubting","far from allah","distant","disconnected","empty prayers","cant pray","stopped praying","dont feel anything","spiritually dry","hypocrite","going through the motions","want to feel close","reconnect","lost my way","astray","need guidance", "new muslim", "just converted", "i converted", "reverted", "new to islam", "just became muslim", "family rejected me", "disowned me", "learning to pray", "dont know how to pray", "where do i start", "questioning islam", "questioning my faith", "doubts about islam", "losing my faith", "lost my faith", "dont feel anything in salah", "no khushu", "khushu", "hard to pray", "missed fajr", "cant wake for fajr", "struggling to pray", "far from deen"]),

dict(id="desire", cat="faith", label="Desire & temptation", blurb="The wandering eye, the urge you are trying not to follow",
     match=r"\b(lust|desire[sd]?|passion|chastity|chaste|lower(ing|s)? (his |the |their )?gaze|private parts?|guard(s|ing)? (his|their) (chastity|private)|fornicat\w*|adulter\w*|zina)\b",
     feelings=["lust","lustful","desire","desires","tempted","temptation","urges","cant control myself","cant control my desire","struggling with desire","struggling with lust","porn","pornography","watching porn","addicted to porn","masturbation","masturbating","bad habit","secret sin","zina","adultery","fornication","haram relationship","girlfriend","boyfriend","talking to someone haram","attracted to someone","attracted to a coworker","i keep looking","cant stop looking","lower my gaze","lowering my gaze","wandering eye","modesty","chastity","staying chaste","want to stay pure","keep falling into the same sin","i keep relapsing","i cant stop","temptation is everywhere","dating","in a haram relationship","crush","i have a crush", "horny", "aroused", "turned on", "relapsed", "relapse", "slipped again", "gave in again", "cant help myself", "weak against it"]),

dict(id="waswas", cat="faith", label="Intrusive thoughts", blurb="Whispers you would never choose to think",
     match=r"\b(whisper|waswas|satan|shaytan|devil|clear faith)\b",
     feelings=["waswas","whispers","intrusive thoughts","bad thoughts","blasphemous thoughts","scared of my own thoughts","ocd","obsessive","cant stop thinking","doubting my wudu","doubting my prayer","repeating","scrupulosity","terrible thoughts","am i a kafir", "horrible thoughts", "thoughts about allah"]),

dict(id="steadfastness", cat="faith", label="Staying firm", blurb="Patience, endurance, keeping going",
     match=r"\b(patien(ce|t)|sabr|persever|endur|steadfast)\b",
     feelings=["patience","sabr","be patient","hard to be patient","waiting","still waiting","how long","enduring","persevere","keep going","dont give up","strength","need strength","tired of trying","consistency","istiqamah","discipline", "procrastinating", "procrastination", "keep putting it off", "cant start", "no discipline", "no willpower", "keep failing at it", "trying again", "start again", "cant keep it up", "fall off", "tawakkul", "reliance", "trust in allah", "hold on", "stay strong", "give me strength", "fitna", "trials", "tested", "being tested", "hardship", "disabled", "disability", "long illness", "chronic", "taqdeer", "qadar", "accept what happened", "content with the decree"]),

dict(id="death-remembrance", cat="faith", label="Thinking about death", blurb="The hereafter, the grave, what comes after",
     match=r"\b(hereafter|akhirah|grave|resurrect|paradise|jannah|hell|fire\b|judgment)\b",
     feelings=["death","dying","afraid of death","the grave","hereafter","akhirah","jannah","paradise","hellfire","jahannam","judgment day","qiyamah","afterlife","am i ready","what happens after","meeting allah","accountability","my deeds", "will anyone remember me", "what happens after i die", "legacy", "leave behind", "after im gone", "meaning of life", "why am i here", "judgement day", "day of judgement", "yawm al qiyamah", "the hereafter", "akhira", "reckoning", "resurrection"]),

# ── PROTECTION ────────────────────────────────────────────────────────────
dict(id="refuge", cat="protection", label="Seeking refuge", blurb="Asking to be shielded from harm",
     match=r"\b(seek refuge|refuge|protect(ion)?|guard)\b",
     feelings=["protection","protect me","seek refuge","refuge","keep me safe","safety","harm","danger","shield","cover","guard","watch over","travelling alone","walking home","at night","dark", "manzil", "ruqyah", "ruqya", "shifa", "protection verses"]),

dict(id="evil-eye", cat="protection", label="Evil eye & envy of others", blurb="Nazar, ḥasad, and the harm of ill will",
     match=r"\b(evil eye|envious eye|ain\b|amulet|ruqya|magic|sorcer|witch)\b",
     feelings=["evil eye","nazar","ayn","hasad","envy","someone envied me","jinxed","bad luck","things keep going wrong","magic","sihr","black magic","cursed","ruqya","possessed","jinn","protection from people","they wish me harm", "buri nazar", "someone jealous of me", "ill wish"]),

dict(id="home", cat="protection", label="Home & household", blurb="Entering, leaving, and being kept in it",
     match=r"\b(enter(s|ing|ed)? .{0,12}(house|home)|leav(es|ing) .{0,12}(house|home)|household)\b",
     feelings=["home","my house","entering home","leaving home","household","family home","moving house","new home","safety at home","alone at home","noises","cant sleep at home", "leaving the house", "going out", "coming home", "entering my house", "new house"]),

# ── DAILY ─────────────────────────────────────────────────────────────────
dict(id="morning-evening", cat="daily", label="Morning & evening", blurb="How to begin and end a day",
     match=r"\b(morning|evening|when he (rose|woke)|at dawn|sunset)\b",
     feelings=["morning","good morning","start of the day","waking up","woke up","evening","end of the day","night","adhkar","daily dhikr","routine","every day","beginning","fresh start","new day", "looking in the mirror", "new clothes", "got dressed"]),

dict(id="sleep", cat="daily", label="Sleep & the night", blurb="Lying down, waking, and bad dreams",
     match=r"\b(sleep|slept|bed\b|night|dream|awoke|wakes)\b",
     feelings=["sleep","cant sleep","insomnia","going to bed","bedtime","night","late at night","3am","awake","tired","nightmare","bad dream","dream","scared at night","waking up","restless night","sleep paralysis", "wake up terrified", "night terrors", "cant fall asleep", "before sleeping", "before bed", "at night", "awake all night", "up all night"]),

dict(id="eating", cat="daily", label="Food & drink", blurb="Before and after eating",
     match=r"\b(eat(s|ing|en)?|food|meal|drink|drank|ate)\b",
     feelings=["eating","food","meal","before eating","after eating","drinking","water","hungry","fasting","iftar","suhoor","breaking fast","bismillah before food","gratitude for food", "about to eat", "having a meal"]),

dict(id="prayer", cat="daily", label="In prayer", blurb="What is said within the ṣalāh",
     match=r"\b(rak(a|')ah|prostrat|sujud|ruku|bow(ing|ed)?|prayer|salat|salah|qunut|tashahhud)\b",
     feelings=["prayer","salah","salat","namaz","praying","in sujood","prostration","ruku","after prayer","before prayer","tahajjud","night prayer","qiyam","witr","qunut","dua in prayer","fajr","concentration in prayer","khushu"]),

dict(id="mosque", cat="daily", label="The masjid", blurb="Going to and being in the house of Allah",
     match=r"\b(mosque|masjid)\b",
     feelings=["mosque","masjid","going to the mosque","entering the masjid","jumuah","friday","congregation","jamaah","itikaf"]),

dict(id="rain-weather", cat="daily", label="Rain, wind & sky", blurb="When the weather turns",
     match=r"\b(rain|wind|thunder|lightning|cloud|drought|storm|moon|crescent)\b",
     feelings=["rain","raining","storm","thunder","lightning","wind","windy","weather","drought","flood","new moon","crescent","ramadan moon","looking at the sky","natural disaster","earthquake", "eclipse", "solar eclipse", "lunar eclipse", "kusuf", "khusuf"]),

dict(id="dhikr", cat="reference", label="Remembrance & praise", blurb="Words of praise, glorification and testifying to Allah",
     match=r"(?!x)x",
     feelings=["dhikr","remembrance","praise","tasbih","subhanallah","alhamdulillah","allahu akbar","tahlil","la ilaha illallah","shahada","glorify","thank allah","remember allah","dhikr after prayer","counting","tasbeeh","words of praise"]),

dict(id="misc", cat="reference", label="Further supplications", blurb="Verified supplications that don't sit under a single heading",
     match=r"(?!x)x",
     feelings=["other","everything","all duas","browse everything","full collection","anything else"]),
]
