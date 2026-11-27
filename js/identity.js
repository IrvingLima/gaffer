"use strict";
/* ================= identidad de los clubes =================
   Nombres y escudos propios: ciudad real, referencia geográfica y colores. Los patrones son genéricos
   (franjas, mitades, aros, banda) y las formas son originales: no se copian escudos, símbolos ni marcas. */
const CREST_SHAPES=[
  'M4 3h32v17c0 10-7 16-16 20C11 36 4 30 4 20z',                      /* clásico */
  'M20 3a19 19 0 1 1-.01 0z',                                          /* redondo */
  'M9 3h22q5 0 5 5v28q0 5-5 5H9q-5 0-5-5V8q0-5 5-5z',                  /* tarjeta */
  'M20 2 37 11v22L20 42 3 33V11z',                                     /* hexágono */
  'M4 3h32v26L20 42 4 29z'                                             /* banderín */
];
/* 0 franja baja · 1 mitades · 2 aros · 3 banda · 4 galón · 5 franjas · 6 liso con ribete · 7 franja central · 8 laterales · 9 cuarteles · 10 jefe */
const NPATS=11,PAT_LIST=[0,1,2,3,4,5,6,7,8,9,10];
function crestPattern(k,R,c2){
  switch(k){
    case 0:return R(0,22,40,9);
    case 1:return R(20,0,20,44);
    case 2:return R(0,9,40,6)+R(0,21,40,6)+R(0,33,40,6);
    case 3:return `<path d="M0 8L40 30V40L0 18z" fill="${c2}"/>`;
    case 4:return `<path d="M0 20L20 8L40 20V29L20 17L0 29z" fill="${c2}"/>`;
    case 5:return R(7,0,6,44)+R(17,0,6,44)+R(27,0,6,44);
    case 6:return `<path d="M0 0H40V44H0z M7 7V37H33V7z" fill="${c2}" fill-rule="evenodd"/>`;
    case 7:return R(14,0,12,44);
    case 8:return R(0,0,10,44)+R(30,0,10,44);
    case 9:return R(20,0,20,22)+R(0,22,20,22);
    default:return R(0,0,40,13);
  }
}
/* patrón de cada club de 1ª (mismo orden que T1), según los colores con que se asocia a cada ciudad */
const T1PAT={
  ES:[6,5,5,10,6,5,5,6,5,6,1,5,6,5,0,5,6,2,6,3],
  EN:[6,6,6,10,6,6,5,10,5,10,6,6,6,5,6,5,5,6,10,5],
  DE:[6,6,1,6,5,0,6,7,5,6,6,6,6,6,7,6,6,1],
  IT:[5,5,5,6,6,6,6,5,1,5,6,6,5,1,5,6,5,9,0,7],
  FR:[7,6,7,3,6,5,1,5,6,4,6,6,6,10,6,6,6,1,1,5],
  PT:[6,2,5,10,6,5,5,6,5,6,6,5,6,5,9,5,1,6],
  RU:[6,1,6,7,6,6,10,6,6,6,6,1,6,5,6,6],
  NL:[7,1,5,6,6,3,7,5,5,5,1,6,6,3,6,6,7,6],
  TR:[1,5,5,1,6,3,5,5,5,6,6,1,5,6,1,5,5,6],
  BE:[6,5,6,6,6,6,3,5,6,6,6,6,6,1,6,6],
  SC:[2,6,6,10,6,6,6,6,5,6,0,6],
  AT:[6,6,6,6,6,5,6,6,6,6,6,6],
  CH:[1,3,6,6,6,6,6,6,6,6,6,6],
  DK:[6,6,6,5,6,6,5,6,6,6,5,6],
  PL:[6,6,6,6,5,6,6,6,6,6,1,6,6,6,6,5,6,6],
  GR:[5,5,5,5,5,6,6,6,6,5,6,6,6,5],
  BR:[0,6,6,2,3,6,5,5,6,5,6,5,5,2,5,6,6,6,6,6],
  AR:[0,3,6,5,5,6,3,0,1,5,6,5,6,5,5,6,6,6,6,5],
  MX:[6,6,6,5,5,5,6,3,6,6,5,6,2,5,2,6,6,6],
  US:[6,6,6,0,5,2,0,6,6,0,6,2,0,6,10,6,0,1,6,6]
};
const identPat=(cc,tier,idx,key)=>tier===1&&T1PAT[cc]&&T1PAT[cc][idx]!=null?T1PAT[cc][idx]:hsh(key)%NPATS;
const identShape=key=>hsh(key+'#')%CREST_SHAPES.length;
const STAD_FIX={'MX|Azteca':'Estadio Tlalpan','AR|Arroyito':'Estadio de la Ribera'};
function identStad(cc,city,suf){
  const fx=STAD_FIX[cc+'|'+suf];if(fx)return fx;
  const pre=STAD_PRE[cc][hsh(city+suf)%STAD_PRE[cc].length];
  return ['EN','SC','US'].includes(cc)?suf+' '+pre:pre+' '+suf;
}
/* ================= nombres: guiños a cada club con apodos propios (ciudad + apodo) ================= */
const T1NAMES={
  ES:'Madrid|Merengues,Barcelona|Culés,Madrid|Colchoneros,Sevilla|Nervionenses,Valencia|Murciélagos,Bilbao|Leones,San Sebastián|Txuri-Urdin,Villarreal|Submarino,Sevilla|Verdiblancos,Vigo|Celtiñas,Pamplona|Rojillos,Girona|Gironautas,Mallorca|Bermellones,Vitoria|Babazorros,Elche|Franjiverdes,Almería|Indálicos,Cádiz|Piratas,Granada|Nazaríes,Las Palmas|Pío-Pío,Vallecas|Relámpagos',
  EN:'Manchester|Devils,Manchester|Citizens,Liverpool|Redbirds,London|Cannons,London|Blue Lions,London|Roosters,Newcastle|Magpies,Birmingham|Villans,Brighton|Seagulls,London|Hammers,Liverpool|Toffees,Leicester|Foxes,Nottingham|Foresters,Southampton|Saints,Wolverhampton|Wolfpack,Bournemouth|Cherries,London|Eagles,Leeds|Peacocks,Burnley|Clarets,Sheffield|Blades',
  DE:'München|Bavarians,Dortmund|Bienen,Leverkusen|Werkself,Leipzig|Bulls,Frankfurt|Adler,Stuttgart|Schwaben,Wolfsburg|Wölfe,Gladbach|Fohlen,Berlin|Eisernen,Hamburg|Dinos,Freiburg|Breisgauer,Bremen|Stadtmusikanten,Köln|Geißböcke,Mainz|Karnevalisten,Augsburg|Zirbeln,Hoffenheim|Kraichgauer,Bochum|Ruhrpott,Heidenheim|Ostälbler',
  IT:'Milano|Diavoli,Milano|Biscione,Torino|Zebre,Roma|Lupi,Roma|Aquile,Napoli|Partenopei,Firenze|Viola,Bergamo|Dea,Genova|Grifoni,Bologna|Felsinei,Torino|Granata,Verona|Scaligeri,Udine|Zebrette,Cagliari|Isolani,Lecce|Salentini,Empoli|Azzurri,Sassuolo|Neroverdi,Parma|Crociati,Genova|Marinai,Monza|Brianzoli',
  FR:'Paris|Parisiens,Marseille|Phocéens,Lyon|Gones,Monaco|Princes,Lille|Dogues,Nice|Aiglons,Rennes|Hermines,Lens|Sang et Or,Nantes|Canaris,Bordeaux|Girondins,Toulouse|Violets,Montpellier|Paillade,Strasbourg|Cigognes,Reims|Champenois,Brest|Pirates,Lorient|Merlus,Metz|Grenats,Clermont|Volcans,Le Havre|Matelots,Angers|Scoïstes',
  PT:'Lisboa|Águias,Lisboa|Leões,Porto|Dragões,Braga|Guerreiros,Guimarães|Conquistadores,Vila do Conde|Caravelas,Setúbal|Sadinos,Coimbra|Estudantes,Funchal|Insulares,Faro|Algarvios,Famalicão|Minhotos,Moreira|Cónegos,Estoril|Canarinhos,Arouca|Lobos,Porto|Panteras,Portimão|Alvinegros,Chaves|Flavienses,Barcelos|Galos',
  RU:'Moscú|Gladiadores,Moscú|Caballos,San Petersburgo|Flechas,Moscú|Locomotoras,Krasnodar|Toros,Sochi|Leopardos,Samara|Alas,Kazán|Rubíes,Rostov|Cosacos,Grozni|Lobos,Ekaterimburgo|Urales,Nizhni Nóvgorod|Venados,Majachkalá|Halcones,Perm|Osos,Ufá|Apicultores,Novosibirsk|Siberianos',
  NL:'Amsterdam|Ajacieden,Rotterdam|Pride,Eindhoven|Boeren,Alkmaar|Kaaskoppen,Enschede|Tukkers,Utrecht|Domstad,Groningen|Noorderlingen,Arnhem|Arenden,Tilburg|Tricolores,Heerenveen|Friezen,Den Haag|Ooievaars,Zwolle|Blauwvingers,Sittard|Fortunezen,Breda|Parels,Waalwijk|Schoenmakers,Venlo|Venlonaren,Nijmegen|Keizers,Emmen|Drenten',
  TR:'Estambul|Leones,Estambul|Canarios,Estambul|Águilas Negras,Trabzon|Tormenta,Ankara|Gencos,Estambul|Búhos,Bursa|Cocodrilos,Esmirna|Göz-Göz,Konya|Águilas Verdes,Antalya|Escorpiones,Adana|Rayos,Kayseri|Estrellas,Gaziantep|Halcones,Samsun|Rayo Rojo,Rize|Teteros,Alanya|Soles,Hatay|Defensores,Sivas|Yiğidos',
  BE:'Bruselas|Malvas,Brujas|Blauwzwart,Amberes|Great Old,Gante|Búfalos,Lieja|Rouches,Genk|Pitufos,Malinas|Campaneros,Charleroi|Cebras,Lovaina|Estudiantes,Kortrijk|Kerels,Sint-Truiden|Canarios,Westerlo|Campesinos,Eupen|Pandas,Ostende|Gaviotas,Namur|Caracoles,Mons|Dragones',
  SC:'Glasgow|Shamrocks,Glasgow|Gers,Edimburgo|Jambos,Edimburgo|Hibees,Aberdeen|Dons,Dundee|Dees,Dundee|Terrors,Inverness|Highlanders,Paisley|Buddies,Kilmarnock|Killies,Motherwell|Steelmen,Livingston|Lions',
  AT:'Viena|Violetas,Viena|Hütteldorfers,Salzburg|Bulls,Graz|Tormenta,Graz|Rotjacken,Linz|Laskers,Klagenfurt|Wörther,Innsbruck|Tiroler,Wolfsberg|Lobos,Altach|Rheindorf,Ried|Vikingos,Hartberg|Ciervos',
  CH:'Basel|Bebbi,Berna|Young Bears,Zúrich|Leones,Zúrich|Saltamontes,Ginebra|Granates,Lugano|Bianconeri,Lucerna|Dragones,San Galo|Espen,Sion|Torbellinos,Lausana|Olímpicos,Winterthur|Löwen,Yverdon|Verdes',
  DK:'Copenhague|Leones,Copenhague|Rojos,Brøndby|Vikingos,Herning|Lobos,Aarhus|Águilas,Aalborg|Linces,Odense|Cisnes,Silkeborg|Salmones,Randers|Caballos,Viborg|Monjes,Lyngby|Reyes,Esbjerg|Focas',
  PL:'Varsovia|Legionarios,Varsovia|Camisas Negras,Poznań|Locomotora,Cracovia|Estrella Blanca,Cracovia|Pasy,Breslavia|Gnomos,Gdansk|Ámbar,Gdynia|Navegantes,Łódź|Caballeros,Chorzów|Niebiescy,Zabrze|Mineros,Katowice|Gigantes,Szczecin|Marineros,Lublin|Motores,Białystok|Bisontes,Kielce|Coronas,Mielec|Aceros,Płock|Petroleros',
  GR:'Atenas|Trébol,Pireo|Leyendas,Atenas|Bicéfalos,Salónica|Águilas,Salónica|Marte,Patras|Panteras,Volos|Argonautas,Heraclión|Minotauros,Larisa|Centauros,Ioánina|Toros,Lamia|Lanzas,Trípoli|Estrellas,Agrinio|Titanes,Kalamata|Tormenta',
  BR:'São Paulo|Tricolores,São Paulo|Verdão,São Paulo|Timão,Río de Janeiro|Urubus,Río de Janeiro|Almirantes,Río de Janeiro|Fogão,Río de Janeiro|Guerreiros,Belo Horizonte|Galos,Belo Horizonte|Raposas,Porto Alegre|Mosqueteiros,Porto Alegre|Colorados,Curitiba|Furacão,Salvador|Esquadrão,Recife|Leões,Fortaleza|Pici,Goiânia|Esmeraldinos,Santos|Peixe,Campinas|Bugre,Belém|Papão,Cuiabá|Dourados',
  AR:'Buenos Aires|Xeneizes,Buenos Aires|Millonarios,Avellaneda|Diablos Rojos,Avellaneda|Academia,Buenos Aires|Cuervos,Buenos Aires|Verdolagas,La Plata|Lobos,La Plata|Pincharratas,Rosario|Leprosos,Rosario|Canallas,Córdoba|Piratas,Córdoba|Tallarines,Mendoza|Tombinos,Tucumán|Decanos,Santa Fe|Tatengues,Mar del Plata|Tiburones,Salta|Santos,Lanús|Granates,Quilmes|Cerveceros,Banfield|Taladros',
  MX:'Ciudad de México|Águilas,Ciudad de México|Felinos,Ciudad de México|Cementeros,Guadalajara|Rebaño,Guadalajara|Zorros,Monterrey|Rayos,Monterrey|Tigrillos,Puebla|Camoteros,Toluca|Diablos,León|Fieras,Pachuca|Tuzos,Tijuana|Xolos,Querétaro|Gallos,San Luis Potosí|Tuneros,Torreón|Guerreros,Mérida|Venados,Veracruz|Escualos,Cancún|Iguanas',
  US:'Nueva York|Pigeons,Nueva York|Bulls,Los Ángeles|Galácticos,Los Ángeles|Falcons,Atlanta|Peaches,Seattle|Sounds,Portland|Lumberjacks,Miami|Herons,Orlando|Lions,Chicago|Flames,Houston|Dynamos,Dallas|Longhorns,Filadelfia|Snakes,Washington|Eagles,Boston|Rebels,Columbus|Hardhats,Kansas City|Wizards,Salt Lake|Royals,San Diego|Surfers,Nashville|Guitars'
};
const CITYNICK={'Santander':'Montañeses','Zaragoza':'Maños','Oviedo':'Carbayones','Gijón':'Playus','Valladolid':'Pucelanos','Albacete':'Navajeros','Tenerife':'Chicharreros','Córdoba':'Califas','Málaga':'Boquerones','Alicante':'Herculanos','Huesca':'Altoaragoneses','Lugo':'Romanos','Ferrol':'Departamentales','Burgos':'Cidianos','Ponferrada':'Templarios','Eibar':'Armeros','Leganés':'Pepineros','Cartagena':'Cartagineses','Murcia':'Pimentoneros','Badajoz':'Pacenses','Logroño':'Viñadores','Castellón':'Orelluts','Tarragona':'Gladiadores','Jaén':'Olivareros','La Coruña':'Herculinos','Salamanca':'Charros','Mérida':'Emeritenses','Toledo':'Espaderos','Segovia':'Acueductos','Cuenca':'Colgados','Huelva':'Choqueros','Jerez':'Jinetes','Marbella':'Costasoleños','Ibiza':'Fiesteros','Ceuta':'Caballas','Melilla':'Faros','Ourense':'Burgas','Pontevedra':'Granates','Sabadell':'Arlequinados','Alcorcón':'Alfareros','Fuenlabrada':'Azulones','Bristol':'Robins','Cardiff':'Bluebirds','Swansea':'Swans','Norwich':'Canaries','Ipswich':'Tractor Boys','Reading':'Royals','Derby':'Rams','Coventry':'Sky Blues','Stoke':'Potters','Hull':'Tigers','Preston':'Lilywhites','Blackburn':'Riversiders','Middlesbrough':'Boro','Sunderland':'Black Cats','Watford':'Hornets','Millwall':'Lions','Luton':'Hatters','Plymouth':'Pilgrims','Oxford':'Scholars','Cambridge':'Punters','Blackpool':'Seasiders','Huddersfield':'Terriers','Rotherham':'Millers','Barnsley':'Tykes','Wigan':'Latics','Bolton':'Trotters','Bradford':'Bantams','Charlton':'Addicks','Portsmouth':'Pompey','Wrexham':'Red Dragons','York':'Minstermen','Lincoln':'Imps','Mansfield':'Stags','Northampton':'Cobblers','Peterborough':'Posh','Walsall':'Saddlers','Wycombe':'Chairboys','Hannover':'Roten','Nürnberg':'Lebkuchen','Düsseldorf':'Fortunen','Karlsruhe':'Fächer','Kiel':'Störche','Paderborn':'Domstädter','Magdeburg':'Elbdomer','Darmstadt':'Lilien','Fürth':'Kleeblätter','Rostock':'Koggen','Dresden':'Dynamiker','Braunschweig':'Löwen','Bielefeld':'Almkicker','Münster':'Adlerträger','Osnabrück':'Lila-Weiße','Regensburg':'Domspatzen','Ulm':'Spatzen','Aachen':'Kartoffelkäfer','Duisburg':'Zebras','Essen':'Bergleute','Chemnitz':'Himmelblauen','Palermo':'Rosanero','Bari':'Galletti','Catania':'Elefanti','Brescia':'Leonesse','Cremona':'Violinisti','Pisa':'Torri Pendenti','Perugia':'Grifoncelli','Cosenza':'Silani','Salerno':'Cavallucci','Venezia':'Gondolieri','Ascoli':'Picchi','Ancona':'Dorici','Modena':'Canarini','Spezia':'Aquilotti','Como':'Lariani','Pescara':'Delfini','Trieste':'Alabardati','Padova':'Biancoscudati','Avellino':'Irpini','Vicenza':'Lanieri','Siena':'Palio','Livorno':'Labronici','Mantova':'Virgiliani','Novara':'Gaudenziani','Amiens':'Licornes','Caen':'Vikings','Dijon':'Moutardiers','Grenoble':'Alpins','Guingamp':'Paysans','Auxerre':'Abbés','Laval':'Tangos','Ajaccio':'Corsaires','Bastia':'Lions de Mer','Sochaux':'Lionceaux','Troyes':'Andouilles','Nancy':'Chardons','Nîmes':'Crocodiles','Saint-Étienne':'Verts','Cannes':'Dragons Rouges','Sedan':'Sangliers','Londrina':'Tubarões','Joinville':'Coelhos','Florianópolis':'Figueiras','Natal':'Elefantes','Maceió':'Galos de Campina','Manaus':'Gaviões','Brasília':'Candangos','Vitória':'Capixabas','Chapecó':'Verdinhos','Caxias do Sul':'Grená','Bahía Blanca':'Aurinegros','San Juan':'Verdinegros','Jujuy':'Lobos Jujeños','Junín':'Turf','Tandil':'Serranos','Tigre':'Matadores','Morón':'Gallitos','Morelia':'Canarios','Culiacán':'Dorados','Hermosillo':'Cimarrones','Oaxaca':'Alebrijes','Zacatecas':'Mineros','Tampico':'Jaibas','Ciudad Juárez':'Bravos','Mazatlán':'Cañoneros','Aguascalientes':'Centellas'};
const NICKPOOL={
  es:'Leones,Halcones,Toros,Lobos,Cóndores,Piratas,Centellas,Dragones,Panteras,Zorros,Búhos,Gallos,Tiburones,Jabalíes,Linces,Cometas,Trovadores,Molineros,Vikingos,Caimanes,Bisontes,Truenos,Corsarios,Mapaches',
  en:'Foxes,Badgers,Otters,Ravens,Stags,Hornets,Rockets,Mariners,Knights,Wolves,Bulldogs,Falcons,Beavers,Hares,Kestrels,Vikings,Comets,Ramblers,Anchors,Owls,Pikes,Bisons,Thunder,Miners',
  de:'Adler,Füchse,Bären,Wölfe,Falken,Störche,Luchse,Ritter,Kickers,Raben,Stiere,Hirsche,Blitze,Dachse,Haie,Löwen,Eulen,Biber,Pumas,Kometen',
  it:'Leoni,Lupi,Aquile,Delfini,Tori,Falchi,Volpi,Grifoni,Corsari,Fulmini,Draghi,Pantere,Gufi,Squali,Cinghiali,Stalloni,Comete,Leopardi,Cervi,Gabbiani',
  fr:'Loups,Aigles,Lions,Dragons,Corsaires,Éclairs,Renards,Sangliers,Faucons,Taureaux,Cigales,Hiboux,Requins,Panthères,Cerfs,Mouettes,Comètes,Chevaliers,Lynx,Castors',
  pt:'Leões,Lobos,Falcões,Tubarões,Touros,Panteras,Corsários,Dragões,Raposas,Galos,Gaviões,Onças,Golfinhos,Relâmpagos,Cometas,Bisontes,Javalis,Corujas,Cavaleiros,Linces',
  nl:'Leeuwen,Valken,Wolven,Vossen,Stieren,Arenden,Draken,Uilen,Haaien,Beren,Ridders,Kraaien,Herten,Bevers,Meeuwen,Kometen',
  tr:'Aslanlar,Kartallar,Kurtlar,Şahinler,Boğalar,Yıldızlar,Kaplanlar,Ejderler,Atmacalar,Şimşekler,Korsanlar,Ayılar,Tilkiler,Martılar',
  da:'Ulve,Ørne,Løver,Falke,Bjørne,Ræve,Hajer,Vikinger,Hjorte,Ravne,Tyre,Sæler',
  pl:'Orły,Wilki,Lwy,Sokoły,Żubry,Rysie,Smoki,Niedźwiedzie,Jelenie,Kruki,Rycerze,Pioruny',
  gr:'Leones,Águilas,Delfines,Centauros,Titanes,Argonautas,Búhos,Grifos,Espartanos,Halcones,Toros,Cíclopes',
  ru:'Osos,Lobos,Halcones,Cosacos,Linces,Cometas,Renos,Tigres,Águilas,Cohetes,Bisontes,Truenos'
};
const NICKLANG={
  ES:'es',
  AR:'es',
  MX:'es',
  EN:'en',
  SC:'en',
  US:'en',
  DE:'de',
  AT:'de',
  CH:'de',
  IT:'it',
  FR:'fr',
  BE:'fr',
  PT:'pt',
  BR:'pt',
  NL:'nl',
  TR:'tr',
  DK:'da',
  PL:'pl',
  GR:'gr',
  RU:'ru'
};
const identNick=(cc,city)=>{if(CITYNICK[city])return CITYNICK[city];const l=NICKPOOL[NICKLANG[cc]||'es'].split(',');return l[hsh(city+cc)%l.length];};
/* nombres de versiones anteriores: solo sirven para reconocer y actualizar partidas guardadas */
const T1RENAME={
  PT:{'Águia':'Carnide','Leão':'Lumiar','Dragão':'Antas'},EN:{Fox:'Soar',Claret:'Calder'},IT:{Neroverde:'Secchia'},
  NL:{Philips:'Strijp'},BR:{Corinto:'Tatuapé'},FR:{Merlus:'Rade'},DK:{Midtjylland:'Hede'},SC:{Tannadice:'Hilltown'},
  AR:{Gigante:'Arroyito',Granate:'Estación',Cervecero:'Ribera',Taladro:'Sur'}
};
const OLD_T2SUF={};
const GEO_SUF={
  ES:'Norte,Ribera,Costa,Sierra,Vega,Puerto,Mirador,Alameda,Vaguada,Ensanche,Faro,Ladera',
  EN:'Vale,Quay,Mills,Cross,Heath,Gate,Brook,Moorside,Wharf,Fields,Ridge,Market',
  DE:'Nord,Süd,Tal,Hafen,Höhe,Aue,Brücke,Altstadt,Wald,Ufer,Markt,Heide',
  IT:'Marina,Colle,Ponte,Valle,Porta,Riviera,Fonte,Piana,Borgo,Rocca,Torre,Lido',
  FR:'Rive,Colline,Port,Vallée,Pont,Plaine,Halles,Coteaux,Source,Rempart,Marais,Belvédère',
  PT:'Ribeira,Serra,Vale,Cais,Ponte,Colina,Praça,Encosta,Várzea,Mirante,Foz,Campina',
  RU:'Norte,Sur,Río,Puerto,Colina,Bosque,Puente,Llanura,Muelle,Parque,Ribera,Fortaleza',
  NL:'Noord,Zuid,Haven,Dijk,Brug,Markt,Veld,Kade,Polder,Hof,Meer,Poort',
  TR:'Liman,Vadi,Tepe,Sahil,Köprü,Ova,Çarşı,Kale,Bahçe,Pınar,Yayla,Merkez',
  BE:'Haven,Brug,Markt,Veld,Dijk,Vallei,Kouter,Poort,Rivier,Heuvel,Park,Kade',
  SC:'Glen,Brae,Quay,Cross,Heath,Burn,Firth,Wynd,Fields,Ridge,Shore,Mills',
  AT:'Nord,Süd,Tal,Au,Berg,Brücke,Markt,Wald,Ufer,Anger,Feld,Höhe',
  CH:'Nord,Süd,Tal,Ufer,Berg,Brücke,Markt,Wald,Matte,Halde,Feld,Höhe',
  DK:'Havn,Strand,Bakke,Dal,Skov,Bro,Torv,Eng,Vig,Mark,Park,Høj',
  PL:'Północ,Południe,Rzeka,Wzgórze,Przystań,Most,Rynek,Dolina,Park,Brzeg,Pole,Las',
  GR:'Limani,Lofos,Potamos,Akti,Kentro,Pediada,Kastro,Alsos,Gefyra,Agora,Dasos,Kolpos',
  BR:'Serra,Porto,Várzea,Colina,Ribeira,Ponte,Praça,Vale,Encosta,Mirante,Campo,Foz',
  AR:'Norte,Sur,Oeste,Ribera,Puerto,Estación,Parque,Barranca,Costanera,Alto,Plaza,Bajo',
  MX:'Norte,Cerro,Valle,Laguna,Puerto,Sierra,Plaza,Mirador,Ribera,Bosque,Llano,Barranca',
  US:'Harbor,Ridge,River,Valley,Bay,Heights,Crossing,Park,Lakes,Mesa,Bridge,Point'
};
Object.keys(GEO_SUF).forEach(cc=>{OLD_T2SUF[cc]=(T2SUF[cc]||[]).slice();});
/* "ciudades" de categorías inferiores que eran nombres de clubes */
const CITYFIX={'Benfica Norte':'Odemira','Marítimo':'Machico','Nacional':'Santana','Académico':'Lamego','Oliveirense':'Oliveira do Bairro','Feirense':'Santa Comba','Torreense':'Torres Vedras',
  'Vitesse Sur':'Velp','Telstar':'Velsen','Cambuur':'Leeuwarden','Roda':'Kerkrade','Arandina':'Aranda','Arosa':'Vilagarcía','Port Vale':'Burslem','Oxford City':'Banbury',
  'Triestina':'Muggia','Carrarese':'Carrara','Lucchese':'Lucca','Pianese':'Piancastagnaio','Viterbese':'Orte','Turris':'Torre del Greco','Vigor':'Senigallia'};
