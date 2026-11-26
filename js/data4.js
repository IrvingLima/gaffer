"use strict";
/* ================= más naciones para ojear (Japón, China ya existente y el resto del mundo) ================= */
(function(){
REGIONS.OCE='Oceanía';
POOLS.jp=[['Haruto','Yuto','Sota','Ren','Kaito','Daiki','Takumi','Ryota','Shun','Kenta','Hiroki','Yuki','Naoki','Taiga','Riku','Shota','Kosuke','Masato','Tomoya','Genki','Ao','Haru','Kota','Minato','Takeru','Sho','Ryo','Itsuki','Hayato','Yamato'],
['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Yamada','Sasaki','Matsumoto','Inoue','Kimura','Hayashi','Shimizu','Mori','Ikeda','Hashimoto','Abe','Ogawa','Fujita','Okada','Goto','Hasegawa','Ishikawa','Maeda','Fujii','Endo','Kondo','Ono','Morita','Takeda','Kubo','Minamino','Tomiyasu','Doan','Mitoma','Furuhashi','Nagatomo','Hosoya','Yokoyama','Aoki','Sakai','Konno','Ueda','Iwasaki','Sugawara']];
POOLS.in=[['Aarav','Vihaan','Arjun','Rohan','Karan','Rahul','Aditya','Sahil','Ishaan','Manish','Sunil','Anil','Gurpreet','Harpreet','Jaskaran','Sandesh','Amrit','Prabir','Subhasish','Lalengmawia','Anirudh','Brandon','Ashique','Rahim','Sumit','Vikram','Nikhil','Deepak','Pritam','Udanta'],
['Sharma','Singh','Kumar','Patel','Gupta','Reddy','Nair','Chhetri','Das','Roy','Mukherjee','Bose','Jhingan','Thapa','Gill','Sandhu','Rai','Lama','Menon','Iyer','Verma','Joshi','Kotal','Pradhan','Kurian','Bhutia','Mondal','Tiwari','Naik','Rawat','Khan','Ali','Sahu','Hazarika','Borah','Pillai']];
POOLS.th=[['Somchai','Anan','Kritsada','Teerasil','Chanathip','Supachai','Nguyen','Tran','Pham','Hoang','Rizky','Evan','Andika','Syahrul','Faisal','Hafiz','Zulfahmi','Bagas','Dimas','Arif','Quang','Duc','Minh','Tuan','Adisak','Pichai','Wattana','Thanawat','Irfan','Ridho'],
['Sukhum','Phetchara','Wongsawat','Rattanakorn','Chaiyasit','Boonmee','Sirisuk','Kaewprom','Dangda','Pratama','Santoso','Wijaya','Hidayat','Saputra','Putra','Nugraha','Ramadhan','Kurniawan','Setiawan','Gunawan','Nguyen','Tran','Le','Pham','Vu','Do','Bui','Dang','Hoang','Ngo','Lim','Tan','Abdullah','Rahman','Ibrahim','Santos','Reyes','Cruz']];
const extra=[
 ['SE','Suecia','EUO','nd',1.0],['FI','Finlandia','EUO','nd',0.8],['IE','Irlanda','EUO','en',0.8],['IS','Islandia','EUO','nd',0.6],['LU','Luxemburgo','EUO','fr',0.5],['MT','Malta','EUO','it',0.4],
 ['SK','Eslovaquia','EUE','sl',0.8],['SI','Eslovenia','EUE','sl',0.8],['RS','Serbia','EUE','sl',1.1],['BA','Bosnia','EUE','sl',0.9],['BG','Bulgaria','EUE','sl',0.8],['ME','Montenegro','EUE','sl',0.7],['MK','Macedonia del Norte','EUE','sl',0.7],['AL','Albania','EUE','sl',0.7],
 ['GE','Georgia','EUE','sl',0.8],['AM','Armenia','EUE','sl',0.6],['BY','Bielorrusia','EUE','sl',0.7],['LT','Lituania','EUE','sl',0.6],['LV','Letonia','EUE','sl',0.5],['EE','Estonia','EUE','sl',0.5],['MD','Moldavia','EUE','sl',0.5],
 ['CA','Canadá','NOR','en',0.9],['CR','Costa Rica','NOR','es',0.8],['PA','Panamá','NOR','es',0.7],['HN','Honduras','NOR','es',0.7],['GT','Guatemala','NOR','es',0.6],['SV','El Salvador','NOR','es',0.6],['JM','Jamaica','NOR','en',0.7],['HT','Haití','NOR','fr',0.7],['CU','Cuba','NOR','es',0.6],['DO','Rep. Dominicana','NOR','es',0.6],['TT','Trinidad y Tobago','NOR','en',0.5],
 ['VE','Venezuela','SUD','es',0.9],
 ['ZA','Sudáfrica','AFR','en',0.9],['TN','Túnez','AFR','ar',1.0],['ML','Malí','AFR','rf',1.2],['BF','Burkina Faso','AFR','rf',1.0],['GN','Guinea','AFR','rf',1.1],['CD','RD del Congo','AFR','rf',1.2],['GA','Gabón','AFR','rf',0.8],['AO','Angola','AFR','pt',0.9],['MZ','Mozambique','AFR','pt',0.7],
 ['KE','Kenia','AFR','en',0.7],['UG','Uganda','AFR','en',0.6],['TZ','Tanzania','AFR','en',0.6],['ZW','Zimbabue','AFR','en',0.6],['ZM','Zambia','AFR','en',0.7],['CV','Cabo Verde','AFR','pt',0.8],['BJ','Benín','AFR','rf',0.7],['TG','Togo','AFR','rf',0.7],['CG','Congo','AFR','rf',0.8],['SD','Sudán','AFR','ar',0.6],['ET','Etiopía','AFR','ra',0.6],['LY','Libia','AFR','ar',0.5],['MG','Madagascar','AFR','rf',0.5],
 ['JP','Japón','ASI','jp',1.2],['SA','Arabia Saudí','ASI','ar',0.9],['IR','Irán','ASI','ar',1.0],['IQ','Irak','ASI','ar',0.7],['QA','Catar','ASI','ar',0.6],['AE','Emiratos Árabes','ASI','ar',0.6],['UZ','Uzbekistán','ASI','tr',0.8],['JO','Jordania','ASI','ar',0.6],['SY','Siria','ASI','ar',0.5],
 ['IN','India','ASI','in',0.6],['TH','Tailandia','ASI','th',0.6],['VN','Vietnam','ASI','th',0.6],['ID','Indonesia','ASI','th',0.7],['MY','Malasia','ASI','th',0.5],['PH','Filipinas','ASI','th',0.5],
 ['AU','Australia','OCE','en',1.0],['NZ','Nueva Zelanda','OCE','en',0.6]
];
const base=NATS.length;
extra.forEach((e,i)=>{const row=[e[0],e[1],e[2],e[3],e[4],i%16,10+Math.floor(i/16)];NATS.push(row);NAT[e[0]]={cc:e[0],nm:e[1],reg:e[2],pool:e[3],yq:e[4],x:row[5],y:row[6]};});
})();
