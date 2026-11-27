"use strict";
/* ============================================================
   DATOS DEL MUNDO — estructura inspirada en las pirámides del juego original
   (países, nº de clubes por división, nivel y aforo típicos).
   Clubes, jugadores y nombres son INVENTADOS. Ciudades reales, colores libres.
   ============================================================ */
const W='#f2f2f0',K='#141414';
const PAL=[['#d4161d',W],['#1a3a8c',W],['#1f8a3c',W],['#f2c200','#1a3a8c'],[K,W],['#6cabdd',W],['#7a1f3a',W],['#f26b1d',K],['#5a2a8c',W],['#1a5fa8','#f2c200'],['#d4161d',K],['#1f8a3c','#f2c200'],[W,'#d4161d'],[W,'#1a3a8c'],['#0b2a6b','#d4161d'],['#e2b80f',K],['#0f6e5a',W],['#9c2a2a','#e8d9a0']];

/* ---- 47 naciones ojeables: [código, nombre, región, pool de nombres, calidad cantera, col, fila] ---- */
const REGIONS={EUO:'Europa occidental',EUE:'Europa del este',SUD:'Sudamérica',NOR:'Norte y Centroamérica',AFR:'África',ASI:'Asia'};
const NATS=[
 ['ES','España','EUO','es',1.3,4,5],['EN','Inglaterra','EUO','en',1.3,5,2],['DE','Alemania','EUO','de',1.2,7,2],['IT','Italia','EUO','it',1.1,6,5],
 ['PT','Portugal','EUO','pt',1.2,3,5],['FR','Francia','EUO','fr',1.4,5,3],['NL','Países Bajos','EUO','nl',1.1,6,2],['BE','Bélgica','EUO','fr',1.1,6,3],
 ['CH','Suiza','EUO','de',0.9,6,4],['AT','Austria','EUO','de',0.9,7,3],['SC','Escocia','EUO','en',0.8,5,1],['DK','Dinamarca','EUO','nd',0.9,7,1],
 ['NO','Noruega','EUO','nd',0.8,7,0],['PL','Polonia','EUE','sl',1.0,9,1],['CZ','Chequia','EUE','sl',0.9,8,2],['HU','Hungría','EUE','sl',0.8,8,3],
 ['RO','Rumanía','EUE','sl',0.9,9,3],['HR','Croacia','EUE','sl',1.1,7,4],['UA','Ucrania','EUE','sl',1.1,10,2],['RU','Rusia','EUE','sl',1.0,11,1],
 ['KZ','Kazajistán','EUE','sl',0.6,13,1],['AZ','Azerbaiyán','EUE','tr',0.6,11,4],['TR','Turquía','EUE','tr',1.0,9,4],['GR','Grecia','EUE','gr',0.9,8,5],
 ['CY','Chipre','EUE','gr',0.6,10,5],
 ['BR','Brasil','SUD','pt',1.5,3,6],['AR','Argentina','SUD','es',1.4,1,9],['UY','Uruguay','SUD','es',1.2,2,8],['CO','Colombia','SUD','es',1.1,1,4],
 ['CL','Chile','SUD','es',0.9,0,8],['EC','Ecuador','SUD','es',1.0,0,5],['PE','Perú','SUD','es',0.8,0,6],['PY','Paraguay','SUD','es',0.9,2,7],
 ['BO','Bolivia','SUD','es',0.7,1,7],['MX','México','NOR','es',1.0,0,2],['US','EE. UU.','NOR','en',0.9,1,1],
 ['NG','Nigeria','AFR','ra',1.4,6,9],['GH','Ghana','AFR','ra',1.2,5,9],['SN','Senegal','AFR','rf',1.3,3,8],['CI','Costa de Marfil','AFR','rf',1.3,4,9],
 ['CM','Camerún','AFR','rf',1.2,7,9],['MA','Marruecos','AFR','ar',1.2,4,7],['DZ','Argelia','AFR','ar',1.1,5,7],['EG','Egipto','AFR','ar',1.0,8,7],
 ['CN','China','ASI','as',0.6,14,3],['KR','Corea del Sur','ASI','as',0.8,15,3]
];
const NAT={};NATS.forEach(n=>{NAT[n[0]]={cc:n[0],nm:n[1],reg:n[2],pool:n[3],yq:n[4],x:n[5],y:n[6]};});