[T2CITY,T3CITY,T4CITY].forEach(T=>Object.keys(T).forEach(cc=>{T[cc]=T[cc].split(',').map(x=>CITYFIX[x]||x).join(',');}));
/* nombres originales (v4.45) y se sustituyen por los nuevos */
const OLD_T1={};
Object.keys(T1).forEach(cc=>{OLD_T1[cc]=T1[cc].map(d=>[d[0],d[1]]);const n=T1NAMES[cc].split(',');T1[cc].forEach((d,i)=>{const [city,suf]=n[i].split('|');d[0]=city;d[1]=suf;});});
T1.MX[0][2]='#f2c200';T1.MX[0][3]='#1a3a8c';T1.MX[2][2]='#1a3a8c';T1.MX[2][3]='#f2f2f0';
/* posición de cada club al generarse el mundo (el orden de los identificadores es siempre el mismo) */
function identSlots(){const out=[];LEAGUES.forEach(L=>L.t.forEach((T,ti)=>{for(let i=0;i<T[1];i++)out.push([L.cc,ti,i]);}));return out;}
/* partidas guardadas: aplica nombres, escudos y estadios nuevos sin tocar lo que el usuario haya personalizado */
function applyIdentity(){
  if(!S||!S.clubs||S.ident===2)return;
  const slots=identSlots(),seen={};
  S.clubs.forEach(c=>{
    const sl=slots[c.id];if(!sl||c.custom||c.cc!==sl[0]){seen[c.short]=1;return;}
    const [cc,ti,i]=sl;let city,suf,olds=[];
    if(ti===0){
      const o=OLD_T1[cc][i];city=T1[cc][i][0];suf=T1[cc][i][1];
      olds=[o[0]+' '+o[1],o[0]+' '+((T1RENAME[cc]||{})[o[1]]||o[1])];
    }else{
      const raw=(ti===1?T2CITY:ti===2?T3CITY:T4CITY)[cc].split(','),cy=raw[i%raw.length],os=OLD_T2SUF[cc]||[],gs=(GEO_SUF[cc]||'').split(',');
      city=cy;suf=identNick(cc,cy);const k=os.length?hsh(cy+ti)%os.length:0;
      const cities=[cy].concat(Object.keys(CITYFIX).filter(x=>CITYFIX[x]===cy));
      cities.forEach(x=>{const j=os.length?hsh(x+ti)%os.length:0;olds.push(x+' '+os[j],x+' '+gs[j%gs.length]);});
      olds.push(cy+' '+gs[k%gs.length]);
    }
    /* el club del usuario conserva su identidad si él la cambió */
    if(c.id===S.user&&!olds.includes(c.name)){seen[c.short]=1;return;}
    const stadDef=STAD_PRE[cc].some(p=>c.stad===p+' '+c.city||c.stad===p+' '+c.suf||c.stad===c.suf+' '+p);
    if(c.name!==city+' '+suf){c.city=city;c.suf=suf;c.name=city+' '+suf;if(!c.shortCustom)c.short=shortFor(city,suf,seen);}else seen[c.short]=1;
    c.pat=identPat(cc,ti+1,i,city+suf);c.sh=identShape(city+suf);
    if(ti===0){const d=T1[cc][i];c.c1=d[2];c.c2=d[3];if(stadDef)c.stad=identStad(cc,city,suf);}
  });
  S.ident=2;
}
