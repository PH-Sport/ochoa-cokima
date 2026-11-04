// Las cinco tarjetas del collage de Nosotros (docs/cokima-el-rediseno.md §3, «Nosotros, en maqueta»).
// Cada una es una faceta de Cokima: su nombre, una frase para la tarjeta ampliada y el texto de «leer más».
// Nada inventado: todo es de @cokimamadrid o de la web del Grupo Tombo, salvo los nombres de las tarjetas y
// la lista de imprescindibles, que sale de la carta. La fuente va al lado. Los códigos son de las
// publicaciones de Instagram, en fototeca/catalogo.json.
export const FACETAS = [
  {
    id: "arguelles",
    nombre: "Argüelles",
    alt: "Un mural de Cokima, en su local de Argüelles",
    // Recortada de DPWxadCjVrg, como la voz.
    frase: "Nacimos con una misión: romper las reglas, jugar con los sabores…",
    // DPWxadCjVrg, «5 años reventando sabores», sin su «Cinco años después», que ya ha caducado.
    voz: "Nacimos en Argüelles con una misión: romper las reglas, jugar con los sabores… y demostrar que la cocina, también puede ser una bomba.",
    textos: [
      "Más experiencia, más carácter… y el mismo hambre de sorprender.",
      // DKPoYXVt-Sv. Es también de lo que más ayuda a los buscadores: el barrio y lo que tiene cerca.
      "Descubre Cokima, restaurante de autor en el barrio de Argüelles, junto a Plaza de España y Moncloa.",
    ],
    enlace: { texto: "Visítanos", ir: "visitanos" },
  },
  {
    id: "fuego",
    nombre: "La cocina",
    alt: "La parrilla de Cokima, con las brasas encendidas",
    // DYKsoicjRh_
    frase: "Ni reglas, ni límites. Solo cocina, fuego y evolución.",
    // Las dos, de la web del Grupo Tombo.
    voz: "Cocina ecléctica con toques que van desde las recetas más castizas, de las que a los de Madriz les llena de orgullo, hasta los guiños más exóticos para los modernos gastronómicos.",
    textos: [
      "Elaboramos nuestros platos con los mejores productos frescos; pescado que casi aletea, carne de animales que viven mejor que tú y verduras que saben a lo que tienen que saber.",
    ],
    enlace: { texto: "Ver la carta", ir: "carta" },
  },
  {
    id: "pase",
    nombre: "El pase",
    alt: "Una mano escribe una comanda en la cocina de Cokima",
    // Recortada de la voz.
    frase: "Cada orden es una melodía y cada plato, una sinfonía de sabores.",
    // DJpD4cktzFT
    voz: "¿Has visto cómo se canta una comanda en Cokima? Aquí, cada orden es una melodía y cada plato, una sinfonía de sabores.",
    textos: [
      // DKo5dLhN0z8
      "El motor silencioso de cada servicio. Sin ellos, no hay magia. Desde el corazón de Argüelles, hacen que cada comida en Cokima sea más que comer: sea disfrutar, repetir, recordar.",
    ],
    enlace: { texto: "Reservar mesa", ir: "reservar" },
  },
  {
    id: "favoritas",
    nombre: "Las favoritas",
    alt: "Unas croquetas de Cokima sobre una tabla",
    // DahfQ-OtjEW
    frase: "Las recetas evolucionan. Las favoritas permanecen.",
    // DPWxadCjVrg
    voz: "Plato a plato, creamos hits que hoy son parte de nuestra historia.",
    textos: [
      // C6tJ19ktThn, de mayo de 2024. Mario decidió que se queda (2026-11-04): sale en su Instagram.
      "Nuestras croquetas semilíquidas son una obra de arte culinaria que debes probar al menos una vez en tu vida.",
      // De la carta, menu-es.json: los que llevan `featured`.
      "Los imprescindibles de la carta: gyozas de langostino, tataki de atún, tacos del gobernador de gambón, katsu sando de solomillo de ternera y arroz meloso de carabinero a la brasa.",
    ],
    enlace: { texto: "Ver la carta", ir: "carta" },
  },
  {
    id: "mesa",
    nombre: "La mesa",
    alt: "Una mesa compartida en la sala de Cokima",
    // Recortada de la voz.
    frase: "Un plato que sorprende, una copa bien servida y una mesa compartida.",
    // DHa2iMZNh8p
    voz: "¿Qué es para ti la felicidad? Para nosotros, es un plato que sorprende, una copa bien servida y una mesa compartida. Es ese primer bocado, esa risa espontánea y el brindis que cierra la noche.",
    textos: [
      // La web del Grupo Tombo.
      "Cokima es una explosión de sabor, un concepto creado para compartir y desfasar, mandanga de la buena.",
    ],
    enlace: { texto: "Reservar mesa", ir: "reservar" },
  },
];