/* ---- pools de nombres (nombre / apellido) ---- */
const POOLS={
 es:[['Álvaro','Diego','Sergio','Iván','Marcos','Pau','Unai','Rubén','Hugo','Raúl','Mario','Aitor','Matías','Facundo','Nicolás','Julián','Lautaro','Santiago','Erick','Édgar'],['García','Martín','López','Navarro','Ruiz','Ortiz','Molina','Santos','Vega','Campos','Iglesias','Soler','Lozano','Cano','Prieto','Ferrer','Acuña','Medina','Sosa','Romero','Benítez','Paredes','Herrera','Aguirre','Ramírez','Torres','Flores','Reyes','Salazar','Mendoza']],
 pt:[['João','Tiago','Rui','Diogo','Nuno','Rafael','Gonçalo','Pedro','André','Miguel','Duarte','Vasco','Caio','Thiago','Lucas','Matheus','Gabriel','Vinícius'],['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Sousa','Fernandes','Gomes','Lopes','Marques','Carvalho','Teixeira','Pinto','Almeida','Barbosa','Ribeiro','Moreira']],
 en:[['Jack','Harry','Callum','Oliver','Reece','Mason','Kyle','Jordan','Liam','Tom','Ben','Declan','Josh','Connor','Ryan','Ethan','Cole','Mitch'],['Walker','Hughes','Bennett','Foster','Hartley','Marsh','Crawford','Pearce','Dawson','Whitlock','Barker','Ellis','Rowe','Sheridan','Thorne','Brooks','Hayes','Mercer','Quinn','Sutton']],
 de:[['Lukas','Jonas','Felix','Niklas','Moritz','Leon','Finn','Tim','Jan','Maxi','Florian','Kai','Timo','Sven','Paul','Elias','Noah','Luis'],['Müller','Schneider','Fischer','Weber','Becker','Hoffmann','Koch','Richter','Wolf','Neumann','Braun','Krüger','Hartmann','Lange','Vogel','Zimmer','Keller','Huber','Brandt','Roth']],
 fr:[['Lucas','Hugo','Théo','Maxime','Antoine','Baptiste','Clément','Yanis','Rayan','Mathis','Romain','Enzo','Nolan','Axel','Karim','Jules','Ousmane','Moussa'],['Martin','Bernard','Dubois','Moreau','Laurent','Girard','Lefèvre','Mercier','Fontaine','Chevalier','Perrin','Blanc','Garnier','Roux','Faure','Lambert','Diop','Traoré','Keita','Camara']],
 it:[['Luca','Matteo','Andrea','Federico','Nicolò','Riccardo','Davide','Simone','Gabriele','Edoardo','Lorenzo','Marco','Tommaso','Alessio','Giulio','Samuele','Pietro','Emanuele'],['Rossi','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Conti','De Luca','Giordano','Mancini','Rinaldi','Caruso','Fabbri','Moretti','Gatti','Villa']],
 nl:[['Daan','Sem','Lars','Thijs','Jesse','Bram','Ruben','Stijn','Tim','Joris','Mees','Niels','Sven','Wout','Koen','Milan','Luuk','Jeroen'],['de Jong','van Dijk','Bakker','Visser','Smit','Meijer','de Boer','Mulder','Bos','Vos','Peters','Hendriks','van Leeuwen','Dekker','Brouwer','Kuiper','Willems','Jacobs','Kok','Maas']],
 sl:[['Ivan','Dmitri','Alexei','Mikhail','Nikita','Andrei','Pavel','Sergei','Marek','Jakub','Tomasz','Luka','Ivo','Mate','Bogdan','Adam','Zoltán','Viktor'],['Ivanov','Petrov','Smirnov','Volkov','Sokolov','Kuznetsov','Novak','Kowalski','Horvat','Kovač','Nagy','Popescu','Dvořák','Marković','Shevchenko','Kovalenko','Wiśniewski','Tóth','Ionescu','Babić']],
 tr:[['Emre','Mehmet','Burak','Can','Kerem','Arda','Yusuf','Ozan','Hakan','Cenk','Deniz','Efe','Berkay','Mert','Orkun','Enes','Ismail','Taha'],['Yılmaz','Kaya','Demir','Şahin','Çelik','Aydın','Öztürk','Arslan','Doğan','Kılıç','Aslan','Çetin','Kara','Koç','Polat','Erdoğan','Güneş','Tekin','Bulut','Aksoy']],
 nd:[['Erik','Lars','Mikkel','Magnus','Oskar','Anders','Henrik','Jonas','Rasmus','Emil','Sander','Joachim','Kasper','Viktor','Mathias','Elias','Filip','Axel'],['Hansen','Nielsen','Andersen','Larsen','Pedersen','Berg','Haugen','Johansen','Lindgren','Eriksen','Olsen','Dahl','Holm','Strand','Lund','Bakke','Nygaard','Sørensen','Kristiansen','Madsen']],
 gr:[['Nikos','Giorgos','Dimitris','Kostas','Panagiotis','Yannis','Christos','Stavros','Andreas','Vasilis','Petros','Alexandros','Thanos','Michalis','Sotiris','Lefteris'],['Papadopoulos','Karagounis','Nikolaidis','Georgiou','Dimitriou','Antoniou','Ioannou','Kyriakou','Pappas','Vasiliou','Charalambous','Christodoulou','Michail','Stavrou','Loizou','Panayiotou']],
 rf:[['Moussa','Ousmane','Ibrahima','Cheikh','Sadio','Idrissa','Seydou','Aboubakar','Kader','Yaya','Franck','Eric','Didier','Serge','Salomon','Wilfried','Gervinho','Mamadou'],['Diallo','Sarr','Ndiaye','Kone','Coulibaly','Touré','Traoré','Mbaye','Fall','Ba','Sow','Gueye','Eto','Mbarga','Nkoulou','Zokora','Bamba','Cissé','Doumbia','Sangaré']],
 ra:[['Emeka','Chidi','Kelechi','Tunde','Segun','Kwame','Kofi','Yaw','Ebenezer','Samuel','Ifeanyi','Obinna','Victor','Ahmed','Daniel','Joseph','Femi','Chukwu'],['Okafor','Adeyemi','Balogun','Eze','Nwosu','Mensah','Asante','Boateng','Owusu','Appiah','Osei','Adebayo','Ogunleye','Okonkwo','Abubakar','Danjuma','Ibrahim','Yakubu','Okoye','Onyeka']],
 ar:[['Youssef','Mohamed','Ahmed','Karim','Hakim','Rachid','Sofiane','Riyad','Achraf','Hicham','Omar','Walid','Mahmoud','Tarek','Amine','Bilal','Nabil','Zakaria'],['Benali','Haddad','Mansouri','Belhadj','Cherif','Saidi','Mahrez','Boulahrouz','El Amrani','Hakimi','Salah','Fathy','Hassan','Mostafa','Zidane','Bennani','Ziyech','Aït','Bouzid','Slimani']],
 as:[['Min','Jae','Hyun','Seung','Tae','Woo','Jin','Sung','Wei','Jun','Hao','Lei','Yang','Ming','Chen','Kai','Dong','Ho'],['Kim','Park','Lee','Choi','Jung','Kang','Cho','Yoon','Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun']]
};

