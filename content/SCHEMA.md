# Formato de cada curso (content/uNN.json, NN = 01..16)
{
  "id": 1,
  "title_es": "Saludos y presentaciones",
  "title_en": "Hello and goodbye",
  "level": "A1",
  "goal_es": "Al terminar podrás saludar, despedirte y decir tu nombre.",
  "lessons": [
    {
      "id": "1-1",
      "title_es": "Hola y adiós",
      "words": [ {"en":"hello","es":"hola","pos":"interj","ex_en":"Hello, I am Ana.","ex_es":"Hola, soy Ana."} ],   // EXACTAMENTE 8
      "sentences": [ {"en":"Nice to meet you.","es":"Mucho gusto."} ],                                                // EXACTAMENTE 5
      "tip_es": "Explicación breve (1–3 oraciones) de gramática o uso, en español de México."
    }
  ],                                    // EXACTAMENTE 6 lecciones
  "dialogue": {
    "title_es": "En la oficina",
    "setting_es": "Conoces a un compañero nuevo en tu trabajo.",
    "lines": [ {"who":"A","en":"Hi! I'm Tom.","es":"¡Hola! Soy Tom."}, {"who":"B","en":"...","es":"..."} ]   // 8 a 10 líneas, alternando A y B; B es el alumno
  }
}
Reglas:
- Contenido 100% original (no copiar de libros, Duolingo ni sitios). Inglés de EE. UU.; español natural de México.
- pos: noun | verb | adj | adv | phrase | interj | pron | prep | num | conj.
- "en" de las palabras en minúsculas salvo nombres propios / "I". Puede ser expresión corta ("good morning").
- Oraciones: A1–A2 máximo 9 palabras; B1–B2 máximo 13. Puntuación simple (. , ? ! ') — sin comillas dobles, sin punto y coma, sin guiones largos.
- Cada oración de "sentences" debe usar vocabulario de su lección o de lecciones anteriores. Progresión de fácil a difícil.
- No repetir la misma palabra "en" dentro del curso. Evitar repetir palabras ya muy obvias de cursos anteriores.
- El JSON debe ser válido (sin comentarios, comillas dobles, sin comas finales).
