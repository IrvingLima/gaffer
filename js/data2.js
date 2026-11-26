"use strict";
/* ================= ampliación del mundo: 7 países europeos más (calendario europeo) ================= */
(function(){
const mk=(cc,nm,sizes,rng,start,end,brk,win,ud,tv)=>({cc,nm,t:sizes.map((n,i)=>[['Primera División','Segunda División','Tercera División','Cuarta División'][i],n,rng[i]]),start,end,brk,win,ud,tv});
LEAGUES.push(
 mk('BE','Bélgica',[16,16,16,16],[[60,74],[50,60],[40,50],[30,40]],[7,26],[5,25],[[12,24,1,3]],[[6,10,9,1],[1,1,2,2]],2,0.6),
 mk('SC','Escocia',[12,10,10,10],[[58,72],[48,58],[38,48],[30,38]],[8,2],[5,18],[[12,25,1,2]],[[6,10,9,1],[1,1,2,2]],1,0.5),
 mk('AT','Austria',[12,16,16,16],[[58,72],[50,58],[40,50],[30,40]],[7,20],[5,25],[[12,15,2,8]],[[6,15,9,1],[1,1,2,2]],2,0.5),
 mk('CH','Suiza',[12,10,16,16],[[58,72],[50,58],[40,50],[30,40]],[7,18],[5,25],[[12,15,2,1]],[[6,20,9,1],[1,1,2,2]],1,0.6),
 mk('DK','Dinamarca',[12,12,12,16],[[56,70],[48,56],[40,48],[30,40]],[7,18],[5,25],[[12,10,2,15]],[[6,20,9,1],[1,1,2,2]],2,0.5),
 mk('PL','Polonia',[18,18,18,18],[[56,70],[48,56],[40,48],[30,40]],[7,25],[5,25],[[12,15,2,20]],[[6,20,9,1],[1,1,2,2]],3,0.5),
 mk('GR','Grecia',[14,16,16,16],[[56,70],[48,56],[40,48],[30,40]],[8,22],[5,15],[[12,24,1,5]],[[7,1,9,1],[1,1,2,2]],2,0.5)
);
LEAGUES.forEach(L=>{LG_BY_CC[L.cc]=L;});
Object.assign(T1,{
BE:[['Bruselas','Atomium','#5a2a8c',W],['Brujas','Canal','#1a3a8c',K],['Amberes','Puerto','#d4161d',W],['Gante','Torres',W,'#1a3a8c'],['Lieja','Mosa','#d4161d',W],['Genk','Minero','#1a3a8c',W],['Malinas','Campanas','#f2c200','#d4161d'],['Charleroi','Hulla',K,W],['Lovaina','Universitaria',W,'#d4161d'],['Kortrijk','Lys','#d4161d',W],['Sint-Truiden','Frutal','#f2c200',K],['Westerlo','Kempen','#f2c200','#1a3a8c'],['Eupen','Frontera','#1f8a3c',K],['Ostende','Mar','#d4161d','#1a3a8c'],['Namur','Ciudadela','#1a3a8c',W],['Mons','Borinage','#d4161d','#1f8a3c']],
SC:[['Glasgow','Clyde','#1f8a3c',W],['Glasgow','Govan','#1a3a8c','#d4161d'],['Edimburgo','Castle','#7a1f3a',W],['Edimburgo','Leith','#1f8a3c',W],['Aberdeen','Granito','#d4161d',W],['Dundee','Tay','#1a3a8c',W],['Dundee','Tannadice','#f26b1d',K],['Inverness','Highlands','#1a3a8c','#d4161d'],['Paisley','Mill',K,W],['Kilmarnock','Rugby','#1a3a8c',W],['Motherwell','Steel','#f2c200','#7a1f3a'],['Livingston','Nueva','#f2c200',K]],
AT:[['Viena','Danubio','#7a1f3a',W],['Viena','Prater','#1f8a3c',W],['Salzburgo','Mozart','#d4161d',W],['Graz','Mur',K,W],['Graz','Schlossberg',K,'#d4161d'],['Linz','Danubio Alto','#1a3a8c',K],['Klagenfurt','Wörthersee','#7a1f3a','#f2c200'],['Innsbruck','Tirol','#1f8a3c',K],['Wolfsberg','Lavant',K,W],['Altach','Rin','#f2c200',K],['Ried','Innviertel','#1f8a3c',W],['Hartberg','Oststeiermark','#d4161d',W]],
CH:[['Basilea','Rin','#d4161d','#1a3a8c'],['Berna','Osos','#f2c200',K],['Zúrich','Limmat','#1a3a8c',W],['Zúrich','Lago',W,'#1a3a8c'],['Ginebra','Lemán','#7a1f3a',W],['Lugano','Ceresio',W,K],['Lucerna','Pilatus','#1a3a8c',W],['San Galo','Abadía','#1f8a3c',W],['Sion','Valais',W,'#d4161d'],['Lausana','Olímpico','#d4161d',W],['Winterthur','Eulach','#d4161d',W],['Yverdon','Neuchâtel','#f2c200','#1f8a3c']],
DK:[['Copenhague','Sund',W,'#1a3a8c'],['Copenhague','Nørrebro','#d4161d',W],['Brøndby','Oeste','#f2c200','#1a3a8c'],['Herning','Midtjylland','#d4161d',K],['Aarhus','Bahía',W,'#1a3a8c'],['Aalborg','Limfjord','#d4161d',W],['Odense','Fionia','#1a3a8c',W],['Silkeborg','Lago','#d4161d',W],['Randers','Gudenå','#1a3a8c',W],['Viborg','Catedral','#1f8a3c',W],['Lyngby','Norte','#1a3a8c','#f2c200'],['Esbjerg','Mar del Norte','#1a3a8c',W]],
PL:[['Varsovia','Vístula','#1f8a3c',W],['Varsovia','Praga','#d4161d','#1a3a8c'],['Poznań','Warta','#1a3a8c',W],['Cracovia','Wawel','#d4161d',W],['Cracovia','Planty',W,'#d4161d'],['Breslavia','Odra','#1f8a3c','#d4161d'],['Gdansk','Ámbar','#1f8a3c',W],['Gdynia','Puerto','#1a3a8c','#f2c200'],['Łódź','Textil','#d4161d',W],['Chorzów','Hulla','#1a3a8c',W],['Zabrze','Minero','#1a3a8c','#d4161d'],['Katowice','Silesia','#f2c200',K],['Szczecin','Puerto','#7a1f3a','#1a3a8c'],['Lublin','Este','#f2c200','#1f8a3c'],['Białystok','Bosque','#d4161d','#f2c200'],['Kielce','Montes','#f2c200','#d4161d'],['Mielec','Aviones','#1a3a8c','#f2c200'],['Płock','Petróleo','#1a3a8c',W]],
GR:[['Atenas','Acrópolis','#1f8a3c',W],['Atenas','Pireo','#d4161d',W],['Atenas','Nea','#1f8a3c','#1a3a8c'],['Salónica','Torre Blanca',K,W],['Salónica','Egeo','#f2c200',K],['Patras','Golfo','#7a1f3a',W],['Volos','Pelión','#1a3a8c',W],['Heraclión','Creta','#1a3a8c','#f2c200'],['Larisa','Tesalia','#f2c200',K],['Ioánina','Lago','#f2c200','#1a3a8c'],['Lamia','Fócida','#1a3a8c',W],['Trípoli','Arcadia','#d4161d',K],['Agrinio','Etolia','#d4161d','#1a3a8c'],['Kalamata','Mesenia','#1a3a8c','#f2c200']]
});
Object.assign(T2CITY,{
BE:'Lokeren,Beveren,Dendermonde,Roeselare,Tubize,Lierse,Deinze,Seraing,Virton,Beerschot,Dessel,Knokke,Heist,Overijse,Waasland,Hamme',
SC:'Falkirk,Partick,Arbroath,Raith,Dunfermline,Ayr,Greenock,Hamilton,Cove,Airdrie',
AT:'Wiener Neustadt,Sankt Pölten,Lustenau,Dornbirn,Kapfenberg,Liefering,Amstetten,Horn,Steyr,Bregenz,Leoben,Villach,Lienz,Kufstein,Wattens,Krems',
CH:'Aarau,Thun,Schaffhausen,Wil,Lausanne Sur,Vaduz,Neuchâtel,Bellinzona,Carouge,Köniz',
DK:'Horsens,Hobro,Vejle,Fredericia,Kolding,Næstved,Hvidovre,Helsingør,Roskilde,Nykøbing,Skive,Thisted',
PL:'Bytom,Gliwice,Sosnowiec,Tychy,Rzeszów,Opole,Radom,Częstochowa,Grudziądz,Bydgoszcz,Toruń,Olsztyn,Jastrzębie,Legnica,Zawiercie,Łęczna,Nowy Sącz,Wieliczka',
GR:'Xanthi,Komotini,Kavala,Drama,Veria,Edessa,Katerini,Kozani,Corfú,Rodas,Chania,Calcis,Tebas,Corinto,Argos,Esparta'});
Object.assign(T3CITY,{
BE:'Aalst,Genk Sur,Lommel,Turnhout,Diest,Geel,Tienen,Nivelles,Tournai,Verviers,Arlon,Dinant,Bastogne,Waremme,Ypres,Menen',
SC:'Stirling,Montrose,Peterhead,Elgin,Forfar,Stranraer,Alloa,Clyde Norte,Annan,Dumbarton',
AT:'Eisenstadt,Bruck,Gmunden,Wels,Braunau,Zell am See,Kitzbühel,Feldkirch,Hallein,Judenburg,Voitsberg,Deutschlandsberg,Gleisdorf,Mattersburg,Neusiedl,Stockerau',
CH:'Baden,Biel,Chiasso,Delémont,Fribourg,Gossau,Kriens,Grenchen,Locarno,Rapperswil,Solothurn,Wohlen,Old Boys,Breitenrain,Zug,Thun Sur',
DK:'Svendborg,Hillerød,Holbæk,Slagelse,Aabenraa,Haderslev,Herlev,Ringsted,Frederikshavn,Struer,Brabrand,Ikast',
PL:'Kołobrzeg,Koszalin,Słupsk,Gorzów,Zielona Góra,Leszno,Kalisz,Konin,Piła,Elbląg,Ostrołęka,Siedlce,Chełm,Zamość,Tarnów,Bielsko,Racibórz,Nysa',
GR:'Naxos,Siros,Mitilene,Samos,Quíos,Zante,Cefalonia,Preveza,Arta,Karditsa,Trikala,Florina,Kastoria,Grevena,Alexandrópolis,Orestiada'});
Object.assign(T4CITY,{
BE:'Poperinge,Ninove,Zottegem,Sint-Niklaas,Oudenaarde,Halle,Vilvoorde,Mol,Hasselt,Tongeren,Bree,Maaseik,Ciney,Couvin,Ath,Soignies',
SC:'Brechin,Cowdenbeath,Stenhousemuir,Berwick,East Fife,Albion,Edimburgo Sur,Gretna,Keith,Fraserburgh',
AT:'Tulln,Mödling,Baden Sur,Traiskirchen,Schwechat,Floridsdorf,Simmering,Hohenems,Rankweil,Telfs,Imst,Schwaz,Spittal,Völkermarkt,Bad Ischl,Ried Sur',
CH:'Altstätten,Brugg,Bulle,Cham,Frauenfeld,Glarus,Herisau,Kreuzlingen,Langenthal,Münsingen,Sursee,Tuggen,Uster,Vevey,Wettswil,Yverdon Sur',
DK:'Skagen,Korsør,Taastrup,Ølstykke,Vejgaard,Hjørring,Nibe,Lemvig,Varde,Ribe,Tønder,Middelfart,Nyborg,Sorø,Køge,Greve',
PL:'Stargard,Świnoujście,Wałbrzych,Jelenia Góra,Głogów,Lubin,Płońsk,Łomża,Suwałki,Tomaszów,Skierniewice,Sieradz,Ostrów,Krosno,Przemyśl,Sanok,Mysłowice,Rybnik',
GR:'Naupacto,Missolonghi,Pirgos,Amaliada,Megalópoli,Nauplia,Hidra,Egina,Salamina,Eleusis,Megara,Maratón,Lavrio,Livadiá,Amfisa,Karpenisi'});
Object.assign(T2SUF,{
BE:['Sporting','Union','Racing','Olympic','Atletiek','Royal','Excelsior','Patria','Vlaanderen','Wallonia','Hermes','Fortuna'],
SC:['Athletic','Thistle','United','Rovers','Wanderers','Albion','Town','Burgh','Park','Harp','Vale','Borough'],
AT:['Sport','Union','Wacker','Alpen','Donau','Berg','Blau-Weiß','Rot-Weiß','Kickers','Fortuna','Viktoria','Eintracht'],
CH:['Sporting','Union','Racing','Étoile','Helvetia','Alpina','Lago','Rhône','Rhein','Blau-Weiß','Concordia','Olympia'],
DK:['Boldklub','Idrætsforening','Fremad','Kammeraterne','Sport','Union','Nord','Vest','Øst','Syd','Forward','Victoria'],
PL:['Sokół','Orzeł','Unia','Zryw','Sparta','Start','Błękitni','Czarni','Polonia','Victoria','Naprzód','Budowlani'],
GR:['Atlético','Unión','Deportivo','Heracles','Poseidón','Atenea','Apolo','Hermes','Nike','Ícaro','Titán','Delfín']});
Object.assign(CUP_NAMES,{BE:'Copa de Bélgica',SC:'Copa de Escocia',AT:'Copa de Austria',CH:'Copa de Suiza',DK:'Copa de Dinamarca',PL:'Copa de Polonia',GR:'Copa de Grecia'});
/* cuotas continentales: siempre 32 equipos (8 grupos de 4) */
CONT.CL.q={ES:4,EN:4,DE:4,IT:4,FR:3,PT:2,NL:2,TR:1,RU:1,BE:1,SC:1,AT:1,CH:1,DK:1,PL:1,GR:1};
CONT.EL.q={ES:4,EN:4,DE:3,IT:3,FR:3,PT:2,NL:2,TR:2,RU:2,BE:1,SC:1,AT:1,CH:1,DK:1,PL:1,GR:1};
CONT.EL.skip={ES:4,EN:4,DE:4,IT:4,FR:3,PT:2,NL:2,TR:1,RU:1,BE:1,SC:1,AT:1,CH:1,DK:1,PL:1,GR:1};
})();