/* ---- ligas: país, divisiones (nombre,nº clubes,[skill min,max]), calendario aproximado real ---- */
/* start/end [mes,día] de la liga; brk pausas navideñas [m1,d1,m2,d2]; win ventanas [m1,d1,m2,d2]: verano e invierno; ud = ascensos/descensos */
const LEAGUES=[
 {cc:'ES',nm:'España',t:[['Primera División',20,[70,90]],['Segunda División',22,[60,70]],['Tercera División',20,[50,60]],['Cuarta División',16,[40,50]]],start:[8,15],end:[5,24],brk:[[12,23,1,4]],win:[[7,1,9,1],[1,1,2,2]],ud:3,tv:1.2},
 {cc:'EN',nm:'Inglaterra',t:[['Primera División',20,[70,90]],['Segunda División',24,[60,70]],['Tercera División',24,[50,60]],['Cuarta División',24,[30,40]]],start:[8,8],end:[5,23],brk:[],win:[[6,14,9,1],[1,1,2,2]],ud:3,tv:1.5},
 {cc:'DE',nm:'Alemania',t:[['Primera División',18,[70,90]],['Segunda División',18,[60,70]],['Tercera División',20,[50,60]],['Cuarta División',16,[40,50]]],start:[8,22],end:[5,23],brk:[[12,20,1,10]],win:[[7,1,9,1],[1,1,2,2]],ud:3,tv:1.1},
 {cc:'IT',nm:'Italia',t:[['Primera División',20,[70,90]],['Segunda División',22,[60,70]],['Tercera División',22,[50,60]],['Cuarta División',22,[40,50]]],start:[8,22],end:[5,24],brk:[[12,24,1,5]],win:[[7,1,9,1],[1,2,2,2]],ud:3,tv:1.1},
 {cc:'FR',nm:'Francia',t:[['Primera División',20,[70,90]],['Segunda División',20,[60,70]],['Tercera División',18,[50,60]],['Cuarta División',18,[40,50]]],start:[8,8],end:[5,23],brk:[[12,21,1,3]],win:[[6,10,9,1],[1,1,2,2]],ud:3,tv:0.9},
 {cc:'PT',nm:'Portugal',t:[['Primera División',18,[60,76]],['Segunda División',20,[50,60]],['Tercera División',18,[40,50]],['Cuarta División',18,[30,40]]],start:[8,8],end:[5,17],brk:[[12,25,1,1]],win:[[7,1,8,31],[1,1,1,31]],ud:3,tv:0.6},
 {cc:'RU',nm:'Rusia',t:[['Primera División',16,[60,75]],['Segunda División',20,[50,60]],['Tercera División',20,[40,50]],['Cuarta División',20,[30,40]]],start:[7,18],end:[5,30],brk:[[12,7,3,6]],win:[[6,22,9,7],[1,19,2,24]],ud:2,tv:0.6},
 {cc:'NL',nm:'Países Bajos',t:[['Primera División',18,[60,76]],['Segunda División',20,[50,60]],['Tercera División',18,[40,50]],['Cuarta División',18,[30,40]]],start:[8,8],end:[5,17],brk:[[12,20,1,10]],win:[[7,1,9,1],[1,1,2,2]],ud:2,tv:0.7},
 {cc:'TR',nm:'Turquía',t:[['Primera División',18,[60,75]],['Segunda División',18,[50,60]],['Tercera División',18,[40,50]],['Cuarta División',18,[30,40]]],start:[8,15],end:[5,24],brk:[[1,1,1,15]],win:[[7,1,9,1],[1,1,2,2]],ud:3,tv:0.7}
];
const LG_BY_CC={};LEAGUES.forEach(L=>LG_BY_CC[L.cc]=L);

