"use strict";
/* ================= escudos propios: símbolo según el nombre, 10 formas y 4 composiciones =================
   Todos los dibujos son originales y genéricos (cabezas geométricas, objetos sencillos). */
CREST_SHAPES.push(
  'M20 2c6 3 11 3 16 2v19c0 9-7 15-16 19C11 38 4 32 4 23V4c5 1 10 1 16-2z',   /* ondulado */
  'M12 3h16l9 9v20l-9 9H12l-9-9V12z',                                          /* octógono */
  'M20 1 38 22 20 43 2 22z',                                                   /* rombo */
  'M3 9Q20-3 37 9v17q-3 12-17 17Q6 38 3 26z',                                  /* cúpula */
  'M5 3h30l3 7-3 3v10c0 9-6 15-15 19C11 38 5 32 5 23V13l-3-3z'                 /* alado */
);
/* símbolos en una caja de 24×24; «eo» marca huecos (ojos, detalles) */
const EM={
 lion:'M12 1l3 3 4-1v4l4 2-2 4 2 4-4 2v4l-4-1-3 3-3-3-4 1v-4l-4-2 2-4-2-4 4-2V3l4 1zM12 6c-4 0-6 3-6 6 0 4 3 7 6 7s6-3 6-7c0-3-2-6-6-6zM9 10h2v2H9zM13 10h2v2h-2zM10 14h4l-2 3z',
 bull:'M2 3c0 5 2 7 5 7l1 3 1 6 3 3 3-3 1-6 1-3c3 0 5-2 5-7-2 3-4 4-7 4l-3-1-3 1C6 7 4 6 2 3zM9 12h2v2H9zM13 12h2v2h-2zM10 18h1v2h-1zM13 18h1v2h-1z',
 eagle:'M12 4c2 0 3 1 3 3l8-3-2 4 2 1-3 3 2 1-4 2-2-1-2 4 2 5-4-2-4 2 2-5-2-4-2 1-4-2 2-1-3-3 2-1-2-4 8 3c0-2 1-3 3-3zM11 6h2v2h-2z',
 wolf:'M3 2l6 5h6l6-5-1 9 2 3-5 3-3 5h-4l-3-5-5-3 2-3zM8 11l3 2H8zM16 11l-3 2h3zM10 17h4l-2 2z',
 fox:'M2 4l7 3h6l7-3-2 9-5 6-3 3-3-3-5-6zM7 11l3 2-3 0zM17 11l-3 2h3zM8 14l4 6 4-6-4 2z',
 bear:'M6 3a3.5 3.5 0 0 1 3 2h6a3.5 3.5 0 1 1 4 5c1 1 1 3 1 4 0 5-4 8-8 8s-8-3-8-8c0-1 0-3 1-4a3.5 3.5 0 0 1 1-7zM8 11h2v2H8zM14 11h2v2h-2zM9 15h6l-1 4h-4z',
 bird:'M2 9c4-3 7-2 10 1 3-3 6-4 10-1-3 0-6 1-7 4l-1 3 2 5-4-3-4 3 2-5-1-3c-1-3-4-4-7-4z',
 gull:'M1 11c4-5 8-5 11-1 3-4 7-4 11 1-4-2-7-1-9 2l-2 3-2-3c-2-3-5-4-9-2z',
 owl:'M4 2l4 3h8l4-3v11c0 6-4 9-8 9s-8-3-8-9zM8.5 7a3 3 0 1 0 .01 0zM15.5 7a3 3 0 1 0 .01 0zM8.5 9a1 1 0 1 1-.01 0zM15.5 9a1 1 0 1 1-.01 0zM12 12l-2 2 2 3 2-3z',
 rooster:'M9 2l2 2 2-2 1 3c3 1 4 4 3 7l5 1-5 2c0 4-3 7-7 7H6l3-4c-2-2-3-5-2-8l-4-1 4-3c0-2 1-3 2-4zM10 7h2v2h-2z',
 deer:'M3 1l2 4 2-2v4l3 3h4l3-3V3l2 2 2-4v6l-3 4-2 1-1 8-3 3-3-3-1-8-2-1-3-4V1zM10 14h1v2h-1zM13 14h1v2h-1z',
 horse:'M9 2l2 4 4-3v4c4 2 6 7 5 15h-8l1-6-4 2-5-1-1-4 7-6V2zM12 8h2v2h-2z',
 fish:'M1 12c4-7 11-8 16-2l6-5-2 7 2 7-6-5c-5 6-12 5-16-2zM6 10h2v2H6z',
 shark:'M1 15c5-1 8-3 10-6l3-7 1 7c3 1 6 3 8 6l-3 0 2 6-6-4c-5 2-10 1-15-2zM17 12h2v2h-2z',
 whale:'M2 10c0 6 4 10 10 10 5 0 8-3 8-8l3-4-3 1-1-4-2 4c-2-2-4-3-7-3-5 0-8 1-8 4zM6 11h2v2H6z',
 snake:'M16 2c4 0 6 3 4 6-1 2-4 2-7 3-2 1-2 3 1 3 5 0 8 2 7 5s-5 4-11 3l-8-2 2-3c4 2 10 3 11 1 1-1-3-1-6-2-4-2-3-7 1-9 3-1 6-1 5-2l-4 0 2-3zM17 4h2v2h-2z',
 croc:'M1 13l8-5 3 2 3-3 3 2 5 3v2l-3 1-2-1-1 3-2-2-2 2-2-2-2 2-2-2-2 2zM9 10h2v1H9zM2 17l18 0-4 3H6z',
 bee:'M12 8c3 0 5 3 5 7s-2 7-5 7-5-3-5-7 2-7 5-7zM7.5 13h9v2h-9zM7.5 17h9v2h-9zM12 8C9 3 3 2 2 6s5 5 10 2zm0 0c3-5 9-6 10-2s-5 5-10 2zM10 2l2 4 2-4z',
 cat:'M3 2l6 5h6l6-5v12c0 5-4 8-9 8s-9-3-9-8zM7 11l4 2H8zM17 11l-4 2h3zM11 16h2l-1 2zM2 15h5v1H2zM17 15h5v1h-5z',
 elephant:'M7 4h10c4 0 6 3 6 7s-2 6-5 6l-2-3v5c0 2 1 3 3 2l-1 3c-3 1-5-1-5-4v-4c-1 1-2 1-2 0v4c0 3-2 5-5 4l-1-3c2 1 3 0 3-2v-5l-2 3c-3 0-5-2-5-6s2-7 6-7zM9 9h2v2H9zM13 9h2v2h-2z',
 dragon:'M3 23c0-7 2-11 5-13L4 2l7 5 3-1 3-5v7l6 4-1 4-7-1-2 2 8 3-3 3c-4 1-7 0-9-2l1 5zM13 9h3v2h-3z',
 devil:'M3 1c0 4 2 6 5 6h8c3 0 5-2 5-6 2 4 2 8-1 10 0 7-4 12-8 12s-8-5-8-12C1 9 1 5 3 1zM7 11l4 2H8zM17 11l-4 2h3zM8 16l4 2 4-2-2 4h-4z',
 skull:'M12 2c6 0 9 4 9 9 0 3-1 5-3 6v4h-3v-2h-2v2h-2v-2H9v2H6v-4c-2-1-3-3-3-6 0-5 3-9 9-9zM8 9a2.5 2.5 0 1 0 .01 0zM16 9a2.5 2.5 0 1 0 .01 0zM12 14l-1.5 3h3z',
 anchor:'M12 1a3.5 3.5 0 0 1 1.5 6.7V9H17v3h-3.5v7c3-1 5-3 5.5-5l-2 0 4-5 3 6h-2c-1 5-6 8-10 8S3 20 2 15H0l3-6 4 5H5c.5 2 2.500 4 5.500 5v-7H7V9h3.500V7.7A3.5 3.5 0 0 1 12 1zM12 3.500a1 1 0 1 0 .01 0z',
 ship:'M11 1h2v2l7 11h-7v2h9l-3 6H5l-3-6h9zM9 5L4 14h5z',
 cannon:'M2 10l15-6 3 7-9 4a5 5 0 1 1-8-2zM7 14a3 3 0 1 0 .01 0zM18 3l3-1 2 7-3 1z',
 hammer:'M4 5l6-4 7 4-3 4-2-1-7 14-4-2 7-14-2-1zM20 5l-6-3 0 0zM15 12l7 8-3 3-6-8z',
 pick:'M2 9C6 2 15 0 22 5l-2 3c-3-2-5-2-7-2l9 13-3 3-9-13c-2 1-4 2-6 5zM2 20l6-7 2 3-5 6z',
 sword:'M20 1l3 0v3L11 16l2 2-2 2-3-3-4 5-3-3 5-4-3-3 2-2 2 2z',
 crown:'M2 7l6 5 4-9 4 9 6-5-2 12H4zM4 21h16v2H4z',
 star:'M12 1l3 7.500 8 .5-6 5 2 8-7-4.500-7 4.500 2-8-6-5 8-.5z',
 bolt:'M14 1L3 14h7l-1 9 12-14h-7z',
 flame:'M13 1c1 5 7 7 7 13 0 5-4 9-8 9s-8-3-8-8c0-3 2-5 3-7 0 2 1 4 3 4-2-5 0-8 3-11zM12 14c-2 3-3 4-3 6a3 3 0 0 0 6 0c0-3-2-3-3-6z',
 volcano:'M8 9h8l6 13H2zM9 7C7 6 6 3 8 2l2 3 2-4 2 4 2-3c2 1 1 4-1 5zM10 11l2 4 2-4z',
 mountain:'M1 21L9 5l4 7 3-4 7 13zM9 8l-2 5 2-1 2 2 1-3z',
 wave:'M1 9c3-4 6-4 9 0 2 2 3 2 5 0 2-3 5-3 8 0v4c-3-3-5-3-8 0-2 2-3 2-5 0-3-4-6-4-9 0zM1 17c3-4 6-4 9 0 2 2 3 2 5 0 2-3 5-3 8 0v4c-3-3-5-3-8 0-2 2-3 2-5 0-3-4-6-4-9 0z',
 sun:'M12 6a6 6 0 1 1-.01 0zM11 0h2v4h-2zM11 20h2v4h-2zM0 11h4v2H0zM20 11h4v2h-4zM3 5l2-2 3 3-2 2zM16 18l2-2 3 3-2 2zM3 19l3-3 2 2-3 3zM16 6l3-3 2 2-3 3z',
 tree:'M12 1l6 8h-3l5 7h-6v7h-4v-7H4l5-7H6z',
 clover:'M12 11C8 7 8 2 11 2l1 2 1-2c3 0 3 5-1 9zm1 1c4-4 9-4 9-1l-2 1 2 1c0 3-5 3-9-1zm-1 1c4 4 4 9 1 9l-1-2-1 2c-3 0-3-5 1-9zm-1-1c-4 4-9 4-9 1l2-1-2-1c0-3 5-3 9 1z',
 cherry:'M7 13a5 5 0 1 1-.01 0zM17 12a5 5 0 1 1-.01 0zM6 13C8 7 12 4 18 1l1 2c-3 2-4 5-3 9l-2 0c-1-3 0-6 1-8-3 2-5 5-7 9z',
 ball:'M12 1a11 11 0 1 1-.01 0zM12 7l-4.500 3.500L9 16h6l1.500-5.500zM11 1h2v4h-2zM2 8l4 2-1 2-4-2zM22 8l-4 2 1 2 4-2zM6 21l2-4 2 1-1.500 4zM18 21l-2-4-2 1 1.500 4z',
 gem:'M6 3h12l5 6-11 13L1 9zM7 5L4 9h4zM10 9h4l-2-4zM17 5l-1 4h4zM8 11l4 8 4-8z',
 key:'M7 3a6 6 0 0 1 5.5 8.500L23 11v4h-3v3h-3v-3h-4.500A6 6 0 1 1 7 3zM7 7a2 2 0 1 0 .01 0z',
 bell:'M12 1c1 0 2 1 2 2 3 1 5 4 5 8v4l3 4H2l3-4v-4c0-4 2-7 5-8 0-1 1-2 2-2zM9 21h6a3 3 0 0 1-6 0z',
 castle:'M3 3h3v3h2V3h3v3h2V3h3v3h2V3h3v8h-2v11h-5v-5a2 2 0 0 0-4 0v5H5V11H3z',
 bridge:'M1 7h22v4h-2v10h-3v-4a3 3 0 0 0-6 0v4h0v-4a3 3 0 0 0-6 0v4H3V11H1zM1 3h3v3H1zM10 3h4v3h-4zM20 3h3v3h-3z',
 mill:'M2 22V10l6 4v-4l6 4V3h3v11h1V6h3v16zM5 17h3v3H5zM11 17h3v3h-3zM17 17h2v3h-2z',
 gear:'M10 1h4l.5 3 2 1 3-2 2 3-2 3 .5 1 3 .5v3l-3 .5-.5 2 2 2-2 3-3-1.500-2 1-.5 3h-4l-.5-3-2-1-3 1.500-2-3 2-2-.5-2-3-.5v-3l3-.5.5-1-2-3 2-3 3 2 2-1zM12 8a4 4 0 1 0 .01 0z',
 loco:'M3 4h10v6h5l3 4v4h-2a3 3 0 0 1-6 0h-1a3 3 0 0 1-6 0H3zM6 7h4v3H6zM9 16.500a1.500 1.500 0 1 0 .01 0zM16 16.500a1.500 1.500 0 1 0 .01 0zM16 4h3v5h-3zM1 22h22v1H1z',
 rocket:'M12 1c4 3 6 8 5 13l4 4v4l-5-3h-8l-5 3v-4l4-4C6 9 8 4 12 1zM12 7a2.500 2.500 0 1 0 .01 0zM10 21h4l-2 3z',
 sub:'M10 4h5v2h-2v3h2c5 0 8 3 8 6s-3 6-8 6H9c-3 0-5-1-6-3l-2 2v-10l2 2c1-2 3-3 6-3h2V6h-1zM9 13.500a1.500 1.500 0 1 0 .01 0zM14 13.500a1.500 1.500 0 1 0 .01 0zM19 13.500a1.500 1.500 0 1 0 .01 0z',
 helmet:'M12 1c6 0 10 5 10 11v10h-6l-1-7h-2v8h-2v-8H9l-1 7H2V12C2 6 6 1 12 1zM5 10v2h6v-2zM13 10v2h6v-2z',
 arrow:'M12 1l7 9h-4v8l4 5h-5l-2-3-2 3H5l4-5v-8H5z',
 heart:'M12 22C5 17 1 13 1 8a5.500 5.500 0 0 1 11-1 5.500 5.500 0 0 1 11 1c0 5-4 9-11 14z',
 hat:'M7 4c3-2 7-2 10 0l1 11h-12zM1 17c4-2 7-2 11-2s7 0 11 2c-3 3-7 4-11 4S4 20 1 17z',
 guitar:'M19 1l4 4-3 2-5 5c2 3 1 5-2 6-1 4-4 5-7 4s-6-4-6-7 1-5 5-5c1-3 3-4 6-2l5-5zM9 12.500a2.500 2.500 0 1 0 .01 0z',
 cross:'M8 2h8l-1.500 7.500L22 8v8l-7.500-1.500L16 22H8l1.500-7.500L2 16V8l7.500 1.500z',
 book:'M2 4c4-2 7-1 10 1 3-2 6-3 10-1v15c-4-2-7-1-10 1-3-2-6-3-10-1zM4 7v9l6 1V8zM14 8v9l6-1V7z',
 leaf:'M21 3C9 2 3 8 4 15l-3 6 2 2 4-5c9 2 15-5 14-15zM8 16l8-9 1 1z',
 bat:'M12 8l2-3 1 4c2-3 5-4 8-3-2 1-3 3-2 6-2-2-4-1-4 1-1-1-3-1-3 1l-2 4-2-4c0-2-2-2-3-1 0-2-2-3-4-1 1-3 0-5-2-6 3-1 6 0 8 3l1-4z',
 pot:'M6 4h12v3h-2c4 2 6 5 6 9 0 4-4 7-10 7S2 20 2 16c0-4 2-7 6-9H6zM9 1h6v2H9zM7 13h10v2H7z'
};
/* qué símbolo corresponde a cada palabra del nombre (en cualquiera de los idiomas de los apodos) */
const EM_RULES=[
 [/merengue|reyes|royal|princ|king|keiz|millonar|dea|posh/,'crown'],[/leon|lion|lowen|leoes|leoni|aslan|leeuwen|lwy|leones|laskers|boro|loewen/,'lion'],
 [/toro|bull|touro|tori|taureau|stier|boga|tyre|zubr|bison|bufal|byk|tallarin/,'bull'],[/aguil|eagle|adler|aquil|aigl|kartal|arend|orly|ornos|bicefal|condor|aguia/,'eagle'],
 [/halcon|falc|falke|valk|sahin|atmaca|sokol|gavia|kestrel|hawk/,'bird'],[/lobo|wolf|wolve|wolfe|lupi|loup|kurt|wolven|ulve|wilk|wolfpack|canallas/,'wolf'],
 [/zorro|fox|fuchs|volpi|renard|vos|tilki|raev|raposa/,'fox'],[/oso|bear|baren|beer|ayi|bjorn|niedzw|panda|ursa|bebbi/,'bear'],
 [/gaviota|gull|gabbian|mouett|meeuw|marti|seagull|aiglon|pio|albatr/,'gull'],[/buho|owl|eulen|gufi|hiboux|uilen|coruja/,'owl'],
 [/gallo|rooster|cock|galo|galli|bantam|roost|coq/,'rooster'],[/venad|stag|hirsch|cervi|cerf|hert|jelen|ciervo|hjort/,'deer'],
 [/caballo|horse|stallon|pferde|potro|cavall|jinete|centaur|fohlen|rebano|mustang|chevaux/,'horse'],
 [/tiburon|shark|haie|squali|requin|haai|haj|escual|tubar/,'shark'],[/ballena|whale/,'whale'],
 [/delfin|dolphin|golfinh|pez|fish|peixe|salmon|merlu|boqueron|jaiba|piraña|pike|forelle/,'fish'],
 [/serpient|snake|bisci|vipera|biscione/,'snake'],[/cocodril|croco|caiman|iguana|xolo|lagart|cimarron/,'croc'],
 [/abeja|bien|bee|hornet|avisp|apicult|wesp/,'bee'],[/felin|tigre|tiger|tigrill|panther|panter|gato|cat|lynx|lince|luchs|onca|kaplan|puma|leopard|rysie|black cats/,'cat'],
 [/elefant|elephant/,'elephant'],[/dragon|drache|draghi|drago|ejder|draken|smoki|dragao|dragone/,'dragon'],
 [/diabl|devil|diavol|demon|terror/,'devil'],[/pirat|corsar|cossac|cosaco|korsan|corsair|buccan|pincharr/,'skull'],
 [/marin|mariner|matelot|navegant|almirant|marinai|stoerche_no/,'anchor'],[/caravel|ship|koggen|barco|gondol|pilgrim|vela|riversider|seasider|marineros/,'ship'],
 [/cannon|canon|artill|gunner/,'cannon'],[/hammer|martillo|smith|herrer|cobbler|saddler|steel|acero|blade_no/,'hammer'],
 [/miner|mineur|bergleute|mineros|zabrze|ruhrpott|colliers|tykes|millers_no/,'pick'],[/blade|espad|espader|sword|armer|guerrer|warrior|gladiad|gladiator|guerreiro|matador|lanza|spartan|espartan|defensor|bravos/,'sword'],
 [/caballer|knight|ritter|chevalier|rycerz|cavaleir|crusad|templar|legion|conquist|ridder|yigid/,'helmet'],
 [/estrella|star|estrelas|yildiz|stern|galactic|solitaria|stella/,'star'],[/rayo|lightning|thunder|bolt|centell|blitz|fulmin|eclair|simsek|relampag|piorun|truen|flash/,'bolt'],
 [/fuego|flame|fogao|llama|dynam|dinam|flambe/,'flame'],[/volcan|volcano|vulkan/,'volcano'],[/monta|mountain|alpin|serran|highland|altoarag|ostalb|cumbre|montes|alpes/,'mountain'],
 [/ola|wave|tormenta|storm|furac|elbdom|riba|rio|rhein|werder|wellen|sound|surfer|tide/,'wave'],[/sol|sun|soles|sunshine|califa|nazari|dorad|costasol/,'sun'],
 [/arbol|tree|forest|wald|oliv|vinador|verdolag|foresters|lenador|lumberjack|cedr|pine/,'tree'],[/trebol|clover|shamrock|kleeblatt|klee/,'clover'],
 [/cerez|cherr|peach|toffee|manzan|naranj|pimenton|pepiner|camoter|tuner|kartoffel|moutard|andouill|queso|lebkuchen|kaas|boer/,'cherry'],
 [/rubi|gem|esmerald|perla|parel|ambar|granat|jewel|diamante|bursztyn/,'gem'],[/llave|key|clav/,'key'],[/campan|bell|bimbam/,'bell'],
 [/castill|castle|torre|tower|dom|ciudadel|alcazar|stadtmusik|fortaleza|giralda|herculin|burg|minster/,'castle'],[/puente|bridge|brug|acueduct|aquaedu/,'bridge'],
 [/mill|fabri|potter|hatter|weber|factor|swabia|schwaben|werkself|werk|industri|textil|tuchm|lanier/,'mill'],[/engran|motor|gear|hardhat|petrol/,'gear'],
 [/locomo|loco|tren|rail|latic/,'loco'],[/cohete|rocket|comet|comete|cometa|falcons_no/,'rocket'],[/submarin|pitufo/,'sub'],[/flecha|arrow|archer|arquer/,'arrow'],
 [/corazon|heart|love/,'heart'],[/sombrer|hat|charro|chairboy|casquet/,'hat'],[/guitar|musik|music|violin|tango|trovador|rambler|palio_no/,'guitar'],
 [/cruz|cross|crociat|kreuz|cemento/,'cross'],[/estudiant|student|scholar|monje|monk|canon|abbe|academi|university|conego|scoist/,'book'],
 [/palm|hoja|leaf|verde|verts|viola|violet|lilie|lily|flor|giglio|malva|lila|cardo|chardon/,'leaf'],[/apicultores|miel|honey|barro|alfarer|ceramic|vase/,'pot'],
 [/cisne|swan|stork|storche|cigogne|ooievaar|garza|heron|flamin|magpie|urraca|cuervo|raven|raben|kruk|kraai|urubu|pigeon|robin|bluebird|canari|canary|peacock|pavo|bird|pajar|canaris|canarinh|ave/,'bird'],
 [/zebr|cebra/,'horse'],[/geissbock|goat|ram|carner|cabra/,'bull'],[/bavar|olimp|olympic|sporting|ball|ajac/,'ball']
];
/* apodos cuyo símbolo se elige a mano */
const EM_NAME={'Merengues':'crown','Culés':'ball','Colchoneros':'bear','Nervionenses':'wave','Murciélagos':'bat','Leones':'lion','Txuri-Urdin':'star','Submarino':'sub','Verdiblancos':'leaf','Celtiñas':'cross','Rojillos':'flame','Gironautas':'rocket','Bermellones':'sun','Franjiverdes':'leaf','Indálicos':'helmet','Pío-Pío':'bird','Relámpagos':'bolt','Citizens':'ship','Villans':'castle','Toffees':'bell','Peacocks':'bird','Clarets':'gem','Saints':'bell','Partenopei':'volcano','Grifoni':'dragon','Felsinei':'castle','Scaligeri':'key','Isolani':'wave','Salentini':'sun','Azzurri':'star','Neroverdi':'gem','Brianzoli':'crown','Parisiens':'castle','Phocéens':'ship','Gones':'lion','Dogues':'wolf','Hermines':'fox','Sang et Or':'pick','Girondins':'anchor','Violets':'leaf','Paillade':'sun','Champenois':'cherry','Matelots':'anchor','Grenats':'gem','Scoïstes':'castle','Werkself':'gear','Eisernen':'hammer','Dinos':'croc','Breisgauer':'tree','Stadtmusikanten':'guitar','Zirbeln':'tree','Kraichgauer':'mountain','Ruhrpott':'pot','Ostälbler':'mountain','Schwaben':'deer','Bavarians':'crown','Sadinos':'fish','Insulares':'wave','Algarvios':'sun','Minhotos':'leaf','Flavienses':'bridge','Alvinegros':'ball','Alas':'eagle','Urales':'mountain','Domstad':'castle','Pride':'lion','Boeren':'rooster','Ajacieden':'helmet','Tukkers':'horse','Noorderlingen':'star','Tricolores':'castle','Blauwvingers':'key','Fortunezen':'clover','Venlonaren':'ship','Drenten':'tree','Schoenmakers':'hammer','Gencos':'star','Göz-Göz':'owl','Yiğidos':'sword','Teteros':'leaf','Malvas':'leaf','Blauwzwart':'wolf','Great Old':'crown','Rouches':'flame','Kerels':'helmet','Campesinos':'tree','Jambos':'heart','Hibees':'bee','Dons':'castle','Dees':'ball','Gers':'crown','Buddies':'heart','Killies':'ball','Laskers':'ball','Hütteldorfers':'bolt','Rotjacken':'flame','Wörther':'wave','Rheindorf':'wave','Tiroler':'mountain','Espen':'leaf','Young Bears':'bear','Pasy':'ball','Niebiescy':'star','Xeneizes':'anchor','Academia':'book','Verdolagas':'leaf','Leprosos':'bell','Tombinos':'gem','Decanos':'book','Tatengues':'flame','Granates':'gem','Taladros':'gear','Timão':'anchor','Verdão':'leaf','Fogão':'star','Pici':'castle','Peixe':'fish','Bugre':'arrow','Papão':'wolf','Dourados':'fish','Mosqueteiros':'sword','Colorados':'flame','Furacão':'wave','Esquadrão':'star','Urubus':'bird','Rebaño':'bull','Fieras':'lion','Tuzos':'pick','Xolos':'wolf','Galácticos':'star','Five Stripes':'cherry','Peaches':'cherry','Sounds':'guitar','Dynamos':'bolt','Hardhats':'helmet','Wizards':'star','Guitars':'guitar','Snakes':'snake','Rebels':'star'};
const EM_POOL=['ball','star','crown','castle','sword','helmet','sun','tree','wave','mountain','key','gem','bridge','anchor','eagle','lion','bolt','flame','bell','leaf'];
const EM_LIST=Object.keys(EM);
const _emCache={};
function emblemFor(c){
  if(c.em&&EM[c.em])return c.em;
  if(c.suf&&EM_NAME[c.suf])return EM_NAME[c.suf];
  const k=strip(String(c.suf||c.name||c.short||'')).toLowerCase();
  if(_emCache[k]!==undefined)return _emCache[k];
  let r=null;const words=k.split(/[^a-z]+/).filter(Boolean);
  /* primero por inicio de palabra, para no confundir trozos sueltos */
  for(const [re,e] of EM_RULES){if(words.some(w=>{const m=w.match(re);return m&&m.index===0;})||(k.includes(' ')&&k.match(re)&&k.match(re).index===0)){r=e;break;}}
  if(!r)for(const [re,e] of EM_RULES){const m=k.match(re);if(m&&m[0].length>=4){r=e;break;}}
  if(!r)r=EM_POOL[hsh(k+(c.city||''))%EM_POOL.length];
  return _emCache[k]=r;
}
crest=function(c,size){
  size=size||40;const id='cp'+(CID++),own=c.lookCustom||c.custom||c.cc===undefined||c.id===undefined,h=hsh((c.city||'')+(c.suf||c.name||c.short||'')+'~');
  const shape=CREST_SHAPES[(own?(c.sh||0):h)%CREST_SHAPES.length],pat=(c.pat||0)%NPATS,R=(x,y,w,ht)=>`<rect x="${x}" y="${y}" width="${w}" height="${ht}" fill="${c.c2}"/>`;
  const lay=(c.lay!=null?c.lay:(h>>>5))%4,em=EM[emblemFor(c)];
  const dark=lum(c.c1)<0.22?c.c1:lum(c.c2)<0.22?c.c2:'#151a1c',other=dark===c.c1?c.c2:c.c1,light='#f7f4ea';
  const small=size<26,txt=String(c.short||'').slice(0,4),fs=txt.length>3?7.4:8.6;
  const icon=(cx,cy,w)=>`<path transform="translate(${cx-w/2} ${cy-w/2}) scale(${(w/24).toFixed(3)})" d="${em}" fill="${dark}" fill-rule="evenodd"/>`;
  const ring=`stroke="${other}" stroke-width="1.5"`;
  const medal=(cx,cy,r)=>lay===3?`<path d="M${cx} ${cy-r-1.5}L${cx+r+1.5} ${cy}L${cx} ${cy+r+1.5}L${cx-r-1.5} ${cy}z" fill="${light}" ${ring}/>`
    :lay===2?`<circle cx="${cx}" cy="${cy}" r="${r+1.6}" fill="${dark}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${light}" ${ring}/>`
    :`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${light}" ${ring}/>`;
  const band=y=>`<rect x="${20-(txt.length*fs*0.31+3)}" y="${y}" width="${txt.length*fs*0.62+6}" height="10" rx="${lay===1?1.5:5}" fill="${dark}" stroke="${light}" stroke-width=".7"/><text x="20" y="${y+7.8}" text-anchor="middle" font-family="Big Shoulders Display,Arial Narrow,sans-serif" font-weight="800" font-size="${fs}" letter-spacing=".4" fill="${light}">${esc(txt)}</text>`;
  const art=small?medal(20,22,13)+icon(20,22,lay===3?17:19)
    :lay===1?medal(20,26,9.5)+icon(20,26,lay===3?12:14)+band(6)
    :medal(20,17,10.5)+icon(20,17,lay===3?13.5:15.5)+band(28);
  return `<svg width="${size}" height="${Math.round(size*1.1)}" viewBox="0 0 40 44" role="img" aria-label="Escudo ${esc(c.name)}" style="flex:none"><defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
   <path d="${shape}" fill="${c.c1}"/><g clip-path="url(#${id})">${crestPattern(pat,R,c.c2)}${art}</g><path d="${shape}" fill="none" stroke="${lum(c.c1)<0.12?'#ffffff66':'#00000066'}" stroke-width="1.4"/></svg>`;
};
/* lo que elige el usuario manda sobre el diseño automático */
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="idpat"],[data-act="idsh"],[data-act="idem"],[data-act="cem"]');if(!b||!S)return;
  const a=b.dataset.act,v=b.dataset.v;
  if(a==='cem'){UI.setup.create.em=v;e.stopImmediatePropagation();render();return;}
  const c=userClub();if(!c)return;
  if(!c.lookCustom){const h=hsh((c.city||'')+(c.suf||c.name)+'~');c.sh=h%CREST_SHAPES.length;c.lookCustom=true;}
  if(a==='idem'){c.em=v;save();e.stopImmediatePropagation();render();}
},true);
const emblemPicker=(c,act)=>`<div class="lbl" style="margin:10px 0 6px">Símbolo</div><div class="empick">${EM_LIST.map(k=>`<button class="btn ${emblemFor(c)===k?'on':''}" data-act="${act}" data-v="${k}" aria-label="Símbolo ${k}"><svg viewBox="0 0 24 24" width="22" height="22"><path d="${EM[k]}" fill="currentColor" fill-rule="evenodd"/></svg></button>`).join('')}</div>`;
