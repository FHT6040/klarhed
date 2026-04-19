<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
return json_decode( <<<'JSON'
{
  "meta": {
    "title": "KLARHED",
    "version": "1.2.2",
    "tagline": "Din vej til resultater",
    "author": "Frank Tessin",
    "intro": "Mennesket før metoden, mening før mekanik. Et 8-kapitlers lederskabsforløb bygget på KLARHED-modellen — syv bogstaver, én praksis."
  },
  "baseline": {
    "intro": "Før vi dykker ned i KLARHED-modellen, skal vi vide, hvor du står. Vær ærlig. Der er ingen rigtige eller forkerte svar, kun din virkelighed lige nu.",
    "scale": "1 = Passer slet ikke · 5 = Passer helt præcist",
    "groups": [
      { "letter": "K", "name": "Klarlægge", "items": ["Jeg ved klart, hvad der dræner mig i min hverdag.", "Jeg har et tydeligt billede af, hvor min virksomhed skal være om 3 år.", "Jeg er bevidst om mine egne begrænsninger som leder."] },
      { "letter": "L", "name": "Lederskab", "items": ["Jeg lytter mere, end jeg taler, når jeg er i dialog med mit team.", "Jeg har tillid til, at mit team kan løse opgaver uden min konstante indblanding.", "Jeg tager ansvar for den kultur, vi har i virksomheden."] },
      { "letter": "A", "name": "Ambition", "items": ["Jeg har sat ord på min vision det seneste halve år.", "Mine ambitioner føles meningsfulde for mig personligt, ikke kun økonomisk.", "Jeg tør dele mine største drømme for virksomheden med andre."] },
      { "letter": "R", "name": "Resultat", "items": ["Jeg måler på det, der reelt skaber værdi, ikke kun på drift og bundlinje.", "Jeg er god til at fejre små sejre i hverdagen.", "Jeg ser fejl som en kilde til læring frem for noget, der skal skjules."] },
      { "letter": "H", "name": "Handling", "items": ["Min kalender afspejler mine vigtigste prioriteter.", "Jeg er god til at sige nej til opgaver, der ikke støtter min retning.", "Jeg har tid til strategisk refleksion hver uge."] },
      { "letter": "E", "name": "Evne", "items": ["Jeg opsøger aktivt ny viden og læring i mit lederskab.", "Jeg er åben for at ændre mening, når jeg præsenteres for nye perspektiver.", "Jeg beder regelmæssigt om feedback på min ledelse."] },
      { "letter": "D", "name": "Dedikation", "items": ["Jeg holder fast i mine beslutninger, også når det bliver svært.", "Jeg ved, hvad der giver mig energi, og jeg prioriterer det.", "Jeg føler mig dedikeret til min rolle som leder på lang sigt."] }
    ]
  },
  "chapters": [
    {
      "n": 1, "letter": "K", "slug": "klarlaegge", "name": "Klarlægge",
      "summary": "Afdæk din virkelighed · Sæt en klar retning · Kortlæg styrker og begrænsninger",
      "duration": "45 min",
      "lessons": [
        { "kind": "read", "title": "Klarhed før kraft", "body": "Mange ejerledere handler hele tiden. De er i gang, de får ting til at ske — men alt for ofte uden et klart billede af, hvor de er på vej hen, og hvorfor de vælger, som de gør. Det fører til udmattelse, spild af ressourcer, og en indre fornemmelse af ikke at komme i mål — trods stor aktivitet.\n\nAt klarlægge handler ikke om at holde igen. Det handler om at vinde kontrollen tilbage over retning og energi — og at sørge for, at din daglige indsats faktisk flytter dig mod det, du ønsker.\n\nI en verden præget af støj, krav og kompleksitet er klarhed et stille styrkerum. Det er et sted, hvor du bliver bevidst om, hvad der er sandt for dig, og hvad du ikke længere vil acceptere. Først når du ser tingene tydeligt, kan du handle med præcision og ro. Uden klarhed bliver du let fanget i andres forventninger, gamle mønstre — og i hamsterhjulets illusion af fremdrift.\n\nDet er fristende at gå direkte til ambitioner og resultater. Men hvis de ikke bygger på ægte indsigt, vil de ofte blive mål, du ikke brænder for — og måske aldrig når. Eller endnu værre: du når dem, og opdager bagefter, at de ikke føles meningsfulde." },
        { "kind": "read", "title": "Vi bygger vores egne mure", "body": "Jeg husker en aften for mange år siden. Jeg sad alene på kontoret. Klokken var over otte, og der var helt stille i bygningen. Jeg havde brugt hele dagen på at slukke brande, svare på spørgsmål, som andre burde have kunnet svare på, og træffe beslutninger, der egentlig ikke hørte til på mit bord.\n\nJeg kiggede på min to-do liste, som kun var blevet længere i løbet af dagen, og tænkte: Er det virkelig det her, jeg har bygget?\n\nJeg havde skabt en virksomhed, men jeg havde også skabt et fængsel. Det var der, jeg indså, at før jeg kunne lede andre, måtte jeg først klarlægge, hvor jeg selv stod." },
        { "kind": "case", "title": "Fra praksis: Henriette, 52 år", "body": "Henriette havde altid været den, der havde styr på det hele. Virksomheden gik godt, men Henriette var ved at brænde ud. Da hun lavede Klarhedskortet, blev det tydeligt: Hun brugte 80% af sin tid på drift og brandslukning, og kun 20% på ledelse og udvikling." },
        { "kind": "reflect", "title": "Din nuværende virkelighed", "prompts": ["Hvordan har jeg det — ærligt — i min rolle som ejerleder lige nu?", "Hvad bruger jeg mest tid og energi på i hverdagen?", "Hvad dræner mig? Hvad giver mig energi?"] },
        { "kind": "exercise-two-col", "title": "Klarhedskortet", "intro": "Skriv i venstre kolonne: Det jeg har — og i højre kolonne: Det jeg ønsker. Sammenlig dem. Hvad springer i øjnene?", "left": "Det jeg har", "right": "Det jeg ønsker" },
        { "kind": "reflect", "title": "Din vision", "prompts": ["Hvad drømmer jeg om at min virksomhed skaber — for mig, for andre, for verden?", "Hvad er mit inderste \"hvorfor\" bag det jeg gør?", "Hvad vil jeg gerne være kendt for?"] },
        { "kind": "dialogue", "title": "Klarhedssamtalen med din sparringspartner", "intro": "Sæt 45 minutter af. Den ene lytter og stiller kun uddybende spørgsmål, mens den anden taler. Byt derefter roller.", "items": ["Hvad er den største udfordring, du står overfor lige nu, som du ikke har talt højt om?", "Hvad er det vigtigste, du forsøger at opnå i de næste 6 måneder?", "Hvad er den største forhindring — og hvor meget af den har du selv skabt?", "Hvad er det første skridt, du skal tage for at fjerne den forhindring?", "Hvordan kan jeg støtte dig i at tage det skridt?"] },
        { "kind": "theory", "title": "Kognitiv belastning og beslutningstræthed", "body": "Når vi som ledere opererer uden klarhed, udsætter vi vores hjerne for en enorm kognitiv belastning. Hver lille beslutning, hver uklar forventning, kræver mental energi — et fænomen kaldet beslutningstræthed. Ved at klarlægge værdier, mål og grænser reducerer vi antallet af daglige mikro-beslutninger og frigiver energi til de beslutninger, der virkelig betyder noget." },
        { "kind": "selfeval", "title": "Selvevaluering — Klarlægge", "items": ["Jeg ved klart, hvad der dræner mig i min hverdag.", "Jeg har et tydeligt billede af, hvor min virksomhed skal være om 3 år.", "Jeg er bevidst om mine egne begrænsninger som leder.", "Jeg tager mig tid til at reflektere over min egen praksis.", "Jeg har formuleret en personlig vision for mit lederskab."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 2, "letter": "L", "slug": "lederskab", "name": "Lederskab",
      "summary": "Lyt før du leder · Udvikl dit team · Skab en sund kultur",
      "duration": "40 min",
      "lessons": [
        { "kind": "quote", "body": "Most people do not listen with the intent to understand; they listen with the intent to reply.", "author": "Stephen R. Covey" },
        { "kind": "read", "title": "At lede er først og fremmest at være", "body": "De fleste tænker på ledelse som noget, vi gør — noget med strategier, beslutninger og KPI'er. Men sand ledelse begynder et andet sted: med det menneske, der leder. Dit indre kompas. Dine værdier. Dine mønstre. Din evne til at være nærværende i kompleksitet.\n\nFordi du som ejerleder er det bærende element i din virksomhed. Din energi, dine beslutninger og din kommunikation smitter hele organisationen — bevidst og ubevidst. Hvis du er uklar, bliver teamet det også. Hvis du er ærlig, smitter det med mod. Hvis du tvivler, bliver kulturen usikker.\n\nLederskab starter altså ikke med andre — men med dig.\n\nMange ledere føler et behov for at vide, forklare og styre. Men nogle af de stærkeste ledelsesøjeblikke opstår, når du vælger at tie og lytte. Ikke for at svare — men for at forstå.\n\nÆgte lederskab kræver modet til at være stille, mens andre taler. At give plads, så folk selv kan tænke og mærke. Og at lytte så dybt, at du hører det, der ikke bliver sagt.\n\nNår du leder dig selv med klarhed, mod og autenticitet, følger andre efter — ikke af pligt, men af tillid." },
        { "kind": "case", "title": "Fra praksis: Nick — lagermedarbejderen der blev grafiker", "body": "Vi stod og manglede en grafiker. Midt i søgningen siger en i teamet: \"Ved du godt, at Nick ude på lageret har en grafisk baggrund?\" Jeg var helt blank. Jeg inviterede ham til en snak. Det viste sig, han var en habil grafiker. Kort tid efter sad Nick med ved bordet som virksomhedens nyeste grafiker.\n\nDet slog mig, hvor mange ressourcer der potentielt ligger lige foran os, hvis bare vi tager os tid til at lytte og spørge." },
        { "kind": "reflect", "title": "Dit lederskabs-DNA", "prompts": ["Mine kerneværdier som leder er…", "Min vigtigste opgave som leder er…", "Mit lederskab fungerer bedst, når…", "Min største ledelsesmæssige udfordring er…"] },
        { "kind": "dialogue", "title": "1:1-samtalen der bygger tillid", "intro": "Lad medarbejderen tale 80% af tiden.", "items": ["Check-in (5 min): Hvordan har du det? — som menneske, ikke kun opgaver.", "Refleksion (10 min): Hvad er du mest stolt af siden sidst? Hvad har været sværest?", "Fremadrettet (10 min): Hvad er dit vigtigste fokus? Hvor har du brug for min støtte?", "Feedback til lederen (5 min): Hvad kan jeg gøre anderledes for at hjælpe dig bedre?"] },
        { "kind": "theory", "title": "Psykologisk tryghed — Amy Edmondson", "body": "Psykologisk tryghed beskriver en arbejdskultur, hvor medarbejdere føler sig trygge ved at tage interpersonelle risici — tør stille spørgsmål, indrømme fejl og foreslå nye idéer uden frygt for at blive straffet. Som leder skaber du denne tryghed ved at reagere konstruktivt på fejl og ved at gå foran i modet til at give ansvar." },
        { "kind": "selfeval", "title": "Selvevaluering — Lederskab", "items": ["Jeg lytter mere, end jeg taler, når jeg er i dialog med mit team.", "Jeg har tillid til, at mit team kan løse opgaver uden min konstante indblanding.", "Jeg tager ansvar for den kultur, vi har i virksomheden.", "Jeg giver konstruktiv feedback, der hjælper mine medarbejdere med at vokse.", "Jeg tør vise sårbarhed og indrømme mine egne fejl."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 0, "letter": "MQ", "slug": "mq-meaning-quotient", "name": "Led med mening (MQ)",
      "interlude": true,
      "summary": "Meaning Quotient — den nye ledelsesintelligens",
      "duration": "20 min",
      "lessons": [
        { "kind": "read", "title": "En ny form for intelligens", "body": "Der var en tid, hvor det vigtigste spørgsmål til en leder var: \"Hvor dygtig er du?\" — IQ. Så kom EQ. Men i dag trænger et nyt spørgsmål sig på: Hvor meningsfuld er den retning, du sætter? Det er MQ — Meaning Quotient. Den stille intelligens, der ikke ses på CV'et, men mærkes i kulturen." },
        { "kind": "pillars", "title": "MQ hviler på fire søjler", "items": [{ "h": "Formål", "p": "Når en organisation har et tydeligt formål, og lederen kommunikerer det med ægthed, føler medarbejderne sig forbundet med noget større." }, { "h": "Forbundethed", "p": "Mening opstår i relationer. I fællesskabet. I følelsen af at høre til og gøre en forskel for andre." }, { "h": "Indflydelse", "p": "Mening kræver medinddragelse. Når du giver medarbejdere mulighed for at påvirke beslutninger, vokser også deres oplevelse af mening." }, { "h": "Anerkendelse", "p": "At blive set, hørt og værdsat, ikke bare for det man gør, men for den man er." }] },
        { "kind": "reflect", "title": "Refleksion til dig som leder", "prompts": ["Hvad oplever dine medarbejdere som meningsfuldt i deres hverdag, ved du det?", "Hvornår har du sidst forklaret hvorfor, ikke bare hvad eller hvordan?"] }
      ]
    },
    {
      "n": 3, "letter": "A", "slug": "ambition", "name": "Ambition",
      "summary": "Sæt store mål · Se dig selv lykkes · Gør mod til handling",
      "duration": "40 min",
      "lessons": [
        { "kind": "quote", "body": "Vær ikke bange for at sigte højt. Du skal være bange for at sigte for lavt — og så ramme plet!", "author": "Jim Rohn" },
        { "kind": "read", "title": "Den sunde ambition", "body": "Ambition i KLARHED-modellen handler ikke om mere — men om meningsfuldt. Det handler om at turde række ud efter noget større, som føles rigtigt og ægte, ikke bare imponerende.\n\nDu kan godt have en stille ambition — fx om mere frihed, mere glæde, større nærvær i lederskabet. Eller du kan have store visioner for vækst og impact. Det vigtige er ikke, hvad din ambition er, men at den kommer indefra — og er forankret i dit hvorfor.\n\nMange ejerledere nedtoner deres ambitioner — måske af hensyn til andre, måske fordi de er bange for at fejle. Men uforløst ambition bliver til frustration. Det tærer på din energi og bremser din ledelse.\n\nFordi uden ambition risikerer du at falde i driftsfælden: at drive virksomheden fra uge til uge uden retning, uden glæde — og uden at du selv vokser. Ambition er en motor for mening. Det er det, der får dig til at løfte blikket, tage ansvar og tænke større end bare at få det til at løbe rundt.\n\nAt turde være ambitiøs handler ikke om arrogance — det handler om modet til at tage din rolle alvorligt." },
        { "kind": "reflect", "title": "Gør din ambition levende", "prompts": ["Hvis jeg kunne skabe lige dét, jeg drømmer om med min virksomhed, hvad ville det være?", "Hvad er mit inderste \"hvorfor\" bag det jeg gør?", "Hvilket eftermæle vil jeg gerne efterlade?"] },
        { "kind": "dialogue", "title": "Vision-samtalen med dit team (60 min)", "items": ["Introduktion (10 min): Del din egen personlige ambition for virksomheden.", "Individuel refleksion (10 min): Hvad er min største ambition for vores team i det næste år?", "Deling i par (15 min): Find fællestræk.", "Fælles opsamling (20 min): Hvordan forbinder vi disse ambitioner til vores fælles retning?", "Afslutning (5 min): Aftal ét konkret skridt."] },
        { "kind": "theory", "title": "Start With Why — Simon Sinek", "body": "De mest inspirerende ledere og organisationer starter med Hvorfor (formål), bevæger sig til Hvordan (proces), og slutter med Hvad (produkt). Når din ambition er forankret i et stærkt Hvorfor, appellerer du til den del af hjernen, der styrer adfærd og beslutningstagning." },
        { "kind": "selfeval", "title": "Selvevaluering — Ambition", "items": ["Jeg har sat ord på min vision det seneste halve år.", "Mine ambitioner føles meningsfulde for mig personligt, ikke kun økonomisk.", "Jeg tør dele mine største drømme for virksomheden med andre.", "Jeg lader ikke frygten for at fejle stoppe mig i at sætte høje mål.", "Jeg afsætter tid til at tænke langsigtet og strategisk."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 4, "letter": "R", "slug": "resultat", "name": "Resultat",
      "summary": "Mål det, der tæller · Fejr små sejre · Forvandl fejl til læring",
      "duration": "40 min",
      "lessons": [
        { "kind": "read", "title": "Det meningsfulde resultat", "body": "I KLARHED-modellen udvider vi resultatbegrebet. Vi måler ikke kun på output — hvad vi får ud af det. Vi måler også på input — hvad vi lægger i det — og på impact: hvilken forskel vi gør.\n\nAmbition uden handling er drømmeri. Handling uden opfølgning er travlhed. Men når vi sætter mål, følger op og justerer, begynder den egentlige transformation.\n\nDet, du måler, udvikler sig. Når du får synlighed over, hvad der fungerer, opstår motivation, ejerskab og energi. Resultater er ikke kun tal og KPI'er. I denne model betyder resultater også at du ser og anerkender din egen fremdrift, at du lærer af det, der ikke virker, og at du fejrer, justerer og udvikler.\n\nResultater er en dialog mellem dine handlinger og din virkelighed. Du prøver noget. Du ser, hvad der sker. Du lærer. Du justerer. Det kræver, at du tør kigge ærligt på, hvad du har skabt — og hvad du ikke har skabt endnu.\n\nDu er ikke din omsætning. Du er ikke din bundlinje. Men du er ansvarlig for, om du bevæger dig bevidst mod det, der betyder noget for dig." },
        { "kind": "reflect", "title": "Dit nye dashboard", "prompts": ["Målepunkt 1 udover økonomi:", "Målepunkt 2 udover økonomi:", "Målepunkt 3 udover økonomi:"] },
        { "kind": "reflect", "title": "Fejringskulturen", "prompts": ["Hvordan fejrer vi succeser i dag?", "Hvad er en lille sejr fra denne uge, som jeg burde anerkende?"] },
        { "kind": "dialogue", "title": "Fejl-fejringen (15 min på teammødet)", "items": ["Start mødet med at dele din egen største fejl fra den forgangne uge.", "Fortæl, hvad du lærte af den.", "Spørg teamet: Hvem har begået en fantastisk fejl i denne uge, som vi andre kan lære af?", "Anerkend modet til at dele."] },
        { "kind": "theory", "title": "Growth Mindset — Carol Dweck", "body": "Personer med et Fixed Mindset tror, at evner er medfødte. De undgår udfordringer for ikke at fejle. Personer med et Growth Mindset tror, at evner kan udvikles gennem indsats. De ser fejl som nødvendige skridt på vejen. Som leder er din vigtigste opgave at belønne læringsprocessen frem for kun det fejlfrie resultat." },
        { "kind": "selfeval", "title": "Selvevaluering — Resultat", "items": ["Jeg måler på det, der reelt skaber værdi, ikke kun på drift og bundlinje.", "Jeg er god til at fejre små sejre i hverdagen.", "Jeg ser fejl som en kilde til læring frem for noget, der skal skjules.", "Jeg kommunikerer tydeligt, hvad succes ser ud for mit team.", "Jeg anerkender indsatsen, selv når resultatet udebliver."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 5, "letter": "H", "slug": "handling", "name": "Handling",
      "summary": "Skab en realistisk plan · Prioritér med omtanke · Beskyt din tid",
      "duration": "40 min",
      "lessons": [
        { "kind": "quote", "body": "Du kan gøre alt, men du kan ikke gøre alt på én gang.", "author": "David Allen" },
        { "kind": "read", "title": "Kunsten at sige nej", "body": "Hver gang du siger ja til en opgave, et møde eller et projekt, siger du uundgåeligt nej til noget andet. Ofte er det netop din tid til refleksion, din familie eller den langsigtede udvikling af virksomheden.\n\nDet er en misforståelse, at vi skal tænke os frem til klarhed, før vi handler. Ofte er det først, når vi begynder at handle, at vi ser tydeligere — hvad der virker, hvad der føles rigtigt, og hvad der skal justeres.\n\nHandling er broen mellem idé og resultat. Som ejerleder er det let at ende i enten handlingslammelse — for mange muligheder — eller handlingsflugt: travlhed uden retning. Ved at arbejde bevidst med dine handlinger kan du vælge med ro, eksekvere med struktur og evaluere med ro i maven.\n\nDette kapitel handler ikke om store forkromede strategiplaner, men om at gøre tingene enkle, realistiske og fokuserede. Små skridt, der bliver taget, er mere værd end store visioner, der aldrig bliver sat i gang.\n\nHandling er ikke bare produktivitet — det er en måde at tage ansvar på." },
        { "kind": "case", "title": "Fra praksis: Martin, 44 år", "body": "CEO i en scale-up med 80 ansatte. Den eksponentielle vækst havde ændret alt. Han havde mistet forbindelsen til det produkt og de mennesker, der oprindeligt havde drevet ham. Martin afsatte to timer hver fredag til strategisk refleksion — og kulturen begyndte langsomt at ændre sig." },
        { "kind": "reflect", "title": "Tids-revisionen", "prompts": ["Hvor mange timer brugte jeg på opgaver, der reelt flytter virksomheden fremad?", "Hvilke 3 møder eller opgaver kunne jeg have slettet eller uddelegeret?", "Hvad er min vigtigste opgave i næste uge, som jeg skal beskytte tid til?"] },
        { "kind": "dialogue", "title": "Delegerings-dialogen", "items": ["Hvad: Hvad er det præcise resultat, vi ønsker? (Ikke hvordan det skal gøres).", "Hvorfor: Hvorfor er denne opgave vigtig for vores overordnede mål?", "Ressourcer: Hvilke ressourcer, tid og budget er til rådighed?", "Grænser: Hvor går grænsen for medarbejderens beslutningskompetence?", "Opfølgning: Hvornår og hvordan følger vi op?"] },
        { "kind": "theory", "title": "Eisenhower-matricen", "body": "Det vigtige er sjældent haster, og det der haster er sjældent vigtigt. Matricen deler opgaver i fire kvadranter: 1) Vigtigt og haster — gør det nu. 2) Vigtigt, men haster ikke — planlæg det. 3) Haster, men ikke vigtigt — uddeleger. 4) Haster ikke og ikke vigtigt — slet det. Stræb efter at bruge det meste af din tid i kvadrant 2." },
        { "kind": "selfeval", "title": "Selvevaluering — Handling", "items": ["Min kalender afspejler mine vigtigste prioriteter.", "Jeg er god til at sige nej til opgaver, der ikke støtter min retning.", "Jeg har tid til strategisk refleksion hver uge.", "Jeg uddelegerer opgaver effektivt og med tillid.", "Jeg færdiggør det, jeg starter, før jeg går i gang med noget nyt."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 6, "letter": "E", "slug": "evne", "name": "Evne",
      "summary": "Forbedr dig kontinuerligt · Tilpas dig med ro · Tænk i løsninger",
      "duration": "35 min",
      "lessons": [
        { "kind": "quote", "body": "Ikke den stærkeste overlever — men den mest tilpasningsdygtige.", "author": "Charles Darwin" },
        { "kind": "read", "title": "Evne er ikke talent — det er vedligeholdt villighed", "body": "Som ejerleder bliver du dagligt udfordret: af forandringer, af kompleksitet, af mennesker og af dine egne begrænsninger. Evne handler derfor ikke om at være god til noget fra starten, men om at ville blive bedre — hele tiden.\n\nDen, der tror, han er færdigudviklet, er allerede bagud. Den, der tør se sig selv som en elev, bliver ved med at vokse.\n\nForretningsverdenen ændrer sig hurtigt. Det, der virkede i går, virker måske ikke i morgen. Hvis du som leder ikke udvikler dine evner — og opdaterer din måde at tænke og handle på — risikerer du at blive en bremseklods for din egen virksomhed.\n\nSelvudvikling er ikke egoisme — det er en ledelsesstrategi. Når du udvikler dig, udvikler alt omkring dig sig også. Dit team, dine beslutninger og din kommunikation smitter af på kulturen.\n\nEvne er en måde at tage ansvar for fremtiden — ikke ved at forudse den, men ved at gøre dig klar til den." },
        { "kind": "reflect", "title": "1% bedre — hver dag", "prompts": ["Én evne, jeg gerne vil styrke er…", "Hvad kan jeg gøre i dag for at rykke bare lidt på det?", "Hvordan kan jeg måle, at jeg gør fremskridt?"] },
        { "kind": "reflect", "title": "Din læringsprofil", "prompts": ["Hvordan lærer jeg bedst? (læse, lytte, prøve, diskutere, undervise?)", "Hvornår har jeg sidst lært noget nyt, som virkelig inspirerede mig?", "Hvilke bøger, kurser, netværk eller mentorer skal jeg prioritere det næste halve år?"] },
        { "kind": "dialogue", "title": "Læringssamtalen (kvartalsvis 1:1)", "items": ["Hvad er den vigtigste nye ting, du har lært i det forgangne kvartal?", "Hvilken opgave har udfordret dig mest, og hvad lærte du af det?", "Hvilken ny færdighed vil du gerne udvikle i det kommende kvartal?", "Hvordan kan jeg bedst støtte dig i den læringsproces?"] },
        { "kind": "theory", "title": "Kaizen og 1% bedre", "body": "Kaizen betyder kontinuerlig forbedring (kai = ændring, zen = god). Små daglige forbedringer på 1% akkumulerer over tid. Hvis du bliver 1% bedre hver dag i et år, er du 37 gange bedre ved årets udgang." },
        { "kind": "selfeval", "title": "Selvevaluering — Evne", "items": ["Jeg opsøger aktivt ny viden og læring i mit lederskab.", "Jeg er åben for at ændre mening, når jeg præsenteres for nye perspektiver.", "Jeg beder regelmæssigt om feedback på min ledelse.", "Jeg investerer tid i at forstå nye teknologier og trends i min branche.", "Jeg ser min egen udvikling som en forudsætning for virksomhedens vækst."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 7, "letter": "D", "slug": "dedikation", "name": "Dedikation",
      "summary": "Hold fast i din indsats · Giv dit engagement næring · Pas på dig selv",
      "duration": "40 min",
      "lessons": [
        { "kind": "quote", "body": "Succes er ikke en engangsbeslutning — det er en daglig praksis.", "author": "Stephen R. Covey" },
        { "kind": "read", "title": "Dedikation, en stille kraft", "body": "Motivation er den følelse, du har, når alt går godt og solen skinner. Dedikation er det, der får dig til at møde op, når det regner, og du mest af alt har lyst til at blive under dynen.\n\nDedikation er viljen til at blive i processen. Ikke fordi det altid føles let, men fordi det føles rigtigt. Det er evnen til at holde kursen — også når vejen er snoet. I KLARHED-modellen er dedikation det, der binder hele rejsen sammen.\n\nFordi det tager tid at skabe forandring. Fordi virkelige resultater ikke kommer af enkelte store indsatser, men af mange små, gentagne skridt. Og fordi mennesker — dine medarbejdere, kunder, samarbejdspartnere — mærker, om du er halvhjertet eller fuldt til stede.\n\nDedikation viser sig i din evne til at være konsekvent, i dit mod til at blive ved selv når det går langsomt, og i din respekt for egen energi og balance.\n\nDedikation er ikke en følelse — det er en beslutning, du tager igen og igen." },
        { "kind": "case", "title": "Fra praksis: Lone, 47 år", "body": "HR-direktør i en større koncern. Da hendes koncern annoncerede en stor omstrukturering, blev Lones lederskab sat på den ultimative prøve. Hun var tæt på at sige op. Men da hun lavede øvelsen \"Hvad holder mig dedikeret?\", indså hun, at hendes hvorfor var at sikre, at de svære beslutninger blev truffet på den mest menneskelige og ordentlige måde muligt." },
        { "kind": "reflect", "title": "Din forpligtelse", "prompts": ["Hvad betyder dedikation for mig som leder og menneske?", "Hvilket mål eller værdiløfte vil jeg ikke give slip på — og hvorfor?", "Hvordan vil jeg reagere, næste gang jeg møder modstand eller træthed?"] },
        { "kind": "reflect", "title": "Tank din indsats op", "prompts": ["Hvad giver mig energi — fysisk, mentalt, følelsesmæssigt?", "Hvilke signaler fortæller mig, at jeg er ved at løbe tør?"] },
        { "kind": "selvom-saa", "title": "Selvom … så", "intro": "Sæt dig og skriv sætningen: \"Selvom ____________, så vil jeg ____________.\"" },
        { "kind": "dialogue", "title": "Check-in med en mentor/peer (45 min månedligt)", "items": ["Status (10 min): Hvad er gået godt siden sidst? Hvor har jeg holdt fast?", "Udfordringen (15 min): Hvor oplever jeg størst modstand lige nu?", "Spejling (15 min): Mentoren/peeren lytter og spejler: Det jeg hører dig sige, er…", "Forpligtelse (5 min): Hvad er den ene ting, jeg forpligter mig til inden næste møde?"] },
        { "kind": "theory", "title": "Grit — Angela Duckworth", "body": "Det er ikke talent, intelligens eller held, der er den afgørende faktor på lang sigt. Det er Grit — en kombination af passion og vedholdenhed for langsigtede mål. Grit handler om at holde fast i sin fremtid, dag ud og dag ind, ikke bare i en uge eller en måned, men i årevis." },
        { "kind": "selfeval", "title": "Selvevaluering — Dedikation", "items": ["Jeg holder fast i mine beslutninger, også når det bliver svært.", "Jeg ved, hvad der giver mig energi, og jeg prioriterer det.", "Jeg føler mig dedikeret til min rolle som leder på lang sigt.", "Jeg har rutiner, der hjælper mig med at genfinde fokus, når jeg mister det.", "Jeg lader ikke kortsigtede tilbageslag slå mig ud af kurs."] },
        { "kind": "commit", "title": "Indsigt · Handling · Løfte" }
      ]
    },
    {
      "n": 8, "letter": "8", "slug": "samling-90-dage", "name": "Samling & 90-dages plan",
      "summary": "Fra indsigt til integreret lederskab",
      "duration": "60 min",
      "lessons": [
        { "kind": "read", "title": "Slutmåling", "body": "Du har nu gennemgået syv essentielle områder af dit lederskab — og ikke bare læst om dem, men mærket, skrevet, reflekteret og besluttet. KLARHED-modellen har givet dig et spejl og et kompas — og forhåbentlig også modet til at være en anden slags leder, end den du engang troede, du skulle være.\n\nMen arbejdet er ikke færdigt. KLARHED er ikke en tilstand — det er en praksis. Det er noget, du vender tilbage til. Noget du genopdager. Noget du vokser med.\n\nFør du begyndte, lavede du en baseline-måling. Nu er det tid til at gentage den — og se, hvad der er rykket sig." },
        { "kind": "final-measure", "title": "Gentag målingen" },
        { "kind": "compare", "title": "Dit før/efter-billede" },
        { "kind": "plan90", "title": "Din 90-dages plan" },
        { "kind": "manifest", "title": "Dit personlige ledelsesmanifest" },
        { "kind": "read", "title": "Et sidste brev fra Frank", "body": "Du er nået til vejs ende i denne arbejdsbog. Men i virkeligheden står du ved en begyndelse.\n\nHusk: Mennesket før metoden. Mening før mekanik. Lad det være dit mantra, når tvivlen melder sig. Du har nøglen. Døren står på klem." }
      ]
    }
  ]
}
JSON, true );