/* ---- clubes de 1ª división (ficticios; ciudad real; colores libres). Orden = fuerza descendente ---- */
const T1={
ES:[['Madrid','Capital',W,'#d4b04a'],['Barcelona','Ciutat','#a50044','#004d98'],['Madrid','Ribera','#cb3524',W],['Sevilla','Giralda',W,'#d4161d'],['Valencia','Turia',W,K],['Bilbao','Ría','#d4161d',W],['San Sebastián','Costa','#1f5fae',W],['Villarreal','Plana','#f2c200','#0f3d8c'],['Sevilla','Triana','#1f8a3c',W],['Vigo','Atlántico','#7fc4ec',W],['Pamplona','Encierro','#c8102e','#0b2a6b'],['Girona','Muralla','#d4161d',W],['Palma','Isla','#c8102e',K],['Vitoria','Mendi','#1f5fae',W],['Elche','Palmeral',W,'#1f8a3c'],['Almería','Alcazaba','#d4161d',W],['Cádiz','Bahía','#f2d000','#1a3a8c'],['Granada','Sierra','#c8102e',W],['Las Palmas','Atlántica','#f2d000','#1a3a8c'],['Madrid','Vallecas',W,'#d4161d']],
EN:[['Manchester','Mill','#da291c','#fbe122'],['Manchester','Ship','#6cabdd',W],['Liverpool','Dock','#c8102e','#00b2a9'],['London','Kensal','#d4161d',W],['London','Bridge','#0a4aa3',W],['London','Lane',W,'#132257'],['Newcastle','Tyne',K,W],['Birmingham','Canal','#7b1f3a','#9cc7ea'],['Brighton','Pier','#0057b8',W],['London','Eastside','#7a263a','#1bb1e7'],['Liverpool','Mersey','#1b5fb8',W],['Leicester','Fox','#003090','#fdbe11'],['Nottingham','Greenwood','#dd0000',W],['Southampton','Harbour','#d71920',W],['Wolverhampton','Gold','#fdb913',K],['Bournemouth','Cherry','#da291c',K],['London','Southside','#1b458f','#c4122e'],['Leeds','Moor',W,'#1d428a'],['Burnley','Claret','#6c1d45','#99d6ea'],['Sheffield','Steel','#ee2737',W]],
DE:[['München','Süd','#dc052d',W],['Dortmund','Ruhr','#fde100',K],['Leverkusen','Rhein','#e32221',K],['Leipzig','Messe','#dd0741',W],['Frankfurt','Main','#e1000f',K],['Stuttgart','Neckar',W,'#e32219'],['Wolfsburg','Aue','#65b32e',W],['Gladbach','Nord','#2a9d4a',K],['Berlin','Spree','#1a4aa3','#e32219'],['Hamburg','Hafen','#1f5fb8',W],['Freiburg','Schwarzwald','#d4161d',K],['Bremen','Weser','#1d9053',W],['Köln','Dom','#e32219',W],['Mainz','Karneval','#c3141e',W],['Augsburg','Fugger','#ba3733','#46714d'],['Hoffenheim','Kraichgau','#1961b5',W],['Bochum','Revier','#005ca9',W],['Heidenheim','Alb','#e2001a','#1a3a8c']],
IT:[['Milano','Nord','#d4161d',K],['Milano','Navigli','#1a3a8c',K],['Torino','Mole',W,K],['Roma','Colle','#8c1c2f','#f0b323'],['Roma','Tevere','#8ecae6',W],['Napoli','Golfo','#5aa9e6',W],['Firenze','Giglio','#6a2a8c',W],['Bergamo','Orobica','#1a5fa8',K],['Genova','Lanterna','#c8102e','#0b2a6b'],['Bologna','Torri','#c8102e','#0b2a6b'],['Torino','Collina','#7b1f3a',W],['Verona','Arena','#f2d000','#1a3a8c'],['Udine','Friuli',W,K],['Cagliari','Isola','#c8102e','#0b2a6b'],['Lecce','Salento','#f2d000','#c8102e'],['Empoli','Valdarno','#1a5fa8',W],['Sassuolo','Neroverde','#1f8a3c',K],['Parma','Ducato','#f2d000','#1a3a8c'],['Genova','Porto','#0b2a6b','#c8102e'],['Monza','Brianza','#c8102e',W]],
FR:[['Paris','Seine','#0b2a6b','#d4161d'],['Marseille','Vieux-Port','#5ab4e6',W],['Lyon','Rhône','#1a3a8c','#d4161d'],['Monaco','Rocher','#d4161d',W],['Lille','Nord','#d4161d','#1a2a5e'],['Nice','Azur','#d4161d',K],['Rennes','Breizh','#d4161d',K],['Lens','Mine','#e2231a','#f2c200'],['Nantes','Loire','#f2d000','#1f8a3c'],['Bordeaux','Garonne','#1a2a5e',W],['Toulouse','Capitole','#6a2a8c',W],['Montpellier','Garrigue','#f26b1d','#1a3a8c'],['Strasbourg','Rhin','#1a5fa8',W],['Reims','Champagne','#d4161d',W],['Brest','Océan',W,'#d4161d'],['Lorient','Merlus','#f26b1d',K],['Metz','Lorraine','#7a1f3a',W],['Clermont','Volcans','#c8102e','#1a3a8c'],['Le Havre','Estuaire','#5aa9e6','#1a3a8c'],['Angers','Maine',K,W]],
PT:[['Lisboa','Águia','#d4161d',W],['Lisboa','Leão','#1f8a3c',W],['Porto','Dragão','#1a4aa3',W],['Braga','Arcebispo','#d4161d',W],['Guimarães','Berço',W,K],['Vila do Conde','Rio','#d4161d',W],['Setúbal','Sado','#1f8a3c',W],['Coimbra','Estudante',K,W],['Funchal','Madeira','#1f4aa3','#e2b80f'],['Faro','Algarve','#e2b80f','#1a2a5e'],['Famalicão','Vale','#1a3a8c',W],['Moreira','Cónegos','#1f8a3c','#d4161d'],['Estoril','Riviera','#f2d000','#1a3a8c'],['Arouca','Serra','#f2d000','#1a3a8c'],['Porto','Bessa',K,W],['Portimão','Barlavento',K,W],['Chaves','Termas','#d4161d','#1a3a8c'],['Barcelos','Galo','#d4161d',W]],
RU:[['Moscú','Kremlin','#d4161d',W],['Moscú','Estepa','#d4161d','#1a3a8c'],['San Petersburgo','Neva','#5aa9e6',W],['Moscú','Arbat',W,'#d4161d'],['Krasnodar','Kuban','#1f8a3c',K],['Sochi','Riviera','#1a3a8c',W],['Samara','Volga','#1f5fb8',W],['Kazán','Tártaro','#1f8a3c',W],['Rostov','Don','#f2d000','#1a3a8c'],['Grozni','Cáucaso','#1f8a3c',W],['Ekaterimburgo','Urales','#f26b1d',K],['Nizhni Nóvgorod','Oka','#d4161d',W],['Majachkalá','Caspio','#1a3a8c',W],['Perm','Kama','#d4161d',K],['Ufá','Bashkir','#f2d000','#1f8a3c'],['Novosibirsk','Siberia','#1a3a8c',W]],
NL:[['Ámsterdam','Canal',W,'#d4161d'],['Róterdam','Maas','#d4161d',W],['Eindhoven','Philips','#d4161d',W],['Alkmaar','Kaas','#d4161d',W],['Enschede','Twente','#d4161d',W],['Utrecht','Dom','#d4161d','#1a3a8c'],['Groninga','Norte','#1f8a3c',W],['Arnhem','Rin','#f2d000',K],['Tilburg','Textil','#1a3a8c',W],['Heerenveen','Frisia','#1a3a8c',W],['La Haya','Corte','#1f8a3c','#f2d000'],['Zwolle','Hanse','#1a3a8c',W],['Sittard','Limburgo','#f2d000',K],['Breda','Nassau','#f2d000',K],['Waalwijk','Dijk','#f2d000','#1a3a8c'],['Venlo','Maas Sur','#d4161d',K],['Nimega','Waal','#1f8a3c',W],['Emmen','Drenthe','#d4161d',W]],
TR:[['Estambul','Bósforo','#f2c200','#1a3a8c'],['Estambul','Cuerno','#1a3a8c','#f2c200'],['Estambul','Oriente',K,W],['Trabzon','Mar Negro','#7a1f3a','#5aa9e6'],['Ankara','Meseta','#1a3a8c',W],['Estambul','Cúpula','#f26b1d',K],['Bursa','Montaña','#1f8a3c',W],['Esmirna','Egeo','#d4161d',K],['Konya','Anatolia','#1f8a3c',W],['Antalya','Costa','#d4161d',W],['Adana','Çukurova','#1a3a8c',W],['Kayseri','Erciyes','#d4161d','#f2d000'],['Gaziantep','Pistacho','#d4161d',K],['Samsun','Karadeniz','#d4161d',W],['Rize','Té','#1f8a3c','#1a3a8c'],['Alanya','Fortaleza','#1f8a3c','#f26b1d'],['Hatay','Antioquía','#7a1f3a',W],['Sivas','Cumhuriyet','#d4161d',W]]
};
/* ---- ciudades y sufijos para 2ª división (procedural, nombres inventados) ---- */
const T2CITY={
ES:'Santander,Zaragoza,Oviedo,Gijón,Valladolid,Albacete,Tenerife,Córdoba,Málaga,Alicante,Huesca,Lugo,Ferrol,Burgos,Ponferrada,Eibar,Leganés,Cartagena,Murcia,Badajoz,Logroño,Castellón,Tarragona,Jaén',
EN:'Bristol,Cardiff,Swansea,Norwich,Ipswich,Reading,Derby,Coventry,Stoke,Hull,Preston,Blackburn,Middlesbrough,Sunderland,Watford,Millwall,Luton,Plymouth,Oxford,Cambridge,Blackpool,Huddersfield,Rotherham,Barnsley,Wigan',
DE:'Hannover,Nürnberg,Düsseldorf,Karlsruhe,Kiel,Paderborn,Magdeburg,Darmstadt,Fürth,Rostock,Dresden,Braunschweig,Bielefeld,Münster,Osnabrück,Regensburg,Ulm,Saarbrücken,Aachen,Duisburg',
IT:'Palermo,Bari,Catania,Brescia,Cremona,Pisa,Perugia,Cosenza,Reggio,Salerno,Venezia,Ascoli,Ancona,Modena,Spezia,Frosinone,Cittadella,Como,Sampierdarena,Pescara,Terni,Trieste,Padova,Avellino',
FR:'Amiens,Caen,Dijon,Grenoble,Guingamp,Auxerre,Laval,Pau,Rodez,Annecy,Ajaccio,Bastia,Valenciennes,Quevilly,Sochaux,Troyes,Dunkerque,Niort,Paris Sur,Saint-Étienne,Le Mans,Tours,Orléans,Cherbourg',
PT:'Viseu,Leiria,Penafiel,Tondela,Santarém,Vizela,Oliveirense,Mafra,Feirense,Académico,Marítimo,Covilhã,Torreense,Nacional,Paços,Benfica Norte,Lusitânia,Beja,Évora,Aveiro',
RU:'Voronezh,Omsk,Tula,Kaliningrado,Vladivostok,Jabárovsk,Sarátov,Tver,Yaroslavl,Kursk,Penza,Tiumén,Smolensk,Orenburgo,Vladikavkaz,Astracán,Cheliábinsk,Briansk,Ivánovo,Kémerovo',
NL:'Eindhoven Sur,Rotterdam Oeste,Dordrecht,Helmond,Cambuur,Roda,Almere,Den Bosch,Telstar,Vitesse Sur,Volendam,Maastricht,Oss,Katwijk,Lelystad,Haarlem,Spakenburg,Hoek,Barendrecht,Veendam',
TR:'Eskişehir,Denizli,Malatya,Erzurum,Bolu,Giresun,Karabük,Çorum,Manisa,Bandırma,Ümraniye,Tuzla,Pendik,Adıyaman,Sakarya,Kocaeli,Zonguldak,Isparta'
};
const T2SUF={
ES:['Unión','Deportivo','Atlético','Racing','Sporting','Levante','Norte','Ribera','Costa','Sierra','Vega','Puerto'],
EN:['Town','United','Rovers','Albion','Wanderers','Athletic','City','Rangers','Borough','Park','Vale','County'],
DE:['Sport','Union','Eintracht','Fortuna','Viktoria','Rot-Weiß','Blau-Weiß','Germania','Borussia','Concordia','Kickers','Phönix'],
IT:['Calcio','Sportiva','Atletico','Unione','Libertas','Virtus','Fortitudo','Audace','Polisportiva','Juventus Nord','Olimpia','Ardita'],
FR:['Sporting','Olympique','Athlétic','Union','Racing','Étoile','Avenir','Jeunesse','Stade','Espérance','Football Club','Réal'],
PT:['Sporting','Atlético','União','Desportivo','Académica','Operário','Naval','Lusitano','Marítimo','Olímpico','Real','Clube'],
RU:['Dinamo','Torpedo','Lokomotiv','Zenit Sur','Shinnik','Spartak Norte','Metallurg','Rotor','Baltika','Akhmat Este','Ural','Sibir'],
NL:['Sportclub','Voetbal','Atletiek','Combinatie','Eendracht','Hercules','Quick','Excelsior Norte','Victoria','Sparta Oeste','Zwaluwen','Oranje'],
TR:['Spor','Gençlik','İdman','Belediye','Atletik','Birlik','Yıldız','Güneş','Anadolu','Kartal','Aslan','Doğu']
};
const SUPPORT_CITY={EUO:'Madrid,París,Lyon,Milán,Hamburgo,Lisboa,Amberes,Zúrich,Viena,Glasgow,Aarhus,Oslo',SUD:'São Paulo,Buenos Aires,Montevideo,Bogotá,Santiago,Quito,Lima,Asunción,La Paz,Río,Rosario,Medellín'};
const FIN_SUF=['Sporting','Atlético','Unión','Deportivo','Juventud','Academia','Real','Racing'];
const FIN_SUF2=['Norte','Sur','Central','Capital','Puerto','Ciudad','Sierra','Valle'];

