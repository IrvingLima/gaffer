"use strict";
/* ================= ampliación: 4 países americanos con temporada de año natural (cal:true) ================= */
(function(){
const mk=(cc,nm,sizes,rng,start,end,win,ud,tv)=>({cc,nm,cal:true,t:sizes.map((n,i)=>[['Primera División','Segunda División','Tercera División','Cuarta División'][i],n,rng[i]]),start,end,brk:[],win,ud,tv});
LEAGUES.push(
 mk('BR','Brasil',[20,20,16,16],[[62,78],[52,62],[42,52],[32,42]],[4,12],[12,3],[[1,2,4,30],[7,1,8,31]],4,0.8),
 mk('AR','Argentina',[20,20,16,16],[[60,74],[50,60],[40,50],[30,40]],[2,6],[12,15],[[1,1,2,28],[7,1,9,1]],3,0.5),
 mk('MX','México',[18,18,16,16],[[58,72],[48,58],[38,48],[30,38]],[1,10],[12,6],[[1,1,1,31],[6,1,7,31],[12,1,12,31]],2,0.7),
 mk('US','EE. UU.',[20,18,16,16],[[56,70],[46,56],[38,46],[30,38]],[2,22],[11,30],[[1,15,4,24],[7,1,8,31]],2,0.9)
);
LEAGUES.forEach(L=>{LG_BY_CC[L.cc]=L;});
Object.assign(T1,{
BR:[['São Paulo','Ipiranga',W,'#d4161d'],['São Paulo','Parque','#1f8a3c',W],['São Paulo','Corinto',K,W],['Río de Janeiro','Guanabara','#d4161d',K],['Río de Janeiro','Tijuca',K,W],['Río de Janeiro','Carioca',W,K],['Río de Janeiro','Laranjeiras','#1f8a3c','#7a1f3a'],['Belo Horizonte','Serra',K,W],['Belo Horizonte','Pampulha','#1a3a8c',W],['Porto Alegre','Guaíba','#6cabdd',K],['Porto Alegre','Orla','#d4161d',W],['Curitiba','Pinheiro','#d4161d',K],['Salvador','Pelourinho','#1a3a8c','#d4161d'],['Recife','Capibaribe','#d4161d',K],['Fortaleza','Jangada','#1a3a8c','#d4161d'],['Goiânia','Cerrado','#1f8a3c',W],['Santos','Cais',W,K],['Campinas','Bandeirante','#1f8a3c',K],['Belém','Amazonas','#1a3a8c',W],['Cuiabá','Pantanal','#1f8a3c','#f2c200']],
AR:[['Buenos Aires','Puerto','#1a3a8c',W],['Buenos Aires','Núñez','#d4161d',K],['Avellaneda','Ribera','#d4161d',W],['Avellaneda','Cancha','#1a3a8c',W],['Buenos Aires','Boedo','#1a3a8c','#d4161d'],['Buenos Aires','Caballito','#1f8a3c',W],['La Plata','Bosque',W,'#1a3a8c'],['La Plata','Ciudad','#1a3a8c','#d4161d'],['Rosario','Parque','#d4161d',K],['Rosario','Gigante','#1a3a8c','#f2c200'],['Córdoba','Docta','#6cabdd',W],['Córdoba','Alta','#1a3a8c',W],['Mendoza','Cordillera','#1a3a8c',W],['Tucumán','Jardín','#6cabdd',W],['Santa Fe','Litoral','#d4161d',W],['Mar del Plata','Mar','#f2c200',K],['Salta','Norte','#1a3a8c',W],['Lanús','Granate','#7a1f3a',W],['Quilmes','Cervecero',W,'#1a3a8c'],['Banfield','Taladro','#1f8a3c',W]],
MX:[['Ciudad de México','Azteca',W,'#1a3a8c'],['Ciudad de México','Coyoacán','#1a3a8c','#f2c200'],['Ciudad de México','Pedregal','#f2c200','#1a3a8c'],['Guadalajara','Tapatía','#d4161d',W],['Guadalajara','Perla','#d4161d',K],['Monterrey','Cerro','#1a3a8c',W],['Monterrey','Sultán','#f2c200','#1a3a8c'],['Puebla','Angelópolis',W,'#1a3a8c'],['Toluca','Nevado','#d4161d',W],['León','Esmeralda','#1f8a3c',W],['Pachuca','Mineral','#1a3a8c',W],['Tijuana','Frontera','#d4161d',K],['Querétaro','Acueducto','#1a3a8c',W],['San Luis Potosí','Huasteca','#1a3a8c','#d4161d'],['Torreón','Laguna','#1f8a3c',W],['Mérida','Maya','#f2c200','#1f8a3c'],['Veracruz','Jarocho','#d4161d','#1a3a8c'],['Cancún','Caribe','#6cabdd',W]],
US:[['Nueva York','Hudson','#1a3a8c',W],['Nueva York','Queens','#6cabdd',W],['Los Ángeles','Pacific','#d4161d',W],['Los Ángeles','Hollywood','#f2c200',K],['Atlanta','Peach','#d4161d',K],['Seattle','Sound','#1f8a3c','#1a3a8c'],['Portland','Pinewood','#1f8a3c','#f2c200'],['Miami','Beach','#f26b1d',K],['Orlando','Sunshine','#7a1f3a',W],['Chicago','Lakefront','#d4161d','#1a3a8c'],['Houston','Bayou','#f26b1d',W],['Dallas','Lone Star','#d4161d',W],['Filadelfia','Liberty','#1a3a8c',W],['Washington','Capital','#d4161d',K],['Boston','Harbor','#1a3a8c','#d4161d'],['Columbus','Buckeye','#f2c200',K],['Kansas City','Prairie','#6cabdd',W],['Salt Lake','Canyon','#7a1f3a','#1a3a8c'],['San Diego','Coast','#1a3a8c','#f2c200'],['Nashville','Music','#f2c200',K]]
});
Object.assign(T2CITY,{
BR:'Campo Grande,Londrina,Joinville,Florianópolis,Natal,João Pessoa,Maceió,Aracaju,São Luís,Teresina,Manaus,Brasília,Vitória,Uberlândia,Ribeirão Preto,Sorocaba,Maringá,Caxias do Sul,Pelotas,Juiz de Fora',
AR:'San Juan,San Luis,Neuquén,Bahía Blanca,Posadas,Corrientes,Resistencia,Paraná,Concordia,Santiago del Estero,Catamarca,La Rioja,Jujuy,Río Cuarto,Villa María,San Rafael,Río Gallegos,Ushuaia,Rafaela,Junín',
MX:'Celaya,Zacatepec,Morelia,Oaxaca,Tlaxcala,Tepic,Culiacán,Hermosillo,Chihuahua,Saltillo,Durango,Aguascalientes,Zacatecas,Colima,Villahermosa,Tapachula,Campeche,Cuernavaca',
US:'Sacramento,Austin,San Antonio,Tampa,Jacksonville,Louisville,Indianápolis,Pittsburgh,Cleveland,Detroit,Milwaukee,Minneapolis,Denver,Phoenix,Las Vegas,Oakland,San José,El Paso'});
Object.assign(T3CITY,{
BR:'Santarém,Macapá,Palmas,Porto Velho,Rio Branco,Boa Vista,Petrolina,Feira de Santana,Ilhéus,Mossoró,Campina Grande,Anápolis,Dourados,Blumenau,Chapecó,Passo Fundo',
AR:'Olavarría,Tandil,Pergamino,Zárate,Campana,San Nicolás,Chivilcoy,Luján,Morón,Tigre,Temperley,Ituzaingó,Merlo,Ezeiza,Berazategui,Florencio Varela',
MX:'Irapuato,Celaya Sur,Uruapan,Zamora,Tampico,Reynosa,Matamoros,Nuevo Laredo,Ciudad Juárez,Mexicali,Ensenada,La Paz,Los Mochis,Mazatlán,Puerto Vallarta,Manzanillo',
US:'Albuquerque,Tulsa,Oklahoma City,Memphis,Birmingham,Richmond,Hartford,Providence,Rochester,Buffalo,Charleston,Savannah,Omaha,Boise,Spokane,Anchorage'});
Object.assign(T4CITY,{
BR:'Marília,Bauru,Presidente Prudente,Araraquara,Piracicaba,Taubaté,Volta Redonda,Campos,Cabo Frio,Itabuna,Vitória da Conquista,Imperatriz,Parnaíba,Sobral,Caruaru,Garanhuns',
AR:'Pilar,Escobar,Cañuelas,Lobos,Mercedes,Azul,Necochea,Balcarce,Trenque Lauquen,Villa Gesell,Gualeguaychú,Venado Tuerto,Reconquista,Esperanza,Sunchales,Ceres',
MX:'Atlixco,Tehuacán,Orizaba,Córdoba,Poza Rica,Tuxpan,Minatitlán,Coatzacoalcos,Comitán,Tuxtla,Salina Cruz,Acapulco,Chilpancingo,Iguala,Taxco,Pachuca Sur',
US:'Fresno,Reno,Tucson,Lexington,Knoxville,Chattanooga,Greenville,Raleigh,Norfolk,Albany,Syracuse,Scranton,Dayton,Akron,Toledo,Madison'});
Object.assign(T2SUF,{
BR:['Atlético','Sport','Associação','Esporte','União','Real','Nacional','Operário','Cidade','Bandeirantes','Estrela','Guarani Sur'].map(s=>s.replace(' Sur','')),
AR:['Atlético','Deportivo','Unión','Sportivo','Argentino','Social','Juventud','Central','Progreso','Defensores','Libertad','Patria'],
MX:['Atlético','Deportivo','Unión','Club','Real','Halcones','Alacranes','Potros','Venados','Lobos','Toros','Cafeteros'],
US:['FC','United','Athletic','City','Rovers','Soccer Club','Stars','Heat','Storm','Founders','Pioneers','Mustangs']});
Object.assign(CUP_NAMES,{BR:'Copa de Brasil',AR:'Copa Argentina',MX:'Copa de México',US:'Copa de EE. UU.'});
})();
