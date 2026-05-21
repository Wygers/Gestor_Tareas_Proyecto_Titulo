Desarrollo de una Plataforma Web para la Gestión y Control de Tareas Operativas en Organizaciones

Sistema web orientado a optimizar la planificación, asignación, supervisión y seguimiento de tareas operativas dentro de organizaciones, permitiendo mejorar la productividad, trazabilidad y control de procesos internos.

📌 Introducción

Actualmente muchas organizaciones presentan dificultades en el control y seguimiento de tareas operativas debido al uso de herramientas manuales, registros dispersos o falta de centralización de información. Esto genera retrasos, duplicidad de actividades, poca trazabilidad y dificultades en la supervisión del trabajo realizado.

La presente propuesta plantea el desarrollo de una plataforma web que permita administrar proyectos, tareas, responsables, seguimientos y evidencias desde un entorno centralizado, facilitando la comunicación y el monitoreo continuo de las actividades organizacionales.

🎯 Objetivo General

Desarrollar una plataforma web para la gestión y control de tareas operativas en organizaciones, permitiendo administrar usuarios, proyectos, actividades, seguimientos y alertas mediante un entorno centralizado y colaborativo.

✅ Objetivos Específicos
Gestionar usuarios y roles dentro del sistema.
Administrar proyectos y tareas operativas.
Controlar estados, prioridades y avances de tareas.
Registrar seguimientos, comentarios y evidencias.
Generar alertas y notificaciones automáticas.
Mantener auditoría de acciones realizadas.
👥 Roles del Sistema
Rol	Funciones
Administrador	Control total de usuarios, proyectos y configuraciones
Supervisor	Supervisa tareas, asigna responsables y valida avances
Técnico/Ejecutor	Ejecuta tareas y registra seguimientos
Visualizador	Consulta información y reportes
📂 Módulos del Sistema
Gestión de Usuarios

Permite registrar, editar y administrar usuarios del sistema, así como asignar roles y permisos según el nivel de acceso correspondiente.

Gestión de Proyectos

Facilita la creación y administración de proyectos operativos dentro de la organización.

Gestión de Tareas

Permite crear tareas, asignar responsables, establecer prioridades, fechas y estados de ejecución.

Seguimiento Operativo

Registra avances, observaciones y cambios realizados sobre las tareas asignadas.

Evidencias y Documentación

Permite adjuntar archivos y evidencias relacionadas con el cumplimiento de actividades.

Alertas y Notificaciones

Genera avisos automáticos sobre vencimientos, retrasos y cambios importantes.

Auditoría

Mantiene registro histórico de las acciones realizadas por los usuarios dentro del sistema.

🧩 Diagrama de Casos de Uso

El siguiente diagrama representa la interacción entre los usuarios y las funcionalidades principales de la plataforma.
<img width="476" height="983" alt="image" src="https://github.com/user-attachments/assets/d93d220c-998c-4f34-99f3-d404359f4b47" />

📖 Justificación del Diagrama de Casos de Uso

El diagrama de casos de uso permite identificar las funcionalidades principales del sistema y la interacción de cada rol con la plataforma.

El administrador posee control total sobre la gestión de usuarios, proyectos y auditorías, garantizando la administración general del sistema. El supervisor se encarga de coordinar y supervisar tareas operativas, asignando responsables y validando avances. El ejecutor desarrolla las actividades asignadas y registra seguimientos, evidencias y comentarios. Finalmente, el visualizador únicamente consulta información y reportes sin modificar datos.

Este modelo permite establecer claramente los permisos y responsabilidades de cada usuario dentro de la organización.

🧱 Diagrama de Clases

El siguiente diagrama representa la estructura lógica de las entidades principales del sistema y sus relaciones.
<img width="921" height="698" alt="image" src="https://github.com/user-attachments/assets/224c93eb-24b0-4de3-b4d1-7fa3e8020c55" />

📖 Justificación del Diagrama de Clases

El diagrama de clases representa la estructura de la base de datos y la organización lógica de las entidades del sistema.

La clase Usuario se relaciona con Rol para definir permisos y niveles de acceso. La entidad Proyecto agrupa múltiples tareas, mientras que cada tarea puede tener categorías, prioridades y estados específicos. Además, las tareas almacenan seguimientos, evidencias, comentarios y alertas para garantizar el control operativo y la trazabilidad de las actividades.

La inclusión de auditoría y notificaciones fortalece la seguridad y comunicación dentro de la plataforma, permitiendo registrar acciones críticas y mantener informados a los usuarios.

🔄 Diagrama de Secuencia

El siguiente diagrama muestra el flujo de interacción cuando un supervisor crea y asigna una tarea a un ejecutor.
<img width="516" height="677" alt="image" src="https://github.com/user-attachments/assets/814da672-a919-476a-89ce-337b791b72de" />

📖 Justificación del Diagrama de Secuencia

El diagrama de secuencia representa el flujo dinámico de operaciones dentro de la plataforma.

El proceso inicia cuando el supervisor accede al sistema y crea una nueva tarea. Posteriormente, el sistema almacena la información en la base de datos y asigna un responsable. Una vez realizada la asignación, el ejecutor recibe una notificación y puede actualizar el avance de la tarea, registrar seguimientos y subir evidencias.

Este flujo garantiza una adecuada comunicación entre los usuarios y permite mantener un control continuo sobre las actividades operativas.

🗄️ Modelo de Base de Datos
Entidades Principales
Usuarios
Roles
Proyectos
Tareas
Categorías
Prioridades
Estados
Seguimientos
Evidencias
Comentarios
Alertas
Auditoría
Notificaciones
💻 Tecnologías Utilizadas
Tecnología	Función
Node.js	Desarrollo backend
Express.js	Framework del servidor
MySQL	Gestión de base de datos
Bootstrap	Diseño responsivo
EJS	Motor de vistas
JavaScript	Lógica del sistema
GitHub	Control de versiones
📊 Beneficios de la Plataforma
Centralización de información operativa.
Mejor control y supervisión de tareas.
Incremento de productividad organizacional.
Reducción de retrasos y pérdida de información.
Automatización de alertas y seguimientos.
Mejor comunicación entre áreas de trabajo.
📈 Resultado Esperado

La implementación de la plataforma permitirá optimizar la gestión y control de tareas operativas en organizaciones mediante un entorno web centralizado, facilitando la planificación, supervisión y seguimiento de actividades, mejorando la productividad y fortaleciendo la toma de decisiones organizacionales