/* ---- roles de staff ---- */
const STAFF_ROLES={
 asst:{nm:'Segundo entrenador',ic:'tactics',ef:'+ nivel táctico del once'},
 fit:{nm:'Preparador físico',ic:'bolt',ef:'− fatiga y − lesiones'},
 tech:{nm:'Entrenador técnico',ic:'star',ef:'+ progreso del primer equipo'},
 gk:{nm:'Entrenador de porteros',ic:'shield',ef:'+ nivel del portero'},
 youth:{nm:'Jefe de cantera',ic:'sprout',ef:'+ desarrollo juvenil'},
 phys:{nm:'Fisioterapeuta',ic:'plus',ef:'− duración de lesiones'},
 anal:{nm:'Analista',ic:'chart',ef:'+ informe del rival y xG'},
 scout:{nm:'Ojeador',ic:'eye',ef:'descubre jugadores en el extranjero'}
};
const TRAITS=[['Profesional',1.2,'Se entrega siempre; crece más'],['Ambicioso',1.1,'Quiere subir de nivel'],['Talento natural',1.3,'Aprende rápido'],['Disciplinado',1.05,'Fiable y constante'],['Irregular',0.95,'Rinde por rachas'],['Perezoso',0.8,'Se acomoda; crece menos'],['Líder',1.1,'Buen mentor'],['Frágil',1.0,'Más propenso a lesiones']];
const POSL={GK:'POR',DEF:'DEF',MID:'MED',FWD:'DEL'};
const ATTL={out:['RIT','TIR','PAS','REG','DEF','FIS'],gk:['REF','ESP','SAQ','JUE','VEL','POS']};
const FORMS={'4-4-2':[4,4,2],'4-3-3':[4,3,3],'3-5-2':[3,5,2],'5-3-2':[5,3,2],'4-5-1':[4,5,1],'4-2-3-1':[4,5,1],'3-4-3':[3,4,3],'5-4-1':[5,4,1],'4-3-1-2':[4,4,2],'4-4-1-1':[4,4,2],'4-1-4-1':[4,5,1],'4-3-2-1':[4,5,1],'4-2-2-2':[4,4,2],'3-4-1-2':[3,5,2],'4-3-3 Plano':[4,3,3],'4-3-3 Ofensivo':[4,3,3],'4-3-3 Defensivo':[4,3,3],'4-3-3 Falso 9':[4,3,3],'4-2-1-3':[4,3,3],'4-4-2 Contención':[4,4,2],'4-1-2-1-2':[4,4,2],'4-1-2-1-2 Cerrado':[4,4,2],'4-1-3-2':[4,4,2],'4-2-3-1 Cerrado':[4,5,1],'4-5-1 Ofensivo':[4,5,1],'4-2-4':[4,2,4],'3-1-4-2':[3,5,2],'3-4-2-1':[3,6,1],'3-5-1-1':[3,5,2],'3-4-3 Rombo':[3,4,3],'5-2-1-2':[5,3,2],'5-2-2-1':[5,4,1],'5-2-3':[5,2,3]};

/* ---- ciudades de 3ª división (procedural) ---- */
const T3CITY={
ES:'Alcorcón,Algeciras,Almendralejo,Arandina,Ávila,Cáceres,Calahorra,Ceuta,La Coruña,Dos Hermanas,Écija,Gandía,Getxo,Guadalajara,Ibiza,La Línea,Lorca,Melilla,Mérida,Orihuela,Ourense,Palencia,Pontevedra,Reus,Sabadell,Salamanca,Segovia,Talavera,Teruel,Toledo',
EN:'Accrington,Bolton,Bradford,Bury,Carlisle,Charlton,Chesterfield,Crewe,Doncaster,Exeter,Fleetwood,Gillingham,Grimsby,Harrogate,Lincoln,Mansfield,Northampton,Oldham,Peterborough,Port Vale,Salford,Shrewsbury,Stevenage,Swindon,Walsall,Wrexham,York,Wycombe,Cheltenham,Colchester',
DE:'Aalen,Bayreuth,Chemnitz,Cottbus,Erfurt,Essen,Halle,Jena,Koblenz,Lübeck,Mannheim,Meppen,Oldenburg,Plauen,Offenbach,Schweinfurt,Siegen,Trier,Unterhaching,Verl,Viersen,Würzburg,Zwickau,Wuppertal,Uerdingen',
IT:'Alessandria,Arezzo,Benevento,Carrarese,Catanzaro,Crotone,Foggia,Gubbio,Imola,Latina,Lucchese,Mantova,Messina,Novara,Piacenza,Pordenone,Potenza,Ravenna,Rimini,Sorrento,Taranto,Trapani,Triestina,Vicenza,Siena,Livorno',
FR:'Aubagne,Béziers,Bourg,Boulogne,Chambly,Concarneau,Créteil,Épinal,Fréjus,Le Puy,Nancy,Nîmes,Sète,Villefranche,Versailles,Bayonne,Cholet,Martigues,Quimper,Romorantin,Colmar,Dieppe,Lannion',
PT:'Alverca,Amarante,Anadia,Barreirense,Caldas,Fafe,Gondomar,Leixões,Lourinhã,Montijo,Oliveira de Azeméis,Pevidém,Sertã,Vilaverdense,Trofa,Tirsense,Pinhal Novo,Mirandela,Rebordosa,Lagos,Tomar',
RU:'Anapa,Armavir,Barnaúl,Belgorod,Cheboksary,Kaluga,Kostromá,Lípetsk,Magnitogorsk,Murmansk,Nalchik,Orel,Pskov,Riazán,Stávropol,Taganrog,Tambov,Tomsk,Ulán-Udé,Vólogda,Yakutsk,Yoshkar-Ola,Cherepovets',
NL:'Alphen,Amersfoort,Apeldoorn,Assen,Deventer,Dronten,Gouda,Harlingen,Hilversum,Hoogeveen,Kampen,Lisse,Meppel,Rijswijk,Spijkenisse,Terneuzen,Urk,Vlaardingen,Winterswijk,Zeist,Zutphen,Roosendaal',
TR:'Afyon,Amasya,Aydın,Balıkesir,Bartın,Batman,Çankırı,Düzce,Edirne,Elazığ,Erzincan,Gümüşhane,İskenderun,Kırıkkale,Kırşehir,Mersin,Niğde,Ordu,Osmaniye,Siirt,Tokat,Uşak,Van,Yalova'
};
/* ---- competiciones ---- */
const CUP_NAMES={ES:'Copa de España',EN:'Copa de Inglaterra',DE:'Copa de Alemania',IT:'Copa de Italia',FR:'Copa de Francia',PT:'Copa de Portugal',RU:'Copa de Rusia',NL:'Copa de los Países Bajos',TR:'Copa de Turquía'};
const CONT={
 CL:{nm:'Copa de Campeones',q:{ES:5,EN:5,DE:4,IT:4,FR:4,PT:3,NL:3,RU:2,TR:2},skip:{},dow:2},
 EL:{nm:'Copa Continental',q:{ES:4,EN:4,DE:4,IT:4,FR:4,PT:3,NL:3,RU:3,TR:3},skip:{ES:5,EN:5,DE:4,IT:4,FR:4,PT:3,NL:3,RU:2,TR:2},dow:4}
};

const T4CITY={
ES:'Alcalá,Alcoy,Antequera,Arosa,Astorga,Badalona,Baza,Betanzos,Cieza,Cuenca,Fuenlabrada,Haro,Huelva,Jerez,Linares,Llerena,Manacor,Marbella,Motril,Olot,Parla,Puertollano,Tudela,Utrera,Yeclano,Zafra',
EN:'Altrincham,Aldershot,Barnet,Boreham Wood,Braintree,Bromley,Dagenham,Dorking,Eastleigh,Ebbsfleet,Gateshead,Hartlepool,Maidenhead,Maidstone,Oxford City,Rochdale,Scunthorpe,Solihull,Southend,Sutton,Torquay,Woking,Yeovil,Weymouth,Wealdstone,Tamworth',
DE:'Ahlen,Altona,Auerbach,Babelsberg,Bonn,Buchholz,Düren,Eutin,Flensburg,Gießen,Homburg,Kassel,Lotte,Norderstedt,Rödinghausen,Saarlouis,Stendal,Wegberg,Weiche',
IT:'Acireale,Aosta,Biella,Bolzano,Casale,Chieti,Cuneo,Fano,Gela,Giulianova,Grosseto,Lavello,Lecco,Matera,Nocerina,Olbia,Pianese,Rieti,Teramo,Turris,Vigor,Viterbese',
FR:'Aurillac,Bergerac,Cannes,Fontainebleau,Hyères,Istres,Jura,Marignane,Mulhouse,Poitiers,Saint-Brieuc,Saint-Malo,Thionville,Vannes,Vitré,Évreux,Sedan,Tarbes,Montluçon',
PT:'Ajuda,Alcains,Amora,Aves,Beira-Mar,Bragança,Cinfães,Esposende,Felgueiras,Madalena,Oriental,Pedras Rubras,Ponta Delgada,Praiense,Sacavém,Valadares,Seixal,Odivelas,Peniche',
RU:'Abakán,Angarsk,Arzamás,Birobidzhán,Bratsk,Chitá,Elista,Gelendzhik,Irkutsk,Kirov,Komsomolsk,Krasnoyarsk,Kurgán,Nizhnekamsk,Novorosíisk,Petrozavodsk,Saransk,Syktyvkar,Veliky Nóvgorod,Vladimir,Zelenograd',
NL:'Barneveld,Duiven,Ede,Emmeloord,Goes,Harderwijk,Hoorn,Leiden,Nijkerk,Oosterhout,Sneek,Staphorst,Tiel,Tubbergen,Veghel,Woerden,Zaandam,Heerlen',
TR:'Adapazarı,Ağrı,Aksaray,Bingöl,Burdur,Çorlu,Dikili,Karaman,Kastamonu,Nevşehir,Sinop,Tekirdağ,Yozgat,Bodrum,Fethiye,Kütahya,Isparta Sur,Manavgat'
};
